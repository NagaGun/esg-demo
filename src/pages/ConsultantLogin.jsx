import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function ConsultantLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    navigate('/dashboard')
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
            <h1 className="font-playfair text-2xl font-bold text-[#1B1B1B] mb-2">Consultant Portal</h1>
            <p className="text-[#1B1B1B]/70 text-sm">Sign in to manage your clients</p>
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
              <label className="block text-sm font-medium text-[#1B1B1B] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-earthana-forest focus:ring-2 focus:ring-earthana-forest/20 outline-none transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-earthana-forest text-white font-medium hover:bg-[#245a42] transition"
            >
              Sign In
            </button>
          </form>

          <a href="#" className="block text-center text-sm text-earthana-forest hover:underline mt-4">
            Forgot password?
          </a>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-[#1B1B1B]/50">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            type="button"
            className="w-full py-3 rounded-lg border-2 border-gray-200 text-[#1B1B1B] font-medium hover:border-gray-300 hover:bg-gray-50 transition"
          >
            Continue with Google
          </button>

          <p className="text-center text-sm text-[#1B1B1B]/70 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/consultant/login" className="text-earthana-forest font-medium hover:underline">
              Start free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
