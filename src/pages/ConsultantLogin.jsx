import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ConsultantLogin() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { email, password, confirmPassword, fullName, companyName } = formData

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters")
        setLoading(false)
        return
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName
          }
        }
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Insert consultant record immediately
        try {
          await supabase.from('consultants').insert({
            id: data.user.id,
            email: email,
            full_name: fullName,
            company_name: companyName
          })
          // Navigate immediately — email confirmation is disabled
          navigate('/dashboard')
        } catch (err) {
          setError("Error creating consultant profile. Please try signing in.")
          console.error(err)
        }
      }
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        setError("Invalid email or password")
      } else {
        navigate('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 font-sans">
      {/* LEFT: FORM SIDE (CREAM) */}
      <div className="bg-[#FEFAE0] flex flex-col justify-center p-8 md:p-16 lg:p-24 scale-in">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <h1 className="font-playfair text-4xl font-bold text-[#2D6A4F] mb-2 flex items-center gap-2">
              🌿 Earthana
            </h1>
            <p className="text-[#1B1B1B] font-medium opacity-60">
              The ESG platform for modern consultants.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-white">
            <h2 className="font-playfair text-2xl font-bold text-[#1B1B1B] mb-6">
              {isSignUp ? 'Create Consultant Account' : 'Welcome Back'}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold animate-shake">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#2D6A4F] transition"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#2D6A4F] transition"
                      placeholder="Green Analytics Ltd"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#2D6A4F] transition"
                  placeholder="name@company.com"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#2D6A4F] transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-gray-400 hover:text-[#2D6A4F]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#2D6A4F] transition"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#2D6A4F] text-white rounded-2xl font-bold text-xl hover:bg-green-800 transition shadow-lg flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  isSignUp ? 'Sign Up' : 'Sign In →'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm font-bold text-[#2D6A4F] hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: MARS/FOREST SIDE */}
      <div className="hidden md:block bg-[#2D6A4F] p-24 text-white relative overflow-hidden">
        <div className="relative z-10 h-full flex flex-col justify-end fade-in-up">
          <div className="text-6xl mb-8">✨</div>
          <h2 className="font-playfair text-5xl font-bold mb-6 leading-tight">
            Streamline your ESG reporting pipeline.
          </h2>
          <p className="text-xl text-white text-opacity-80 max-w-md leading-relaxed">
            Earthana uses agentic AI to process complex business documents so you can focus on strategy, not spreadsheets.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-[#FEFAE0] opacity-10 rounded-full blur-3xl"></div>
      </div>

      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-4px); } 40%, 80% { transform: translateX(4px); } }
        .scale-in { animation: scaleIn 0.6s ease-out forwards; }
        .fade-in-up { animation: fadeInUp 0.8s ease-out 0.2s forwards; opacity: 0; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  )
}
