import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-earthana-cream" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* SECTION 1 — Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-playfair font-semibold text-earthana-forest">Earthana</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#1B1B1B] hover:text-earthana-forest transition">Features</a>
            <a href="#how-it-works" className="text-[#1B1B1B] hover:text-earthana-forest transition">How It Works</a>
            <a href="#pricing" className="text-[#1B1B1B] hover:text-earthana-forest transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/consultant/login"
              className="px-4 py-2 rounded-lg border-2 border-earthana-forest text-earthana-forest font-medium hover:bg-earthana-forest/5 transition"
            >
              Consultant Login
            </Link>
            <Link
              to="/consultant/login"
              className="px-4 py-2 rounded-lg bg-earthana-forest text-white font-medium hover:bg-[#245a42] transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 2 — Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-earthana-mint/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-earthana-mint/15 rounded-full blur-2xl -z-10" />
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-[#1B1B1B] leading-tight mb-6">
              ESG Reporting,
              <br />
              <span className="text-earthana-forest">Finally Simplified.</span>
            </h1>
            <p className="text-lg text-[#1B1B1B]/80 mb-8 max-w-lg">
              Earthana helps ESG consultants collect clean, validated client data — without the email chaos. Save 25% of your project time starting today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/consultant/login"
                className="px-6 py-3 rounded-lg bg-earthana-forest text-white font-medium hover:bg-[#245a42] transition shadow-lg"
              >
                Start Free Trial
              </Link>
              <a href="#how-it-works" className="px-6 py-3 text-earthana-forest font-medium hover:underline flex items-center gap-2">
                See How It Works
                <span>→</span>
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100" style={{ boxShadow: '0 25px 50px -12px rgba(45, 106, 79, 0.15)' }}>
              <div className="text-earthana-forest font-playfair font-semibold mb-4">Client Dashboard</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-[#1B1B1B]">Patagonia</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Submitted</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-[#1B1B1B]">Cruz Foam</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Incomplete</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-[#1B1B1B]">Bloom & Wild</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">In Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Problem & Solution */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-playfair text-3xl font-bold text-[#1B1B1B] text-center mb-12">The Problem With ESG Data Today</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-[#FFF0F0] border border-red-100">
              <span className="text-3xl mb-3 block">📧</span>
              <h3 className="font-semibold text-[#1B1B1B] mb-2">Endless Email Chains</h3>
              <p className="text-[#1B1B1B]/80 text-sm">5-10 emails per client per data category just to collect basic utility information.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#FFF0F0] border border-red-100">
              <span className="text-3xl mb-3 block">📊</span>
              <h3 className="font-semibold text-[#1B1B1B] mb-2">Wrong Formats, Wrong Units</h3>
              <p className="text-[#1B1B1B]/80 text-sm">Clients submit PDFs instead of spreadsheets, kWh instead of MWh, incomplete date ranges.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#FFF0F0] border border-red-100">
              <span className="text-3xl mb-3 block">⏱</span>
              <h3 className="font-semibold text-[#1B1B1B] mb-2">20-30% of Project Time Wasted</h3>
              <p className="text-[#1B1B1B]/80 text-sm">Consultants spend nearly a third of billable hours on admin instead of analysis.</p>
            </div>
          </div>
          <div className="flex justify-center mb-8">
            <span className="text-earthana-forest text-2xl">↓</span>
          </div>
          <h2 className="font-playfair text-2xl font-bold text-earthana-forest text-center mb-12">Here&apos;s how Earthana fixes this</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F0FFF4] border border-green-100">
              <span className="text-3xl mb-3 block">✅</span>
              <h3 className="font-semibold text-[#1B1B1B] mb-2">Smart Data Collection</h3>
              <p className="text-[#1B1B1B]/80 text-sm">Clients submit through a guided portal. Wrong formats become impossible.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#F0FFF4] border border-green-100">
              <span className="text-3xl mb-3 block">✅</span>
              <h3 className="font-semibold text-[#1B1B1B] mb-2">AI Validation at Submission</h3>
              <p className="text-[#1B1B1B]/80 text-sm">Our AI catches errors before the consultant ever sees the data.</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#F0FFF4] border border-green-100">
              <span className="text-3xl mb-3 block">✅</span>
              <h3 className="font-semibold text-[#1B1B1B] mb-2">Real-Time Dashboard</h3>
              <p className="text-[#1B1B1B]/80 text-sm">See every client&apos;s submission status in one place. No inbox required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Features */}
      <section id="features" className="py-20 bg-earthana-cream">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-playfair text-3xl font-bold text-[#1B1B1B] text-center mb-12">Everything Your Practice Needs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🏗', title: 'Multi-Client Dashboard', desc: "Manage every client's data collection from one unified workspace." },
              { icon: '🤖', title: 'AI Document Parser', desc: 'Upload a utility bill — AI extracts the data and fills the form automatically.' },
              { icon: '✉️', title: 'Client Invite Portal', desc: 'Generate a unique link for each client. They submit, you review.' },
              { icon: '🔍', title: 'Smart Validation', desc: 'Automated checks catch unit mismatches, missing months, and zero values instantly.' },
              { icon: '💬', title: 'Scope Classifier', desc: "Not sure if it's Scope 1, 2, or 3? Ask the AI assistant built into every portal." },
              { icon: '📬', title: 'Consultant Approval Flow', desc: 'AI drafts follow-up messages. You approve with one click.' },
            ].map((f) => (
              <div key={f.title} className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
                <span className="text-2xl mb-3 block text-earthana-forest">{f.icon}</span>
                <h3 className="font-semibold text-[#1B1B1B] mb-2">{f.title}</h3>
                <p className="text-[#1B1B1B]/80 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-playfair text-3xl font-bold text-[#1B1B1B] text-center mb-12">Trusted By ESG Professionals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Earthana cut our data collection time in half. We onboarded 3 new clients last month that we wouldn't have had capacity for before.", author: 'Sarah M., ESG Consultant, Boutique Firm' },
              { quote: "The AI validation alone is worth it. Clients submit clean data on the first try now. The back-and-forth emails are basically gone.", author: 'James T., Sustainability Advisor' },
              { quote: "Our team was skeptical about another software tool. Within a week everyone agreed — this is exactly what we were missing.", author: 'Priya K., ESG Practice Lead' },
            ].map((t) => (
              <div key={t.author} className="p-6 bg-earthana-cream rounded-2xl border-l-4 border-earthana-sand">
                <div className="flex gap-1 mb-4 text-earthana-sand">★★★★★</div>
                <p className="text-[#1B1B1B] mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-sm text-[#1B1B1B]/70">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — Pricing */}
      <section id="pricing" className="py-20 bg-earthana-cream">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-playfair text-3xl font-bold text-[#1B1B1B] text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-[#1B1B1B]/80 mb-12">Start free. Scale as you grow.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-playfair text-xl font-semibold text-[#1B1B1B] mb-2">Starter</h3>
              <div className="text-3xl font-bold text-[#1B1B1B] mb-6">$0<span className="text-base font-normal text-[#1B1B1B]/70">/month</span></div>
              <ul className="space-y-3 mb-6 text-sm text-[#1B1B1B]/80">
                <li>✓ Up to 3 active clients</li>
                <li>✓ AI validation included</li>
                <li>✓ Client portal links</li>
                <li>✓ Email support</li>
              </ul>
              <Link to="/consultant/login" className="block w-full py-3 text-center rounded-lg border-2 border-gray-300 text-[#1B1B1B] font-medium hover:border-earthana-forest hover:text-earthana-forest transition">Start Free</Link>
            </div>
            <div className="p-6 bg-earthana-forest rounded-2xl shadow-xl relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-earthana-sand text-[#1B1B1B] text-xs font-semibold rounded-full">Most Popular</span>
              <h3 className="font-playfair text-xl font-semibold text-white mb-2">Professional</h3>
              <div className="text-3xl font-bold text-white mb-6">$79<span className="text-base font-normal text-white/80">/month</span></div>
              <ul className="space-y-3 mb-6 text-sm text-white/90">
                <li>✓ Unlimited clients</li>
                <li>✓ AI document parsing</li>
                <li>✓ Consultant approval flow</li>
                <li>✓ Priority support</li>
                <li>✓ Custom branding on client portals</li>
              </ul>
              <Link to="/consultant/login" className="block w-full py-3 text-center rounded-lg bg-white text-earthana-forest font-medium hover:bg-earthana-cream transition">Start Free Trial</Link>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-earthana-sand/50 shadow-sm">
              <h3 className="font-playfair text-xl font-semibold text-[#1B1B1B] mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-[#1B1B1B] mb-6">Custom</div>
              <ul className="space-y-3 mb-6 text-sm text-[#1B1B1B]/80">
                <li>✓ Everything in Professional</li>
                <li>✓ Dedicated onboarding</li>
                <li>✓ API access</li>
                <li>✓ SLA guarantee</li>
                <li>✓ Team seats</li>
              </ul>
              <a href="mailto:contact@earthana.com" className="block w-full py-3 text-center rounded-lg border-2 border-earthana-sand text-[#1B1B1B] font-medium hover:bg-earthana-sand/20 transition">Contact Us</a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — Footer */}
      <footer className="bg-earthana-forest text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌿</span>
                <span className="font-playfair text-xl font-semibold">Earthana</span>
              </div>
              <p className="text-white/80 text-sm">ESG data collection, simplified.</p>
            </div>
            <div className="grid grid-cols-3 gap-12">
              <div>
                <h4 className="font-semibold mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="#features" className="hover:text-white">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-white">Roadmap</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="#" className="hover:text-white">About</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Legal</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="#" className="hover:text-white">Privacy</a></li>
                  <li><a href="#" className="hover:text-white">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/20 text-center text-sm text-white/70">
            © 2025 Earthana. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
