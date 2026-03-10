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

export async function fillQuestionnaire(parsedQuestionnaire, smeData) {
  console.log('=== fillQuestionnaire START ===')
  console.log('Questions received:', parsedQuestionnaire?.questions?.length)
  console.log('Data fields:', Object.keys(smeData || {}).length)

  if (!parsedQuestionnaire?.questions?.length) {
    console.warn('No questions to fill')
    return { filledAnswers: [], completionPct: 0 }
  }

  // Build complete data string from ALL fields
  const dataLines = Object.entries(smeData || {})
    .filter(([k, v]) => 
      v !== null && v !== undefined && v !== ''
    )
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  console.log('=== FILL QUESTIONNAIRE ===')
  console.log('Questions count:', 
    parsedQuestionnaire.questions.length)
  console.log('Data fields available:', 
    Object.keys(smeData || {}).length)
  console.log('Data:', dataLines)

  const prompt = `You are an ESG data assistant.
Fill in answers to every question using the 
company data provided below.

COMPANY DATA:
${dataLines}

INSTRUCTIONS:
- Answer EVERY question using the data above
- Match each question to the MOST RELEVANT data field. 
- Do not reuse the same data field for multiple unrelated questions. 
- If no relevant field exists set needsManualInput to true and leave answer empty.
- For yes/no questions use "Yes" or "No"
- For number questions use the exact number
- For percentage questions include the % symbol
- If exact data exists: confidence = "high"
- If calculated or derived: confidence = "medium"
- If estimated or approximated: confidence = "low"
- NEVER leave an answer blank if any related
  data exists

Return a JSON object exactly like this:
{
  "filledAnswers": [
    {
      "id": "Q1",
      "question": "exact question text",
      "answer": "the answer value",
      "unit": "unit if applicable or empty string",
      "confidence": "high|medium|low",
      "needsManualInput": false,
      "dataSource": "which data field was used"
    }
  ],
  "completionPct": 85
}

QUESTIONS TO FILL:
${JSON.stringify(
  parsedQuestionnaire.questions, null, 2
)}

Return only valid JSON. No markdown. 
No explanation. No backticks.`

  try {
    const response = await fetch(
      'http://localhost:3001/api/claude',
      {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }]
        })
      }
    )
    const data = await response.json()
    const text = data.content[0].text

    // 5-attempt JSON parse
    let parsed = null

    // Attempt 1: direct parse
    try { parsed = JSON.parse(text) } catch(e) {}

    // Attempt 2: extract JSON object
    if (!parsed) {
      try {
        const match = text.match(/\{[\s\S]*\}/)
        if (match) parsed = JSON.parse(match[0])
      } catch(e) {}
    }

    // Attempt 3: remove markdown fences
    if (!parsed) {
      try {
        const clean = text
          .replace(/\`\`\`json/g, '')
          .replace(/\`\`\`/g, '')
          .trim()
        parsed = JSON.parse(clean)
      } catch(e) {}
    }

    // Attempt 4: fix trailing commas
    if (!parsed) {
      try {
        const fixed = text
          .replace(/,(\s*[}\]])/g, '$1')
        parsed = JSON.parse(fixed)
      } catch(e) {}
    }

    console.log('=== fillQuestionnaire RESPONSE ===')
    console.log('Raw length:', text?.length)
    console.log('Answers filled:', parsed?.filledAnswers?.length)

    if (!parsed) {
      console.error('All parse attempts failed')
      console.error('Raw text:', text)
      return { filledAnswers: [], completionPct: 0 }
    }

    const answers = parsed.filledAnswers || []
    console.log('Filled answers count:', answers.length)
    return {
      filledAnswers: answers,
      completionPct: parsed.completionPct || 
        Math.round(
          answers.filter(a => !a.needsManualInput)
            .length / answers.length * 100
        )
    }

  } catch(err) {
    console.error('fillQuestionnaire error:', err)
    return { filledAnswers: [], completionPct: 0 }
  }
}

// RESTORED FOR COMPATIBILITY
export async function extractSMEData(documentText) {
    const result = await parseSMEDocument(documentText)
    return result.data || {}
}

export async function parseQuestionnaire(text) {
  console.log('=== parseQuestionnaire START ===')
  console.log('Input text length:', text?.length)

  if (!text || text.trim().length < 10) {
    console.warn('Questionnaire text too short')
    return { questions: [], questionnaireTitle: '' }
  }

  // Process in chunks if text is very long
  // to avoid response cutoff
  const truncatedText = text.length > 3000 
    ? text.substring(0, 3000) + '\n...[truncated]'
    : text

  const prompt = `Extract all questions from this 
ESG questionnaire template.

QUESTIONNAIRE TEXT:
${truncatedText}

Return a JSON object. Keep answers SHORT.
Maximum 20 questions. If more exist pick the
most important 20.

{
  "questionnaireTitle": "title here",
  "questions": [
    {
      "id": "Q1",
      "section": "Environmental",
      "question": "question text here",
      "type": "number|text|boolean|percentage",
      "unit": "kWh|tonnes|%|etc or empty string"
    }
  ]
}

RULES:
- Maximum 20 questions total
- Keep question text under 100 characters
- type must be exactly: number, text, boolean, 
  or percentage
- unit is empty string if not applicable
- Return ONLY valid JSON, no markdown, 
  no backticks, no extra text`

  try {
    const response = await fetch(
      'http://localhost:3001/api/claude',
      {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.05,
          max_tokens: 3000,
          messages: [{ role: 'user', content: prompt }]
        })
      }
    )

    const data = await response.json()
    const rawText = data.content[0].text

    let parsed = null

    // Attempt 1: direct parse
    try { 
      parsed = JSON.parse(rawText)
      console.log('Parse attempt 1 succeeded')
    } catch(e) {}

    // Attempt 2: extract JSON object
    if (!parsed) {
      try {
        const match = rawText.match(/\{[\s\S]*\}/)
        if (match) {
          parsed = JSON.parse(match[0])
          console.log('Parse attempt 2 succeeded')
        }
      } catch(e) {}
    }

    // Attempt 3: strip markdown
    if (!parsed) {
      try {
        const clean = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim()
        parsed = JSON.parse(clean)
        console.log('Parse attempt 3 succeeded')
      } catch(e) {}
    }

    // Attempt 4: fix trailing commas
    if (!parsed) {
      try {
        const fixed = rawText
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim()
        parsed = JSON.parse(fixed)
        console.log('Parse attempt 4 succeeded')
      } catch(e) {}
    }

    // Attempt 5: find and fix truncated JSON
    if (!parsed) {
      try {
        // Find last complete question object
        const cleanText = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
        
        // Find last closing brace of a question
        const lastComplete = cleanText.lastIndexOf(
          '}\n  ]'
        ) || cleanText.lastIndexOf('}\n]')
        
        if (lastComplete > 0) {
          const truncated = cleanText.substring(
            0, lastComplete
          ) + '}\n  ]\n}'
          parsed = JSON.parse(truncated)
          console.log('Parse attempt 5 succeeded')
        }
      } catch(e) {}
    }

    if (!parsed || !parsed.questions) {
      console.error('All parse attempts failed')
      console.error('Raw:', rawText.substring(0,500))
      return { questions: [], questionnaireTitle: '' }
    }

    console.log('=== parseQuestionnaire SUCCESS ===')
    console.log('Title:', parsed.questionnaireTitle)
    console.log('Questions count:', parsed.questions?.length)
    parsed.questions?.slice(0,3).forEach((q,i) => 
      console.log(`Q${i+1}:`, q.question)
    )

    return {
      questionnaireTitle: parsed.questionnaireTitle || '',
      questions: parsed.questions || []
    }

  } catch(err) {
    console.error('parseQuestionnaire error:', err)
    return { questions: [], questionnaireTitle: '' }
  }
}
