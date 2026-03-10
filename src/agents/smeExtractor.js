import { Groq } from 'groq-sdk'

// Initialize Groq (normally would be on server, but here for demo proxy)
// Note: In a real app, logic like this should stay server-side for security.
// We are calling a proxy at http://localhost:3001/api/claude

export async function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(e)
        reader.readAsText(file)
    })
}

export async function parseSMEDocument(documentText, frameworkId = 'gri', requiredFields = []) {
    if (!requiredFields || !Array.isArray(requiredFields)) {
        console.warn('parseSMEDocument: requiredFields missing, using defaults.')
        requiredFields = ['electricity_kwh', 'gas_kwh', 'employee_count']
    }

    if (!documentText || documentText.trim().length < 20) {
        return { data: {}, fieldsFound: [] }
    }

    const prompt = `Extract ESG data for an SME following the ${frameworkId} framework.
  
  REQUIRED FIELDS:
  ${requiredFields.join(', ')}
  
  DOCUMENT TEXT:
  ${documentText.substring(0, 8000)}
  
  Return a JSON object only. Format:
  {
    "data": { "field_name": "value", ... },
    "fieldsFound": ["field_name", ...]
  }
  Value should be numeric only if it is a measurement.`

    try {
        const res = await fetch('http://localhost:3001/api/claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }]
            })
        })
        const json = await res.json()
        const content = json.content[0].text
        return JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1))
    } catch (err) {
        console.error('AI Extraction Error:', err)
        return { data: {}, fieldsFound: [] }
    }
}

export function calculateEmissionsLocally(data) {
    const result = {}

    // Scope 2 (Electricity) - Factor: 0.233 kg/kWh
    if (data.electricity_kwh) {
        result.scope2_tco2e = (parseFloat(data.electricity_kwh) * 0.233 / 1000).toFixed(2)
    }

    // Scope 1 (Gas) - Factor: 0.183 kg/kWh
    if (data.gas_kwh) {
        result.scope1_gas_tco2e = (parseFloat(data.gas_kwh) * 0.183 / 1000).toFixed(2)
    }

    // Intensity
    if (result.scope2_tco2e && data.employee_count) {
        result.intensity_per_employee = (parseFloat(result.scope2_tco2e) / parseInt(data.employee_count)).toFixed(3)
    }

    return result
}

export async function fillQuestionnaire(parsed, smeData) {
    // Build dynamic data lines for the prompt
    const dataLines = Object.entries(smeData)
        .filter(([k, v]) => v !== null && v !== undefined && k !== 'submissions')
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')

    const prompt = `Fill this ESG questionnaire using the company data provided. Match questions to the most relevant data field.

  COMPANY PROFILE:
  Company: ${smeData.company_name || 'Unknown'}
  Framework: ${smeData.framework || 'GRI'}
  Year: ${smeData.reporting_year || '2024'}

  ALL AVAILABLE DATA:
  ${dataLines}

  QUESTIONS:
  ${JSON.stringify(parsed.questions || parsed)}

  Return a JSON object:
  {
    "filledAnswers": [
      { "q": "original question", "a": "calculated answer", "conf": "high/medium/low", "source": "data field name" }
    ]
  }
  
  Be precise. If no data matches, return empty string for 'a' and set confidence 'low'.
  IMPORTANT: Fill every single question provided. Do not skip any. If you have 15+ questions, fill all of them.`

    try {
        const res = await fetch('http://localhost:3001/api/claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }]
            })
        })
        const json = await res.json()
        const content = json.content[0].text

        // Support both old style (array) and new style (object with filledAnswers)
        const filledData = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1))
        return filledData.filledAnswers || filledData
    } catch (err) {
        console.error('AI Fill Error:', err)
        return []
    }
}

// RESTORED FOR COMPATIBILITY
export async function extractSMEData(documentText) {
    const result = await parseSMEDocument(documentText)
    return result.data || {}
}

export async function parseQuestionnaire(questionnaireText) {
    const prompt = `Parse this ESG questionnaire text and extract individual questions.
    
    TEXT:
    ${questionnaireText.substring(0, 8000)}
    
    Return a JSON object:
    {
      "questionnaireTitle": "...",
      "questions": [
        { "id": 1, "question": "...", "type": "text/number/yes_no", "unit": "...", "section": "..." }
      ]
    }
    Extract as many relevant questions as possible (at least 15 if present).`

    try {
        const res = await fetch('http://localhost:3001/api/claude', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }]
            })
        })
        const json = await res.json()
        const content = json.content[0].text
        return JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1))
    } catch (err) {
        console.error('AI Parse Error:', err)
        return { questionnaireTitle: 'ESG Questionnaire', questions: [] }
    }
}
