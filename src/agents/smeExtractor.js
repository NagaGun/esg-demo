// ─── File Reader ───────────────────────────────────
// Reads any file type and returns clean plain text
export async function readFileAsText(file) {
    return new Promise((resolve) => {
        const reader = new FileReader()

        const isPDF = file.type === 'application/pdf'
            || file.name.toLowerCase().endsWith('.pdf')

        if (isPDF) {
            reader.onload = (e) => {
                const binary = e.target.result
                // Strip everything except printable ASCII
                const clean = binary
                    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
                    .replace(/\s{3,}/g, ' ')
                    .trim()
                console.log('PDF CLEANED - length:', clean.length)
                console.log('PDF PREVIEW:', clean.substring(0, 300))
                resolve(clean)
            }
            reader.onerror = () => {
                console.error('PDF read failed')
                resolve('')
            }
            reader.readAsBinaryString(file)
        } else {
            reader.onload = (e) => {
                const text = e.target.result || ''
                console.log('TEXT FILE - length:', text.length)
                console.log('TEXT PREVIEW:', text.substring(0, 300))
                resolve(text)
            }
            reader.onerror = () => resolve('')
            reader.readAsText(file)
        }
    })
}

// ─── ESG Data Architect ────────────────────────────
// The core AI extraction function
export async function parseSMEDocument(
    documentText,
    frameworkId,
    requiredFields
) {
    if (!documentText || documentText.length < 20) {
        console.error('Document text too short to extract')
        return { data: {}, fieldsFound: [], confidence: {} }
    }

    // Build hyper-specific field instructions
    const fieldInstructions = requiredFields.map(f => {
        const searchTerms = {
            electricity_kwh:
                'Search for: kWh, kilowatt-hours, electricity usage, units consumed, electric consumption. NUMBER ONLY.',
            gas_kwh:
                'Search for: gas consumption, therms, natural gas, cubic metres of gas. If in therms multiply by 29.3 to convert to kWh. NUMBER ONLY.',
            fuel_litres:
                'Search for: diesel, petrol, fuel, gallons, litres of fuel. If gallons multiply by 3.785. NUMBER ONLY.',
            water_m3:
                'Search for: water consumption, cubic metres, m3, water usage. NUMBER ONLY.',
            waste_tonnes:
                'Search for: waste, tonnes, waste collected, disposal weight. NUMBER ONLY.',
            waste_recycled_pct:
                'Search for: recycling rate, recycled percentage, % recycled. NUMBER between 0-100 ONLY.',
            scope1_emissions:
                'Search for: Scope 1, direct emissions, tCO2e. NUMBER ONLY.',
            scope2_emissions:
                'Search for: Scope 2, indirect emissions, electricity emissions. NUMBER ONLY.',
            employee_count:
                'Search for: employees, headcount, staff total, number of workers. NUMBER ONLY.',
            female_employees:
                'Search for: female employees, women employees, female headcount. NUMBER ONLY.',
            employee_turnover:
                'Search for: turnover rate, staff turnover, attrition rate. NUMBER between 0-100 ONLY.',
            injury_rate:
                'Search for: injuries, accidents, incidents, work-related injuries. NUMBER ONLY.',
            training_hours:
                'Search for: training hours, learning hours per employee. NUMBER ONLY.',
            pay_gap_pct:
                'Search for: gender pay gap, pay difference, salary gap. NUMBER ONLY.',
            renewable_energy_pct:
                'Search for: renewable energy, green energy percentage, solar wind. NUMBER ONLY.',
            has_ethics_policy:
                'Search for: code of ethics, ethics policy, conduct policy. Return true if exists, false if not.',
            has_privacy_policy:
                'Search for: data privacy, privacy policy, GDPR. Return true if exists, false if not.',
            has_esg_policy:
                'Search for: ESG policy, sustainability policy. Return true if exists, false if not.',
            has_whistleblower:
                'Search for: whistleblower, reporting channel, speak up policy. Return true if exists, false if not.',
            living_wage:
                'Search for: living wage, minimum wage commitment. Return true if exists, false if not.',
            supplier_code:
                'Search for: supplier code, vendor code of conduct. Return true if exists, false if not.',
            board_female_pct:
                'Search for: female board, women directors, board diversity. NUMBER ONLY.',
        }

        return `  "${f.id}": {
    "description": "${f.plain}",
    "howToFind": "${searchTerms[f.id] || 'Look for the value - NUMBER ONLY or true/false'}",
    "unit": "${f.unit}"
  }`
    }).join(',\n')

    const systemPrompt = `You are an ESG Data Architect. 
Your only job is to extract sustainability data 
from business documents with perfect accuracy.

ABSOLUTE RULES:
1. Return ONLY a valid JSON object
2. Start with { and end with } — nothing else
3. No markdown, no backticks, no explanations
4. Numbers must be plain numbers: 47250 not "47,250 kWh"
5. If you cannot find a value with certainty: null
6. Never guess or estimate — only extract explicit values
7. For yes/no fields: true or false only`

    const userPrompt = `Extract these specific fields 
from the document below.

FIELDS TO FIND:
{
${fieldInstructions}
}

DOCUMENT:
${documentText.substring(0, 8000)}

Return ONLY the JSON object with field IDs as keys 
and extracted values or null as values.
Every field_id listed above must appear in your response.`

    console.log('SENDING TO AI - doc length:', documentText.length)
    console.log('FIELDS REQUESTED:', requiredFields.map(f => f.id))

    try {
        const res = await fetch('http://localhost:3001/api/claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                max_tokens: 2048,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            })
        })

        if (!res.ok) {
            console.error('API call failed:', res.status)
            return { data: {}, fieldsFound: [], confidence: {} }
        }

        const apiData = await res.json()

        if (!apiData.content || !apiData.content[0]) {
            console.error('Empty API response:', apiData)
            return { data: {}, fieldsFound: [], confidence: {} }
        }

        const raw = apiData.content[0].text.trim()
        console.log('RAW AI RESPONSE:', raw)

        // ── Parse with 3 fallback strategies ──
        let parsed = null

        // Strategy 1: direct parse
        try {
            parsed = JSON.parse(raw)
            console.log('Parse strategy 1 succeeded')
        } catch (e) {
            // Strategy 2: find JSON block
            const match = raw.match(/\{[\s\S]*\}/)
            if (match) {
                try {
                    parsed = JSON.parse(match[0])
                    console.log('Parse strategy 2 succeeded')
                } catch (e2) {
                    // Strategy 3: aggressive cleanup
                    try {
                        const cleaned = match[0]
                            .replace(/:\s*undefined/g, ': null')
                            .replace(/,\s*([}\]])/g, '$1')
                            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
                        parsed = JSON.parse(cleaned)
                        console.log('Parse strategy 3 succeeded')
                    } catch (e3) {
                        console.error('All parse strategies failed')
                        console.error('Raw was:', raw.substring(0, 500))
                    }
                }
            }
        }

        if (!parsed) {
            return { data: {}, fieldsFound: [], confidence: {} }
        }

        // ── Sanitize all values ──
        const cleanData = {}
        const fieldsFound = []

        requiredFields.forEach(f => {
            const val = parsed[f.id]

            if (val === null || val === undefined || val === '') {
                cleanData[f.id] = null
                return
            }

            if (f.unit === 'yes/no') {
                cleanData[f.id] = val === true
                    || val === 'true'
                    || val === 'yes'
                    || val === 'Yes'
                fieldsFound.push(f.id)
                return
            }

            // Strip commas and units then convert to number
            const numStr = String(val)
                .replace(/,/g, '')
                .replace(/[^0-9.-]/g, '')
            const num = parseFloat(numStr)

            if (!isNaN(num) && num >= 0) {
                cleanData[f.id] = num
                fieldsFound.push(f.id)
            } else {
                cleanData[f.id] = null
            }
        })

        console.log('CLEAN EXTRACTED DATA:', cleanData)
        console.log('FIELDS FOUND:', fieldsFound)

        return { data: cleanData, fieldsFound, confidence: {} }

    } catch (err) {
        console.error('parseSMEDocument failed:', err)
        return { data: {}, fieldsFound: [], confidence: {} }
    }
}

