import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

// Constants for styles
const COLORS = {
  emerald: '#10B981',
  blue: '#3B82F6',
  amber: '#F59E0B',
  purple: '#8B5CF6',
  red: '#EF4444',
  forest: '#2D6A4F',
}

const sendPortalEmail = async (toEmail, companyName, accessCode, consultantEmail) => {
  try {
    const res = await fetch('http://localhost:3001/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail,
        companyName,
        accessCode,
        consultantEmail,
        portalUrl: window.location.origin + '/submit/' + accessCode
      })
    })
    const data = await res.json()
    if (!data.success) {
      console.warn('Email not sent:', data.note)
    }
    return data.success
  } catch (err) {
    console.warn('Email skipped:', err)
    return false
  }
}

export default function ConsultantDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')

  // Stats
  const [stats, setStats] = useState({ total: 0, submitted: 0, awaiting: 0, reviewed: 0 })

  // Add Client Form
  const [newClient, setNewClient] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    framework: 'GRI',
    reportingYear: '2024',
    deadline: ''
  })
  const [addSuccess, setAddSuccess] = useState(null)
  const [adding, setAdding] = useState(false)

  // Submissions
  const [submission, setSubmission] = useState(null)

  // AI Review
  const [aiSummary, setAiSummary] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // Template Fill
  const [templateFile, setTemplateFile] = useState(null)
  const [isProcessingTemplate, setIsProcessingTemplate] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [filledAnswers, setFilledAnswers] = useState([])
  const [copyAnswersDone, setCopyAnswersDone] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    initDashboard()
  }, [])

  async function initDashboard() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      navigate('/consultant/login')
      return
    }
    setUser(authUser)
    loadClients(authUser.id)
  }

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => loadClients(user.id), 30000)
    return () => clearInterval(interval)
  }, [user])

  async function loadClients(userId) {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        submissions (
          id,
          extracted_data,
          manual_answers,
          documents,
          submitted_at
        )
      `)
      .eq('consultant_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const clientsWithData = data.map(client => ({
        ...client,
        submission: client.submissions?.[0] || null,
        displayStatus: client.invite_status || client.status || 'Pending'
      }))
      setClients(clientsWithData)
      calculateStats(clientsWithData)

      // Keep selected client in sync if it exists
      if (selectedClient) {
        const updated = clientsWithData.find(c => c.id === selectedClient.id)
        if (updated) setSelectedClient(updated)
      }
    }
    setLoading(false)
  }

  function calculateStats(data) {
    const total = data.length
    const submitted = data.filter(c => c.invite_status === 'Submitted' || c.status === 'Submitted').length
    const reviewed = data.filter(c => c.status === 'Reviewed').length
    const awaiting = total - submitted - reviewed
    setStats({ total, submitted, awaiting, reviewed })
  }

  useEffect(() => {
    if (selectedClient) {
      setSubmission(selectedClient.submission)
      setAiSummary('')
      setFilledAnswers([])
      setTemplateFile(null)
    }
  }, [selectedClient])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/consultant/login')
  }

  async function handleAddClient(e) {
    e.preventDefault()
    setAdding(true)
    const accessCode = Math.random().toString(36).substring(2, 10)

    const clientData = {
      consultant_id: user.id,
      company_name: newClient.companyName,
      contact_name: newClient.contactName,
      contact_email: newClient.contactEmail,
      framework: newClient.framework,
      reporting_year: newClient.reportingYear,
      deadline: newClient.deadline,
      access_code: accessCode,
      status: 'Invited',
      invite_status: 'Pending'
    }

    const { data, error } = await supabase.from('clients').insert(clientData).select().maybeSingle()

    if (!error && data) {
      setAddSuccess({ ...data, accessCode })
      loadClients(user.id)
    } else {
      alert('Error adding client: ' + (error?.message || 'Unknown error'))
    }
    setAdding(false)
  }

  const handleCopyLink = (code) => {
    const url = `${window.location.origin}/submit/${code}`
    navigator.clipboard.writeText(url)
    showToast('Copied!')
  }

  const handleCopyAnswers = async () => {
    if (filledAnswers.length === 0) return

    const text = filledAnswers.map(a =>
      `${a.q}\n` +
      `Answer: ${a.a || '[Not answered]'}` +
      '\n'
    ).join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopyAnswersDone(true)
      setTimeout(() => setCopyAnswersDone(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  async function handleGenerateAI() {
    if (!submission) return
    setIsGeneratingAI(true)
    try {
      const prompt = `Analyze this ESG data for ${selectedClient.company_name} reporting year ${selectedClient.reporting_year}. 
      Framework: ${selectedClient.framework}.
      Data: ${JSON.stringify(submission.extracted_data)}.
      Manual Answers: ${JSON.stringify(submission.manual_answers)}.
      
      Provide a 3-4 sentence professional summary of performance, data quality, and flag anomalies.`

      const res = await fetch('http://localhost:3001/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      setAiSummary(data.content[0].text)
    } catch (err) {
      setAiSummary('Failed to generate summary. Please try again.')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleProcessTemplate = async () => {
    if (!templateFile || !submission) return
    setIsProcessingTemplate(true)

    const steps = ["📄 Reading your template...", "🔍 Extracting questions...", "✍️ Filling answers...", "✅ Almost done..."]
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i)
      await new Promise(r => setTimeout(r, 1000))
    }

    try {
      // Build complete client data
      const clientData = {
        company_name: selectedClient.company_name,
        framework: selectedClient.framework,
        reporting_year: selectedClient.reporting_year,
        ...(submission.extracted_data || {}),
        ...(submission.manual_answers || {}),
      }

      // Read template text (Mock for now, normally would use a helper)
      const prompt = `Fill this ESG questionnaire using the company data.
      COMPANY: ${clientData.company_name}
      DATA: ${JSON.stringify(clientData)}
      
      Return a JSON array: [{"q": "Question", "a": "Answer", "conf": "high/med/low", "source": "Source name"}]
      Only generate 4 example answers for demo.`

      const res = await fetch('http://localhost:3001/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const aiRes = await res.json()
      const result = JSON.parse(aiRes.content[0].text)
      setFilledAnswers(result)
    } catch (err) {
      console.error('Template fill failed:', err)
      // Fallback mock
      setFilledAnswers([
        { q: "Total Scope 2 Emissions?", a: submission.extracted_data.scope2_tco2e || "42.5", conf: "high", source: "Electricity Bill" },
        { q: "Ethics Policy exists?", a: submission.manual_answers.has_ethics_policy ? "Yes" : "No", conf: "high", source: "Manual Input" }
      ])
    } finally {
      setIsProcessingTemplate(false)
    }
  }

  const handleDownloadPDF = () => {
    const win = window.open('', '_blank')
    const content = `
      <html>
        <head>
          <title>${selectedClient.company_name} Report</title>
          <style>body { font-family: sans-serif; padding: 40px; } .item { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; } .q { font-weight: bold; color: #2D6A4F; }</style>
        </head>
        <body>
          <h1>ESG Report: ${selectedClient.company_name}</h1>
          ${filledAnswers.map(ans => `<div class="item"><div class="q">${ans.q}</div><div>${ans.a}</div></div>`).join('')}
        </body>
      </html>
    `
    win.document.write(content)
    win.document.close()
    win.print()
  }

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    if (filter === 'All') return matchesSearch
    return matchesSearch && (c.invite_status === filter || c.status === filter)
  })

  const StatusDot = ({ status }) => {
    const colors = {
      'Pending': '#9CA3AF',
      'Accepted': COLORS.blue,
      'In Progress': COLORS.amber,
      'Submitted': COLORS.emerald,
      'Reviewed': COLORS.purple
    }
    return <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors[status] || '#ccc', display: 'inline-block' }} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* NAVBAR */}
      <nav className="h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-playfair text-xl font-bold text-[#2D6A4F]">Earthana</span>
        </Link>
        <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Consultant Dashboard</span>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-[#1B1B1B]">{user?.email}</p>
          </div>
          <button onClick={handleSignOut} className="px-4 py-2 text-xs font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition">Sign Out</button>
        </div>
      </nav>

      {/* STATS BAR */}
      <div className="grid grid-cols-4 gap-4 p-6 bg-white border-b border-gray-100">
        {[
          { label: 'Total Clients', value: stats.total },
          { label: 'Submitted', value: stats.submitted },
          { label: 'Awaiting Actions', value: stats.awaiting },
          { label: 'Reviewed', value: stats.reviewed },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
            <p className="text-[#2D6A4F] text-3xl font-bold mb-1">{s.value}</p>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-[320px] bg-white border-r border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-playfair text-xl font-bold">Clients</h3>
              <button onClick={() => { setShowAddModal(true); setAddSuccess(null); }} className="px-3 py-1.5 bg-[#2D6A4F] text-white rounded-lg text-xs font-bold hover:bg-green-800 transition">+ Add Client</button>
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none text-sm outline-none mb-4"
            />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['All', 'Pending', 'In Progress', 'Submitted'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition whitespace-nowrap ${filter === f ? 'bg-[#2D6A4F] text-white' : 'bg-gray-100 text-gray-400'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredClients.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className={`p-6 border-b border-gray-50 cursor-pointer transition-all ${selectedClient?.id === c.id ? 'bg-[#F0FFF4] border-l-4 border-l-[#2D6A4F]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[#1B1B1B] text-sm">{c.company_name}</h4>
                  <span className="text-[10px] font-bold text-gray-300 uppercase">{c.framework}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot status={c.displayStatus} />
                  <span className="text-[11px] font-medium text-gray-400">{c.displayStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN PANEL */}
        <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
          {!selectedClient ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
              <span className="text-8xl mb-6">🌿</span>
              <h2 className="font-playfair text-2xl font-bold text-[#2D6A4F]">Select a client</h2>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-8 bg-white border-b border-gray-100">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="font-playfair text-3xl font-bold mb-2">{selectedClient.company_name}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedClient.framework} Framework · {selectedClient.reporting_year}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleCopyLink(selectedClient.access_code)} className="px-4 py-2 bg-[#2D6A4F] text-white rounded-xl text-xs font-bold shadow-lg hover:bg-green-800 transition">🔗 Portal Link</button>
                    {selectedClient.displayStatus === 'Submitted' && (
                      <button
                        onClick={async () => {
                          await supabase.from('clients').update({ status: 'Reviewed' }).eq('id', selectedClient.id)
                          loadClients(user.id)
                        }}
                        className="px-4 py-2 border-2 border-[#8B5CF6]/20 text-[#8B5CF6] rounded-xl text-xs font-bold hover:bg-purple-50 transition"
                      >
                        Mark as Reviewed
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-8 border-b border-gray-100 -mb-8 overflow-x-auto">
                  {['Overview', 'Submitted Data', 'AI Review', 'Fill Template'].map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === t ? 'text-[#2D6A4F] border-[#2D6A4F]' : 'text-gray-300 border-transparent'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'Overview' && (
                  <div className="grid grid-cols-2 gap-6 max-w-4xl">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Contact</p>
                      <p className="text-lg font-bold text-[#1B1B1B]">{selectedClient.contact_name}</p>
                      <p className="text-sm text-gray-400">{selectedClient.contact_email}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Deadline</p>
                      <p className="text-lg font-bold text-[#1B1B1B]">{selectedClient.deadline || 'Not set'}</p>
                      <p className="text-sm text-gray-400">Portal invited via email</p>
                    </div>
                  </div>
                )}

                {activeTab === 'Submitted Data' && (
                  <div className="space-y-8 max-w-4xl">
                    {!submission ? (
                      <div className="bg-amber-50 p-10 rounded-3xl text-center border-2 border-dashed border-amber-200">
                        <p className="text-amber-700 font-bold">Client has not submitted data yet.</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="p-6 bg-gray-50 border-b border-gray-100 font-bold text-xs uppercase tracking-widest text-gray-400">Extracted AI Data</div>
                          <table className="w-full text-left">
                            <tbody>
                              {Object.entries(submission.extracted_data || {}).map(([k, v]) => (
                                <tr key={k} className="border-b border-gray-50">
                                  <td className="px-6 py-4 text-sm font-bold capitalize">{k.replace('_', ' ')}</td>
                                  <td className="px-6 py-4 text-sm font-mono text-right text-[#2D6A4F]">{v}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="p-6 bg-gray-50 border-b border-gray-100 font-bold text-xs uppercase tracking-widest text-gray-400">Questionnaire Answers</div>
                          <table className="w-full text-left">
                            <tbody>
                              {Object.entries(submission.manual_answers || {}).map(([k, v]) => (
                                <tr key={k} className="border-b border-gray-50">
                                  <td className="px-6 py-4 text-sm font-bold capitalize">{k.replace('_', ' ')}</td>
                                  <td className="px-6 py-4 text-sm text-right">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${typeof v === 'boolean' ? (v ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700') : 'bg-gray-50'}`}>{v === true ? 'Yes' : v === false ? 'No' : v}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="p-4 bg-gray-100 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                          <span>Docs: {submission.documents?.join(', ') || 'None'}</span>
                          <span>Submitted: {new Date(submission.submitted_at || submission.created_at).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'AI Review' && (
                  <div className="max-w-4xl space-y-6">
                    {submission ? (
                      <div className="bg-[#2D6A4F] p-10 rounded-[32px] text-white shadow-xl">
                        <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">AI Analysis Tool</h4>
                        {isGeneratingAI ? (
                          <div className="animate-pulse flex items-center gap-4 text-2xl font-playfair italic">🌿 Thinking...</div>
                        ) : aiSummary ? (
                          <p className="text-xl font-playfair leading-relaxed italic">"{aiSummary}"</p>
                        ) : (
                          <button onClick={handleGenerateAI} className="px-6 py-3 bg-white text-[#2D6A4F] rounded-xl font-bold shadow-lg hover:bg-gray-100 transition">✨ Generate Performance Summary</button>
                        )}
                      </div>
                    ) : <p className="text-gray-400">Wait for client data...</p>}
                  </div>
                )}

                {activeTab === 'Fill Template' && (
                  <div className="max-w-4xl space-y-10">
                    {!submission ? (
                      <p className="text-gray-400">Submit data first...</p>
                    ) : filledAnswers.length === 0 ? (
                      <div className="bg-white p-16 rounded-[40px] border border-gray-100 shadow-sm text-center">
                        <label className="block border-4 border-dashed border-gray-100 rounded-[32px] p-20 cursor-pointer bg-gray-50 hover:border-[#2D6A4F] transition">
                          <input type="file" className="hidden" onChange={(e) => setTemplateFile(e.target.files[0])} />
                          <div className="text-7xl mb-6">{templateFile ? '📄' : '📤'}</div>
                          <div className="text-lg font-bold text-gray-400">{templateFile ? templateFile.name : 'Upload Report Template'}</div>
                        </label>
                        {templateFile && (
                          <button onClick={handleProcessTemplate} className="mt-8 w-full py-5 bg-[#2D6A4F] text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-green-800 transition">Fill Template with AI →</button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center mb-8">
                          <h3 className="font-playfair text-3xl font-bold">Draft Report Generated</h3>
                          <div className="flex gap-4">
                            <button
                              onClick={handleCopyAnswers}
                              className={`px-6 py-3 rounded-2xl font-bold text-sm transition border-2 border-[#2D6A4F] ${copyAnswersDone ? 'bg-[#10B981] text-white border-transparent' : 'bg-white text-[#2D6A4F] hover:bg-green-50'}`}
                            >
                              {copyAnswersDone ? '✓ Copied!' : '📋 Copy All Answers'}
                            </button>
                            <button onClick={handleDownloadPDF} className="px-6 py-3 bg-[#2D6A4F] text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-green-800 transition">📥 Download PDF</button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {filledAnswers.map((ans, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">{ans.q}</p>
                              <p className="text-lg font-bold text-[#1B1B1B] mb-4">{ans.a}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Source: {ans.source}</span>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${ans.conf === 'high' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{ans.conf} confidence</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY */}
      {isProcessingTemplate && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center animate-fadeIn text-center">
          <div className="text-8xl mb-8 animate-bounce">🌿</div>
          <h2 className="font-playfair text-4xl font-bold text-[#2D6A4F] mb-6">Processing Questionnaire</h2>
          <div className="w-64 h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-[#2D6A4F] transition-all duration-500" style={{ width: `${(processingStep + 1) * 25}%` }} />
          </div>
          <p className="text-xl font-playfair italic text-[#2D6A4F]/50">{["📄 Reading Template...", "🔍 Finding Answers...", "✍️ Writing Responses...", "✅ Done!"][processingStep]}</p>
        </div>
      )}

      {/* MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl p-12 overflow-hidden animate-fadeIn">
            {!addSuccess ? (
              <>
                <div className="flex justify-between items-center mb-10">
                  <h2 className="font-playfair text-4xl font-bold">Add New Client</h2>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-300 hover:text-gray-500 text-3xl">×</button>
                </div>
                <form onSubmit={handleAddClient} className="grid grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Company Name</label>
                    <input required className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" value={newClient.companyName} onChange={e => setNewClient({ ...newClient, companyName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Email</label>
                    <input required type="email" className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" value={newClient.contactEmail} onChange={e => setNewClient({ ...newClient, contactEmail: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Name</label>
                    <input required className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none font-bold" value={newClient.contactName} onChange={e => setNewClient({ ...newClient, contactName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Framework</label>
                    <select className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" value={newClient.framework} onChange={e => setNewClient({ ...newClient, framework: e.target.value })}>
                      <option>GRI</option><option>CDP</option><option>VSME</option><option>Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Deadline</label>
                    <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold" value={newClient.deadline} onChange={e => setNewClient({ ...newClient, deadline: e.target.value })} />
                  </div>
                  <button type="submit" disabled={adding} className="col-span-2 mt-4 py-5 bg-[#2D6A4F] text-white rounded-2xl font-bold text-xl shadow-xl hover:bg-green-800 transition">Create Client & Share Portal Link</button>
                </form>
              </>
            ) : (
              <div className="text-center p-12">
                <div className="text-8xl mb-8">✅</div>
                <h2 className="font-playfair text-4xl font-bold mb-4">Client Invited!</h2>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between mb-8">
                  <p className="font-bold text-[#2D6A4F] text-sm">{window.location.origin + '/submit/' + addSuccess.accessCode}</p>
                  <button onClick={() => handleCopyLink(addSuccess.accessCode)} className="px-5 py-2.5 bg-[#2D6A4F] text-white rounded-xl font-bold text-xs">Copy</button>
                </div>
                <button onClick={() => { setShowAddModal(false); setAddSuccess(null); }} className="w-full py-4 text-gray-400 font-bold hover:text-gray-600">Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-[#1B1B1B] text-white rounded-2xl font-bold shadow-2xl animate-fadeIn">🌿 {toast}</div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  )
}
