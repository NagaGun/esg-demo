import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ClientDashboard() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedRequest, setExpandedRequest] = useState(null)

    useEffect(() => {
        loadRequests()
    }, [])

    const loadRequests = async () => {
        try {
            setLoading(true)
            const { data: userData } = await supabase.auth.getUser()

            if (!userData?.user) {
                navigate('/client/login')
                return
            }
            setUser(userData.user)

            // Step 1: get client records
            const { data: clientRecords, error: clientError } = await supabase
                .from('clients')
                .select('*, consultants(full_name)')
                .or(
                    `client_user_id.eq.${userData.user.id},` +
                    `contact_email.eq.${userData.user.email}`
                )
                .order('created_at', { ascending: false })

            if (clientError) {
                console.error('Client load error:', clientError)
                setRequests([])
                return
            }

            console.log('Client records:', clientRecords?.length)

            if (!clientRecords?.length) {
                setRequests([])
                setLoading(false)
                return
            }

            // Step 2: get submissions for each client
            const clientIds = clientRecords
                .map(c => c.id)
                .filter(Boolean)

            const accessCodes = clientRecords
                .map(c => c.access_code)
                .filter(Boolean)

            console.log('Looking for client IDs:', clientIds)
            console.log('Looking for access codes:', accessCodes)

            // Try fetching by client_id first
            let submissionsData = []

            if (clientIds.length > 0) {
              const { data: subsByClientId } = await supabase
                .from('submissions')
                .select('*')
                .in('client_id', clientIds)
              
              console.log('Subs by client_id:', 
                subsByClientId?.length)
              
              if (subsByClientId?.length) {
                submissionsData = subsByClientId
              }
            }

            // Also try by access_code and merge results
            if (accessCodes.length > 0) {
              const { data: subsByCode } = await supabase
                .from('submissions')
                .select('*')
                .in('access_code', accessCodes)
              
              console.log('Subs by access_code:', 
                subsByCode?.length)
              
              if (subsByCode?.length) {
                // Merge without duplicates
                const existingIds = new Set(
                  submissionsData.map(s => s.id)
                )
                subsByCode.forEach(s => {
                  if (!existingIds.has(s.id)) {
                    submissionsData.push(s)
                  }
                })
              }
            }

            console.log('Total submissions found:', 
              submissionsData.length)

            // Step 3: merge submissions into client records matching BOTH ways
            const merged = clientRecords.map(client => ({
                ...client,
                submissions: submissionsData.filter(s =>
                    s.access_code === client.access_code ||
                    s.client_id === client.id
                )
            }))

            console.log('Merged requests:', merged.length)
            console.log('First request submissions:', merged[0]?.submissions?.length)

            setRequests(merged)

        } catch (err) {
            console.error('loadRequests error:', err)
            setRequests([])
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
            return {
                text: expandedRequest === request.id ? '▲ Hide Submission' : '▼ View Submission →',
                action: () => setExpandedRequest(expandedRequest === request.id ? null : request.id)
            }
        }
        if (status === 'In Progress') {
            return { text: 'Continue Upload →', action: () => navigate(`/client/portal/${request.access_code}`) }
        }
        if (status === 'Accepted') {
            return { text: 'Start Uploading →', action: () => navigate(`/client/portal/${request.access_code}`) }
        }
        return { text: 'Accept & Start →', action: () => navigate(`/client/portal/${request.access_code}`) }
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
                                    <div className={`bg-white rounded-3xl p-8 shadow-sm transition-all border-l-[12px] hover:shadow-xl hover:translate-x-1 ${expandedRequest === req.id ? 'translate-x-1 ring-2 ring-[#2D6A4F]/10' : ''}`} style={{ borderLeftColor: getStatusColor(status) }}>
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

                                        {expandedRequest === req.id && (
                                            <div style={{
                                                background: '#F9FAFB',
                                                border: '1px solid #E5E7EB',
                                                borderTop: 'none',
                                                borderRadius: '0 0 12px 12px',
                                                padding: '24px'
                                            }}>
                                                {req.submissions && req.submissions.length > 0 ? (
                                                    <div>
                                                        <h4 style={{
                                                            fontFamily: 'Playfair Display, serif',
                                                            fontSize: '16px',
                                                            marginBottom: '16px',
                                                            color: '#1B1B1B'
                                                        }}>
                                                            Your Submission Summary
                                                        </h4>

                                                        {/* Extracted Data Table */}
                                                        {req.submissions[0].extracted_data && Object.keys(req.submissions[0].extracted_data).length > 0 && (
                                                            <div style={{ marginBottom: '20px' }}>
                                                                <p style={{
                                                                    fontSize: '13px',
                                                                    fontWeight: '600',
                                                                    color: '#2D6A4F',
                                                                    marginBottom: '8px'
                                                                }}>
                                                                    📄 Extracted from Documents
                                                                </p>
                                                                <table style={{
                                                                    width: '100%',
                                                                    borderCollapse: 'collapse',
                                                                    fontSize: '13px'
                                                                }}>
                                                                    <tbody>
                                                                        {Object.entries(req.submissions[0].extracted_data)
                                                                            .filter(([k, v]) => v !== null && v !== undefined)
                                                                            .map(([key, value]) => (
                                                                                <tr key={key} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                                                                    <td style={{
                                                                                        padding: '6px 8px',
                                                                                        color: '#6B7280',
                                                                                        width: '55%',
                                                                                        textTransform: 'capitalize'
                                                                                    }}>
                                                                                        {key.replace(/_/g, ' ')}
                                                                                    </td>
                                                                                    <td style={{
                                                                                        padding: '6px 8px',
                                                                                        color: '#1B1B1B',
                                                                                        fontWeight: '500'
                                                                                    }}>
                                                                                        {typeof value === 'boolean'
                                                                                            ? (value ? 'Yes' : 'No')
                                                                                            : String(value)}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}

                                                        {/* Manual Answers Table */}
                                                        {req.submissions[0].manual_answers && Object.keys(req.submissions[0].manual_answers).length > 0 && (
                                                            <div style={{ marginBottom: '20px' }}>
                                                                <p style={{
                                                                    fontSize: '13px',
                                                                    fontWeight: '600',
                                                                    color: '#D4A373',
                                                                    marginBottom: '8px'
                                                                }}>
                                                                    ✏️ Manually Entered
                                                                </p>
                                                                <table style={{
                                                                    width: '100%',
                                                                    borderCollapse: 'collapse',
                                                                    fontSize: '13px'
                                                                }}>
                                                                    <tbody>
                                                                        {Object.entries(req.submissions[0].manual_answers)
                                                                            .filter(([k, v]) => v !== null && v !== undefined)
                                                                            .map(([key, value]) => (
                                                                                <tr key={key} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                                                                    <td style={{
                                                                                        padding: '6px 8px',
                                                                                        color: '#6B7280',
                                                                                        width: '55%',
                                                                                        textTransform: 'capitalize'
                                                                                    }}>
                                                                                        {key.replace(/_/g, ' ')}
                                                                                    </td>
                                                                                    <td style={{
                                                                                        padding: '6px 8px',
                                                                                        color: '#1B1B1B',
                                                                                        fontWeight: '500'
                                                                                    }}>
                                                                                        {typeof value === 'boolean'
                                                                                            ? (value ? 'Yes' : 'No')
                                                                                            : String(value)}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}

                                                        {/* Footer */}
                                                        <div style={{
                                                            borderTop: '1px solid #E5E7EB',
                                                            paddingTop: '12px',
                                                            fontSize: '12px',
                                                            color: '#9CA3AF'
                                                        }}>
                                                            <p>📎 Documents: {
                                                                (req.submissions[0].documents || [])
                                                                    .join(', ') || 'None listed'
                                                            }</p>
                                                            <p style={{ marginTop: '4px' }}>
                                                                🕐 Submitted: {new Date(
                                                                    req.submissions[0].submitted_at
                                                                ).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        padding: '24px',
                                                        textAlign: 'center',
                                                        color: '#6B7280',
                                                        fontSize: '14px'
                                                    }}>
                                                        No submission data found.
                                                        <br />
                                                        <small style={{ color: '#9CA3AF' }}>
                                                            If you submitted recently,
                                                            try refreshing the page.
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
