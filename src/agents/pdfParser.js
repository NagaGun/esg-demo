const API_URL = 'http://localhost:3001/api/claude'
const MODEL = 'claude-sonnet-4-20250514'

export async function parsePDFWithAI(billText) {
  try {
    const prompt = `You are a utility bill data extractor. Extract fields from this utility bill and return ONLY a valid JSON object. No extra text, no markdown, no backticks. Just raw JSON.

Format:
{
  startDate: YYYY-MM-DD string,
  endDate: YYYY-MM-DD string,
  energyType: one of exactly: electricity, natural_gas, diesel, steam,
  unit: one of exactly: kWh, MWh, therms, gallons, mmbtu,
  usageAmount: number only no units
}

If you cannot find a field with confidence, use an empty string for strings and 0 for numbers.

Bill text: ${billText}`

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
      return {}
    }

    const data = await res.json()
    const raw = data.content?.[0]?.text ?? ''

    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : raw
    return JSON.parse(jsonStr)
  } catch {
    return {}
  }
}
