import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import frameworks from '../data/frameworks';
import NavBar from '../components/NavBar';

export default function SMEOnboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('');
    const [reportingYear, setReportingYear] = useState('2024');
    const [employeeCount, setEmployeeCount] = useState('');
    const [selectedFramework, setSelectedFramework] = useState(null);

    const handleNextStep1 = (e) => {
        e.preventDefault();
        if (companyName.trim()) {
            setStep(2);
        }
    };

    const handleSelectFramework = (id) => {
        setSelectedFramework(id);
    };

    const handleNextStep2 = () => {
        if (selectedFramework) {
            setStep(3);
        }
    };

    const handleStartCollection = () => {
        navigate('/sme/collect', {
            state: { companyName, industry, reportingYear, selectedFramework, employeeCount }
        });
    };

    const selectedData = selectedFramework ? frameworks[selectedFramework] : null;

    // Calculate field counts
    let totalDataPoints = 0;
    let uploadableFields = [];
    let questionFields = [];

    if (selectedData) {
        const categories = ['environmental', 'social', 'governance'];
        categories.forEach(cat => {
            const fields = selectedData.requiredFields[cat] || [];
            totalDataPoints += fields.length;
            fields.forEach(f => {
                if (f.uploadable) {
                    uploadableFields.push(f);
                } else {
                    questionFields.push(f);
                }
            });
        });
    }

    // Helper to map field ids to simple labels for the checklists
    const docMapping = {
        'electricity_kwh': '⚡ Electricity bills (last 12 months)',
        'gas_kwh': '🔥 Gas bills (last 12 months)',
        'fuel_litres': '🚗 Fuel receipts or fleet reports',
        'scope1_emissions': '⛽ Direct emissions data',
        'scope2_emissions': '🔌 Indirect emissions data',
        'water_m3': '💧 Water utility bills',
        'waste_tonnes': '🗑 Waste disposal invoices'
    };

    return (
        <div className="min-h-screen bg-[var(--cream)] flex flex-col font-sans">
            <NavBar backTo="/" backLabel="Home" title="ESG Data Collection" />
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-5xl">

                    {/* Progress Bar */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-[var(--forest)]' : 'bg-gray-200'}`}></div>
                        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-[var(--forest)]' : 'bg-gray-200'}`}></div>
                        <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-[var(--forest)]' : 'bg-gray-200'}`}></div>
                    </div>

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="bg-[var(--white)] shadow-xl border border-gray-100 rounded-2xl p-8 max-w-lg mx-auto">
                            <h2 className="font-playfair text-3xl font-bold text-[var(--dark)] mb-6 text-center">
                                Tell us about your business
                            </h2>
                            <form onSubmit={handleNextStep1} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--dark)] mb-2">
                                        Company Name <span className="text-[var(--red)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. Acme Corp"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[var(--dark)] focus:outline-none focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--dark)] mb-2">
                                        Industry
                                    </label>
                                    <select
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[var(--dark)] bg-white focus:outline-none focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] transition"
                                    >
                                        <option value="">Select industry</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Food & Beverage">Food & Beverage</option>
                                        <option value="Professional Services">Professional Services</option>
                                        <option value="Construction">Construction</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--dark)] mb-2">
                                        Reporting Year
                                    </label>
                                    <select
                                        value={reportingYear}
                                        onChange={(e) => setReportingYear(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[var(--dark)] bg-white focus:outline-none focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] transition"
                                    >
                                        <option value="2023">2023</option>
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--dark)] mb-2">
                                        Number of Employees
                                    </label>
                                    <select
                                        value={employeeCount}
                                        onChange={(e) => setEmployeeCount(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[var(--dark)] bg-white focus:outline-none focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] transition"
                                    >
                                        <option value="">Select range</option>
                                        <option value="1-10">1-10</option>
                                        <option value="11-50">11-50</option>
                                        <option value="51-250">51-250</option>
                                        <option value="250+">250+</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[var(--forest)] text-[var(--white)] font-bold py-3 rounded-lg hover:bg-green-800 transition shadow-sm mt-4"
                                >
                                    Continue
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="animate-fade-in text-center">
                            <h2 className="font-playfair text-4xl font-bold text-[var(--dark)] mb-4">
                                Why are you reporting?
                            </h2>
                            <p className="text-[var(--gray)] text-lg mb-10 max-w-2xl mx-auto">
                                Select your situation and we'll collect exactly the right data — nothing more.
                            </p>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 text-left mb-10">

                                {[
                                    {
                                        id: 'bank',
                                        emoji: '🏦',
                                        bullets: ['✓ Energy and emissions data', '✓ Workforce information', '✓ Basic governance policies']
                                    },
                                    {
                                        id: 'customer',
                                        emoji: '🤝',
                                        bullets: ['✓ Scope 1 & 2 emissions', '✓ Supply chain information', '✓ Social and governance policies']
                                    },
                                    {
                                        id: 'gri',
                                        emoji: '🌍',
                                        bullets: ['✓ Energy and emissions (GRI 302, 305)', '✓ Water and waste (GRI 303, 306)', '✓ Workforce and social data (GRI 401-405)']
                                    },
                                    {
                                        id: 'cdp',
                                        emoji: '🏭',
                                        bullets: ['✓ Scope 1 and 2 emissions', '✓ Energy consumption data', '✓ Climate governance questions']
                                    },
                                    {
                                        id: 'vsme',
                                        emoji: '📋',
                                        bullets: ['✓ Full environmental disclosure', '✓ Workforce and social data', '✓ Governance information']
                                    }
                                ].map(card => {
                                    const fw = frameworks[card.id];
                                    const isSelected = selectedFramework === card.id;
                                    return (
                                        <button
                                            key={card.id}
                                            onClick={() => handleSelectFramework(card.id)}
                                            className={`bg-[var(--white)] rounded-2xl p-6 border-2 transition relative flex flex-col h-full hover:shadow-md text-left ${isSelected ? 'border-[var(--forest)] shadow-md ring-2 ring-[var(--mint)] ring-opacity-40' : 'border-gray-200'}`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-4 right-4 text-[var(--forest)] text-sm font-bold bg-[var(--light-green)] rounded-full w-8 h-8 flex items-center justify-center">✓</div>
                                            )}
                                            <div className="text-3xl mb-3">{card.emoji}</div>
                                            <h3 className="font-bold text-lg text-[var(--dark)] mb-2 leading-snug">{fw.label}</h3>
                                            <p className="text-[var(--gray)] text-sm mb-5 leading-relaxed">{fw.description}</p>
                                            <ul className="space-y-2 mt-auto text-sm text-[var(--dark)] font-medium">
                                                {card.bullets.map((b, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-[var(--mint)] shrink-0">{b.substring(0, 1)}</span>
                                                        <span>{b.substring(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className={`mt-5 py-2 px-4 rounded-lg font-bold text-center w-full text-sm transition ${isSelected ? 'bg-[var(--forest)] text-white' : 'bg-gray-100 text-gray-700'}`}>
                                                {isSelected ? 'Selected ✓' : 'Select'}
                                            </div>
                                        </button>
                                    );
                                })}

                            </div>

                            {selectedFramework && (
                                <div className="bg-[var(--light-green)] border border-[var(--mint)] border-opacity-30 rounded-xl p-4 inline-block mb-8 shadow-sm">
                                    <p className="text-[var(--forest)] font-medium">
                                        We'll collect <strong>{totalDataPoints}</strong> data points across <strong>3</strong> categories for your <strong>{selectedData.label}</strong> report.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="bg-white border border-gray-300 text-[var(--dark)] font-bold py-3 px-8 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Back
                                </button>
                                <button
                                    disabled={!selectedFramework}
                                    onClick={handleNextStep2}
                                    className="bg-[var(--forest)] text-[var(--white)] font-bold py-3 px-8 rounded-lg hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && selectedData && (
                        <div className="animate-fade-in max-w-4xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="font-playfair text-4xl font-bold text-[var(--dark)] mb-4">
                                    Here's what you'll need
                                </h2>
                                <p className="text-[var(--gray)] text-lg">
                                    Gather these documents before you start. Our AI will read them and fill out the forms automatically.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-10">

                                {/* Left Column */}
                                <div className="bg-[var(--white)] shadow-md rounded-2xl p-8 border border-gray-100">
                                    <h3 className="font-bold text-xl text-[var(--dark)] mb-6 pb-4 border-b border-gray-100">
                                        Documents to upload (AI reads these)
                                    </h3>
                                    <ul className="space-y-4 text-[var(--gray)]">
                                        {uploadableFields.map(field => (
                                            <li key={field.id} className="flex gap-3">
                                                <span className="shrink-0">{docMapping[field.id] ? docMapping[field.id].split(' ')[0] : '📄'}</span>
                                                <span className="font-medium text-[var(--dark)]">
                                                    {docMapping[field.id] ? docMapping[field.id].substring(docMapping[field.id].indexOf(' ') + 1) : field.label}
                                                </span>
                                            </li>
                                        ))}
                                        {uploadableFields.length === 0 && (
                                            <li className="italic text-gray-400">No documents required for this report.</li>
                                        )}
                                    </ul>
                                </div>

                                {/* Right Column */}
                                <div className="bg-[var(--white)] shadow-md rounded-2xl p-8 border border-gray-100">
                                    <h3 className="font-bold text-xl text-[var(--dark)] mb-6 pb-4 border-b border-gray-100">
                                        Questions you'll answer
                                    </h3>
                                    <ul className="space-y-4 text-[var(--gray)]">
                                        {/* Show a representative sample of questions to avoid overwhelming, since there might be many */}
                                        {questionFields.filter(f => f.category === 'social').slice(0, 2).map(field => (
                                            <li key={field.id} className="flex gap-3">
                                                <span className="shrink-0">👥</span>
                                                <span className="font-medium text-[var(--dark)]">{field.label}</span>
                                            </li>
                                        ))}
                                        {questionFields.filter(f => f.category === 'social').length > 0 && (
                                            <li className="flex gap-3">
                                                <span className="shrink-0">📊</span>
                                                <span className="font-medium text-[var(--dark)]">Basic workforce stats</span>
                                            </li>
                                        )}
                                        {questionFields.filter(f => f.category === 'governance').length > 0 && (
                                            <li className="flex gap-3">
                                                <span className="shrink-0">📋</span>
                                                <span className="font-medium text-[var(--dark)]">Policy yes/no questions</span>
                                            </li>
                                        )}
                                        {questionFields.length === 0 && (
                                            <li className="italic text-gray-400">No manual questions for this report.</li>
                                        )}
                                    </ul>
                                </div>

                            </div>

                            <div className="bg-[var(--light-green)] border border-[var(--mint)] border-opacity-40 rounded-xl p-6 mb-8 text-center max-w-2xl mx-auto shadow-sm">
                                <p className="text-[var(--forest)] font-bold mb-2">⏱ Estimated time: 15-30 minutes</p>
                                <p className="text-[var(--dark)] text-sm opacity-80">
                                    AI will pre-fill everything it finds in your documents. You'll only answer what's left.
                                </p>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="bg-white border border-gray-300 text-[var(--dark)] font-bold py-3 px-8 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleStartCollection}
                                    className="bg-[var(--forest)] text-[var(--white)] font-bold py-3 px-8 rounded-lg hover:bg-green-800 transition shadow-md"
                                >
                                    Start Data Collection →
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
