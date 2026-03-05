function ClientCard({
  name,
  status,
  issue,
  submitted,
  submittedEntries,
  submittedAt,
  expanded,
  onExpand,
  onSubmitClick,
}) {
  const statusColors = {
    Submitted: "bg-green-100 text-green-700",
    Reviewed: "bg-blue-100 text-blue-700",
    Incomplete: "bg-red-100 text-red-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    "Not Started": "bg-gray-100 text-gray-600",
  }

  const showSubmitButton = status !== "Submitted" && status !== "Reviewed"
  const isSubmitted = status === "Submitted"

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow ${
        isSubmitted ? "cursor-pointer hover:shadow-md" : ""
      }`}
      onClick={isSubmitted ? onExpand : undefined}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[status] || "bg-gray-100 text-gray-600"}`}
        >
          {status}
        </span>
      </div>

      {issue && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-3">
          <p className="text-sm text-red-600">⚠ {issue}</p>
        </div>
      )}

      {showSubmitButton && onSubmitClick && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSubmitClick()
          }}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Submit Data
        </button>
      )}

      {isSubmitted && !expanded && (
        <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-medium">
          <span>✓</span>
          <span>Data submitted — awaiting review</span>
        </div>
      )}

      {expanded && isSubmitted && submittedEntries?.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-3">
            SUBMITTED DATA — {submittedAt}
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2">Energy Type</th>
                <th className="text-left pb-2">Amount</th>
                <th className="text-left pb-2">Unit</th>
                <th className="text-left pb-2">Period</th>
              </tr>
            </thead>
            <tbody>
              {submittedEntries.map((entry, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 capitalize">
                    {(entry.energyType || "").replace("_", " ")}
                  </td>
                  <td className="py-2">{entry.usageAmount}</td>
                  <td className="py-2">{entry.unit}</td>
                  <td className="py-2 text-xs text-gray-400">
                    {entry.startDate} → {entry.endDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ClientCard
