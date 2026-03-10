import { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import frameworks from '../data/frameworks';
import { readFileAsText, parseSMEDocument, calculateEmissions } from '../agents/smeExtractor';
import NavBar from '../components/NavBar';

export default function SMECollect() {
    function safeFixed(value, decimals = 2) {
        const num = Number(value);
        if (value === null || value === undefined || isNaN(num)) {
            return 'N/A';
        }
        return num.toFixed(decimals);
    }

    function getFieldHint(fieldId) {
        const hints = {
            electricity_kwh: 'Find this on your electricity bill — look for "Total Units" or "kWh consumed"',
            gas_kwh: 'Find this on your gas bill — look for "Units used" or convert therms × 29.3',
            fuel_litres: 'Add up all fuel receipts for the year, or check your fleet management records',
            water_m3: 'Find this on your water bill — look for "Cubic metres" or "m³"',
            waste_tonnes: 'Check your waste disposal invoices — total weight collected during the year',
            employee_count: 'Total headcount at year end including part-time',
            female_employees: 'Number of employees who identify as female',
            employee_turnover: 'Employees who left ÷ average headcount × 100',
            injury_rate: 'Number of injuries recorded in your accident log',
            training_hours: 'Total training hours delivered ÷ number of employees',
            pay_gap_pct: 'Average male salary minus average female salary ÷ average male salary × 100',
            board_female_pct: 'Female board members ÷ total board members × 100',
            renewable_energy_pct: 'Check with your electricity supplier or look for green tariff documentation',
            waste_recycled_pct: 'Recycled waste weight ÷ total waste weight × 100',
        };
        return hints[fieldId] || 'Enter the value for this field';
    }

    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const formUploadRef = useRef(null);

    const { companyName, industry, reportingYear, selectedFramework } = location.state || {};

    const [collectedData, setCollectedData] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [extracting, setExtracting] = useState(false);
    const [extractionResults, setExtractionResults] = useState([]);
    const [step, setStep] = useState('upload'); // upload, review, gaps
    const [emissionsBreakdown, setEmissionsBreakdown] = useState(null);

    // Gap step state
    const [gapAnswers, setGapAnswers] = useState({});
    const [activeTab, setActiveTab] = useState('manual');
    const [formUploadText, setFormUploadText] = useState('');
    const [formExtracting, setFormExtracting] = useState(false);
    const [formFillResult, setFormFillResult] = useState(null);
    const [formFileName, setFormFileName] = useState('');

    // Validation + report step state
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [finalData, setFinalData] = useState({});

    if (!selectedFramework) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--cream)]">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-4 text-[var(--dark)]">Missing Information</h2>
                    <button onClick={() => navigate('/sme')} className="text-[var(--forest)] font-bold underline hover:text-green-800">
                        Please start from the beginning
                    </button>
                </div>
            </div>
        );
    }

    const framework = frameworks[selectedFramework];
    const allFields = [
        ...(framework.requiredFields.environmental || []),
        ...(framework.requiredFields.social || []),
        ...(framework.requiredFields.governance || [])
    ];

    const uploadableFields = allFields.filter(f => f.uploadable);

    const docMapping = {
        'electricity_kwh': '⚡ Electricity bills (last 12 months)',
        'gas_kwh': '🔥 Gas bills (last 12 months)',
        'fuel_litres': '🚗 Fuel receipts or fleet reports',
        'scope1_emissions': '⛽ Direct emissions data',
        'scope2_emissions': '🔌 Indirect emissions data',
        'water_m3': '💧 Water utility bills',
        'waste_tonnes': '🗑 Waste disposal invoices'
    };

    const handleFileAdd = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type,
            fileObj: file,
            status: 'pending'
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
        // Reset so the same file can be re-uploaded if needed
        e.target.value = '';
    };

    const removeFile = (id) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
    };

    async function handleExtract() {
        if (uploadedFiles.length === 0) return;

        setExtracting(true);
        // collectedData is now a flat {fieldId: value} map
        const allExtracted = {};
        const results = [];

        for (const fileEntry of uploadedFiles) {
            setUploadedFiles(prev => prev.map(f =>
                f.id === fileEntry.id ? { ...f, status: 'extracting' } : f
            ));

            try {
                // Use robust FileReader — handles PDFs and text
                const text = await readFileAsText(fileEntry.fileObj);

                if (!text || text.trim().length < 20) {
                    throw new Error(
                        'File appears empty or unreadable. ' +
                        'Try saving as .txt format.'
                    );
                }

                const extracted = await parseSMEDocument(
                    text,
                    selectedFramework,
                    uploadableFields
                );

                // Merge into flat map — only non-null values
                if (extracted?.data) {
                    Object.entries(extracted.data).forEach(([key, val]) => {
                        if (val !== null && val !== undefined) {
                            allExtracted[key] = val;
                        }
                    });
                }

                setUploadedFiles(prev => prev.map(f =>
                    f.id === fileEntry.id
                        ? { ...f, status: 'done', fieldsFound: extracted?.fieldsFound?.length || 0 }
                        : f
                ));

                results.push({
                    filename: fileEntry.name,
                    fieldsFound: extracted?.fieldsFound || [],
                    status: 'done'
                });

            } catch (err) {
                console.error('File extraction error:', err);
                setUploadedFiles(prev => prev.map(f =>
                    f.id === fileEntry.id
                        ? { ...f, status: 'failed', error: err.message }
                        : f
                ));
                results.push({
                    filename: fileEntry.name,
                    fieldsFound: [],
                    status: 'failed',
                    error: err.message
                });
            }
        }

        // Calculate emissions from raw energy values
        try {
            const emissions = await calculateEmissions(allExtracted);
            if (emissions.scope1_emissions_tco2e !== null) {
                allExtracted.scope1_emissions = emissions.scope1_emissions_tco2e;
            }
            if (emissions.scope2_emissions_tco2e !== null) {
                allExtracted.scope2_emissions = emissions.scope2_emissions_tco2e;
            }
            setEmissionsBreakdown(emissions);
        } catch (err) {
            console.error('Emissions calculation error:', err);
        }

        setCollectedData(allExtracted);
        setExtractionResults(results);
        setExtracting(false);
        setStep('review');
    }

    async function handleFormUploadProcess(e) {
        const file = e.target.files[0];
        if (!file) return;

        setFormFileName(file.name);
        setFormExtracting(true);
        const text = await file.text();
        setFormUploadText(text);

        try {
            const res = await fetch('http://localhost:3001/api/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    max_tokens: 3000,
                    messages: [{
                        role: 'user',
                        content: `You are an ESG form-filling assistant.

A small business has uploaded a questionnaire they 
need to fill out. They have already collected their 
ESG data. Match their data to the questionnaire 
questions and fill in the answers.

TASK:
1. Read the questionnaire and identify each question
2. Match each question to the available company data
3. Provide a filled answer for each question

Return ONLY valid JSON:
{
  "formTitle": "name of the form/questionnaire",
  "filledQuestions": [
    {
      "questionNumber": "Q1 or section number",
      "question": "the actual question text",
      "answer": "filled answer using company data",
      "dataSource": "which field was used",
      "confidence": "high/medium/low",
      "needsReview": true or false
    }
  ],
  "unansweredQuestions": [
    {
      "questionNumber": "number",
      "question": "question text",
      "reason": "why it could not be answered"
    }
  ],
  "completionPct": number between 0 and 100
}

COMPANY DATA AVAILABLE:
${JSON.stringify({ ...collectedData, ...gapAnswers })}

QUESTIONNAIRE TO FILL:
${text.substring(0, 6000)}`
                    }]
                })
            });

            const data = await res.json();
            const raw = data.content[0].text.trim();
            const match = raw.match(/\{[\s\S]*\}/);

            if (match) {
                const result = JSON.parse(match[0]);
                setFormFillResult(result);
            }
        } catch (e) {
            console.error('Form fill parse failed:', e);
        }
        setFormExtracting(false);
    }

    async function handleValidate() {
        setValidating(true);

        // Merge AI extracted data with manual gap answers
        const allData = { ...collectedData, ...gapAnswers };

        try {
            const res = await fetch('http://localhost:3001/api/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    max_tokens: 1024,
                    messages: [
                        {
                            role: 'system',
                            content: `You are an ESG data validator. You check sustainability data for errors and inconsistencies. Always return valid JSON only.`
                        },
                        {
                            role: 'user',
                            content: `Validate this ESG data submission.

Return ONLY this JSON structure, nothing else:
{
  "passed": true,
  "issues": [],
  "warnings": [],
  "summary": "one sentence"
}

Rules:
- passed is true unless there is a CRITICAL error
- issues = critical errors that must be fixed
- warnings = things worth checking but not blocking
- Keep all messages in plain English for a small business owner, no jargon

Check for:
- Female employees greater than total employees
- Turnover rate over 100%
- Zero values for energy fields that should have data
- Negative numbers anywhere

Company: ${companyName}
Industry: ${industry}
Framework: ${selectedFramework}
Data: ${JSON.stringify(allData)}`
                        }
                    ]
                })
            });

            const data = await res.json();
            const raw = data.content[0].text.trim();
            const match = raw.match(/\{[\s\S]*\}/);
            const result = match ? JSON.parse(match[0]) : {
                passed: true,
                issues: [],
                warnings: [],
                summary: 'Data looks good.'
            };

            setValidationResult(result);

            if (result.passed) {
                setFinalData(allData);
                navigate('/sme/report', {
                    state: {
                        companyName,
                        industry,
                        reportingYear,
                        selectedFramework,
                        finalData: allData
                    }
                });
            }

        } catch (err) {
            console.error('Validation error:', err);
            // Don't block user if validation service fails
            const allData2 = { ...collectedData, ...gapAnswers };
            navigate('/sme/report', {
                state: {
                    companyName,
                    industry,
                    reportingYear,
                    selectedFramework,
                    finalData: allData2
                }
            });
        } finally {
            setValidating(false);
        }
    }

    const extractedFieldIds = Object.keys(collectedData);
    const fieldsNeededCount = allFields.length - extractedFieldIds.length;

    const gapFields = allFields.filter(f => collectedData[f.id] === null || collectedData[f.id] === undefined);

    const renderGapField = (f) => {
        if (f.unit === 'yes/no') {
            return (
                <div key={f.id} className="mb-6">
                    <label className="block font-medium text-gray-800 mb-1">{f.plain}</label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setGapAnswers(prev => ({ ...prev, [f.id]: true }))}
                            className={`px-6 py-2 rounded-lg border-2 font-medium transition-colors ${gapAnswers[f.id] === true ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-600 hover:border-green-400'}`}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => setGapAnswers(prev => ({ ...prev, [f.id]: false }))}
                            className={`px-6 py-2 rounded-lg border-2 font-medium transition-colors ${gapAnswers[f.id] === false ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 text-gray-600 hover:border-red-400'}`}
                        >
                            No
                        </button>
                    </div>
                </div>
            );
        } else if (f.unit === '%') {
            return (
                <div key={f.id} className="mb-6">
                    <label className="block font-medium text-gray-800 mb-1">{f.plain}</label>
                    <p className="text-sm text-gray-500 mb-2">Enter a percentage between 0 and 100</p>
                    <div className="flex items-center gap-2 max-w-xs">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={gapAnswers[f.id] ?? ''}
                            onChange={e => setGapAnswers(prev => ({ ...prev, [f.id]: e.target.value === '' ? undefined : Number(e.target.value) }))}
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-lg font-medium focus:border-green-500 focus:outline-none"
                            placeholder="0"
                        />
                        <span className="text-gray-500 font-medium text-lg">%</span>
                    </div>
                </div>
            );
        } else {
            return (
                <div key={f.id} className="mb-6">
                    <label className="block font-medium text-gray-800 mb-1">{f.plain}</label>
                    <p className="text-sm text-gray-500 mb-2">{getFieldHint(f.id)}</p>
                    <div className="flex items-center gap-2 max-w-sm">
                        <input
                            type="number"
                            min="0"
                            step="any"
                            value={gapAnswers[f.id] ?? ''}
                            onChange={e => setGapAnswers(prev => ({ ...prev, [f.id]: e.target.value === '' ? undefined : Number(e.target.value) }))}
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-lg font-medium focus:border-green-500 focus:outline-none"
                            placeholder="Enter value"
                        />
                        <span className="text-gray-500 font-medium whitespace-nowrap">{f.unit}</span>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-[var(--cream)] flex flex-col font-sans pb-20">
            <NavBar backTo="/sme" backLabel="Start Over" title={companyName} />
            <div className="flex-1 flex flex-col items-center p-6">

                <div className="w-full max-w-5xl mb-12">
                    <div className="flex justify-between relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
                        {[
                            { id: 'upload', num: 1, label: 'Upload Documents' },
                            { id: 'review', num: 2, label: 'Review Extracted Data' },
                            { id: 'gaps', num: 3, label: 'Fill Remaining Gaps' },
                            { id: 'report', num: 4, label: 'Generate Report' }
                        ].map(s => {
                            const isActive = step === s.id;
                            const isPast = ['upload', 'review', 'gaps', 'report'].indexOf(step) > ['upload', 'review', 'gaps', 'report'].indexOf(s.id);

                            return (
                                <div key={s.id} className="flex flex-col items-center bg-[var(--cream)] px-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 shadow-sm transition ${isActive ? 'bg-[var(--forest)] text-[var(--white)] ring-4 ring-[var(--light-green)]' : isPast ? 'bg-[var(--mint)] text-[var(--forest)] border-2 border-[var(--mint)]' : 'bg-white text-[var(--gray)] border-2 border-gray-200'}`}>
                                        {isPast ? '✓' : s.num}
                                    </div>
                                    <span className={`text-xs font-bold uppercase tracking-wide hidden md:block ${isActive ? 'text-[var(--forest)]' : 'text-gray-400'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full max-w-5xl">

                    {step === 'upload' && (
                        <div className="animate-fade-in text-center max-w-3xl mx-auto">
                            <h1 className="font-playfair text-4xl font-bold text-[var(--dark)] mb-4">Upload Your Documents</h1>
                            <p className="text-[var(--gray)] text-lg mb-10">AI will read these and fill in your data automatically. The more you upload, the less you have to type.</p>

                            <div className="bg-[var(--white)] rounded-2xl shadow-sm border border-gray-200 p-8 text-left mb-8">
                                <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-10 text-center hover:bg-gray-100 hover:border-[var(--mint)] transition cursor-pointer mb-8" onClick={() => fileInputRef.current?.click()}>
                                    <div className="text-4xl mb-4">📄</div>
                                    <h3 className="font-bold text-[var(--dark)] text-lg mb-2">Click to select files</h3>
                                    <p className="text-sm text-[var(--gray)]">or drag and drop them here</p>
                                    <p className="text-xs text-gray-400 mt-2">Accepts: .pdf, .txt, .csv, .xlsx</p>
                                    <input type="file" ref={fileInputRef} onChange={handleFileAdd} multiple className="hidden" accept=".pdf,.txt,.csv,.xlsx" />
                                </div>

                                {uploadedFiles.length > 0 && (
                                    <div className="mb-8">
                                        <h4 className="font-bold text-[var(--dark)] mb-4 text-sm uppercase tracking-wide">Ready to process</h4>
                                        <ul className="space-y-3">
                                            {uploadedFiles.map(file => (
                                                <li key={file.id} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <span className="text-xl shrink-0">{file.status === 'done' ? '✅' : file.status === 'extracting' ? '⏳' : file.status === 'failed' ? '❌' : '📄'}</span>
                                                        <div className="truncate">
                                                            <div className="font-medium text-[var(--dark)] text-sm truncate">{file.name}</div>
                                                            <div className="text-xs text-gray-400 flex items-center gap-2">
                                                                <span>{file.size}</span>
                                                                <span>•</span>
                                                                <span className={file.status === 'done' ? 'text-[var(--forest)] font-semibold' : file.status === 'extracting' ? 'text-amber-500 font-semibold animate-pulse' : file.status === 'failed' ? 'text-red-500 font-semibold' : 'text-gray-500'}>{file.status}{file.error ? ` — ${file.error}` : ''}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {file.status !== 'extracting' && file.status !== 'done' && (
                                                        <button onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500 transition p-2" title="Remove file">✕</button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="bg-[var(--light-green)] border border-[var(--mint)] border-opacity-30 rounded-xl p-6">
                                    <h4 className="font-bold text-[var(--forest)] mb-3 text-sm flex items-center gap-2"><span className="text-lg">💡</span> We recommend uploading:</h4>
                                    <div className="grid sm:grid-cols-2 gap-3 pl-7">
                                        {uploadableFields.map(field => (
                                            <div key={field.id} className="text-sm text-[var(--dark)] font-medium flex items-center gap-2">
                                                <span className="opacity-60">•</span>{docMapping[field.id] ? docMapping[field.id].substring(docMapping[field.id].indexOf(' ') + 1) : field.plain}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <Link to="/sme" className="bg-white border border-gray-200 text-[var(--dark)] font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition shadow-sm">Back</Link>
                                <button disabled={uploadedFiles.length === 0 || extracting} onClick={handleExtract} className="bg-[var(--forest)] text-[var(--white)] font-bold py-4 px-10 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-800 shadow-md flex-1 max-w-xs">
                                    {extracting ? <><svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Extracting Data...</> : <>Extract Data with AI</>}
                                </button>
                            </div>
                            {uploadedFiles.length === 0 && (
                                <p className="text-sm text-[var(--gray)] mt-4">Don't have documents right now? <button onClick={() => setStep('gaps')} className="underline text-[var(--forest)] font-semibold">Skip straight to manual entry.</button></p>
                            )}
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="animate-fade-in w-full">
                            <div className="text-center mb-10">
                                <div className="inline-block bg-[var(--light-green)] text-[var(--forest)] font-bold px-4 py-2 rounded-full mb-4 shadow-sm border border-[var(--mint)] border-opacity-30">✨ Extraction Complete</div>
                                <h1 className="font-playfair text-4xl font-bold text-[var(--dark)] mb-4">Here's what AI found</h1>
                                <p className="text-[var(--gray)] text-lg max-w-2xl mx-auto">AI filled <strong>{extractedFieldIds.length}</strong> of <strong>{allFields.length}</strong> fields automatically.<strong> {fieldsNeededCount}</strong> files didn't have matches and need your input.</p>
                            </div>

                            {emissionsBreakdown && emissionsBreakdown.calculation_notes && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-10 max-w-3xl mx-auto shadow-sm">
                                    <p className="font-bold text-green-800 mb-4 text-center">🌍 Emissions Calculated Automatically</p>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="text-center bg-white rounded-lg p-3 border border-green-100 shadow-sm">
                                            <p className="text-3xl font-bold text-green-700">{safeFixed(emissionsBreakdown.scope1_emissions_tco2e)}</p>
                                            <p className="text-sm font-semibold text-green-900 mt-1">Scope 1 (tCO2e)</p>
                                        </div>
                                        <div className="text-center bg-white rounded-lg p-3 border border-green-100 shadow-sm">
                                            <p className="text-3xl font-bold text-green-700">{safeFixed(emissionsBreakdown.scope2_emissions_tco2e)}</p>
                                            <p className="text-sm font-semibold text-green-900 mt-1">Scope 2 (tCO2e)</p>
                                        </div>
                                        <div className="text-center bg-white rounded-lg p-3 border border-green-100 shadow-sm ring-2 ring-green-300">
                                            <p className="text-3xl font-bold text-green-700">{safeFixed(emissionsBreakdown.total_emissions_tco2e)}</p>
                                            <p className="text-sm font-bold text-green-900 mt-1">Total (tCO2e)</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-green-800 opacity-80 mt-4 text-center">{emissionsBreakdown.calculation_notes}</p>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-8 mb-10 items-start">
                                <div className="bg-[var(--white)] shadow-md rounded-2xl overflow-hidden border border-gray-200">
                                    <div className="bg-[var(--light-green)] p-5 border-b border-[var(--mint)] border-opacity-30 flex items-center gap-3">
                                        <div className="bg-[var(--forest)] w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">{extractedFieldIds.length}</div>
                                        <h3 className="font-bold text-lg text-[var(--forest)]">Extracted automatically</h3>
                                    </div>
                                    <div className="p-6">
                                        {extractedFieldIds.length === 0 ? (
                                            <div className="text-center py-8"><p className="text-[var(--gray)] italic">No data could be extracted automatically.<br />Continue to fill in manually.</p></div>
                                        ) : (
                                            <div className="space-y-4">
                                                {extractedFieldIds.map(fieldId => {
                                                    const fieldDef = allFields.find(f => f.id === fieldId);
                                                    const dataObj = collectedData[fieldId];
                                                    if (!fieldDef) return null;

                                                    return (
                                                        <div key={fieldId} className="flex flex-col gap-2 border-b border-gray-100 pb-4 last:border-0 last:pb-0 hover:bg-gray-50 p-3 -mx-2 rounded transition group">
                                                            <div>
                                                                <p className="text-sm font-semibold text-[var(--dark)] mb-1">{fieldDef.plain}</p>
                                                                <p className="text-xs text-gray-400">Found in: {dataObj.sourceFile}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={dataObj.value}
                                                                    onChange={e => setCollectedData(prev => ({ ...prev, [fieldId]: { ...dataObj, value: Number(e.target.value) || e.target.value } }))}
                                                                    className="border border-gray-300 rounded px-2 py-1 text-sm flex-1 font-mono focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                                                />
                                                                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{fieldDef.unit !== 'yes/no' && fieldDef.unit !== 'number' ? fieldDef.unit : ''}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-[var(--white)] shadow-md rounded-2xl overflow-hidden border border-gray-200">
                                    <div className="bg-amber-50 p-5 border-b border-amber-200 flex items-center gap-3">
                                        <div className="bg-amber-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">{fieldsNeededCount}</div>
                                        <h3 className="font-bold text-lg text-amber-900">Still needed</h3>
                                    </div>
                                    <div className="p-6">
                                        {fieldsNeededCount === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-green-600 font-bold mb-2">🎉 Perfect extraction!</p>
                                                <p className="text-[var(--gray)] text-sm">We found everything needed based on your documents.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {allFields.filter(f => !extractedFieldIds.includes(f.id)).map(fieldDef => (
                                                    <div key={fieldDef.id} className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                                        <div className="pr-4">
                                                            <p className="text-sm font-medium text-[var(--dark)] mb-1">{fieldDef.plain}</p>
                                                            <p className="text-xs text-amber-600">You'll answer this in the next step</p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">Not found</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button className="bg-white border-2 border-[var(--forest)] text-[var(--forest)] font-bold py-4 px-8 rounded-xl hover:bg-[var(--light-green)] transition flex-1 max-w-xs shadow-sm">Edit extracted data</button>
                                <button onClick={() => setStep('gaps')} className="bg-[var(--forest)] text-[var(--white)] font-bold py-4 px-10 rounded-xl hover:bg-green-800 transition shadow-md flex-1 max-w-xs">Continue to fill gaps →</button>
                            </div>
                        </div>
                    )}

                    {step === 'gaps' && (
                        <div className="animate-fade-in w-full max-w-4xl mx-auto">
                            <div className="text-center mb-10">
                                <h1 className="font-playfair text-4xl font-bold text-[var(--dark)] mb-4">Complete Your Data</h1>
                                <p className="text-[var(--gray)] text-lg">We just need a few more details to generate your full ESG report.</p>
                            </div>

                            {gapFields.length === 0 ? (
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center shadow-sm">
                                    <div className="text-5xl mb-4">🎉</div>
                                    <h2 className="text-2xl font-bold text-green-800 mb-2">Extraction Complete</h2>
                                    <p className="text-green-700 mb-8">AI extracted all required fields from your documents! Review the data above and generate your report.</p>
                                    <button onClick={handleValidate} disabled={validating} className="bg-[var(--forest)] text-white px-8 py-3 rounded-xl font-bold hover:bg-green-800 shadow-md transition disabled:opacity-60">{validating ? 'Validating...' : 'Generate Report →'}</button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

                                    {/* Tab Switcher */}
                                    <div className="flex border-b border-gray-200 bg-gray-50">
                                        <button
                                            onClick={() => setActiveTab('manual')}
                                            className={`flex-1 py-4 px-6 font-bold text-lg transition-colors border-b-2 ${activeTab === 'manual' ? 'bg-white text-[var(--forest)] border-[var(--forest)]' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            ✏️ Fill Manually
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('upload')}
                                            className={`flex-1 py-4 px-6 font-bold text-lg transition-colors border-b-2 ${activeTab === 'upload' ? 'bg-white text-[var(--forest)] border-[var(--forest)]' : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            📄 Upload Form
                                        </button>
                                    </div>

                                    <div className="p-8">
                                        {/* MANUAL EXCECUTION TAB */}
                                        {activeTab === 'manual' && (
                                            <div className="animate-fade-in space-y-12">
                                                {(() => {
                                                    const grouped = {
                                                        environmental: gapFields.filter(f => f.category === 'environmental'),
                                                        social: gapFields.filter(f => f.category === 'social'),
                                                        governance: gapFields.filter(f => f.category === 'governance')
                                                    };

                                                    return (
                                                        <>
                                                            {grouped.environmental.length > 0 && (
                                                                <section>
                                                                    <h3 className="flex items-center gap-2 font-bold text-xl text-green-800 border-b-2 border-green-200 pb-2 mb-6"><span className="text-2xl">🌿</span> Environmental</h3>
                                                                    {grouped.environmental.map(f => renderGapField(f))}
                                                                </section>
                                                            )}
                                                            {grouped.social.length > 0 && (
                                                                <section>
                                                                    <h3 className="flex items-center gap-2 font-bold text-xl text-blue-800 border-b-2 border-blue-200 pb-2 mb-6"><span className="text-2xl">👥</span> Social</h3>
                                                                    {grouped.social.map(f => renderGapField(f))}
                                                                </section>
                                                            )}
                                                            {grouped.governance.length > 0 && (
                                                                <section>
                                                                    <h3 className="flex items-center gap-2 font-bold text-xl text-purple-800 border-b-2 border-purple-200 pb-2 mb-6"><span className="text-2xl">🏛</span> Governance</h3>
                                                                    {grouped.governance.map(f => renderGapField(f))}
                                                                </section>
                                                            )}
                                                        </>
                                                    );
                                                })()}

                                                <div className="border-t border-gray-200 pt-8 mt-10">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="font-bold text-gray-700">{Object.keys(gapAnswers).length} of {gapFields.length} fields answered</p>
                                                        <p className="text-sm font-bold text-[var(--forest)]">{Math.round((Object.keys(gapAnswers).length / gapFields.length) * 100)}% Complete</p>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-3 mb-8 overflow-hidden">
                                                        <div className="bg-[var(--forest)] h-3 rounded-full transition-all duration-500" style={{ width: `${(Object.keys(gapAnswers).length / gapFields.length) * 100}%` }}></div>
                                                    </div>

                                                    <button
                                                        disabled={Object.keys(gapAnswers).length < gapFields.length / 2 || validating}
                                                        onClick={handleValidate}
                                                        className="w-full py-4 rounded-xl font-bold bg-[var(--forest)] text-white hover:bg-green-800 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                                                    >
                                                        {validating ? 'Validating...' : 'Validate & Continue →'}
                                                    </button>
                                                    <p className="text-center text-sm text-gray-500 mt-3">You need to answer at least 50% of the questions to proceed.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* UPLOAD FORM TAB */}
                                        {activeTab === 'upload' && (
                                            <div className="animate-fade-in w-full">
                                                {!formFillResult ? (
                                                    <div className="text-center">
                                                        <h2 className="text-2xl font-bold text-[var(--dark)] mb-2">Upload the form you need to fill</h2>
                                                        <p className="text-[var(--gray)] mb-8 max-w-lg mx-auto">Upload the questionnaire your bank or customer sent you. AI will match your data to their specific questions automatically.</p>

                                                        <div
                                                            onClick={() => formUploadRef.current?.click()}
                                                            className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-12 hover:bg-gray-100 hover:border-[var(--mint)] transition cursor-pointer flex flex-col items-center justify-center"
                                                        >
                                                            <div className="text-5xl mb-4">📋</div>
                                                            <h3 className="text-xl font-bold text-[var(--dark)] mb-2">Click to select questionnaire</h3>
                                                            <p className="text-[var(--gray)]">Accepts: .pdf, .txt, .docx, .csv</p>
                                                            <p className="text-xs text-gray-400 mt-4 leading-relaxed max-w-sm">Examples: bank ESG questionnaire, customer sustainability survey, CDP questionnaire</p>

                                                            <input
                                                                type="file"
                                                                ref={formUploadRef}
                                                                onChange={handleFormUploadProcess}
                                                                className="hidden"
                                                                accept=".pdf,.txt,.docx,.csv"
                                                            />
                                                        </div>

                                                        {formExtracting && (
                                                            <div className="mt-8 flex flex-col items-center justify-center pt-6 border-t border-gray-100">
                                                                <svg className="animate-spin h-8 w-8 text-[var(--forest)] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                <p className="font-bold text-[var(--dark)] text-lg">AI is filling your form...</p>
                                                                <p className="text-gray-500 text-sm mt-1">Cross-referencing {formFileName} with your corporate data.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="animate-fade-in">
                                                        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8 flex items-center justify-between">
                                                            <div>
                                                                <h3 className="font-bold text-xl text-green-900">{formFillResult.formTitle || formFileName}</h3>
                                                                <p className="text-green-700 text-sm mt-1">{formFillResult.completionPct}% complete based on matched items</p>
                                                            </div>
                                                            <div className="bg-white rounded-full h-14 w-14 flex items-center justify-center font-bold text-xl text-green-700 shadow-sm border border-green-200">
                                                                {formFillResult.completionPct}%
                                                            </div>
                                                        </div>

                                                        <div className="mb-8">
                                                            <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Successfully Answered ({formFillResult.filledQuestions?.length || 0})</h4>
                                                            <div className="space-y-4">
                                                                {formFillResult.filledQuestions?.map((q, idx) => (
                                                                    <div key={idx} className="bg-gray-50 rounded-lg p-5 border border-gray-200 relative">
                                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{q.questionNumber}</p>
                                                                        <p className="font-medium text-gray-800 mb-3">{q.question}</p>
                                                                        <div className="bg-white border-l-4 border-green-500 p-3 rounded shadow-sm text-green-900 font-medium">
                                                                            {q.answer}
                                                                        </div>
                                                                        <div className="mt-3 flex gap-2">
                                                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-semibold tracking-wide">Source: {q.dataSource}</span>
                                                                            <span className="text-xs bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded font-semibold tracking-wide">Confidence: {q.confidence}</span>
                                                                            {q.needsReview && <span className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-1 rounded font-bold tracking-wide flex items-center gap-1">⚠️ Review Recommended</span>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {formFillResult.unansweredQuestions?.length > 0 && (
                                                            <div className="mb-8">
                                                                <h4 className="font-bold text-amber-800 mb-4 border-b border-amber-200 pb-2">Cannot Answer ({formFillResult.unansweredQuestions?.length || 0})</h4>
                                                                <div className="space-y-4">
                                                                    {formFillResult.unansweredQuestions?.map((q, idx) => (
                                                                        <div key={idx} className="bg-amber-50 rounded-lg p-5 border border-amber-200">
                                                                            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">{q.questionNumber}</p>
                                                                            <p className="font-medium text-amber-900 mb-3">{q.question}</p>
                                                                            <div className="bg-white border text-amber-700 border-amber-300 p-3 rounded font-medium text-sm">
                                                                                <span className="font-bold">Missing Data:</span> {q.reason}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                                                            <button onClick={() => window.print()} className="flex-1 bg-white border-2 border-[var(--forest)] text-[var(--forest)] px-6 py-4 rounded-xl font-bold hover:bg-[var(--light-green)] transition">
                                                                Download Filled Form
                                                            </button>
                                                            <button onClick={handleValidate} disabled={validating} className="flex-1 bg-[var(--forest)] text-white px-6 py-4 rounded-xl font-bold shadow-md hover:bg-green-800 transition disabled:opacity-60">
                                                                Continue to Report →
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
