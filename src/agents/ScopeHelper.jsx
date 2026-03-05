import { useState } from 'react'

const API_URL = 'http://localhost:3001/api/claude'
const MODEL = 'claude-sonnet-4-20250514'

function ScopeHelper() {
  const [isOpen, setIsOpen] = useState(false)
  const [activity, setActivity] = useState('')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)

  async function handleClassify() {
    if (!activity.trim()) return

    setLoading(true)
    setResponse(null)

    const prompt = `You are an ESG Scope classifier. Given this business activity, respond in 2 sentences max: what Scope it is (1, 2, or 3), which category, and why. Activity: ${activity.trim()}`

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 256,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error?.message || `API error: ${res.status}`)
      }

      const data = await res.json()
      const text = data.content?.[0]?.text || 'No response received.'
      setResponse(text)
    } catch (err) {
      setResponse(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-96 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <h3 className="mb-3 font-semibold text-gray-900">Scope Helper</h3>
          <textarea
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="Describe a business activity to classify (e.g., company-owned vehicle fleet emissions)"
            className="mb-3 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            rows={4}
          />
          <button
            onClick={handleClassify}
            disabled={loading || !activity.trim()}
            className="mb-3 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Classifying...' : 'Classify Scope'}
          </button>
          {response && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
              {response}
            </div>
          )}
        </div>
      )}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl shadow-lg hover:bg-green-700"
        aria-label={isOpen ? 'Close Scope Helper' : 'Open Scope Helper'}
      >
        🤖
      </button>
    </div>
  )
}

export default ScopeHelper
