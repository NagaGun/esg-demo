const API_URL = 'http://localhost:3001/api/claude'
console.log('validator calling:', API_URL)
const MODEL = 'claude-sonnet-4-20250514'

const FALLBACK_RESULT = { isValid: false, issues: ['Validation service unavailable'] }

export default async function validateWithAI(formData) {
  try {
    const prompt = `You are an ESG data validator. Review this energy data submission and return ONLY a valid JSON object with no extra text, no markdown, no backticks. Just raw JSON.

Format:
{
  "isValid": true or false,
  "issues": ["list of specific problems"],
  "warnings": ["list of anomalies worth flagging"]
}

Check for: missing fields, usage amount of 0 or negative, date range over 1 year, unit mismatch with energy type, unusually high or low values.

Submission data:
Company: ${formData.companyName ?? ''}
Period: ${formData.startDate ?? ''} to ${formData.endDate ?? ''}
Energy type: ${formData.energyType ?? ''}
Unit: ${formData.unit ?? ''}
Amount: ${formData.usageAmount ?? ''}`

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      return FALLBACK_RESULT
    }

    const data = await res.json()
    const raw = data.content?.[0]?.text ?? ''

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : raw
    const parsed = JSON.parse(jsonStr)

    return {
      isValid: Boolean(parsed.isValid),
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
    }
  } catch {
    return FALLBACK_RESULT
  }
}
