function ClientCard({ name, status, issue, submitted, onClick }) {
  const statusColors = {
    "Submitted": "bg-green-100 text-green-700",
    "Incomplete": "bg-red-100 text-red-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    "Not Started": "bg-gray-100 text-gray-600"
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">

      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[status]}`}>
          {status}
        </span>
      </div>

      {issue && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-3">
          <p className="text-sm text-red-600">⚠ {issue}</p>
        </div>
      )}

      {submitted && (
        <p className="text-sm text-gray-400 mt-3">Ready for review</p>
      )}

      {onClick && (
        <button
          onClick={onClick}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Submit Data
        </button>
      )}

    </div>
  )
}

export default ClientCard