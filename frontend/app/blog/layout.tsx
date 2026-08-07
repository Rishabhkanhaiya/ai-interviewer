import Link from 'next/link'
import { ReactNode } from 'react'

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Blog Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/8">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 transition-colors hidden sm:block">← Dashboard</Link>
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 hover:text-indigo-600 transition-colors">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            InterviewAI
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/blog" className="text-indigo-600">Blog</Link>
          </div>
        </div>
      </nav>

      {/* Main Blog Content wrapped in Typography Prose */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <article className="prose prose-indigo prose-lg md:prose-xl max-w-none bg-white p-8 md:p-12 rounded-2xl border border-black/8 shadow-sm">
          {children}
        </article>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-black/8 py-8 px-6 mt-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} InterviewAI. Practice interviews in Hinglish.</p>
      </footer>
    </div>
  )
}
