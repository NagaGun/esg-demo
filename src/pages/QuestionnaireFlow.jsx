import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    readFileAsText,
    extractSMEData,
    calculateEmissionsLocally,
    parseQuestionnaire,
    fillQuestionnaire
} from '../agents/smeExtractor'
import NavBar from '../components/NavBar'

export default function QuestionnaireFlow() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [questionnaireFile, setQuestionnaireFile] = useState(null)
    const [questionnaireText, setQuestionnaireText] = useState('')
    const [supportingFiles, setSupportingFiles] = useState([])
    const [questions, setQuestions] = useState([])
    const [filledAnswers, setFilledAnswers] = useState([])
    const [smeData, setSmeData] = useState({})
    const [processing, setProcessing] = useState(false)
    const [companyName, setCompanyName] = useState('')
    const [processingStep, setProcessingStep] = useState(0)
    const [copySuccess, setCopySuccess] = useState(false)
    const [parsedQuestionnaire, setParsedQuestionnaire] = useState(null)

    const processingLabels = [
        "📄 Reading your questionnaire...",
        "⚡ Extracting data from your documents...",
        "🔢 Calculating emissions...",
        "✍️ Filling in your answers...",
        "✅ Almost done..."
    ]

    // Animated processing steps
    useEffect(() => {
        if (!processing) return
        const interval = setInterval(() => {
            setProcessingStep(prev => (prev + 1) % processingLabels.length)
        }, 2500)
        return () => clearInterval(interval)
    }, [processing])

    // Step 1: Upload Questionnaire
    const handleQuestionnaireUpload = (e) => {
        const file = e.target.files[0]
        if (file) setQuestionnaireFile(file)
    }

    const proceedToStep2 = async () => {
        if (!questionnaireFile || !companyName) return
        const text = await readFileAsText(questionnaireFile)
        setQuestionnaireText(text)
        setStep(2)
    }

    // Step 2: Supporting Documents
    const handleSupportingUpload = (e) => {
        const files = Array.from(e.target.files)
        const newFiles = files.map(f => ({
            id: Math.random().toString(36).substring(7),
            name: f.name,
            size: (f.size / 1024).toFixed(1) + ' KB',
            fileObj: f
        }))
        setSupportingFiles(prev => [...prev, ...newFiles])
    }

    const removeFile = (id) => {
        setSupportingFiles(prev => prev.filter(f => f.id !== id))
    }

    // AI Pipeline
    async function processEverything() {
        setProcessing(true)

        try {
            // Step A: Extract SME data from all supporting documents
            const allExtracted = {}
            for (const fileEntry of supportingFiles) {
                const text = await readFileAsText(fileEntry.fileObj)
                if (!text || text.length < 20) continue
                const extracted = await extractSMEData(text)
                Object.assign(allExtracted, extracted)
            }

            // Step B: Calculate emissions
            const emissions = calculateEmissionsLocally(allExtracted)
            const fullData = {
                ...allExtracted,
                ...emissions,
                company_name: companyName
            }
            setSmeData(fullData)

            // Step C: Parse questionnaire into questions
            const parsed = await parseQuestionnaire(questionnaireText)

            // Step D: Fill questionnaire with SME data
            const filled = await fillQuestionnaire(parsed, fullData)

            setParsedQuestionnaire(parsed)
            setQuestions(parsed.questions || [])
            setFilledAnswers(filled || [])
            setProcessing(false)
            setStep(3)
        } catch (err) {
            console.error("Processing failed:", err)
            setProcessing(false)
            alert("Something went wrong during AI processing. Please try again.")
        }
    }

    // Step 3: Review & Edit
    const handleAnswerChange = (id, newVal) => {
        setFilledAnswers(prev => prev.map(a =>
            a.id === id ? { ...a, answer: newVal, needsManualInput: false } : a
        ))
    }

    const filledCount = filledAnswers.filter(a => !a.needsManualInput).length
    const totalCount = filledAnswers.length
    const gapCount = totalCount - filledCount

    // Step 4: Download/Copy
    const copyToClipboard = () => {
        const formattedText = filledAnswers
            .map(a =>
                `${a.id}. ${a.question}\n` +
                `Answer: ${a.answer || '[To be completed]'}` +
                (a.unit ? ` ${a.unit}` : '') + '\n'
            ).join('\n')

        navigator.clipboard.writeText(formattedText)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
    }

    const handleDownloadPDF = () => {
        const content = filledAnswers.map(a => `
          <div style="margin-bottom:24px;padding:16px;
            border-left:4px solid ${a.needsManualInput
                ? '#F59E0B' : '#2D6A4F'};background:#fff;
            font-family:Arial,sans-serif;">
            <p style="color:#6B7280;font-size:12px;
              margin:0 0 6px 0;text-transform:uppercase;
              letter-spacing:1px">
              ${a.id}${a.section ? ' — ' + a.section : ''}
            </p>
            <p style="color:#1B1B1B;font-size:14px;
              margin:0 0 10px 0;font-weight:500">
              ${a.question}
            </p>
            <p style="color:#2D6A4F;font-size:16px;
              font-weight:700;margin:0">
              ${a.answer || '[ Not answered ]'}
              ${a.unit ? ' ' + a.unit : ''}
            </p>
            ${a.dataSource ? `<p style="color:#9CA3AF;
              font-size:11px;margin:6px 0 0 0">
              Source: ${a.dataSource}</p>` : ''}
          </div>
        `).join('')

        const html = `<!DOCTYPE html><html><head>
          <title>${companyName} — ESG Questionnaire</title>
          <style>
            @media print { body { margin:0; } }
            body { font-family:Arial,sans-serif;
              background:#FEFAE0;padding:40px;
              max-width:800px;margin:0 auto; }
          </style></head><body>
          <div style="border-top:6px solid #2D6A4F;
            padding:32px;background:white;margin-bottom:24px">
            <h1 style="color:#2D6A4F;font-size:24px;
              margin:0 0 8px 0">🌿 ${companyName}</h1>
            <h2 style="color:#1B1B1B;font-size:18px;
              margin:0 0 8px 0">ESG Questionnaire — 
              Filled by Earthana AI</h2>
            <p style="color:#6B7280;font-size:13px;margin:0">
              ${parsedQuestionnaire?.questionnaireTitle
            || 'ESG Questionnaire'} | 
              Generated ${new Date().toLocaleDateString(
                'en-GB', {
                    day: 'numeric', month: 'long',
                year: 'numeric'
            })} | 
              ${filledAnswers.filter(
                a => !a.needsManualInput).length} of 
              ${filledAnswers.length} filled automatically
            </p>
          </div>
          ${content}
          <div style="margin-top:32px;padding:16px;
            background:#F0FFF4;border-radius:8px;
            font-size:12px;color:#6B7280;font-style:italic">
            Prepared using Earthana ESG Data Collection 
            Platform. Data extracted and validated 
            automatically from company documents.
          </div>
          </body></html>`

        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const w = window.open(url, '_blank')
        if (w) {
            w.onload = () => { w.print(); URL.revokeObjectURL(url) }
        }
    }

    // ── RENDERERS ──

    if (processing) {
        return (
            <div className="fixed inset-0 bg-[#FEFAE0] z-50 flex flex-col items-center justify-center p-6">
                <div className="text-6xl mb-8 animate-bounce">🌿</div>
                <h2 className="font-playfair text-3xl font-bold text-[#2D6A4F] mb-4 text-center">
                    Earthana AI is working...
                </h2>
                <p className="text-[#6B7280] text-xl mb-12 h-8 text-center">
                    {processingLabels[processingStep]}
                </p>
                <div className="w-full max-w-md h-3 bg-white rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-[#2D6A4F] transition-all duration-500 ease-out"
                        style={{ width: `${((processingStep + 1) / processingLabels.length) * 100}%` }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FEFAE0] flex flex-col font-sans">
            <NavBar backTo="/dashboard" backLabel="Dashboard" />
            <div className="flex-1 py-12 px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Progress Bar */}
                    <div className="flex justify-between items-center mb-12 px-4">
                        {[1, 2, 3, 4].map(num => (
                            <div key={num} className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm transition-all
                                ${step === num ? 'bg-[#2D6A4F] text-white scale-110' :
                                        step > num ? 'bg-[#74C69D] text-white' : 'bg-white text-gray-300'}`}>
                                    {step > num ? '✓' : num}
                                </div>
                                <span className={`text-xs font-semibold uppercase tracking-wider
                                ${step === num ? 'text-[#2D6A4F]' : 'text-gray-400'}`}>
                                    Step {num}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* STEP 1: UPLOAD QUESTIONNAIRE */}
                    {step === 1 && (
                        <div className="bg-white rounded-3xl p-10 shadow-xl border border-white max-w-2xl mx-auto text-center">
                            <h1 className="font-playfair text-3xl font-bold text-[#1B1B1B] mb-3">
                                Upload your questionnaire
                            </h1>
                            <p className="text-[#6B7280] mb-8">
                                Upload the form your bank or customer sent you. We accept PDF, Word, Excel, or text files.
                            </p>

                            <div className="text-left mb-6">
                                <label className="block text-sm font-bold text-[#2D6A4F] mb-2 uppercase tracking-wide">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Acme Corp Sustainability"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    className="w-full p-4 border-2 border-[#E5E7EB] rounded-2xl focus:border-[#2D6A4F] transition outline-none text-lg"
                                />
                            </div>

                            <label className="block cursor-pointer">
                                <div className="border-4 border-dashed border-[#E5E7EB] rounded-3xl p-12 hover:border-[#2D6A4F] transition bg-gray-50 group">
                                    <div className="text-5xl mb-4 group-hover:scale-110 transition">📋</div>
                                    <div className="text-xl font-bold text-[#1B1B1B] mb-1">
                                        {questionnaireFile ? questionnaireFile.name : "Drop your questionnaire here"}
                                    </div>
                                    <p className="text-[#6B7280]">
                                        {questionnaireFile ? "✓ Questionnaire uploaded" : "or click to browse"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-4">
                                        Accepts PDF, Word (.docx), Excel (.xlsx), or text files
                                    </p>
                                </div>
                                <input type="file" className="hidden" onChange={handleQuestionnaireUpload} accept=".pdf,.txt,.docx,.xlsx,.csv" />
                            </label>

                            <button
                                onClick={proceedToStep2}
                                disabled={!companyName || !questionnaireFile}
                                className={`mt-10 w-full py-5 rounded-2xl font-bold text-xl transition shadow-lg
                                ${companyName && questionnaireFile ? 'bg-[#2D6A4F] text-white hover:bg-[#1B4332]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                Continue →
                            </button>
                        </div>
                    )}

                    {/* STEP 2: SUPPORTING DOCUMENTS */}
                    {step === 2 && (
                        <div className="grid md:grid-cols-2 gap-8 items-start">
                            <div className="bg-white rounded-3xl p-8 shadow-lg border border-white">
                                <h2 className="font-playfair text-2xl font-bold text-[#2D6A4F] mb-6">What to upload</h2>
                                <div className="space-y-4">
                                    {[
                                        { icon: '⚡', label: 'Electricity bills', sub: '12 months of statements' },
                                        { icon: '🔥', label: 'Gas bills', sub: 'Natural gas or heating fuel' },
                                        { icon: '🚗', label: 'Fuel records', sub: 'Receipts or fleet reports' },
                                        { icon: '💧', label: 'Water bills', sub: 'Usage statements' },
                                        { icon: '🗑️', label: 'Waste invoices', sub: 'Weight and disposal records' },
                                        { icon: '👥', label: 'Payroll summary', sub: 'Headcount and HR data' },
                                        { icon: '📄', label: 'Other', sub: 'Policies, audits, certificates' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition">
                                            <div className="text-2xl">{item.icon}</div>
                                            <div className="flex-1">
                                                <div className="font-bold text-[#1B1B1B] text-sm">{item.label}</div>
                                                <div className="text-xs text-[#6B7280]">{item.sub}</div>
                                            </div>
                                            <input type="checkbox" className="w-5 h-5 accent-[#2D6A4F]" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white rounded-3xl p-8 shadow-lg border border-white text-center">
                                    <h1 className="font-playfair text-2xl font-bold text-[#1B1B1B] mb-2 text-left">
                                        Upload supporting documents
                                    </h1>
                                    <p className="text-[#6B7280] text-sm text-left mb-8">
                                        The more data you provide, the better AI can fill your questionnaire.
                                    </p>

                                    <label className="block cursor-pointer">
                                        <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 hover:border-[#2D6A4F] transition bg-gray-50">
                                            <div className="text-3xl mb-2">📤</div>
                                            <div className="font-bold text-[#1B1B1B]">Click to add documents</div>
                                        </div>
                                        <input type="file" multiple className="hidden" onChange={handleSupportingUpload} />
                                    </label>

                                    {supportingFiles.length > 0 && (
                                        <div className="mt-8 text-left space-y-3">
                                            {supportingFiles.map(file => (
                                                <div key={file.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 animate-fadeIn">
                                                    <div className="flex items-center gap-3 overflow-hidden text-left">
                                                        <span className="text-lg">📄</span>
                                                        <div className="truncate">
                                                            <div className="text-sm font-bold text-[#1B1B1B] truncate">{file.name}</div>
                                                            <div className="text-[10px] text-[#6B7280]">{file.size}</div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500 transition px-2">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={processEverything}
                                        disabled={supportingFiles.length === 0}
                                        className={`mt-10 w-full py-5 rounded-2xl font-bold text-xl transition shadow-lg
                                        ${supportingFiles.length > 0 ? 'bg-[#2D6A4F] text-white hover:bg-[#1B4332]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                        Process with AI →
                                    </button>

                                    <button
                                        onClick={() => alert("No problem — AI will fill what it can from the documents you have. You'll manually complete any gaps in step 3.")}
                                        className="mt-6 text-[#2D6A4F] font-bold text-sm hover:underline">
                                        I don't have some of these
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REVIEW AI-FILLED ANSWERS */}
                    {step === 3 && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Header Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#E9F5EF] p-6 rounded-3xl border-2 border-[#2D6A4F] border-opacity-10">
                                    <div className="text-2xl font-bold text-[#2D6A4F]">{filledCount} of {totalCount}</div>
                                    <div className="text-sm text-[#2D6A4F] opacity-70">Answered automatically</div>
                                </div>
                                {gapCount > 0 ? (
                                    <div className="bg-[#FFF9E6] p-6 rounded-3xl border-2 border-[#D97706] border-opacity-10">
                                        <div className="text-2xl font-bold text-[#D97706]">{gapCount} needed</div>
                                        <div className="text-sm text-[#D97706] opacity-70">Action required below</div>
                                    </div>
                                ) : (
                                    <div className="bg-[#E9F5EF] p-6 rounded-3xl border-2 border-[#2D6A4F] border-opacity-10">
                                        <div className="text-2xl font-bold text-[#2D6A4F]">100% Complete</div>
                                        <div className="text-sm text-[#2D6A4F] opacity-70">All questions reviewed</div>
                                    </div>
                                )}
                            </div>

                            {/* Questions List */}
                            <div className="space-y-4">
                                {filledAnswers.map((answer, i) => (
                                    <div key={i}
                                        className={`bg-white rounded-2xl p-6 shadow-sm border-l-8 transition-all
                                        ${answer.needsManualInput ? 'border-[#D97706]' : 'border-[#2D6A4F]'}`}>

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Question {answer.id}</div>
                                                <h3 className="text-[#1B1B1B] font-medium text-lg leading-relaxed">{answer.question}</h3>
                                            </div>
                                            {answer.needsManualInput ? (
                                                <span className="bg-[#FFF9E6] text-[#D97706] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">Needs Input</span>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight 
                                                ${answer.confidence === 'high' ? 'bg-[#E9F5EF] text-[#2D6A4F]' :
                                                        answer.confidence === 'medium' ? 'bg-[#FFF9E6] text-[#D97706]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
                                                    {answer.confidence} Confidence
                                                </span>
                                            )}
                                        </div>

                                        {/* Input Logic */}
                                        <div className="relative">
                                            {answer.type === 'text' ? (
                                                <textarea
                                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#2D6A4F] transition"
                                                    rows={3}
                                                    value={answer.answer || ''}
                                                    onChange={(e) => handleAnswerChange(answer.id, e.target.value)}
                                                    placeholder="Enter your answer..."
                                                />
                                            ) : answer.type === 'yes_no' ? (
                                                <div className="flex gap-3">
                                                    {['Yes', 'No'].map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => handleAnswerChange(answer.id, opt)}
                                                            className={`flex-1 py-3 rounded-xl font-bold transition
                                                            ${answer.answer === opt ? 'bg-[#2D6A4F] text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <input
                                                        type="text"
                                                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#2D6A4F] transition"
                                                        value={answer.answer || ''}
                                                        onChange={(e) => handleAnswerChange(answer.id, e.target.value)}
                                                        placeholder="Enter value..."
                                                    />
                                                    {answer.unit && <span className="absolute right-4 font-bold text-gray-400">{answer.unit}</span>}
                                                </div>
                                            )}
                                        </div>

                                        {!answer.needsManualInput && answer.dataSource && (
                                            <div className="mt-4 text-[10px] text-gray-400 italic">Source: {answer.dataSource}</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(4)}
                                className="w-full py-6 bg-[#2D6A4F] text-white rounded-3xl font-bold text-xl shadow-xl hover:bg-[#1B4332] transition">
                                Download Filled Questionnaire →
                            </button>
                        </div>
                    )}

                    {/* STEP 4: DOWNLOAD */}
                    {step === 4 && (
                        <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
                            <h1 className="font-playfair text-3xl font-bold text-[#1B1B1B] text-center mb-8">
                                Your questionnaire is ready
                            </h1>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* PDF Card */}
                                <div className="bg-white rounded-3xl p-8 shadow-lg border border-white flex flex-col items-center text-center">
                                    <div className="text-5xl mb-6">📄</div>
                                    <h3 className="font-bold text-xl text-[#1B1B1B] mb-2">Download as PDF</h3>
                                    <p className="text-[#6B7280] text-sm mb-8 flex-1">
                                        Your filled questionnaire ready to email back to your bank or customer.
                                    </p>
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="w-full py-4 bg-[#2D6A4F] text-white rounded-2xl font-bold hover:opacity-90 transition">
                                        Download PDF
                                    </button>
                                </div>

                                {/* Text Card */}
                                <div className="bg-white rounded-3xl p-8 shadow-lg border border-white flex flex-col items-center text-center">
                                    <div className="text-5xl mb-6">📋</div>
                                    <h3 className="font-bold text-xl text-[#1B1B1B] mb-2">Copy as Text</h3>
                                    <p className="text-[#6B7280] text-sm mb-8 flex-1">
                                        For pasting answers directly into an online reporting portal.
                                    </p>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`w-full py-4 rounded-2xl font-bold transition
                                        ${copySuccess ? 'bg-[#74C69D] text-white' : 'bg-white border-2 border-[#E5E7EB] text-[#1B1B1B] hover:bg-gray-50'}`}>
                                        {copySuccess ? 'Copied!' : 'Copy All Answers'}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-4 text-[#2D6A4F] font-bold text-lg hover:underline mt-12">
                                ← Back to home
                            </button>
                        </div>
                    )}

                </div>

                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                `}</style>
            </div>
        </div>
    )
}
