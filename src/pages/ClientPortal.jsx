import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { readFileAsText, parseSMEDocument, calculateEmissionsLocally } from '../agents/smeExtractor'
import frameworks from '../data/frameworks'

const REQUIRED_DOCS = [
  { id: 'electricity', label: 'Electricity Bills', icon: '⚡', match: ['electric', 'pge', 'power', 'utilit'], desc: 'Last 12 months of statements', format: 'PDF or Excel' },
  { id: 'gas', label: 'Natural Gas Bills', icon: '🔥', match: ['gas', 'natural', 'therm', 'heat'], desc: 'Invoices showing consumption', format: 'PDF or Excel' },
  { id: 'fuel', label: 'Fuel Receipts', icon: '⛽', match: ['fuel', 'diesel', 'fleet', 'gasoline', 'receipt'], desc: 'Fleet or generator fuel usage', format: 'PDF or Excel' },
  { id: 'water', label: 'Water Invoices', icon: '💧', match: ['water', 'sewage', 'meter'], desc: 'Monthly or quarterly bills', format: 'PDF or Excel' },
  { id: 'waste', label: 'Waste Data', icon: '🗑️', match: ['waste', 'recycl', 'trash', 'landfill'], desc: 'Tonnage or volume reports', format: 'PDF or Excel' },
  { id: 'hr', label: 'HR Summary', icon: '👥', match: ['hr', 'payroll', 'employee', 'staff', 'census'], desc: 'Staff count and diversity data', format: 'PDF or Excel' },
]

