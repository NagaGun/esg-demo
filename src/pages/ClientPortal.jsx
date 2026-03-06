import { useParams, Link } from 'react-router-dom';
import IntakeForm from '../components/IntakeForm';
import ScopeHelper from '../agents/ScopeHelper';

export default function ClientPortal({ clients, setClients }) {
  const { accessCode } = useParams();
  const client = clients.find((c) => c.accessCode === accessCode);

  if (!client) {
    return (
      <div className="min-h-screen bg-[var(--cream)] flex flex-col items-center justify-center font-sans p-6">
        <div className="bg-[var(--white)] shadow-xl rounded-2xl p-10 text-center max-w-sm w-full border border-gray-100">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-playfair font-bold text-[var(--dark)] mb-2">Invalid Access Link</h2>
          <p className="text-[var(--gray)] mb-8 leading-relaxed">
            This link is not valid or has expired. Please contact your ESG consultant.
          </p>
          <Link
            to="/client/login"
            className="block w-full bg-[var(--forest)] text-[var(--white)] font-bold py-3 rounded-xl hover:bg-green-800 transition shadow-sm"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    );
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
    );
  }

  // Determine which step is active purely for visual purposes
  // If not submitted: Step 1 active. If submitted: Step 3 active.
  const activeStep = client.submitted ? 3 : 1;

  return (
    <div className="min-h-screen bg-[var(--cream)] font-sans flex flex-col pb-20">

      {/* TOP BAR */}
      <nav className="bg-[var(--white)] shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link
          to="/client/login"
          className="text-sm font-bold text-[var(--gray)] hover:text-[var(--forest)] transition flex items-center gap-1"
        >
          <span>←</span> Back
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-playfair text-xl font-bold text-[var(--forest)] hidden sm:block">Earthana</span>
        </div>

        <div className="text-sm font-semibold text-[var(--gray)] px-3 py-1 bg-gray-50 rounded-md border border-gray-100">
          {client.name}
        </div>
      </nav>

      {/* PROGRESS INDICATOR */}
      <div className="bg-[var(--white)] border-b border-gray-200 py-4 shadow-sm mb-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>

            {/* Steps */}
            {[
              { num: 1, label: 'Upload or Enter Data' },
              { num: 2, label: 'Review Entries' },
              { num: 3, label: 'Submit' }
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center bg-[var(--white)] px-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 shadow-sm transition
                    ${activeStep === step.num ? 'bg-[var(--forest)] text-[var(--white)] ring-4 ring-[var(--light-green)]'
                      : activeStep > step.num ? 'bg-[var(--mint)] text-[var(--forest)] border-2 border-[var(--mint)]'
                        : 'bg-white text-[var(--gray)] border-2 border-gray-200'}`}
                >
                  {activeStep > step.num ? '✓' : step.num}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wide hidden md:block ${activeStep === step.num ? 'text-[var(--forest)]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6">
        <div className="bg-[var(--white)] shadow-xl rounded-2xl border border-gray-100 overflow-hidden mb-8">

          <div className="p-8 pb-4 border-b border-gray-100 bg-gray-50">
            <h1 className="font-playfair text-3xl font-bold text-[var(--dark)] mb-2">Submit Your Sustainability Data</h1>
            <p className="text-[var(--gray)] leading-relaxed">
              Add all your energy data entries below. You can upload bills or enter manually.
            </p>
          </div>

          <div className="p-4 sm:p-8">
            <IntakeForm onSubmitSuccess={handleSubmitSuccess} />
          </div>

        </div>
      </div>

      {/* ScopeHelper chat bot */}
      <ScopeHelper />
    </div>
  );
}
