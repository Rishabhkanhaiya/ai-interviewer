# -*- coding: utf-8 -*-
import re

file_path = 'app/interview/scorecard/[id]/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update SessionRecord Interface
content = re.sub(
    r'  star_weakest: string\n  top_improvements: string\[\]',
    '  error_analysis?: {\n    quote: string\n    mistake: string\n    fix: string\n    better_example?: string\n  }[]\n  comprehensive_summary?: string',
    content
)

# 2. Update STAR Analysis labels
content = re.sub(
    r'<strong>S</strong> = Situation &nbsp;·&nbsp; <strong>T</strong> = Task &nbsp;·&nbsp; <strong>A</strong> = Action &nbsp;·&nbsp; <strong>R</strong> = Result',
    '<strong>S</strong> = Technical Depth &nbsp;·&nbsp; <strong>T</strong> = Comm Clarity &nbsp;·&nbsp; <strong>A</strong> = Structure &nbsp;·&nbsp; <strong>R</strong> = Specificity',
    content
)
content = re.sub(
    r"const labels = \['Situation', 'Task', 'Action', 'Result'\]",
    "const labels = ['Technical', 'Clarity', 'Structure', 'Examples']",
    content
)

# 3. Remove weakest component badge
content = re.sub(
    r'            \{session\.star_weakest && \([\s\S]*?\)\}',
    '',
    content
)

# 4. Replace Top Improvements block with Error Analysis and Comprehensive Summary
new_feedback_section = '''        {/* ── Comprehensive Summary ─────────────────────────────────────────────── */}
        {session.comprehensive_summary && (
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Overall Performance Summary</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{session.comprehensive_summary}</p>
          </div>
        )}

        {/* ── Error Analysis ─────────────────────────────────────────────── */}
        {session.error_analysis && session.error_analysis.length > 0 && (
          <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Critical Mistakes & Fixes</h2>
            <div className="space-y-4">
              {session.error_analysis.map((err, i) => (
                <div key={i} className="border border-red-100 bg-red-50/50 rounded-xl p-4">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Mistake {i + 1}</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-3 text-sm text-gray-600 italic mb-3">
                    "{err.quote}"
                  </div>
                  <p className="text-sm text-gray-800 font-medium mb-1">Why it failed:</p>
                  <p className="text-sm text-gray-600 mb-3">{err.mistake}</p>
                  
                  <p className="text-sm text-emerald-700 font-medium mb-1">How to fix it:</p>
                  <p className="text-sm text-emerald-600 mb-3">{err.fix}</p>
                  
                  {err.better_example && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-sm text-emerald-800">
                      <strong>Better Example:</strong> "{err.better_example}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}'''

content = re.sub(
    r'        \{\/\* ── Top Improvements ─────────────────────────────────────────────── \*\/\}.*?        \{\/\* ── Per-Question Breakdown ────────────────────────────────────────── \*\/\}',
    new_feedback_section + '\n\n        {/* ── Per-Question Breakdown ────────────────────────────────────────── */}',
    content,
    flags=re.DOTALL
)

# 5. Fix Practice Again CTA
content = re.sub(
    r'            \{session\.star_weakest[\s\S]*?\}',
    "            'Practice another round to improve your score.'",
    content
)

# Let's save this back.
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
