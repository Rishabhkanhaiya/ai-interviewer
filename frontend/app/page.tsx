import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'InterviewAI — Practice Interviews in Hinglish | AI Mock Interview for Indian Students',
  description: 'Voice-first AI mock interview platform for Indian engineering students. Practice TCS NQT, Infosys, Wipro, startup interviews in Hinglish. Get STAR scores, WPM analysis, and downloadable scorecards.',
}

const FEATURES = [
  { icon: '🇮🇳', title: 'Hinglish AI', desc: 'Understands "matlab" and "basically" — no penalty for code-switching. Sarvam Bulbul voice.' },
  { icon: '🏢', title: 'Company-specific', desc: 'TCS NQT, Infosys, Wipro, startups, FAANG-style — different question banks per company.' },
  { icon: '📄', title: 'Resume grilling', desc: 'Paste your resume summary. AI asks questions about YOUR specific projects.' },
  { icon: '⚡', title: 'Barge-in', desc: 'Interrupt the AI anytime. It stops instantly and listens — just like a real interview.' },
  { icon: '⭐', title: 'STAR scoring', desc: 'Situation, Task, Action, Result — each scored separately. Know exactly what\'s missing.' },
  { icon: '📊', title: 'LinkedIn scorecard', desc: 'Downloadable PDF and shareable card proving your interview readiness.' },
]

const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Capgemini', 'HDFC Bank', 'Razorpay', 'Groww', 'PhonePe', 'Swiggy']

