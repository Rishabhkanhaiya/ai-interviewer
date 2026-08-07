export default function HelpPage() {
  const categories = [
    {
      title: '🎙️ Technical Issues',
      faqs: [
        { q: 'My microphone is not working. What should I do?', a: 'Go to your browser settings → Site Settings → Microphone and make sure yourdomain.in is set to "Allow". On mobile Chrome, tap the lock icon in the address bar. Reload the page after changing permission.' },
        { q: 'The AI\'s voice is cutting out or lagging.', a: 'This usually happens on slow internet (below 5 Mbps). Move closer to your WiFi router or switch to mobile data. Wired connections work best. If it persists, restart the interview session.' },
        { q: 'The interview session is stuck loading.', a: 'Hard refresh the page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac). Clear your browser cache. If still stuck, try Chrome in incognito mode.' },
        { q: 'I can\'t hear the AI\'s questions.', a: 'Check your speaker/headphone volume. Make sure you haven\'t muted your tab (right-click the tab in Chrome to check). Try headphones — they\'re recommended for the best experience.' },
        { q: 'The session ended early without a reason.', a: 'This happens if you stay quiet for more than 90 seconds (our anti-gaming system kicks in). Start your next session. If you believe a round was wrongly deducted, WhatsApp us and we\'ll check.' },
      ],
    },
    {
      title: '🔐 Account Issues',
      faqs: [
        { q: 'I\'m not receiving the OTP email.', a: 'Check your spam/junk folder first — email clients often filter OTP emails. The email comes from hello@mail.yourdomain.in. Add this to your contacts to avoid future issues. If still not received, wait 2 minutes and click Resend.' },
        { q: 'I accidentally created two accounts with different emails.', a: 'WhatsApp us with both emails. We\'ll merge your data manually within 24 hours. Use the email with the most session history going forward.' },
        { q: 'I want to change my email address.', a: 'Currently we don\'t support email changes in the app. WhatsApp us and we\'ll update it manually. Make sure to verify access to both the old and new email.' },
        { q: 'How do I delete my account?', a: 'Email us at support@yourdomain.in with subject "Account deletion request". We\'ll delete all your data within 7 business days. Any unused paid rounds are non-refundable on deletion.' },
      ],
    },
    {
      title: '💳 Payment Issues',
      faqs: [
        { q: 'I paid but my pack is not showing up.', a: 'First, wait 2 minutes — Razorpay webhooks can take a moment. Reload the page. If still not credited after 5 minutes, WhatsApp us your Razorpay payment ID (looks like pay_XXXXXXXX) and we\'ll credit manually within 30 minutes.' },
        { q: 'I was charged but the payment page showed an error.', a: 'This happens occasionally with UPI. Open your bank app or UPI app and check if the debit happened. If it did, send us your transaction reference. If it didn\'t, your money was not deducted — try again.' },
        { q: 'Can I get a refund?', a: 'We offer a full refund if you haven\'t used more than 1 round from your pack. Contact us within 48 hours of purchase. After 48 hours or after using 2+ rounds, we can\'t offer refunds — but we can transfer credits.' },
        { q: 'Is GST included in the ₹499 price?', a: 'Yes, the price shown is all-inclusive. No hidden taxes or charges.' },
      ],
    },
    {
      title: '📊 Product Questions',
      faqs: [
        { q: 'How does the scoring work?', a: 'Each answer is scored on 4 dimensions: STAR structure (Situation, Task, Action, Result), speaking pace (target 120–140 WPM), filler word count, and communication clarity. Each dimension contributes to your total score out of 100.' },
        { q: 'What does "minutes" vs "rounds" mean?', a: 'A "round" is one complete interview session (typically 15–20 minutes). The 200-minute pack gives you roughly 10 rounds. Each round uses however many minutes the session takes.' },
        { q: 'Can the AI understand my resume?', a: 'Yes — on the interview setup screen, paste your resume summary (150–300 words). The AI generates questions specifically about your projects, experience, and tech stack.' },
        { q: 'Which companies are available?', a: 'Currently: TCS NQT, Infosys, Wipro, Accenture, Capgemini, Razorpay, Groww, PhonePe, Swiggy, HDFC Bank, and generic startup mode. We add new company modes every month.' },
        { q: 'Does Hindi speech work?', a: 'Yes — we use Sarvam Saaras, India\'s best speech recognition for Indian languages. It understands pure Hindi, pure English, and Hinglish equally well.' },
        { q: 'Can I practice the same company mode multiple times?', a: 'Yes, and we recommend it. The question bank has 200+ questions per company — you\'ll rarely see the same question twice. Repetition also trains your muscle memory for STAR structure.' },
        { q: 'How do I share my scorecard on LinkedIn?', a: 'After any session, go to your scorecard page and click "Share on LinkedIn". It pre-fills the post with your score, company, and weak areas. You can edit before posting.' },
        { q: 'What is the affiliate referral system?', a: 'Get a unique referral code from your dashboard. Share it with friends. Every friend who buys using your code earns you ₹100. Payouts happen every Sunday via UPI.' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="border-b border-black/8 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">← Dashboard</a>
          <a href="/" className="font-semibold text-[#4F46E5]">InterviewAI</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#111827] mb-3">Help Center</h1>
        <p className="text-[#6B7280] mb-4">
          Can&apos;t find your answer? WhatsApp us directly —{' '}
          <a href="https://wa.me/+91" className="text-[#4F46E5] hover:underline">click here to chat</a>. We respond within 2 hours (9am–10pm).
        </p>

        {/* Quick WhatsApp CTA */}
        <div className="bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl p-4 mb-10 flex items-center gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <p className="font-medium text-[#111827] text-sm">Need urgent help?</p>
            <p className="text-sm text-[#6B7280]">WhatsApp support responds in under 2 hours for payment and technical issues.</p>
          </div>
          <a href="https://wa.me/+91" target="_blank" rel="noopener noreferrer"
            className="ml-auto flex-shrink-0 bg-[#25D366] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#22c55e] transition">
            Chat now
          </a>
        </div>

        <div className="space-y-10">
          {categories.map((cat, ci) => (
            <section key={ci}>
              <h2 className="text-lg font-semibold text-[#111827] mb-4">{cat.title}</h2>
              <div className="space-y-3">
                {cat.faqs.map((faq, fi) => (
                  <details key={fi} className="bg-white border border-black/8 rounded-xl group">
                    <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-[#374151] hover:text-[#111827] transition list-none flex items-center justify-between">
                      {faq.q}
                      <span className="text-[#9CA3AF] group-open:rotate-180 transition-transform ml-3 flex-shrink-0">▼</span>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-[#6B7280] leading-relaxed border-t border-black/8 pt-3">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 bg-[#EEF2FF] rounded-xl p-6 text-center">
          <p className="text-sm font-medium text-[#4F46E5] mb-1">Still need help?</p>
          <p className="text-sm text-[#374151] mb-4">Our team reads every message personally.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="https://wa.me/+91" target="_blank" rel="noopener noreferrer"
              className="bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#22c55e] transition">
              WhatsApp us
            </a>
            <a href="mailto:support@yourdomain.in"
              className="bg-white border border-gray-200 text-[#374151] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-50 transition">
              Email support
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
