import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ClientDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedRequestId, setExpandedRequestId] = useState(null)

    useEffect(() => {
        loadDashboardData()
    }, [])

    async function loadDashboardData() {
        setLoading(true)
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
            navigate('/client/login')
            return
        }
        setUser(authUser)

        try {
            // Find all client records matching this user's ID or email
            const { data, error } = await supabase
                .from('clients')
                .select('*, consultants(full_name), submissions(*)')
                .or(`client_user_id.eq.${authUser.id},contact_email.eq.${authUser.email}`)
                .order('created_at', { ascending: false })

            if (error) throw error
            setRequests(data || [])
        } catch (err) {
            console.error('Error loading dashboard:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        navigate('/client/login')
    }

    const getStatusColor = (status) => {
        const colors = {
            'Pending': '#9CA3AF',
            'Accepted': '#3B82F6',
            'In Progress': '#F59E0B',
            'Submitted': '#10B981'
        }
        return colors[status] || '#9CA3AF'
    }

    const getButtonConfig = (request) => {
        const status = request.invite_status || 'Pending'
        if (status === 'Submitted') {
            return { text: 'View Submission →', action: () => setExpandedRequestId(expandedRequestId === request.id ? null : request.id) }
        }
        if (status === 'In Progress') {
            return { text: 'Continue Upload →', action: () => navigate(`/client/portal/${request.access_code}`) }
        }
        if (status === 'Accepted') {
            return { text: 'Start Uploading →', action: () => navigate(`/client/portal/${request.access_code}`) }
        }
        return { text: 'Accept & Start →', action: () => navigate(`/client/portal/${request.access_code}`) }
    }

    const renderSubmissionSummary = (submission) => {
        if (!submission) return null

        return (
            <div className="mt-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-inner animate-fadeIn">
                <h4 className="font-bold text-[#2D6A4F] mb-4 flex items-center gap-2">
                    <span>📋</span> Submission Summary
                </h4>

                <div className="space-y-6">
                    {submission.extracted_data && Object.keys(submission.extracted_data).length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Automated Extraction</p>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(submission.extracted_data).slice(0, 6).map(([k, v]) => (
                                    <div key={k} className="flex justify-between border-b border-gray-50 pb-1">
                                        <span className="text-xs text-gray-500 capitalize">{k.replace('_', ' ')}</span>
                                        <span className="text-xs font-bold font-mono">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {submission.manual_answers && Object.keys(submission.manual_answers).length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Questionnaire Answers</p>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(submission.manual_answers).slice(0, 4).map(([k, v]) => (
                                    <div key={k} className="flex justify-between border-b border-gray-50 pb-1">
                                        <span className="text-xs text-gray-500 capitalize">{k.replace('_', ' ')}</span>
                                        <span className={`text-[10px] font-bold ${typeof v === 'boolean' ? (v ? 'text-green-600' : 'text-red-500') : ''}`}>
                                            {v === true ? 'Yes' : v === false ? 'No' : v}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="text-[10px] text-gray-400">
                            <span className="font-bold">Submitted:</span> {new Date(submission.submitted_at || submission.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-gray-400">
                            <span className="font-bold">Docs:</span> {submission.documents?.length || 0} files
                        </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg text-center text-[10px] font-bold text-green-700 uppercase tracking-widest">
                        ✅ This submission is complete
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FEFAE0] flex items-center justify-center">
                <div className="text-6xl animate-bounce">🌿</div>
            </div>
        )
    }

    const completedCount = requests.filter(r => r.invite_status === 'Submitted').length
    const pendingCount = requests.length - completedCount

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* NAVBAR */}
            <nav className="h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🌿</span>
                    <span className="font-playfair text-xl font-bold text-[#2D6A4F]">Earthana</span>
                </div>
                <div className="hidden md:block">
                    <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">My ESG Requests</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-[#1B1B1B] hidden sm:inline">{user?.email}</span>
                    <button onClick={handleSignOut} className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition">Sign Out</button>
                </div>
            </nav>

            {/* HEADER STATS */}
            <div className="max-w-5xl w-full mx-auto p-6 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="font-playfair text-4xl font-bold text-[#1B1B1B] mb-2">Welcome Back</h1>
                        <p className="text-gray-500">Manage your sustainability data requests from consultants.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                            <span className="text-sm font-bold">{completedCount} Completed</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                            <span className="text-sm font-bold">{pendingCount} Awaiting Action</span>
                        </div>
                    </div>
                </div>

                {/* REQUEST LIST */}
                {requests.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-gray-200 opacity-50">
                        <div className="text-8xl mb-6">📭</div>
                        <h2 className="font-playfair text-2xl font-bold mb-2">No ESG requests yet</h2>
                        <p className="text-sm max-w-xs mx-auto">When a consultant sends you a data request, it will appear here.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {requests.map(req => {
                            const status = req.invite_status || 'Pending'
                            const config = getButtonConfig(req)
                            return (
                                <div key={req.id} className="group">
                                    <div className={`bg-white rounded-3xl p-8 shadow-sm transition-all border-l-[12px] hover:shadow-xl hover:translate-x-1 ${expandedRequestId === req.id ? 'translate-x-1 ring-2 ring-[#2D6A4F]/10' : ''}`} style={{ borderLeftColor: getStatusColor(status) }}>
                                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-2xl font-bold text-[#1B1B1B]">{req.company_name}</h3>
                                                    <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">{req.framework}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-400">
                                                    <span className="flex items-center gap-1.5">👤 Consultant: {req.consultants?.full_name || 'Assigned Consultant'}</span>
                                                    <span className="flex items-center gap-1.5">📅 Deadline: {req.deadline ? new Date(req.deadline).toLocaleDateString() : 'No deadline'}</span>
                                                    <span className="flex items-center gap-1.5">📊 Year: {req.reporting_year}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Status</p>
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(status) }}></div>
                                                        <span className="font-bold text-sm uppercase tracking-wider" style={{ color: getStatusColor(status) }}>{status}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={config.action}
                                                    className={`px-8 py-3 rounded-2xl font-bold text-sm transition shadow-lg ${status === 'Submitted' ? 'bg-white border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-green-50 shadow-green-900/5' : 'bg-[#2D6A4F] text-white hover:bg-green-800 shadow-green-900/10'}`}
                                                >
                                                    {config.text}
                                                </button>
                                            </div>
                                        </div>

                                        {expandedRequestId === req.id && renderSubmissionSummary(req.submissions?.[0])}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
        </div>
    )
}
