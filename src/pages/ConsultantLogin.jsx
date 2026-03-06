import { Link, useNavigate } from 'react-router-dom';

export default function ConsultantLogin() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* LEFT COLUMN */}
      <div className="hidden md:flex flex-col justify-center bg-[var(--forest)] w-[40%] text-[var(--white)] p-12">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="text-5xl mb-8">🌿</div>
          <h1 className="font-playfair text-4xl leading-tight font-bold">
            Welcome back,<br />Consultant.
          </h1>
          <p className="text-[var(--white)] opacity-60 text-lg leading-relaxed">
            Manage your clients, review submissions,
            and grow your practice — all in one place.
          </p>

          <ul className="space-y-4 pt-4">
            <li className="flex items-center gap-3 text-lg">
              <span className="text-[var(--mint)]">✓</span> Real-time client submission tracking
            </li>
            <li className="flex items-center gap-3 text-lg">
              <span className="text-[var(--mint)]">✓</span> AI-powered data validation
            </li>
            <li className="flex items-center gap-3 text-lg">
              <span className="text-[var(--mint)]">✓</span> One-click approval workflow
            </li>
          </ul>

          <div className="pt-12 mt-12 border-t border-[var(--white)] border-opacity-20">
            <p className="italic text-sm opacity-80 leading-relaxed">
              "We cut follow-up emails by 80% in the
              first month." — ESG Consultant
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full md:w-[60%] bg-[var(--cream)] flex flex-col p-6">
        <div className="mb-auto">
          <Link to="/" className="text-[var(--gray)] hover:text-[var(--forest)] font-medium transition inline-flex items-center gap-2">
            <span>←</span> Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[var(--white)] shadow-xl rounded-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="font-playfair text-3xl font-bold text-[var(--dark)] mb-2">Consultant Sign In</h2>
              <p className="text-[var(--gray)]">Access your practice dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[var(--dark)] mb-2">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@consultancy.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--dark)] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] transition"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-[var(--forest)] focus:ring-[var(--forest)]" />
                  <span className="text-sm text-[var(--gray)]">Remember me</span>
                </label>
                <Link to="/" className="text-sm font-semibold text-[var(--forest)] hover:text-green-800 transition">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--forest)] text-[var(--white)] font-bold py-3 rounded-lg hover:bg-green-800 transition shadow-sm mt-2"
              >
                Sign In to Dashboard
              </button>
            </form>

            <div className="mt-8 mb-6 relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full absolute"></div>
              <span className="bg-[var(--white)] px-4 text-sm text-[var(--gray)] relative z-10">
                — or continue with —
              </span>
            </div>

            <button className="w-full border border-gray-300 bg-[var(--white)] text-[var(--dark)] font-bold py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="mt-8 text-center text-sm text-[var(--gray)]">
              New to Earthana?{' '}
              <Link to="/" className="text-[var(--forest)] font-semibold hover:underline">
                Start your free trial →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-auto"></div>
      </div>
    </div>
  );
}
