import { useParams } from 'react-router-dom'
import IntakeForm from '../components/IntakeForm'
import ScopeHelper from '../agents/ScopeHelper'

export default function ClientPortal({ clients, setClients }) {
  const { accessCode } = useParams()
  const client = clients.find((c) => c.accessCode === accessCode)

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Invalid Access Link</h2>
          <p className="text-gray-500 mt-2">
            This link is not valid. Please contact your consultant.
          </p>
        </div>
      </div>
    )
  }

  function handleSubmitSuccess(entries) {
    setClients((prev) =>
      prev.map((c) =>
        c.accessCode === accessCode
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

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-bold text-green-700">ESG Data Submission Portal</h1>
        <p className="text-sm text-gray-500">
          {client.name} — {client.reportingYear || '2024'} Reporting
        </p>
      </div>

      <IntakeForm onSubmitSuccess={handleSubmitSuccess} />
      <ScopeHelper />
    </>
  )
}