// ─── Emissions Calculator ──────────────────────────
export async function calculateEmissions(extractedData) {
    // Standard emission factors
    const GAS_FACTOR = 0.203          // kgCO2e per kWh gas
    const ELECTRICITY_FACTOR = 0.233  // kgCO2e per kWh electricity
    const DIESEL_FACTOR = 2.68        // kgCO2e per litre

    let scope1_kg = null
    let scope2_kg = null
    const notes = []
    const missing = []

    // Calculate Scope 1 from gas + fuel
    if (extractedData.gas_kwh || extractedData.fuel_litres) {
        scope1_kg = 0
        if (extractedData.gas_kwh) {
            const gasEmissions = extractedData.gas_kwh * GAS_FACTOR
            scope1_kg += gasEmissions
            notes.push(`Gas: ${gasEmissions.toFixed(0)} kgCO2e`)
        } else {
            missing.push('gas_kwh')
        }
        if (extractedData.fuel_litres) {
            const fuelEmissions = extractedData.fuel_litres * DIESEL_FACTOR
            scope1_kg += fuelEmissions
            notes.push(`Fuel: ${fuelEmissions.toFixed(0)} kgCO2e`)
        }
    } else {
        missing.push('gas_kwh', 'fuel_litres')
    }

    // Calculate Scope 2 from electricity
    if (extractedData.electricity_kwh) {
        scope2_kg = extractedData.electricity_kwh * ELECTRICITY_FACTOR
        notes.push(`Electricity: ${scope2_kg.toFixed(0)} kgCO2e`)
    } else {
        missing.push('electricity_kwh')
    }

    const scope1_t = scope1_kg ? scope1_kg / 1000 : null
    const scope2_t = scope2_kg ? scope2_kg / 1000 : null
    const total_t = (scope1_t && scope2_t)
        ? scope1_t + scope2_t
        : (scope1_t || scope2_t)

    return {
        scope1_emissions_kgco2e: scope1_kg,
        scope1_emissions_tco2e: scope1_t,
        scope2_emissions_kgco2e: scope2_kg,
        scope2_emissions_tco2e: scope2_t,
        total_emissions_tco2e: total_t,
        calculation_notes: notes.length > 0
            ? notes.join(' | ')
            : 'Insufficient data for calculation',
        missing_data: [...new Set(missing)]
    }
}
