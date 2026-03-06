import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ConsultantLogin from './pages/ConsultantLogin'
import ClientLogin from './pages/ClientLogin'
import ConsultantDashboard from './pages/ConsultantDashboard'
import ClientPortal from './pages/ClientPortal'
import SMEOnboarding from './pages/SMEOnboarding'
import SMECollect from './pages/SMECollect'
import SMEReport from './pages/SMEReport'

const initialClients = [
  { id: 1, name: 'Patagonia', status: 'Submitted', submitted: true, accessCode: 'demo1', reportingYear: '2024' },
  { id: 2, name: 'Cruz Foam', status: 'Incomplete', issue: 'Missing February energy data — unit mismatch on Scope 1', accessCode: 'demo2', reportingYear: '2024' },
  { id: 3, name: 'Bloom & Wild', status: 'In Progress', accessCode: 'demo3', reportingYear: '2024' },
  { id: 4, name: 'Allbirds', status: 'Not Started', accessCode: 'demo4', reportingYear: '2024' },
]

export default function App() {
  const [clients, setClients] = useState(initialClients)

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/consultant/login" element={<ConsultantLogin />} />
      <Route path="/client/login" element={<ClientLogin />} />
      <Route path="/sme" element={<SMEOnboarding />} />
      <Route path="/sme/collect" element={<SMECollect />} />
      <Route path="/sme/report" element={<SMEReport />} />
      <Route
        path="/dashboard"
        element={<ConsultantDashboard clients={clients} setClients={setClients} />}
      />
      <Route
        path="/submit/:accessCode"
        element={<ClientPortal clients={clients} setClients={setClients} />}
      />
    </Routes>
  )
}