const FAQS = [
  { q: 'How is this different from other interview prep apps?', a: 'No other tool combines real-time voice + Hinglish understanding + company-specific questions + STAR scoring in one place. We grade your logic, not your accent.' },
  { q: 'Does the AI understand Hindi and Hinglish?', a: 'Yes — powered by Sarvam Saaras STT, which is built specifically for Indian languages. "Basically matlab what I\'m saying is" is perfectly understood.' },
  { q: 'What happens when my 200 minutes are over?', a: 'Your pack is complete. You can add 5 more rounds for ₹199 at any time. Unused rounds never expire.' },
  { q: 'Can I use this on my phone?', a: 'The platform is browser-first and works on mobile Chrome/Safari. A laptop or tablet gives the best experience.' },
  { q: 'Is my resume data private?', a: 'Your pasted resume text is only used to generate questions in that session. We never share or sell your data.' },
  { q: 'How does the affiliate referral work?', a: 'You get a unique code. Every friend who buys using your code earns you ₹100. Payouts every Sunday via UPI.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/8">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            InterviewAI
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a>
            <Link href="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">Sign in</Link>
            <Link href="/auth"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              Try 60s free →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="hero-gradient px-6 pt-24 pb-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full mb-6">
            🇮🇳 Built for Indian placement drives
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
            Practice interviews<br />in <span className="text-indigo-600">Hinglish.</span> Get hired.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            The only AI interviewer that understands how Indian engineers actually speak — and grades your logic, not your accent.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth"
              className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200">
              Start free 60-second interview →
            </Link>
            <a href="#how-it-works"
              className="px-8 py-4 text-indigo-600 font-semibold text-lg rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors">
              See how it works
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            Used by 500+ students from COEP, PICT, VIT Pune
          </p>
        </div>

        {/* Mock interview UI preview */}
        <div className="max-w-2xl mx-auto mt-16">
          <div className="bg-white rounded-2xl border border-black/8 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-black/8">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">TCS NQT · Technical Round</span>
              <span className="font-mono text-xs text-gray-400">08:42</span>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm shrink-0">🤖</div>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 max-w-sm">
                  What is the difference between an ArrayList and a LinkedList in Java? And matlab when would you choose one over the other?
                </div>
              </div>
              <div className="flex items-start gap-4 flex-row-reverse">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-sm shrink-0">👤</div>
                <div className="bg-indigo-50 rounded-xl px-4 py-3 text-sm text-gray-800 max-w-sm text-right">
                  So basically... <span className="bg-amber-100 text-amber-800 px-1 rounded text-xs">filler</span> ArrayList uses dynamic array internally, toh random access is O(1). But LinkedList is better for frequent insertions...
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-3">
                <div className="flex gap-1">
                  {[4, 7, 5, 9, 6, 8, 5].map((h, i) => (
                    <div key={i} className="w-1 bg-indigo-400 rounded-full wave-bar" style={{ height: `${h * 3}px` }} />
                  ))}
                </div>
                <span className="text-xs text-green-600 font-medium">● Listening</span>
                <span className="ml-auto text-xs text-gray-400">~128 WPM · 1 filler</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain Section ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">You know your subject. You just freeze in interviews.</h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: '🗣️', title: 'The AI that actually understands you', desc: 'Most tools penalise Hinglish. Ours doesn\'t. Speak naturally — in English, Hindi, or both.' },
            { icon: '📝', title: 'Questions based on YOUR resume', desc: 'Paste 5 lines from your resume. The AI asks about your specific projects, not generic ones.' },
            { icon: '📊', title: 'Know exactly where you failed', desc: 'STAR score, WPM, filler words. Not vague feedback. Specific, actionable improvement notes.' },
          ].map(item => (
            <div key={item.title} className="bg-white rounded-2xl p-6 border border-black/8 shadow-sm card-hover">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Select company & role', desc: 'TCS, Infosys, Wipro, Startup, FAANG — each has its own question bank' },
              { step: '02', title: 'Paste your resume', desc: '5–8 lines of your projects and skills. AI asks about YOUR work.' },
              { step: '03', title: 'Speak naturally', desc: 'English or Hinglish. The AI listens in real-time and responds in seconds.' },
              { step: '04', title: 'Get your scorecard', desc: 'STAR score, WPM, fillers. Download PDF, share on LinkedIn.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">{s.step}</div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Everything you need to clear placement</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-black/8 shadow-sm card-hover">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Company Logos ─────────────────────────────────────────────────────── */}
      <section className="py-12 px-6 bg-white border-y border-black/8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-6">Practice for these companies</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {COMPANIES.map(c => (
              <span key={c} className="text-sm font-semibold text-gray-300 hover:text-gray-500 transition-colors cursor-default">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, one-time pricing</h2>
          <p className="text-gray-500">One coaching session costs ₹1,500. Ten AI interviews cost ₹499.</p>
        </div>
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Placement Pack */}
          <div className="bg-white rounded-2xl border-2 border-indigo-500 p-6 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
              MOST POPULAR
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">₹499</div>
            <div className="text-sm text-gray-500 mb-4">One-time · Placement Pack</div>
            {['10 full interview rounds', '200 minutes total (hard cap)', 'All company modes', 'Resume-based grilling', 'STAR scoring + WPM + filler detection', 'Downloadable PDF scorecard', 'LinkedIn share card'].map(f => (
              <div key={f} className="flex items-start gap-2 text-sm text-gray-700 mb-2">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span> {f}
              </div>
            ))}
            <Link href="/buy?pack=placement_499"
              className="mt-5 w-full block text-center py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              Buy now — UPI / Card / Net Banking
            </Link>
          </div>
          {/* Top-Up Pack */}
          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">₹199</div>
            <div className="text-sm text-gray-500 mb-4">One-time · Top-Up Pack</div>
            {['5 more rounds', '100 minutes additional', 'All features included', 'Perfect when you need more practice'].map(f => (
              <div key={f} className="flex items-start gap-2 text-sm text-gray-700 mb-2">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span> {f}
              </div>
            ))}
            <Link href="/buy?pack=topup_199"
              className="mt-5 w-full block text-center py-3 border border-indigo-200 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors">
              Add more rounds
            </Link>
          </div>
        </div>

        {/* Affiliate code */}
        <div className="max-w-3xl mx-auto mt-6 text-center text-sm text-gray-500">
          Have a referral code?{' '}
          <Link href="/buy" className="text-indigo-600 hover:underline">Apply it at checkout</Link> — your friend gets ₹100.
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <details key={faq.q} className="group bg-gray-50 rounded-xl border border-black/8 p-5 cursor-pointer">
                <summary className="font-medium text-gray-900 list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-indigo-600 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Your placement drive is in 48 hours. Are you ready?</h2>
        <p className="text-indigo-200 mb-8">Join 500+ students who practiced with AI before their actual interview.</p>
        <Link href="/auth"
          className="inline-block px-10 py-4 bg-white text-indigo-600 font-bold text-lg rounded-xl hover:bg-indigo-50 transition-all hover:scale-105 shadow-lg">
          Start your free 60-second interview now
        </Link>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="w-6 h-6 bg-indigo-500 rounded-md" />
            InterviewAI
            <span className="text-gray-600 font-normal text-sm ml-1">— Made in Pune, India 🇮🇳</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/become-affiliate" className="hover:text-white transition-colors">Affiliates</Link>
            <Link href="/help" className="hover:text-white transition-colors">Help & FAQ</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/auth" className="hover:text-white transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
