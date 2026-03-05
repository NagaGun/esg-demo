import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ClientCard from '../components/ClientCard'
import IntakeForm from '../components/IntakeForm'
import ScopeHelper from '../agents/ScopeHelper'

export default function ConsultantDashboard({ clients, setClients }) {
  const [screen, setScreen] = useState('dashboard')
  const [activeClient, setActiveClient] = useState(null)
  const [expandedClient, setExpandedClient] = useState(null)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [newClientForm, setNewClientForm] = useState({
    companyName: '',
    email: '',
    year: '2024',
  })
  const [newlyAddedClient, setNewlyAddedClient] = useState(null)

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
      )
    }
    setActiveClient(null)
    setScreen('dashboard')
  }

  function handleAddNewClient(e) {
    e.preventDefault()
    const { companyName, email, year } = newClientForm
    if (!companyName.trim() || !email.trim()) return
    const accessCode = Math.random().toString(36).substring(2, 10)
    const client = {
      id: Date.now(),
      name: companyName.trim(),
      email: email.trim(),
      reportingYear: year,
      status: 'Not Started',
      submitted: false,
      accessCode,
      submittedEntries: [],
    }
    setClients((prev) => [...prev, client])
    setNewlyAddedClient(client)
    setNewClientForm({ companyName: '', email: '', year: '2024' })
  }

  function closeNewClientModal() {
    setShowNewClientModal(false)
    setNewlyAddedClient(null)
  }

  if (screen === 'form') {
    return (
      <>
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-playfair text-xl font-semibold text-earthana-forest">Earthana</span>
          </Link>
          <span className="text-sm text-gray-500">Consultant Workspace</span>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[#1B1B1B]/70 hover:text-earthana-forest transition"
          >
            Logout
          </button>
        </nav>
        <IntakeForm onSubmitSuccess={handleSubmitSuccess} />
        <ScopeHelper />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-earthana-cream">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <nav className="bg-white border-b border-gray-200 -mx-6 -mt-10 px-6 py-4 mb-8 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="font-playfair text-xl font-semibold text-earthana-forest">Earthana</span>
            </Link>
            <h2 className="font-playfair font-semibold text-[#1B1B1B]">Dashboard</h2>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-[#1B1B1B]/70 hover:text-earthana-forest transition"
            >
              Logout
            </button>
          </nav>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Client Dashboard</h2>
              <p className="text-gray-500 mt-1">{clients.length} active clients</p>
            </div>
            <button
              onClick={() => setShowNewClientModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + New Client
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                name={client.name}
                status={client.status}
                issue={client.issue}
                submitted={client.submitted}
                submittedEntries={client.submittedEntries}
                submittedAt={client.submittedAt}
                expanded={expandedClient === client.id}
                onExpand={() =>
                  setExpandedClient((prev) => (prev === client.id ? null : client.id))
                }
                onSubmitClick={() => {
                  setActiveClient(client)
                  setScreen('form')
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {showNewClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Client</h2>

            {newlyAddedClient ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 text-sm font-medium mb-2">
                    Client added. Share this portal link with them:
                  </p>
                  <code className="block text-green-900 text-sm bg-green-100 p-2 rounded break-all select-all">
                    {`${window.location.origin}/submit/${newlyAddedClient.accessCode}`}
                  </code>
                </div>
                <button
                  onClick={closeNewClientModal}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded-lg"
                >
                  Done
                </button>
              </>
            ) : (
              <form onSubmit={handleAddNewClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newClientForm.companyName}
                    onChange={(e) =>
                      setNewClientForm((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newClientForm.email}
                    onChange={(e) =>
                      setNewClientForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reporting year
                  </label>
                  <select
                    value={newClientForm.year}
                    onChange={(e) =>
                      setNewClientForm((prev) => ({ ...prev, year: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewClientModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg"
                  >
                    Add Client
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ScopeHelper />
    </>
  )
}
