import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ClientRegister() {
    const { accessCode } = useParams()
    const navigate = useNavigate()

    const [mode, setMode] = useState('register') // 'register' or 'login'
    const [clientInfo, setClientInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [authLoading, setAuthLoading] = useState(false)

    // Form states
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        loadInvite()
    }, [accessCode])

    async function loadInvite() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*, consultants(full_name)')
                .eq('access_code', accessCode)
                .maybeSingle()

            if (error || !data) {
                setError('Invalid or expired invite link.')
            } else {
                setClientInfo(data)
                setEmail(data.contact_email || '')
            }
        } catch (err) {
            setError('Failed to load invite.')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }

        setAuthLoading(true)
        setError(null)

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        user_type: 'client',
                        access_code: accessCode
                    }
                }
            })

            if (signUpError) throw signUpError

            if (data.user) {
                // Link client record
                const { error: updateError } = await supabase
                    .from('clients')
                    .update({
                        client_user_id: data.user.id,
                        invite_status: 'Accepted',
                        accepted_at: new Date().toISOString()
                    })
                    .eq('access_code', accessCode)

                if (updateError) throw updateError

                navigate('/client/dashboard')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setAuthLoading(false)
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setAuthLoading(true)
        setError(null)

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (signInError) throw signInError
            navigate('/client/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setAuthLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FEFAE0]">
                <div className="text-6xl animate-bounce">🌿</div>
            </div>
        )
    }

    if (error && !clientInfo) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FEFAE0] p-6 text-center">
                <div className="text-8xl mb-6">⚠️</div>
                <h1 className="font-playfair text-4xl font-bold text-[#2D6A4F] mb-4">Invalid Link</h1>
                <p className="text-gray-500 max-w-md mb-8">{error}</p>
                <Link to="/" className="px-8 py-3 bg-[#2D6A4F] text-white rounded-xl font-bold transition hover:bg-green-800">Return Home</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans">
            {/* LEFT PANEL */}
            <div className="md:w-1/2 bg-[#2D6A4F] p-12 md:p-24 flex flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 mb-16">
                        <span className="text-3xl">🌿</span>
                        <span className="font-playfair text-2xl font-bold">Earthana</span>
                    </Link>
                    <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-8 leading-tight">Welcome to your ESG Portal</h1>
                    <p className="text-xl md:text-2xl text-white/80 font-medium max-w-lg leading-relaxed mb-6">
                        {clientInfo.consultants?.full_name || 'Your consultant'} has invited <span className="text-white font-bold">{clientInfo.company_name}</span> to submit sustainability data.
                    </p>
                    <p className="text-lg text-white/60">
                        Create a free account to get started. Your data will be saved securely and shared only with your ESG consultant.
                    </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -right-24 w-64 h-64 bg-green-400/10 rounded-full blur-3xl"></div>
            </div>

            {/* RIGHT PANEL */}
            <div className="md:w-1/2 bg-[#FEFAE0] p-8 md:p-24 flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                    {/* TABS */}
                    <div className="flex bg-white/50 p-1 rounded-2xl mb-12">
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition ${mode === 'register' ? 'bg-[#2D6A4F] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Create Account
                        </button>
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition ${mode === 'login' ? 'bg-[#2D6A4F] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Sign In
                        </button>
                    </div>

                    <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold animate-fadeIn">
                                {error}
                            </div>
                        )}

                        {mode === 'register' && (
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full px-6 py-4 bg-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 text-gray-700 font-medium"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                            <input
                                required
                                type="email"
                                placeholder="email@company.com"
                                className="w-full px-6 py-4 bg-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 text-gray-700 font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                            <div className="relative">
                                <input
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full px-6 py-4 bg-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 text-gray-700 font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm Password</label>
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-6 py-4 bg-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 text-gray-700 font-medium"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        )}

                        <button
                            disabled={authLoading}
                            className="w-full py-5 bg-[#2D6A4F] text-white rounded-[20px] font-bold text-lg shadow-xl shadow-green-900/10 hover:bg-green-800 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3"
                        >
                            {authLoading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : mode === 'register' ? (
                                'Create Account & Accept Invite'
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-400 text-sm font-medium">
                        {mode === 'register' ? (
                            <>Already have an account? <button onClick={() => setMode('login')} className="text-[#2D6A4F] font-bold hover:underline">Sign In</button></>
                        ) : (
                            <>Don't have an account? <button onClick={() => setMode('register')} className="text-[#2D6A4F] font-bold hover:underline">Create one</button></>
                        )}
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
        </div>
    )
}
