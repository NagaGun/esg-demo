import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import NavBar from '../components/NavBar'

export default function ClientLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      // Ensure it's a client
      if (data.user?.user_metadata?.user_type === 'consultant') {
        navigate('/dashboard')
      } else {
        navigate('/client/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FEFAE0]">
      <NavBar showLogo backTo="/" />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[32px] shadow-xl p-10 border border-gray-50">
            <div className="text-center mb-10">
              <span className="text-5xl mb-4 block">🌿</span>
              <h1 className="font-playfair text-3xl font-bold text-[#1B1B1B] mb-2">Client Portal</h1>
              <p className="text-gray-400 text-sm font-medium">Sign in to manage your ESG data requests</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 text-gray-700 font-medium transition"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 text-gray-700 font-medium transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#2D6A4F] text-white rounded-2xl font-bold shadow-xl shadow-green-900/10 hover:bg-green-800 transition flex items-center justify-center gap-2"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-10 text-center space-y-4">
              <p className="text-sm text-gray-400 font-medium">
                Don't have an account yet?
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Check your email for an invite link from your ESG consultant.
                Invite links automatically guide you through account creation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
