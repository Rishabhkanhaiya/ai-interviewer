'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Sidebar from '@/components/Sidebar'
import { Copy, CheckCheck, Download, ExternalLink } from 'lucide-react'
import QRCode from 'qrcode'

function makeTemplates(code: string, url: string) {
  return [
    {
      title: 'WhatsApp — Formal',
      text: `Namaste! Agar aap placement ke liye taiyari kar rahe hain toh ye AI mock interview tool try karein. Hinglish mein interview karta hai, TCS/Infosys ke actual questions poochta hai, aur detailed scorecard deta hai.\n\nKaafi helpful hai! → ${url}`,
    },
    {
      title: 'WhatsApp — Casual',
      text: `Yaar, ek cheez try karo — AI interviewer hai jo Hinglish mein baat karta hai 😄 TCS/Wipro ke questions poochta hai aur score bhi deta hai. Mujhe kaam aa gaya, tujhe bhi aayega!\n→ ${url}`,
    },
    {
      title: 'WhatsApp — Urgent (Drive Season)',
      text: `⚠️ Drive aa raha hai! Abhi practice karo — ye AI mock interviewer actual TCS NQT/Infosys questions poochta hai. 60 seconds free hai, koi login nahi chahiye.\n→ ${url}\n\nGroup mein share karo bhi 🙏`,
    },
    {
      title: 'Instagram Caption — Reel',
      text: `POV: AI interviewer ne pehle hi question mein pakad liya 😅\n\nHinglish mein karta hai — TCS, Wipro, Infosys ke real questions!\n\nLink bio mein hai 👇 #placement #interview #engineering`,
    },
    {
      title: 'Instagram Caption — Post',
      text: `Placement stress? Try karo ye AI mock interviewer 🤖\n✅ Hinglish mein baat karta hai\n✅ TCS/Infosys ke actual questions\n✅ Scorecard ke saath feedback\n\nLink: ${url}`,
    },
    {
      title: 'LinkedIn Post',
      text: `Excited to share this with placement seekers!\n\nInterviewAI is India's first Hinglish AI mock interviewer — it asks real TCS NQT, Infosys, and Wipro questions and gives you a detailed scorecard.\n\nPerfect for final-year students preparing for placement season. Try it free: ${url}`,
    },
    {
      title: 'Twitter/X Thread — Opener',
      text: `Thread: How I cracked TCS NQT in 3 days using an AI interviewer 🧵\n\n1/ I was scared of the interview round. HR interview mein kya bolunga, ye samajh nahi aa raha tha...\n\n[Use this tool to practice] → ${url}`,
    },
  ]
}

const visualAssets = [
  { name: 'Logo PNG', format: 'PNG' },
  { name: 'Logo SVG', format: 'SVG' },
  { name: 'Instagram Story Template', format: 'Canva', link: 'https://canva.com' },
  { name: 'Instagram Post Template', format: 'Canva', link: 'https://canva.com' },
  { name: 'LinkedIn Banner', format: 'PNG' },
  { name: 'WhatsApp Status Image', format: 'PNG' },
  { name: 'A4 Poster (Printable)', format: 'PDF' },
]

export default function KitPage() {
  const [code, setCode] = useState('')
  const [referralUrl, setReferralUrl] = useState('')
  const [tier, setTier] = useState('')
  const [copied, setCopied] = useState<number | null>(null)

  useEffect(() => {
    api.getMe().then(me => {
      setCode(String(me.code || ''))
      setReferralUrl(String(me.referral_url || ''))
      setTier(String(me.tier || ''))
    })
  }, [])

  const templates = makeTemplates(code, referralUrl)

  const copy = async (text: string, i: number) => {
    await navigator.clipboard.writeText(text)
    setCopied(i); setTimeout(() => setCopied(null), 2000)
  }

  const downloadQR = async () => {
    if (!referralUrl) return
    const dataUrl = await QRCode.toDataURL(referralUrl, { width: 400, margin: 2, color: { dark: '#111827', light: '#FFFFFF' } })
    const a = document.createElement('a'); a.download = `${code}-qr.png`; a.href = dataUrl; a.click()
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar tier={tier} />
      <main className="ml-[220px] p-8">
        <h1 className="text-2xl font-semibold text-[#111827] mb-2">Marketing Kit</h1>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg mb-8">
          📌 All templates below include your referral code <strong>{code || 'loading...'}</strong>. Do not modify the referral link in any asset.
        </div>

        {/* Written templates */}
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Written Templates</h2>
        <div className="grid grid-cols-1 gap-4 mb-10">
          {templates.map((t, i) => (
            <div key={i} className="bg-white border border-black/8 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-[#111827] text-sm">{t.title}</span>
                <button onClick={() => copy(t.text, i)} className="flex items-center gap-1.5 text-xs text-[#4F46E5] border border-[#4F46E5]/30 px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition">
                  {copied === i ? <><CheckCheck size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
              <pre className="text-xs text-[#374151] whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded-lg leading-relaxed">{t.text}</pre>
            </div>
          ))}
        </div>

        {/* Visual assets */}
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Visual Assets</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {visualAssets.map((a, i) => (
            <div key={i} className="bg-white border border-black/8 rounded-xl p-4">
              <div className="w-full h-28 bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] rounded-lg mb-3 flex items-center justify-center">
                <span className="text-3xl">🖼️</span>
              </div>
              <div className="font-medium text-[#111827] text-sm mb-1">{a.name}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF] bg-gray-100 px-2 py-0.5 rounded">{a.format}</span>
                {a.link ? (
                  <a href={a.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#4F46E5] hover:underline">
                    <ExternalLink size={10} /> Open
                  </a>
                ) : (
                  <button className="flex items-center gap-1 text-xs text-[#4F46E5] hover:underline">
                    <Download size={10} /> Download
                  </button>
                )}
              </div>
            </div>
          ))}
          {/* QR Code — dynamically generated */}
          <div className="bg-white border border-black/8 rounded-xl p-4">
            <div className="w-full h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-3xl">📱</span>
            </div>
            <div className="font-medium text-[#111827] text-sm mb-1">QR Code (Your link)</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9CA3AF] bg-gray-100 px-2 py-0.5 rounded">PNG</span>
              <button onClick={downloadQR} className="flex items-center gap-1 text-xs text-[#4F46E5] hover:underline">
                <Download size={10} /> Download
              </button>
            </div>
          </div>
        </div>

        {/* Video assets */}
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Video Assets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {['60-second demo video (MP4)', '15-second teaser clip', 'Thumbnail template (Canva)'].map((v, i) => (
            <div key={i} className="bg-white border border-black/8 rounded-xl p-5">
              <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-4xl">🎬</span>
              </div>
              <div className="font-medium text-[#111827] text-sm mb-2">{v}</div>
              <a href="#" className="flex items-center gap-1 text-xs text-[#4F46E5] hover:underline"><Download size={12} /> Download</a>
            </div>
          ))}
        </div>

        {/* Data and proof */}
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Data & Proof</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['Sample scorecard PDF (anonymised)', '5 real user quotes document', 'Placement success story PDF'].map((d, i) => (
            <div key={i} className="bg-white border border-black/8 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center text-lg flex-shrink-0">📄</div>
              <div>
                <div className="font-medium text-[#111827] text-sm mb-1">{d}</div>
                <a href="#" className="flex items-center gap-1 text-xs text-[#4F46E5] hover:underline"><Download size={10} /> Download</a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
