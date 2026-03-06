import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import IntakeForm from '../components/IntakeForm';
import ScopeHelper from '../agents/ScopeHelper';

export default function ConsultantDashboard({ clients, setClients }) {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('dashboard');
  const [activeClientId, setActiveClientId] = useState(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [newClientForm, setNewClientForm] = useState({
    companyName: '',
    email: '',
    year: '2024',
  });
  const [newlyAddedClient, setNewlyAddedClient] = useState(null);

  const activeClient = clients.find(c => c.id === activeClientId);

  const stats = {
    total: clients.length,
    submitted: clients.filter(c => c.status === 'Submitted').length,
    awaiting: clients.filter(c => c.status !== 'Submitted' && c.status !== 'Reviewed').length,
    reviewed: clients.filter(c => c.status === 'Reviewed').length,
  };

  function handleSubmitSuccess(entries) {
    if (activeClient) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === activeClient.id
            ? {
              ...c,
              status: 'Submitted',
              submitted: true,
              issue: null,
              submittedEntries: entries,
              submittedAt: new Date().toLocaleDateString(),
            }
            : c
        )
      );
    }
    setScreen('dashboard');
  }

  function handleAddNewClient(e) {
    e.preventDefault();
    const { companyName, email, year } = newClientForm;
    if (!companyName.trim() || !email.trim()) return;
    const accessCode = Math.random().toString(36).substring(2, 10);
    const client = {
      id: Date.now(),
      name: companyName.trim(),
      email: email.trim(),
      reportingYear: year,
      status: 'Not Started',
      submitted: false,
      accessCode,
      submittedEntries: [],
    };
    setClients((prev) => [...prev, client]);
    setNewlyAddedClient(client);
    setNewClientForm({ companyName: '', email: '', year: '2024' });
  }

  function closeNewClientModal() {
    setShowNewClientModal(false);
    setNewlyAddedClient(null);
  }

  if (screen === 'form') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <nav className="bg-[var(--white)] shadow-sm sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setScreen('dashboard')}>
            <span className="text-2xl">🌿</span>
            <span className="font-playfair text-xl font-bold text-[var(--forest)]">Earthana</span>
          </Link>
          <span className="font-medium text-[var(--gray)]">Consulting on behalf of {activeClient?.name}</span>
          <button
            onClick={() => setScreen('dashboard')}
            className="text-sm font-semibold text-[var(--gray)] hover:text-[var(--forest)] transition"
          >
            Cancel
          </button>
        </nav>
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <IntakeForm onSubmitSuccess={handleSubmitSuccess} />
        </div>
        <ScopeHelper />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* TOP NAVIGATION BAR */}
      <nav className="bg-[var(--white)] shadow-sm sticky top-0 z-50 px-6 py-3 border-b flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-playfair text-xl font-bold text-[var(--forest)]">Earthana</span>
        </Link>
        <div className="font-medium text-[var(--gray)] absolute left-1/2 -translate-x-1/2 hidden md:block">
          Dashboard
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[var(--gray)] hover:text-[var(--dark)] relative pb-1">
            <span className="text-xl">🔔</span>
            {clients.some(c => c.status === 'Submitted') && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setShowNewClientModal(true)}
            className="bg-[var(--forest)] text-[var(--white)] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800 transition shadow-sm hidden sm:block"
          >
            Add Client
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-10 h-10 rounded-full bg-[var(--forest)] text-[var(--white)] font-bold flex items-center justify-center hover:bg-green-800 transition"
            >
              SC
            </button>
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--white)] rounded-xl shadow-lg py-2 border border-gray-100 z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-[var(--dark)] hover:bg-gray-50 font-medium">Settings</button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--red)] hover:bg-red-50 font-medium"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* SUMMARY BAR */}
      <div className="bg-[var(--cream)] border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-gray-200">
          <div className="p-6 bg-[var(--white)] flex flex-col items-center justify-center text-center">
            <div className="text-sm font-semibold text-[var(--gray)] mb-1">Total Clients</div>
            <div className="text-3xl font-bold text-[var(--forest)]">{stats.total}</div>
          </div>
          <div className="p-6 bg-[var(--white)] flex flex-col items-center justify-center text-center">
            <div className="text-sm font-semibold text-[var(--gray)] mb-1">Submitted</div>
            <div className="text-3xl font-bold text-[var(--forest)]">{stats.submitted}</div>
          </div>
          <div className="p-6 bg-[var(--white)] flex flex-col items-center justify-center text-center">
            <div className="text-sm font-semibold text-[var(--gray)] mb-1">Awaiting Data</div>
            <div className="text-3xl font-bold text-[var(--forest)]">{stats.awaiting}</div>
          </div>
          <div className="p-6 bg-[var(--white)] flex flex-col items-center justify-center text-center">
            <div className="text-sm font-semibold text-[var(--gray)] mb-1">Reviewed</div>
            <div className="text-3xl font-bold text-[var(--forest)]">{stats.reviewed}</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full flex flex-col md:flex-row items-stretch">

        {/* Left Sidebar */}
        <div className="w-full md:w-[260px] bg-[var(--white)] border-r border-gray-200 flex flex-col shrink-0 min-h-[500px]">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-[var(--dark)] uppercase tracking-wide text-xs">Clients</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {clients.map(client => (
              <button
                key={client.id}
                onClick={() => setActiveClientId(client.id)}
                className={`w-full text-left p-4 border-b border-gray-50 flex items-center justify-between transition ${activeClientId === client.id ? 'bg-[var(--light-green)] border-l-4 border-l-[var(--forest)]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <span className={`font-medium truncate pr-2 ${activeClientId === client.id ? 'text-[var(--forest)]' : 'text-[var(--dark)]'}`}>
                  {client.name}
                </span>
                {client.status === 'Submitted' && <span className="w-2 h-2 rounded-full bg-[var(--mint)] shrink-0"></span>}
                {client.status === 'Incomplete' && <span className="w-2 h-2 rounded-full bg-[var(--red)] shrink-0"></span>}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => setShowNewClientModal(true)}
              className="w-full text-center py-2 text-sm font-bold text-[var(--forest)] hover:bg-[var(--light-green)] rounded-lg transition"
            >
              Add New Client +
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-x-auto">
          {!activeClient ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--gray)] mt-20">
              <span className="text-6xl mb-4 opacity-20">📂</span>
              <p className="text-lg font-medium">Select a client to view their details</p>
            </div>
          ) : (
            <div className="max-w-3xl bg-[var(--white)] shadow-sm rounded-xl border border-gray-200 p-8">

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-playfair text-3xl font-bold text-[var(--dark)] mb-2">{activeClient.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-[var(--gray)]">
                    <span className="flex items-center gap-1">✉️ {activeClient.email || 'No email provided'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">📅 {activeClient.reportingYear || '2024'} Reporting</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {activeClient.status === 'Submitted' && (
                    <span className="bg-[var(--light-green)] text-[var(--forest)] px-3 py-1 rounded-full text-sm font-bold border border-[var(--mint)]">
                      Submitted
                    </span>
                  )}
                  {activeClient.status === 'In Progress' && (
                    <span className="bg-[#FFF8E6] text-[#B7791F] px-3 py-1 rounded-full text-sm font-bold border border-[#F6E05E]">
                      In Progress
                    </span>
                  )}
                  {activeClient.status === 'Incomplete' && (
                    <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-bold border border-red-200">
                      Incomplete
                    </span>
                  )}
                  {activeClient.status === 'Not Started' && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold border border-gray-200">
                      Not Started
                    </span>
                  )}
                </div>
              </div>

              {/* Copyable Portal Link */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-[var(--gray)] uppercase tracking-wide mb-2">Client Portal Link</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[var(--light-green)] text-[var(--forest)] px-4 py-3 rounded-lg border border-[var(--mint)] border-opacity-30 font-mono text-sm break-all font-medium">
                    {window.location.origin}/submit/{activeClient.accessCode}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/submit/${activeClient.accessCode}`)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-bold text-sm transition shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <hr className="border-gray-100 my-8" />

              {/* Conditional Content based on Status */}
              {!activeClient.submitted ? (
                <div>
                  <h3 className="text-lg font-bold text-[var(--dark)] mb-2">Data Submission Pending</h3>
                  <p className="text-[var(--gray)] mb-4 text-sm leading-relaxed">
                    The client has not completed their submission yet. You can submit data manually on their behalf if you have it.
                  </p>
                  <button
                    onClick={() => setScreen('form')}
                    className="bg-[var(--forest)] text-[var(--white)] font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-green-800 transition"
                  >
                    Submit Data Manually
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[var(--dark)]">Submitted Data</h3>
                    <span className="text-xs font-semibold text-[var(--gray)] uppercase tracking-wide">
                      Received {activeClient.submittedAt || 'recently'}
                    </span>
                  </div>

                  {/* Submitted Data Table */}
                  {activeClient.submittedEntries && activeClient.submittedEntries.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-8">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                          <tr>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4 text-right">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-800">
                          {activeClient.submittedEntries.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                              <td className="py-3 px-4">{entry.date || '-'}</td>
                              <td className="py-3 px-4">
                                <div className="font-medium">{entry.type || 'Energy'}</div>
                                {entry.scope && <div className="text-xs text-gray-500">{entry.scope}</div>}
                              </td>
                              <td className="py-3 px-4 text-right font-medium">
                                {Number(entry.value).toLocaleString()} {entry.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 text-gray-500 p-4 border border-gray-200 rounded-lg text-sm text-center italic mb-8">
                      No matching entry data found.
                    </div>
                  )}

                  {/* AI Message Panel if issue exists */}
                  {activeClient.status === 'Incomplete' && activeClient.issue && (
                    <div className="bg-[var(--cream)] border border-[var(--sand)] border-opacity-50 p-6 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[var(--sand)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        AI ASSISTANT
                      </div>
                      <h4 className="font-bold text-[var(--dark)] mb-3 flex items-center gap-2">
                        ✨ Issue detected: unit mismatch
                      </h4>
                      <div className="bg-white border border-gray-200 p-4 rounded-lg text-sm text-gray-700 leading-relaxed mb-4 shadow-sm">
                        <p>Hi {activeClient.name.split(' ')[0] || 'Team'},</p>
                        <br />
                        <p>Thanks for submitting your {activeClient.reportingYear || '2024'} data. We noticed a potential unit mismatch in Scope 1 emissions (Missing February energy data — unit mismatch on Scope 1).</p>
                        <br />
                        <p>Could you please review and provide the corrected figures?</p>
                        <br />
                        <p>Best,<br />Your ESG Consultant</p>
                      </div>
                      <div className="flex gap-3">
                        <button className="bg-[var(--forest)] text-[var(--white)] font-bold px-4 py-2 rounded shadow-sm hover:bg-green-800 transition text-sm">
                          Send Message
                        </button>
                        <button className="bg-white border text-[var(--dark)] font-bold px-4 py-2 rounded text-sm hover:bg-gray-50 transition border-gray-300 shadow-sm">
                          Edit Draft
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ADD CLIENT MODAL */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-[var(--dark)] bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
          <div className="bg-[var(--white)] rounded-2xl shadow-2xl max-w-md w-full p-8 relative">

            <button
              onClick={closeNewClientModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold transition"
            >
              &times;
            </button>

            <h2 className="font-playfair text-2xl font-bold text-[var(--dark)] mb-6">Add New Client</h2>

            {newlyAddedClient ? (
              <div className="animate-fade-in">
                <div className="bg-[var(--light-green)] border border-[var(--mint)] rounded-xl p-5 mb-6">
                  <p className="text-[var(--forest)] text-sm font-bold mb-3 flex items-center gap-2">
                    <span className="text-xl">✅</span> Client successfully added
                  </p>
                  <p className="text-[var(--dark)] text-sm mb-2 opacity-80">Share this portal link with them:</p>
                  <code className="block text-[var(--forest)] text-sm font-mono bg-white p-3 rounded-lg border border-[var(--mint)] border-opacity-30 break-all select-all shadow-inner font-semibold">
                    {`${window.location.origin}/submit/${newlyAddedClient.accessCode}`}
                  </code>
                </div>
                <button
                  onClick={closeNewClientModal}
                  className="w-full bg-[var(--dark)] hover:bg-black text-[var(--white)] font-bold py-3 rounded-lg transition shadow-sm"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddNewClient} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[var(--dark)] mb-2">
                    Company name <span className="text-[var(--red)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newClientForm.companyName}
                    onChange={(e) =>
                      setNewClientForm((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    placeholder="e.g. Acme Corp"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[var(--dark)] focus:outline-none focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--dark)] mb-2">
                    Contact email <span className="text-[var(--red)]">*</span>
                  </label>
                  <input
                    type="email"
                    value={newClientForm.email}
                    onChange={(e) =>
                      setNewClientForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="contact@acme.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[var(--dark)] focus:outline-none focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[var(--dark)] mb-2">
                    Reporting year
                  </label>
                  <select
                    value={newClientForm.year}
                    onChange={(e) =>
                      setNewClientForm((prev) => ({ ...prev, year: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[var(--dark)] bg-white focus:outline-none focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] transition"
                  >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewClientModal(false)}
                    className="flex-1 bg-[var(--white)] border border-gray-300 hover:bg-gray-50 text-[var(--dark)] font-bold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[var(--forest)] hover:bg-green-800 text-[var(--white)] font-bold py-3 rounded-lg transition shadow-sm"
                  >
                    Add Client
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* KEEP THE SCOPE HELPER FOR DASHBOARD AS WELL */}
      <ScopeHelper />
    </div>
  );
}
