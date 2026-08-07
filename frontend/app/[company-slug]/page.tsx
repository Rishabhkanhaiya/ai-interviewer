import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: {
    'company-slug': string
  }
}

// Simulated data for drives
const DRIVES = {
  'tcs-nqt-2025': {
    company: 'TCS',
    drive: 'TCS NQT 2025',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    questions: [
      "Tell me about a time you had to learn a new technology quickly.",
      "Explain the difference between a process and a thread.",
      "How do you handle a situation where you disagree with a team member?"
    ],
    price: 499,
  },
  'infosys-pune-2025': {
    company: 'Infosys',
    drive: 'Infosys Campus Drive (Pune)',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    questions: [
      "What is OOPs? Explain with a real-world example.",
      "Describe a challenging project you worked on and how you overcame the obstacles.",
      "Where do you see yourself in 5 years?"
    ],
    price: 499,
  },
  'wipro-elite-2025': {
    company: 'Wipro',
    drive: 'Wipro Elite NTH 2025',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    questions: [
      "Explain SDLC models and which one you prefer.",
      "How would you optimize a slow-performing database query?",
      "Tell me about a time you showed leadership skills."
    ],
    price: 499,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params['company-slug']
  const driveInfo = DRIVES[slug as keyof typeof DRIVES]

  if (!driveInfo) {
    return { title: 'Drive Not Found' }
  }

  return {
    title: `${driveInfo.drive} Interview Prep | InterviewAI`,
    description: `Prepare for the upcoming ${driveInfo.drive} with AI mock interviews. Practice real questions in Hinglish.`,
  }
}

export default function DriveLandingPage({ params }: Props) {
  const slug = params['company-slug']
  const driveInfo = DRIVES[slug as keyof typeof DRIVES]

  if (!driveInfo) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-black/5 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            IAI
          </div>
          <span className="font-semibold text-gray-900 tracking-tight text-lg">InterviewAI</span>
        </div>
        <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          Log in
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 md:py-20">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Drive approaching fast
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            {driveInfo.company} is visiting. <br className="hidden md:block" />
            <span className="text-indigo-600">Are you ready?</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Prepare specifically for the <strong>{driveInfo.drive}</strong>. Practice with an AI that asks actual company questions, understands Hinglish, and grades your STAR method.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/auth?redirect=/buy?plan=drive&company=${encodeURIComponent(driveInfo.company)}`}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors text-lg"
            >
              Practice {driveInfo.company} round now " ,1{driveInfo.price}
            </Link>
          </div>
          <p className="text-sm text-gray-500">100% money-back guarantee if you don't find it helpful.</p>
        </div>

        {/* Sample Questions Section */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden mb-16">
          <div className="px-6 py-5 border-b border-black/5 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 text-lg">Sample questions you'll face</h2>
            <p className="text-sm text-gray-500 mt-1">Our AI will ask these dynamically based on your resume.</p>
          </div>
          <div className="divide-y divide-black/5">
            {driveInfo.questions.map((q, i) => (
              <div key={i} className="px-6 py-4 flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-medium">
                  {i + 1}
                </div>
                <p className="text-gray-700 pt-1">{q}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center space-y-8">
          <h3 className="font-semibold text-gray-900 text-xl">Past students who used this mode</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: "The AI asked me the exact same OOPs question that TCS asked me 2 days later. Insane.", name: "Rahul D.", college: "PICT" },
              { text: "My Hinglish wasn't an issue. The AI graded my logic. I felt 10x more confident in the actual HR round.", name: "Sneha M.", college: "VIT Pune" },
              { text: "Worth every rupee. The STAR method feedback alone fixed how I tell my internship story.", name: "Aditya P.", college: "MIT WPU" }
            ].map((t, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm text-left">
                <div className="flex gap-1 text-amber-400 mb-3 text-sm">dddddddddd</div>
                <p className="text-gray-700 text-sm italic mb-4">"{t.text}"</p>
                <div className="text-xs text-gray-500 font-medium">" {t.name} ({t.college})</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
