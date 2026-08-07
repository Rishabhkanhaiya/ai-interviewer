'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Zap, BarChart2, Package, MessageCircle } from 'lucide-react'

const faqs = [
  { q: 'When do I get paid?', a: 'Every Sunday via UPI directly to your account. Minimum ₹500 to withdraw.' },
  { q: 'Is there a minimum to withdraw?', a: 'Yes, ₹500 minimum. Most partners cross this in their first week.' },
  { q: 'How does tracking work?', a: 'Your referral code is tracked for 30 days via cookie. Any purchase within 30 days counts as yours.' },
  { q: 'What if my referral returns the product?', a: 'Refunds within 7 days will deduct the commission. After 7 days, refunds are not applicable.' },
  { q: 'Can I promote on Instagram / YouTube / WhatsApp?', a: 'Yes! All platforms are allowed. We provide ready-made templates for each.' },
  { q: 'How do I apply as a freelancer vs student?', a: 'Students get auto-approved — just sign in. Freelancers need to apply and are reviewed within 48 hours.' },
]

const tiers = [
  { tier: 'Campus Partner', who: 'Engineering student', sales: 'Any', commission: '20%', earning: '₹100', color: 'bg-green-100 text-green-800' },
  { tier: 'Freelancer Standard', who: 'External marketer', sales: '1–24', commission: '25%', earning: '₹125', color: 'bg-indigo-100 text-indigo-700' },
  { tier: 'Freelancer Pro', who: 'External marketer', sales: '25–49', commission: '28%', earning: '₹140', color: 'bg-purple-100 text-purple-700' },
  { tier: 'Freelancer Elite', who: 'External marketer', sales: '50+', commission: '30%', earning: '₹150', color: 'bg-amber-100 text-amber-800' },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-black/8 px-6 py-4 flex items-center justify-between">
        <div className="font-semibold text-lg text-[#111827]">InterviewAI <span className="text-[#4F46E5]">Partners</span></div>
        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-sm text-[#374151] hover:text-[#4F46E5] transition-colors">Sign in</Link>
          <Link href="/apply" className="bg-[#4F46E5] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors">Apply now</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <Zap size={12} /> Affiliate &amp; Partner Program
        </div>
        <h1 className="text-[40px] font-semibold text-[#111827] leading-tight mb-4">
          Earn ₹150 for every<br />student you refer
        </h1>
        <p className="text-lg text-[#6B7280] mb-8 max-w-xl mx-auto">
          Join 200+ partners promoting India&apos;s first Hinglish AI mock interviewer. No experience needed. No cap on earnings.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link href="/apply" className="bg-[#4F46E5] text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-[#4338CA] transition-colors">
            Apply as a freelancer →
          </Link>
          <Link href="/auth" className="bg-white border border-gray-200 text-[#374151] font-semibold px-8 py-3.5 rounded-lg hover:bg-gray-50 transition-colors">
            I&apos;m a student, join free →
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[#6B7280]">
          <span className="flex items-center gap-2"><Check size={14} className="text-[#10B981]" /> Avg partner earns ₹4,200/month</span>
          <span className="flex items-center gap-2"><Check size={14} className="text-[#10B981]" /> Weekly UPI payouts</span>
          <span className="flex items-center gap-2"><Check size={14} className="text-[#10B981]" /> 30-day cookie tracking</span>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-black/8 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-[28px] font-semibold text-[#111827] text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Apply & get approved', desc: 'Students get instant approval. Freelancers reviewed within 48 hours.' },
              { n: '2', title: 'Get your kit', desc: 'Your unique referral code + full marketing kit with WhatsApp templates, posters, and scripts.' },
              { n: '3', title: 'Earn per sale', desc: 'Earn ₹100–₹150 every time a student buys using your code. Paid every Sunday.' },
            ].map(step => (
              <div key={step.n} className="text-center">
                <div className="w-12 h-12 bg-[#EEF2FF] text-[#4F46E5] font-bold text-lg rounded-xl flex items-center justify-center mx-auto mb-4">{step.n}</div>
                <h3 className="font-semibold text-[#111827] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6B7280]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission table */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-[28px] font-semibold text-[#111827] text-center mb-8">Commission tiers</h2>
        <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-black/8">
                <th className="text-left px-6 py-4 font-semibold text-[#374151]">Tier</th>
                <th className="text-left px-6 py-4 font-semibold text-[#374151]">Who</th>
                <th className="text-left px-6 py-4 font-semibold text-[#374151]">Sales/Month</th>
                <th className="text-left px-6 py-4 font-semibold text-[#374151]">Commission</th>
                <th className="text-left px-6 py-4 font-semibold text-[#374151]">Per Sale</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t, i) => (
                <tr key={i} className="border-b border-black/8 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><span className={`text-xs font-semibold px-3 py-1 rounded-full ${t.color}`}>{t.tier}</span></td>
                  <td className="px-6 py-4 text-[#374151]">{t.who}</td>
                  <td className="px-6 py-4 text-[#374151]">{t.sales}</td>
                  <td className="px-6 py-4 font-semibold text-[#111827]">{t.commission}</td>
                  <td className="px-6 py-4 font-bold text-[#4F46E5]">{t.earning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Feature cards */}
      <section className="bg-white border-y border-black/8 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-[28px] font-semibold text-[#111827] text-center mb-10">What you get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: <Zap size={20} className="text-[#4F46E5]" />, title: 'Weekly UPI payouts', desc: 'Every Sunday, no waiting. Money in your UPI account automatically.' },
              { icon: <BarChart2 size={20} className="text-[#4F46E5]" />, title: 'Real-time dashboard', desc: 'See clicks, conversions, and earnings live. Know exactly what\'s working.' },
              { icon: <Package size={20} className="text-[#4F46E5]" />, title: 'Ready-made marketing kit', desc: 'WhatsApp templates, Instagram posters, Reels scripts — all ready to use.' },
              { icon: <MessageCircle size={20} className="text-[#4F46E5]" />, title: 'Dedicated support', desc: 'WhatsApp support from our founding team. We help you earn more.' },
            ].map((f, i) => (
              <div key={i} className="bg-white border border-black/8 rounded-xl p-6">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-semibold text-[#111827] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6B7280]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-[28px] font-semibold text-[#111827] text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-black/8 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-medium text-[#111827]">{faq.q}</span>
                {openFaq === i ? <ChevronUp size={16} className="text-[#6B7280] flex-shrink-0" /> : <ChevronDown size={16} className="text-[#6B7280] flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm text-[#374151] border-t border-black/8 pt-4">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#4F46E5] py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-[28px] font-semibold text-white mb-4">Ready to start earning?</h2>
          <p className="text-indigo-200 mb-8">Join 200+ partners. First payout usually within 7 days.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/apply" className="bg-white text-[#4F46E5] font-semibold px-8 py-3.5 rounded-lg hover:bg-gray-100 transition-colors">
              Apply as freelancer
            </Link>
            <Link href="/auth" className="border border-white/30 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors">
              Join as student (instant)
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-black/8 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-semibold text-[#111827]">InterviewAI <span className="text-[#4F46E5]">Partners</span></div>
          <div className="flex gap-6 text-sm text-[#6B7280]">
            <a href={process.env.NEXT_PUBLIC_MAIN_PRODUCT_URL} className="hover:text-[#4F46E5]">Main product</a>
            <a href="#" className="hover:text-[#4F46E5]">Support</a>
            <a href="#" className="hover:text-[#4F46E5]">Privacy</a>
            <a href="#" className="hover:text-[#4F46E5]">Terms</a>
          </div>
          <div className="text-xs text-[#9CA3AF]">A part of InterviewAI</div>
        </div>
      </footer>
    </div>
  )
}
