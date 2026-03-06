import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import frameworks from '../data/frameworks'

export default function SMEReport() {
    const location = useLocation()
    const navigate = useNavigate()
    const {
        companyName,
        industry,
        reportingYear,
        selectedFramework,
        finalData
    } = location.state || {}

    const [stage, setStage] = useState('generating')
    const [stageLabel, setStageLabel] = useState('Analyzing your data...')
    const [report, setReport] = useState(null)
    const [error, setError] = useState(null)

    const stages = [
        'Analyzing your data...',
        'Benchmarking against industry averages...',
        'Writing your report narrative...',
        'Finalizing report...'
    ]

    if (!selectedFramework) {
        return <Navigate to="/sme" />
    }

    const framework = frameworks[selectedFramework]

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        generateReport()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Cycle stage labels during loading
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (stage !== 'generating') return
        let i = 0
        const interval = setInterval(() => {
            i = (i + 1) % stages.length
            setStageLabel(stages[i])
        }, 2500)
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stage])

    async function generateReport() {
        setStage('generating')

        const allFields = [
            ...(framework.requiredFields.environmental || []),
            ...(framework.requiredFields.social || []),
            ...(framework.requiredFields.governance || [])
        ]

        // Build a human readable data summary
        const dataSummary = allFields
            .filter(f => finalData[f.id] !== null && finalData[f.id] !== undefined)
            .map(f => `${f.plain || f.label}: ${finalData[f.id]} ${f.unit !== 'yes/no' ? f.unit : ''}`)
            .join('\n')

        const missingFields = allFields
            .filter(f => finalData[f.id] === null || finalData[f.id] === undefined)
            .map(f => f.plain || f.label)

        try {
            const res = await fetch('http://localhost:3001/api/claude', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    max_tokens: 4096,
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional ESG report writer for small businesses. You write clear, accurate sustainability reports using only the data provided. You never invent numbers. Always return valid JSON only.`
                        },
                        {
                            role: 'user',
                            content: `Write a complete ESG report for this small business.

COMPANY: ${companyName}
INDUSTRY: ${industry}
YEAR: ${reportingYear}
FRAMEWORK: ${framework.label}

DATA COLLECTED:
${dataSummary || 'No data provided'}

MISSING DATA (write "Not reported this period"):
${missingFields.join(', ') || 'None'}

Return ONLY this JSON structure:
{
  "reportTitle": "${companyName} Sustainability Report ${reportingYear}",
  "executiveSummary": "3-4 professional sentences summarizing performance using real numbers from the data",
  "sections": [
    {
      "title": "Environmental Performance",
      "category": "environmental",
      "narrative": "3-4 sentences using actual environmental data provided",
      "dataPoints": [
        { "label": "metric name", "value": "number with unit" }
      ]
    },
    {
      "title": "Social Performance",
      "category": "social",
      "narrative": "3-4 sentences using actual social data",
      "dataPoints": [
        { "label": "metric name", "value": "value" }
      ]
    },
    {
      "title": "Governance",
      "category": "governance",
      "narrative": "2-3 sentences about policies and governance",
      "dataPoints": [
        { "label": "policy name", "value": "Yes or No" }
      ]
    }
  ],
  "recommendations": [
    {
      "title": "recommendation title",
      "description": "specific actionable recommendation based on their actual data",
      "priority": "high/medium/low"
    }
  ],
  "dataNote": "brief note about data completeness"
}`
                        }
                    ]
                })
            })

            const data = await res.json()
            const raw = data.content[0].text.trim()
            console.log('REPORT RAW:', raw.substring(0, 300))

            const match = raw.match(/\{[\s\S]*\}/)
            if (match) {
                const parsed = JSON.parse(match[0])
                setReport(parsed)
                setStage('done')
            } else {
                throw new Error('Could not parse report JSON')
            }

        } catch (err) {
            console.error('Report generation failed:', err)
            setError(err.message)
            setStage('error')
        }
    }

    // ── Loading Screen ──
    if (stage === 'generating') {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#FEFAE0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'DM Sans, Arial, sans-serif'
            }}>
                <div style={{ fontSize: '56px', marginBottom: '24px', animation: 'pulse 2s infinite' }}>🌿</div>
                <h2 style={{
                    fontSize: '26px',
                    fontWeight: 'bold',
                    color: '#2D6A4F',
                    marginBottom: '12px',
                    fontFamily: 'Playfair Display, serif'
                }}>
                    Generating Your ESG Report
                </h2>
                <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '48px' }}>
                    {stageLabel}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '340px' }}>
                    {stages.map((s, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            opacity: stageLabel === s ? 1 : 0.35,
                            transition: 'opacity 0.5s ease'
                        }}>
                            <span style={{
                                fontSize: '18px',
                                animation: stageLabel === s ? 'spin 1s linear infinite' : 'none'
                            }}>
                                {stageLabel === s ? '⟳' : '○'}
                            </span>
                            <span style={{
                                fontSize: '14px',
                                color: stageLabel === s ? '#2D6A4F' : '#9CA3AF',
                                fontWeight: stageLabel === s ? '600' : '400'
                            }}>
                                {s}
                            </span>
                        </div>
                    ))}
                </div>
                <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        `}</style>
            </div>
        )
    }

    // ── Error Screen ──
    if (stage === 'error') {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#FEFAE0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'DM Sans, Arial, sans-serif'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '48px',
                    maxWidth: '480px',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                    <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: '#1B1B1B' }}>
                        Report Generation Failed
                    </h2>
                    <p style={{ color: '#6B7280', marginBottom: '32px', lineHeight: '1.6' }}>{error}</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={generateReport}
                            style={{
                                background: '#2D6A4F', color: 'white', border: 'none',
                                borderRadius: '10px', padding: '12px 28px',
                                cursor: 'pointer', fontWeight: '600', fontSize: '15px'
                            }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/sme')}
                            style={{
                                background: 'transparent', color: '#6B7280',
                                border: '1px solid #E5E7EB', borderRadius: '10px',
                                padding: '12px 28px', cursor: 'pointer', fontSize: '15px'
                            }}
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ── Report Display ──
    const categoryIcons = { environmental: '🌿', social: '👥', governance: '🏛' }
    const priorityColors = { high: '#DC2626', medium: '#D97706', low: '#16A34A' }

    return (
        <div style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'DM Sans, Arial, sans-serif' }}>

            <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-card { box-shadow: none !important; border: 1px solid #E5E7EB !important; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
      `}</style>

            {/* Sticky Top Bar */}
            <div className="no-print" style={{
                background: 'white',
                borderBottom: '1px solid #E5E7EB',
                padding: '14px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                        onClick={() => navigate('/sme')}
                        style={{
                            background: 'transparent', border: '1px solid #E5E7EB',
                            borderRadius: '8px', padding: '8px 16px',
                            cursor: 'pointer', color: '#6B7280', fontSize: '14px'
                        }}
                    >
                        ← Start Over
                    </button>
                    <div style={{ width: '1px', height: '20px', background: '#E5E7EB' }} />
                    <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                        {companyName} — {framework.label} {reportingYear}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => { document.title = `${companyName} ESG Report ${reportingYear}`; window.print() }}
                        style={{
                            background: '#2D6A4F', color: 'white', border: 'none',
                            borderRadius: '8px', padding: '10px 18px', cursor: 'pointer',
                            fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                    >
                        📥 Download PDF
                    </button>
                    <button
                        onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!') }}
                        style={{
                            background: 'white', border: '1px solid #E5E7EB',
                            borderRadius: '8px', padding: '10px 18px', cursor: 'pointer',
                            fontSize: '14px', color: '#374151'
                        }}
                    >
                        🔗 Share
                    </button>
                </div>
            </div>

            {/* Report Body */}
            <div style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 24px 80px' }}>

                {/* Header Card */}
                <div className="report-card" style={{
                    background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
                    borderRadius: '20px',
                    padding: '48px',
                    color: 'white',
                    marginBottom: '28px',
                    boxShadow: '0 8px 32px rgba(45,106,79,0.3)'
                }}>
                    <div style={{
                        fontSize: '11px', textTransform: 'uppercase',
                        letterSpacing: '3px', opacity: 0.65, marginBottom: '10px'
                    }}>
                        {framework.label} • {reportingYear}
                    </div>
                    <h1 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '34px', fontWeight: '700',
                        marginBottom: '20px', lineHeight: '1.25', margin: '0 0 20px 0'
                    }}>
                        {report.reportTitle}
                    </h1>
                    <div style={{ width: '48px', height: '3px', background: '#74C69D', borderRadius: '2px', marginBottom: '20px' }} />
                    <p style={{ fontSize: '15px', opacity: 0.85, lineHeight: '1.75', margin: 0 }}>
                        {report.executiveSummary}
                    </p>
                </div>

                {/* Sections */}
                {report.sections?.map((section, i) => (
                    <div key={i} className="report-card" style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '36px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                    }}>
                        <h2 style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: '22px', fontWeight: '700',
                            color: '#1B1B1B', marginBottom: '16px',
                            display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 16px 0'
                        }}>
                            <span>{categoryIcons[section.category] || '📊'}</span>
                            {section.title}
                        </h2>
                        <p style={{
                            color: '#4B5563', lineHeight: '1.85',
                            marginBottom: '28px', fontSize: '15px', margin: '0 0 28px 0'
                        }}>
                            {section.narrative}
                        </p>

                        {section.dataPoints?.length > 0 && (
                            <div style={{
                                background: '#F9FAFB',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: '1px solid #F3F4F6'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                                            <th style={{
                                                textAlign: 'left', padding: '12px 16px',
                                                color: '#6B7280', fontWeight: '600',
                                                fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px'
                                            }}>Metric</th>
                                            <th style={{
                                                textAlign: 'right', padding: '12px 16px',
                                                color: '#6B7280', fontWeight: '600',
                                                fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px'
                                            }}>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {section.dataPoints.map((dp, j) => (
                                            <tr key={j} style={{
                                                borderBottom: j < section.dataPoints.length - 1 ? '1px solid #F3F4F6' : 'none',
                                                background: j % 2 === 0 ? 'white' : '#FAFAFA'
                                            }}>
                                                <td style={{ padding: '13px 16px', color: '#374151' }}>{dp.label}</td>
                                                <td style={{
                                                    padding: '13px 16px', textAlign: 'right',
                                                    fontWeight: '700', color: '#2D6A4F', fontVariantNumeric: 'tabular-nums'
                                                }}>{dp.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}

                {/* Recommendations */}
                {report.recommendations?.length > 0 && (
                    <div className="report-card" style={{
                        background: 'white', borderRadius: '16px',
                        padding: '36px', marginBottom: '20px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                    }}>
                        <h2 style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: '22px', fontWeight: '700',
                            color: '#1B1B1B', margin: '0 0 24px 0'
                        }}>
                            💡 Recommendations
                        </h2>
                        {report.recommendations.map((rec, i) => (
                            <div key={i} style={{
                                borderLeft: `4px solid ${priorityColors[rec.priority] || '#2D6A4F'}`,
                                padding: '16px 20px',
                                marginBottom: i < report.recommendations.length - 1 ? '14px' : 0,
                                background: '#F9FAFB',
                                borderRadius: '0 10px 10px 0'
                            }}>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'flex-start', marginBottom: '8px'
                                }}>
                                    <h3 style={{ fontWeight: '700', color: '#1B1B1B', fontSize: '15px', margin: 0 }}>
                                        {rec.title}
                                    </h3>
                                    <span style={{
                                        fontSize: '10px', padding: '3px 10px',
                                        borderRadius: '20px',
                                        background: (priorityColors[rec.priority] || '#2D6A4F') + '18',
                                        color: priorityColors[rec.priority] || '#2D6A4F',
                                        fontWeight: '700', textTransform: 'uppercase',
                                        whiteSpace: 'nowrap', marginLeft: '12px', letterSpacing: '0.5px'
                                    }}>
                                        {rec.priority}
                                    </span>
                                </div>
                                <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.65', margin: 0 }}>
                                    {rec.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div style={{
                    textAlign: 'center', color: '#9CA3AF',
                    fontSize: '13px', paddingTop: '32px',
                    borderTop: '1px solid #E5E7EB'
                }}>
                    <p style={{ marginBottom: '6px' }}>🌿 Generated by <strong style={{ color: '#2D6A4F' }}>Earthana</strong></p>
                    {report.dataNote && (
                        <p style={{ marginBottom: '6px', fontStyle: 'italic' }}>{report.dataNote}</p>
                    )}
                    <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
        </div>
    )
}
