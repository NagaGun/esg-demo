import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-earthana-white flex flex-col font-sans">
      {/* NAV BAR */}
      <nav className="sticky top-0 z-50 bg-[var(--white)] shadow-sm px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-playfair text-xl font-bold text-[var(--forest)]">Earthana</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-[var(--gray)] hover:text-[var(--forest)] transition font-medium">Features</a>
          <a href="#pricing" className="text-[var(--gray)] hover:text-[var(--forest)] transition font-medium">Pricing</a>
          <button
            onClick={() => navigate('/consultant/login')}
            className="border border-[var(--gray)] text-[var(--gray)] px-4 py-2 rounded-lg hover:border-[var(--forest)] hover:text-[var(--forest)] transition font-medium"
          >
            Consultant Login
          </button>
          <button
            onClick={() => navigate('/client/login')}
            className="border border-[var(--mint)] text-[var(--forest)] px-4 py-2 rounded-lg hover:bg-[var(--light-green)] transition font-medium"
          >
            Client Portal
          </button>
          <button
            onClick={() => navigate('/consultant/login')}
            className="bg-[var(--forest)] text-[var(--white)] px-4 py-2 rounded-lg hover:bg-green-800 transition font-medium"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-[var(--cream)] py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-[var(--light-green)] text-[var(--forest)] px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
              ESG Data Collection Platform
            </span>
            <h1 className="font-playfair text-5xl md:text-[56px] leading-tight text-[var(--dark)] font-bold">
              ESG Reporting,<br />Finally Simplified.
            </h1>
            <p className="text-[18px] text-[var(--gray)] max-w-lg leading-relaxed">
              Stop chasing clients for bad data over email.
              Earthana gives ESG consultants a smarter way
              to collect, validate, and manage client
              sustainability data — all in one place.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate('/consultant/login')}
                className="bg-[var(--forest)] text-[var(--white)] px-6 py-3 rounded-lg hover:bg-green-800 transition font-medium text-lg shadow-sm"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/questionnaire')}
                className="border-2 border-[var(--forest)] text-[var(--forest)] bg-white px-6 py-3 rounded-lg hover:bg-[var(--light-green)] transition font-bold text-lg shadow-sm"
              >
                Fill My Questionnaire →
              </button>
              <button className="border border-[var(--gray)] text-[var(--gray)] px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium text-lg">
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-[var(--gray)] font-medium">
              ✓ Free to start &nbsp;&nbsp;✓ No credit card &nbsp;&nbsp;✓ Setup in 5 mins
            </p>
          </div>

          <div className="relative">
            <div className="bg-[var(--white)] rounded-xl shadow-xl p-6 border border-gray-100 relative z-10 w-full max-w-md mx-auto">
              <h3 className="font-playfair font-bold text-xl text-[var(--dark)] mb-4 border-b pb-4">Client Dashboard</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition border border-gray-50">
                  <span className="font-medium text-[var(--dark)]">Patagonia</span>
                  <span className="bg-[var(--light-green)] text-[var(--forest)] px-2 py-1 rounded text-xs font-semibold">Submitted</span>
                </div>
                <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition border border-gray-50">
                  <span className="font-medium text-[var(--dark)]">Cruz Foam</span>
                  <span className="bg-[var(--light-red)] text-[var(--red)] px-2 py-1 rounded text-xs font-semibold">Incomplete</span>
                </div>
                <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition border border-gray-50">
                  <span className="font-medium text-[var(--dark)]">Allbirds</span>
                  <span className="bg-[#FFF8E6] text-[#B7791F] px-2 py-1 rounded text-xs font-semibold">In Progress</span>
                </div>
              </div>
            </div>
            <div className="absolute top-10 -right-4 w-full h-full bg-[var(--sand)] opacity-20 rounded-xl blur-lg z-0"></div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="bg-[var(--white)] py-20 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <h2 className="font-playfair text-4xl font-bold text-[var(--dark)]">Sound Familiar?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[var(--light-red)] p-8 rounded-xl text-left">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-bold text-xl text-[var(--dark)] mb-3">Endless Email Chains</h3>
              <p className="text-[var(--gray)]">
                5-10 emails per client just to collect basic utility data.
              </p>
            </div>
            <div className="bg-[var(--light-red)] p-8 rounded-xl text-left">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-bold text-xl text-[var(--dark)] mb-3">Wrong Formats Every Time</h3>
              <p className="text-[var(--gray)]">
                PDFs instead of spreadsheets. kWh instead of MWh. Incomplete date ranges.
              </p>
            </div>
            <div className="bg-[var(--light-red)] p-8 rounded-xl text-left">
              <div className="text-4xl mb-4">⏱</div>
              <h3 className="font-bold text-xl text-[var(--dark)] mb-3">20-30% of Time Wasted</h3>
              <p className="text-[var(--gray)]">
                Nearly a third of billable hours spent on admin instead of analysis.
              </p>
            </div>
          </div>

          <div className="py-8">
            <span className="inline-block bg-[var(--dark)] text-[var(--white)] px-6 py-2 rounded-full font-medium shadow-md">
              Earthana solves this →
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[var(--light-green)] p-8 rounded-xl text-left shadow-sm">
              <div className="text-2xl mb-4 bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-[var(--forest)]">✓</div>
              <h3 className="font-bold text-xl text-[var(--forest)] mb-3">Guided Client Portal</h3>
              <p className="text-[var(--dark)] opacity-80">
                Clients submit through a smart form. Wrong formats become impossible.
              </p>
            </div>
            <div className="bg-[var(--light-green)] p-8 rounded-xl text-left shadow-sm">
              <div className="text-2xl mb-4 bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-[var(--forest)]">✓</div>
              <h3 className="font-bold text-xl text-[var(--forest)] mb-3">AI Catches Errors First</h3>
              <p className="text-[var(--dark)] opacity-80">
                Every submission is validated by AI before the consultant sees it.
              </p>
            </div>
            <div className="bg-[var(--light-green)] p-8 rounded-xl text-left shadow-sm">
              <div className="text-2xl mb-4 bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-sm text-[var(--forest)]">✓</div>
              <h3 className="font-bold text-xl text-[var(--forest)] mb-3">One Dashboard, All Clients</h3>
              <p className="text-[var(--dark)] opacity-80">
                See every client status in real time. Your inbox stays empty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="bg-[var(--cream)] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl font-bold text-[var(--dark)]">Everything Your Practice Needs</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[var(--white)] p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-4">🏗</div>
              <h3 className="font-bold text-[var(--dark)] mb-2 text-lg">Multi-Client Dashboard</h3>
              <p className="text-[var(--gray)]">One workspace for all your clients.</p>
            </div>
            <div className="bg-[var(--white)] p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="font-bold text-[var(--dark)] mb-2 text-lg">AI Document Parser</h3>
              <p className="text-[var(--gray)]">Upload a bill — AI fills the form.</p>
            </div>
            <div className="bg-[var(--white)] p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-4">✉️</div>
              <h3 className="font-bold text-[var(--dark)] mb-2 text-lg">Client Invite Portal</h3>
              <p className="text-[var(--gray)]">Unique link per client. They submit, you review.</p>
            </div>
            <div className="bg-[var(--white)] p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="font-bold text-[var(--dark)] mb-2 text-lg">Smart Validation</h3>
              <p className="text-[var(--gray)]">Unit mismatches and missing data caught automatically.</p>
            </div>
            <div className="bg-[var(--white)] p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="font-bold text-[var(--dark)] mb-2 text-lg">Scope Classifier</h3>
              <p className="text-[var(--gray)]">Built-in AI answers Scope 1/2/3 questions.</p>
            </div>
            <div className="bg-[var(--white)] p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-4">📬</div>
              <h3 className="font-bold text-[var(--dark)] mb-2 text-lg">Approval Flow</h3>
              <p className="text-[var(--gray)]">AI drafts follow-ups. You approve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[var(--white)] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-playfair text-4xl font-bold text-center text-[var(--dark)] mb-16">Trusted By ESG Professionals</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[var(--cream)] p-8 rounded-xl">
              <div className="text-[var(--sand)] text-xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-[var(--dark)] italic mb-6">
                "Earthana cut our data collection time in half. We onboarded 3 new clients last month that we wouldn't have had capacity for before."
              </p>
              <div className="font-bold text-[var(--forest)]">— Sarah M., ESG Consultant</div>
            </div>
            <div className="bg-[var(--cream)] p-8 rounded-xl">
              <div className="text-[var(--sand)] text-xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-[var(--dark)] italic mb-6">
                "The AI validation alone is worth it. Clients submit clean data on the first try now."
              </p>
              <div className="font-bold text-[var(--forest)]">— James T., Sustainability Advisor</div>
            </div>
            <div className="bg-[var(--cream)] p-8 rounded-xl">
              <div className="text-[var(--sand)] text-xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-[var(--dark)] italic mb-6">
                "This is exactly what our practice was missing. Setup took less than a day."
              </p>
              <div className="font-bold text-[var(--forest)]">— Priya K., ESG Practice Lead</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="bg-[var(--cream)] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl font-bold text-[var(--dark)] mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-[var(--gray)]">Start free. Scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-[var(--white)] p-8 rounded-2xl border border-[var(--gray)] border-opacity-20 shadow-sm flex flex-col h-full">
              <h3 className="text-xl font-bold text-[var(--gray)] mb-2 uppercase tracking-wide">Starter</h3>
              <div className="text-4xl font-bold text-[var(--dark)] mb-6">$0<span className="text-lg font-normal text-[var(--gray)]">/month</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><span className="text-[var(--forest)]">✓</span> Up to 3 active clients</li>
                <li className="flex items-center gap-3"><span className="text-[var(--forest)]">✓</span> AI validation included</li>
                <li className="flex items-center gap-3"><span className="text-[var(--forest)]">✓</span> Client portal links</li>
                <li className="flex items-center gap-3"><span className="text-[var(--forest)]">✓</span> Email support</li>
              </ul>
              <button
                onClick={() => navigate('/consultant/login')}
                className="w-full py-3 rounded-lg border-2 border-[var(--dark)] text-[var(--dark)] font-bold hover:bg-[var(--dark)] hover:text-[var(--white)] transition"
              >
                Start Free
              </button>
            </div>

            {/* Professional */}
            <div className="bg-[var(--forest)] p-8 rounded-2xl shadow-xl flex flex-col h-[105%] relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--sand)] text-[var(--dark)] font-bold px-4 py-1 rounded-full text-sm">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold text-[var(--mint)] mb-2 uppercase tracking-wide mt-2">Professional</h3>
              <div className="text-4xl font-bold text-[var(--white)] mb-6">$79<span className="text-lg font-normal text-[var(--mint)]">/month</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-white opacity-90">
                <li className="flex items-center gap-3"><span className="text-[var(--mint)]">✓</span> Unlimited clients</li>
                <li className="flex items-center gap-3"><span className="text-[var(--mint)]">✓</span> AI document parsing</li>
                <li className="flex items-center gap-3"><span className="text-[var(--mint)]">✓</span> Consultant approval flow</li>
                <li className="flex items-center gap-3"><span className="text-[var(--mint)]">✓</span> Custom branding</li>
                <li className="flex items-center gap-3"><span className="text-[var(--mint)]">✓</span> Priority support</li>
              </ul>
              <button
                onClick={() => navigate('/consultant/login')}
                className="w-full py-3 rounded-lg bg-[var(--white)] text-[var(--forest)] font-bold hover:bg-[var(--cream)] transition"
              >
                Start Free Trial
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-[var(--white)] p-8 rounded-2xl border-2 border-[var(--sand)] shadow-sm flex flex-col h-full">
              <h3 className="text-xl font-bold text-[var(--sand)] mb-2 uppercase tracking-wide">Enterprise</h3>
              <div className="text-4xl font-bold text-[var(--dark)] mb-6">Custom</div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><span className="text-[var(--forest)]">✓</span> Everything in Professional</li>
                <li className="flex items-center gap-3"><span className="text-[var(--forest)]">✓</span> Dedicated onboarding</li>
                <li className="flex items-center gap-3"><span className="text-[var(--forest)]">✓</span> API access</li>
                <li className="flex items-center gap-3"><span className="text-[var(--forest)]">✓</span> SLA guarantee</li>
                <li className="flex items-center gap-3"><span className="text-[var(--forest)]">✓</span> Team seats</li>
              </ul>
              <button
                className="w-full py-3 rounded-lg border-2 border-[var(--sand)] text-[var(--dark)] font-bold hover:bg-[var(--sand)] hover:text-[var(--white)] transition"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER */}
      <div style={{
        background: '#2D6A4F',
        padding: '64px 24px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '32px',
          marginBottom: '16px'
        }}>
          Got a questionnaire sitting on your desk?
        </h2>
        <p style={{
          opacity: 0.85,
          marginBottom: '32px',
          fontSize: '18px',
          maxWidth: '600px',
          margin: '0 auto 32px'
        }}>
          Upload it now. We'll extract your data and fill in the answers in minutes.
        </p>
        <button onClick={() => navigate('/questionnaire')}
          style={{
            background: '#D4A373',
            color: '#1B1B1B',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 40px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
          }}>
          Fill My Questionnaire →
        </button>
      </div>

      {/* FOOTER */}
      <footer className="bg-[var(--forest)] text-[var(--white)] py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌿</span>
              <span className="font-playfair text-2xl font-bold">Earthana</span>
            </Link>
            <p className="text-[var(--mint)]">ESG data collection, simplified.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-[var(--mint)]">
              <li><a href="#features" className="hover:text-[var(--white)] transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-[var(--white)] transition">Pricing</a></li>
              <li><Link to="/" className="hover:text-[var(--white)] transition">Roadmap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-[var(--mint)]">
              <li><Link to="/" className="hover:text-[var(--white)] transition">About</Link></li>
              <li><Link to="/" className="hover:text-[var(--white)] transition">Blog</Link></li>
              <li><Link to="/" className="hover:text-[var(--white)] transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-[var(--mint)]">
              <li><Link to="/" className="hover:text-[var(--white)] transition">Privacy</Link></li>
              <li><Link to="/" className="hover:text-[var(--white)] transition">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-8 border-t border-[var(--mint)] border-opacity-20 text-[var(--mint)] text-sm">
          © 2025 Earthana. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