export default function ClientPortal() {
  const { accessCode } = useParams()
  const navigate = useNavigate()

  // Use a Ref to ensure data is never lost due to async state updates
  const smeDataRef = useRef({})

  // State initialization
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState(null)
  const [clientNotFound, setClientNotFound] = useState(false)
  const [step, setStep] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [smeData, setSmeData] = useState({})
  const [gapAnswers, setGapAnswers] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [processing, setProcessing] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [extractionStatus, setExtractionStatus] = useState(0)
  // Bug 1: localStorage persistence state
  const [savedFileNames, setSavedFileNames] = useState([])
  const [extractionComplete, setExtractionComplete] = useState(false)

  const STORAGE_KEY = `earthana_portal_${accessCode}`

  // Bug 1+3: Load client and restore localStorage state
  useEffect(() => {
    const loadPortal = async () => {
      setLoading(true)

      // Check for saved state first
      const saved = localStorage.getItem(`earthana_portal_${accessCode}`)
      if (saved) {
        try {
          const state = JSON.parse(saved)
          const savedAt = new Date(state.savedAt)
          const hoursSince = (Date.now() - savedAt) / (1000 * 60 * 60)
          if (hoursSince < 24) {
            setSmeData(state.smeData || {})
            smeDataRef.current = state.smeData || {}
            setExtractionComplete(state.extractionComplete || false)
            setSavedFileNames(state.uploadedFileNames || [])
            console.log('Restored portal state from save')
          }
        } catch (e) {
          console.warn('Could not restore state:', e)
        }
      }

      // Still load client data from Supabase
      await loadClient()
    }

    if (accessCode) {
      loadPortal()
    } else {
      setClientNotFound(true)
      setLoading(false)
    }
  }, [accessCode])

  async function loadClient() {
    try {
      const { data, error: queryError } = await supabase
        .from('clients')
        .select('*')
        .eq('access_code', accessCode)
        .single()

      if (queryError || !data) {
        setClientNotFound(true)
        setLoading(false)
        return
      }

      setClient({
        ...data,
        consultantName: 'Your ESG Consultant'
      })
      setLoading(false)
    } catch (err) {
      console.error('Portal load error:', err)
      setClientNotFound(true)
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map(f => {
      const name = f.name.toLowerCase()
      let category = null
      REQUIRED_DOCS.forEach(cat => {
        if (cat.match.some(m => name.includes(m))) category = cat.id
      })

      return {
        id: Math.random().toString(36).substring(7),
        name: f.name,
        size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
        category,
        fileObj: f,
        status: 'Pending'
      }
    })
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleRemoveFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleExtract = async () => {
    setProcessing(true)
    const statuses = ["📄 Reading documents...", "⚡ Extracting energy data...", "🌍 Analyzing context...", "🔢 Calculating emissions...", "✅ Finalizing preview..."]

    const timer = setInterval(() => {
      setExtractionStatus(s => (s < statuses.length - 1 ? s + 1 : s))
    }, 2500)

    try {
      // Update invite status to In Progress
      await supabase.from('clients').update({ invite_status: 'In Progress' }).eq('access_code', accessCode)

      const allTexts = []
      for (const fileEntry of uploadedFiles) {
        const text = await readFileAsText(fileEntry.fileObj)
        if (text && text.length > 20) {
          allTexts.push(`=== FILE: ${fileEntry.name} ===\n${text}`)
        }
      }
      const combinedText = allTexts.join('\n\n')

      const frameworkId = client?.framework || 'gri'
      const frameworkData = frameworks[frameworkId.toLowerCase()]

      const requiredFields = frameworkData ? [
        ...(frameworkData.requiredFields?.environmental || []),
        ...(frameworkData.requiredFields?.social || []),
        ...(frameworkData.requiredFields?.governance || [])
      ] : []

      const result = await parseSMEDocument(combinedText, frameworkId, requiredFields)
      const extracted = result?.data || result || {}
      const emissions = calculateEmissionsLocally(extracted)

      const fullData = { ...extracted, ...emissions }
      setSmeData(fullData)
      smeDataRef.current = fullData
      setExtractionComplete(true)

      // Bug 1: Save state to localStorage so navigation back doesn't lose work
      const portalState = {
        step: 2,
        smeData: fullData,
        uploadedFileNames: uploadedFiles.map(f => f.name),
        extractionComplete: true,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portalState))

      setStep(2)
    } catch (err) {
      console.error('Extraction Error:', err)
      setError("AI Extraction failed. Please enter data manually in Step 2.")
      setStep(2)
    } finally {
      clearInterval(timer)
      setProcessing(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    const required = [
      { id: 'electricity_kwh', label: 'Electricity Consumption' },
      { id: 'gas_kwh', label: 'Natural Gas' },
      { id: 'employee_count', label: 'Total Employees' },
      { id: 'has_ethics_policy', label: 'Code of Ethics' },
      { id: 'has_privacy_policy', label: 'Privacy Policy' }
    ]

    const currentSmeData = smeDataRef.current
    required.forEach(f => {
      const val = currentSmeData[f.id] !== undefined ? currentSmeData[f.id] : gapAnswers[f.id]
      if (val === null || val === undefined || val === '') {
        errors[f.id] = `${f.label} is required`
      }
    })
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setProcessing(true)

    const submissionData = {
      client_id: client?.id || null,
      access_code: accessCode,
      extracted_data: smeDataRef.current,
      manual_answers: gapAnswers,
      documents: uploadedFiles.map(f => f.name),
      submitted_at: new Date().toISOString()
    }

    try {
      const { error: submitError } = await supabase.from('submissions').insert(submissionData)
      if (submitError) throw submitError

      await supabase.from('clients').update({ invite_status: 'Submitted' }).eq('access_code', accessCode)

      // Bug 1: Clear localStorage after successful submit
      localStorage.removeItem(STORAGE_KEY)

      setSubmitted(true)
      setStep(3)
    } catch (err) {
      console.error('Submission Crash:', err)
      setError('Submission failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/client/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FEFAE0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, Arial, sans-serif' }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>🌿</div>
      <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading your portal...</p>
    </div>
  )

  if (clientNotFound || !client) return (
    <div style={{ minHeight: '100vh', background: '#FEFAE0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>Portal Not Found</h2>
        <p style={{ color: '#6B7280', marginBottom: '32px' }}>Please check your link or log in to your dashboard.</p>
        <button onClick={() => navigate('/client/dashboard')} style={{ background: '#2D6A4F', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 24px', cursor: 'pointer', fontWeight: '600', width: '100%' }}>Go to Dashboard</button>
      </div>
    </div>
  )

  const missingDocs = REQUIRED_DOCS.filter(cat =>
    (client?.framework?.toUpperCase() === 'CDP' ? ['electricity', 'gas', 'fuel'].includes(cat.id) : true) &&
    !uploadedFiles.some(f => f.category === cat.id)
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-x-hidden">
      {/* NAVBAR — Bug 3: back button always goes to /client/dashboard */}
      <nav className="h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
        <button onClick={() => navigate('/client/dashboard')} className="flex items-center gap-2 group">
          <span className="text-gray-400 group-hover:text-[#2D6A4F] transition">←</span>
          <span className="text-sm font-bold text-gray-400 group-hover:text-[#2D6A4F] transition">Dashboard</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-playfair text-lg font-bold text-[#2D6A4F]">Earthana</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/client/dashboard')} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#2D6A4F] transition">My Requests</button>
          <button onClick={handleSignOut} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition">Sign Out</button>
        </div>
      </nav>

      {/* STEP INDICATOR */}
      <div className="max-w-3xl mx-auto w-full px-6 py-8 flex items-center justify-between">
        {[
          { n: 1, label: 'Upload' },
          { n: 2, label: 'Questions' },
          { n: 3, label: 'Submit' }
        ].map((s, idx) => (
          <React.Fragment key={s.n}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === s.n ? 'bg-[#2D6A4F] text-white scale-110 shadow-lg' : step > s.n ? 'bg-green-100 text-[#2D6A4F]' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${step === s.n ? 'text-[#2D6A4F]' : 'text-gray-300'}`}>{s.label}</span>
            </div>
            {idx < 2 && <div className={`flex-1 h-0.5 mx-4 ${step > s.n ? 'bg-green-100' : 'bg-gray-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-bold rounded-r-xl animate-fadeIn">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="animate-fadeIn space-y-10">
            <div className="bg-[#2D6A4F] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h1 className="font-playfair text-4xl font-bold mb-2">{client.company_name}</h1>
                <p className="text-xl text-white/70 font-medium mb-6">Complete your ESG submission for {client.reporting_year}</p>
                <div className="flex gap-4">
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">{client.framework} Framework</div>
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">Due: {client.deadline || 'Soon'}</div>
                </div>
              </div>
              <div className="absolute top-0 right-0 text-[180px] opacity-10 translate-x-1/4 -translate-y-1/4">🌿</div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="font-playfair text-2xl font-bold mb-6">Required Documentation</h3>
                <div className="space-y-4">
                  {REQUIRED_DOCS.filter(cat => client.framework?.toUpperCase() === 'CDP' ? ['electricity', 'gas', 'fuel'].includes(cat.id) : true).map(cat => {
                    const isDone = uploadedFiles.some(f => f.category === cat.id) ||
                      savedFileNames.some(name => cat.match.some(m => name.toLowerCase().includes(m)))
                    return (
                      <div key={cat.id} className={`p-6 rounded-3xl border-2 transition-all ${isDone ? 'bg-green-50 border-green-500 shadow-sm shadow-green-900/5' : 'bg-white border-gray-100 hover:border-[#2D6A4F]'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-2xl">{cat.icon}</span>
                          <span className={`text-[10px] font-bold uppercase ${isDone ? 'text-green-600' : 'text-gray-300'}`}>{isDone ? 'Provided' : 'Pending'}</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1">{cat.label}</h4>
                        <p className="text-sm text-gray-500">{cat.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm text-center">
                <h3 className="text-xl font-bold mb-6">Upload Center</h3>

                {/* Bug 1: Previously uploaded files section */}
                {savedFileNames.length > 0 && (
                  <div style={{
                    background: '#F0FFF4',
                    border: '1px solid #74C69D',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '20px',
                    textAlign: 'left'
                  }}>
                    <p style={{ fontWeight: '600', color: '#2D6A4F', marginBottom: '8px', fontSize: '14px' }}>
                      ✅ Previously uploaded files
                    </p>
                    {savedFileNames.map(name => (
                      <div key={name} style={{ fontSize: '13px', color: '#374151', padding: '4px 0' }}>
                        📄 {name}
                      </div>
                    ))}
                    <button
                      onClick={() => setStep(2)}
                      style={{
                        marginTop: '12px',
                        background: '#2D6A4F',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        width: '100%'
                      }}>
                      Continue Where You Left Off →
                    </button>
                    <button
                      onClick={() => {
                        setSavedFileNames([])
                        localStorage.removeItem(STORAGE_KEY)
                      }}
                      style={{
                        marginTop: '8px',
                        background: 'none',
                        color: '#6B7280',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        width: '100%'
                      }}>
                      Start fresh instead
                    </button>
                  </div>
                )}

                <label className="block border-4 border-dashed border-gray-50 rounded-[40px] p-20 hover:border-[#2D6A4F] transition cursor-pointer bg-gray-50 group mb-8">
                  <span className="text-7xl mb-4 block group-hover:scale-110 transition animate-pulse">📤</span>
                  <span className="text-lg font-bold text-gray-400">Add Documents</span>
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-3 mb-8 text-left">
                    {uploadedFiles.map(f => (
                      <div key={f.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">📄</span>
                          <span className="font-bold text-xs text-[#2D6A4F] truncate max-w-[150px]">{f.name}</span>
                        </div>
                        <button onClick={() => handleRemoveFile(f.id)} className="text-gray-300 hover:text-red-500 text-lg font-bold">×</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {uploadedFiles.length > 0 && missingDocs.length > 0 && (
                    <button onClick={handleExtract} className="py-4 text-amber-600 font-bold text-sm hover:underline">Continue with missing documents →</button>
                  )}
                  <button
                    onClick={handleExtract}
                    disabled={uploadedFiles.length === 0}
                    className={`py-5 rounded-3xl font-bold text-lg transition shadow-xl ${uploadedFiles.length > 0 ? 'bg-[#2D6A4F] text-white shadow-green-900/10' : 'bg-gray-100 text-gray-300 shadow-none'}`}
                  >
                    Analyze & Extract →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn max-w-3xl mx-auto space-y-12">
            <div>
              {/* Bug 2: Back button at top of Step 2 */}
              <button
                onClick={() => setStep(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#2D6A4F',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  fontFamily: 'DM Sans, Arial, sans-serif',
                  padding: '0 0 16px 0'
                }}>
                ← Back to Documents
              </button>
              <h2 className="font-playfair text-4xl font-bold text-[#1B1B1B] mb-2">Final Data Approval</h2>
              <p className="text-gray-400 font-medium">Please review and complete the fields below.</p>
            </div>

            <div className="space-y-12">
              {['Environmental', 'Social', 'Governance'].map(group => (
                <div key={group} className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F] opacity-50">{group}</h3>
                  {(group === 'Environmental' ? [
                    { id: 'electricity_kwh', label: 'Electricity Consumption', unit: 'kWh' },
                    { id: 'gas_kwh', label: 'Natural Gas', unit: 'kWh' }
                  ] : group === 'Social' ? [
                    { id: 'employee_count', label: 'Total Employees', unit: '' }
                  ] : [
                    { id: 'has_ethics_policy', label: 'Code of Ethics', type: 'yesno' },
                    { id: 'has_privacy_policy', label: 'Privacy Policy', type: 'yesno' }
                  ]).map(field => {
                    const isExtracted = smeData[field.id] !== undefined
                    const val = isExtracted ? smeData[field.id] : gapAnswers[field.id]
                    return (
                      <div key={field.id} className={`p-8 bg-white rounded-[32px] border-2 transition-all ${formErrors[field.id] ? 'border-red-500 bg-red-50/10' : isExtracted ? 'border-green-100 shadow-sm shadow-green-900/5' : 'border-gray-50'}`}>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg">{field.label}</h4>
                          <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-lg ${isExtracted ? 'bg-green-100 text-[#2D6A4F]' : 'bg-gray-100 text-gray-400'}`}>
                            {isExtracted ? '✨ AI Extracted' : 'Required'}
                          </span>
                        </div>
                        {field.type === 'yesno' ? (
                          <div className="flex gap-4">
                            {[true, false].map(bool => (
                              <button
                                key={bool.toString()}
                                onClick={() => setGapAnswers(p => ({ ...p, [field.id]: bool }))}
                                className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all ${val === bool ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-lg shadow-green-900/20' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                              >
                                {bool ? 'Yes' : 'No'}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="number"
                              className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-2xl outline-none"
                              value={val || ''}
                              onChange={(e) => {
                                const newval = e.target.value;
                                if (isExtracted) {
                                  setSmeData(p => {
                                    const next = { ...p, [field.id]: newval };
                                    smeDataRef.current = next;
                                    return next;
                                  })
                                } else {
                                  setGapAnswers(p => ({ ...p, [field.id]: newval }))
                                }
                              }}
                            />
                            {field.unit && <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-300">{field.unit}</span>}
                          </div>
                        )}
                        {formErrors[field.id] && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest">{formErrors[field.id]}</p>}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <button onClick={handleSubmit} className="w-full py-8 bg-[#2D6A4F] text-white rounded-[40px] font-bold text-2xl shadow-2xl shadow-green-900/20 hover:bg-green-800 transition transform hover:-translate-y-1">Submit All Data →</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fadeIn max-w-2xl mx-auto text-center py-20 px-6">
            {/* Bug 2: Back button at top of Step 3 */}
            <button
              onClick={() => navigate('/client/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: '#2D6A4F',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                fontFamily: 'DM Sans, Arial, sans-serif',
                padding: '0 0 24px 0',
                marginBottom: '8px'
              }}>
              ← Back to Dashboard
            </button>
            <div className="w-32 h-32 bg-green-100 text-[#2D6A4F] rounded-full flex items-center justify-center text-6xl mx-auto mb-10 shadow-inner">✓</div>
            <h1 className="font-playfair text-5xl font-bold text-[#2D6A4F] mb-4">Submission Received</h1>
            <p className="text-xl text-gray-400 font-medium mb-12">Thank you! Your ESG data has been securely shared with your consultant for {client.reporting_year}.</p>
            <button onClick={() => navigate('/client/dashboard')} className="w-full py-5 bg-[#2D6A4F] text-white rounded-3xl font-bold text-xl shadow-xl hover:bg-green-800 transition">← Back to Dashboard</button>
          </div>
        )}
      </div>

      {processing && (
        <div className="fixed inset-0 z-[100] bg-[#FEFAE0]/95 backdrop-blur-md flex flex-col items-center justify-center p-20 text-center animate-fadeIn">
          <div className="text-8xl mb-8 animate-bounce">🌿</div>
          <div className="w-64 h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-[#2D6A4F] transition-all duration-500" style={{ width: `${(extractionStatus + 1) * 20}%` }} />
          </div>
          <p className="text-2xl font-bold text-[#2D6A4F] font-playfair animate-pulse italic">
            {["📄 Reading documents...", "⚡ Extracting energy data...", "🌍 Analyzing context...", "🔢 Calculating emissions...", "✅ Finalizing preview..."][extractionStatus]}
          </p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  )
}
