import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function ClientLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [accessCode, setAccessCode] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (accessCode.trim()) {
      navigate(`/submit/${accessCode.trim()}`)
    }
  }

  return (
    <div className="min-h-screen bg-earthana-cream flex items-center justify-center px-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl">🌿</span>
              <span className="font-playfair text-2xl font-semibold text-earthana-forest">Earthana</span>
            </Link>
            <h1 className="font-playfair text-2xl font-bold text-[#1B1B1B] mb-2">Client Portal</h1>
            <p className="text-[#1B1B1B]/70 text-sm">Enter your access code to submit your data</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1B1B1B] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-earthana-forest focus:ring-2 focus:ring-earthana-forest/20 outline-none transition"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1B1B1B] mb-1">Access Code</label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-earthana-forest focus:ring-2 focus:ring-earthana-forest/20 outline-none transition font-mono"
                placeholder="e.g. abc12345"
                maxLength={10}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-earthana-forest text-white font-medium hover:bg-[#245a42] transition"
            >
              Access My Portal
            </button>
          </form>

          <p className="text-center text-sm text-[#1B1B1B]/70 mt-6">
            Your access code was sent by your ESG consultant. Check your email or contact them directly.
          </p>
        </div>
      </div>
    </div>
  )
}
