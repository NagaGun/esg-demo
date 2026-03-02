import { useState } from 'react'
import ClientCard from './components/ClientCard'
import IntakeForm from './components/IntakeForm'

const initialClients = [
  { id: 1, name: "Patagonia", status: "Submitted", submitted: true },
  { id: 2, name: "Cruz Foam", status: "Incomplete", issue: "Missing February energy data — unit mismatch on Scope 1" },
  { id: 3, name: "Bloom & Wild", status: "In Progress" },
  { id: 4, name: "Allbirds", status: "Not Started" }
]

function App() {
  const [screen, setScreen] = useState('dashboard')
  const [clients, setClients] = useState(initialClients)

  function handleSubmitSuccess() {
    setClients(prev => prev.map(c =>
      c.name === "Cruz Foam"
        ? { ...c, status: "Submitted", submitted: true, issue: null }
        : c
    ))
    setScreen('dashboard')
  }

  if (screen === 'form') {
    return <IntakeForm onSubmitSuccess={handleSubmitSuccess} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
            <p className="text-gray-500 mt-1">4 active clients · 1 requires attention</p>
          </div>
          <button
            onClick={() => setScreen('form')}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Submit Data
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {clients.map(client => (
            <ClientCard
              key={client.id}
              name={client.name}
              status={client.status}
              issue={client.issue}
              submitted={client.submitted}
            />
          ))}
        </div>

      </div>
    </div>
  )
}

export default App