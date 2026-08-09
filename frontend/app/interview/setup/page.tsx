'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { Sidebar } from '@/components/ui/Sidebar'
import { TopBar } from '@/components/ui/TopBar'
import { Search, Code, Users, Briefcase, FileUp, CheckCircle, Video, Mic, ShieldAlert, MonitorPlay, CheckSquare } from 'lucide-react'

const POPULAR_COMPANIES = ['General', 'Google', 'Meta', 'Apple', 'Amazon', 'Netflix']

const ROUND_TYPES = [
  { id: 'technical',  label: 'Technical / Coding', desc: 'Algorithms, system design, problem-solving.', icon: Code },
  { id: 'hr',         label: 'Behavioral / HR',    desc: 'Past experiences, culture fit, soft skills.', icon: Users },
  { id: 'managerial', label: 'Managerial',         desc: 'Leadership, project management, conflict resolution.', icon: Briefcase },
]

const LANGUAGES = [
  { id: 'english',  label: 'English only',        icon: '🇬🇧' },
  { id: 'hinglish', label: 'Hinglish (recommended)', icon: '🇮🇳', recommended: true },
  { id: 'hindi',    label: 'Hindi primary',        icon: '🔵' },
]

export default function InterviewSetupPage() {
  const router = useRouter()
  // step 1: config, step 2: environment, step 3: confirm, step 4: loading
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [company, setCompany] = useState('')
  const [companyList, setCompanyList] = useState<string[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<string[]>([])
  const [isCompanyFocused, setIsCompanyFocused] = useState(false)
  
  const [roundType, setRoundType] = useState('')
  const [language, setLanguage] = useState('hinglish')
  const [resumeText, setResumeText] = useState('')
  const [showTextarea, setShowTextarea] = useState(false)
  const [loadedFromProfile, setLoadedFromProfile] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  
  const [userName, setUserName] = useState<string>('')
  const [cameraMode, setCameraMode] = useState('video')

  // Device Test State
  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [camStatus, setCamStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [volume, setVolume] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isTestingRef = useRef(false)
  
  const rules = [
    { title: "No Tabs", desc: "Do not switch tabs during the interview." },
    { title: "No Help", desc: "Do not use external AI or cheat sheets." },
    { title: "Professional Conduct", desc: "Offensive language will result in an immediate strike and session termination." }
  ]

  const testDevices = async () => {
    isTestingRef.current = true
    setMicStatus('testing')
    if (cameraMode === 'video') {
      setCamStatus('testing')
    } else {
      setCamStatus('success') // Auto-succeed camera if audio only
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: cameraMode === 'video' 
      })
      streamRef.current = stream
      
      if (cameraMode === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream
        setCamStatus('success')
      }
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(analyser)
      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      let successTimeout: NodeJS.Timeout
      
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i]
        const avg = sum / bufferLength
        setVolume(avg)
        if (avg > 15) {
          if (!successTimeout) {
            successTimeout = setTimeout(() => {
              setMicStatus('success')
            }, 1000)
          }
        }
        if (isTestingRef.current) {
          requestAnimationFrame(updateVolume)
        }
      }
      updateVolume()
    } catch (e) {
      setMicStatus('error')
      if (cameraMode === 'video') setCamStatus('error')
    }
  }

  const stopDevices = () => {
    isTestingRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || session.user.email || '')
        // Fetch profile to prefill resume_text
        apiClient.getProfile().then(({ data }) => {
          if (data.name) {
            setUserName(data.name)
          }
          if (data.resume_text) {
            setResumeText(data.resume_text)
            setShowTextarea(true)
            setLoadedFromProfile(true)
          }
        }).catch(() => {})
      } else {
        router.push('/auth')
      }
    })
    
    // Fetch companies list
    fetch('/companies.json')
      .then(res => res.json())
      .then(data => setCompanyList(data))
      .catch(err => console.error("Failed to load companies:", err))
    
    return () => stopDevices()
  }, [router])

  useEffect(() => {
    if (company.length > 0) {
      const filtered = companyList.filter(c => c.toLowerCase().includes(company.toLowerCase()))
      setFilteredCompanies(filtered.slice(0, 8)) // show top 8 matches
    } else {
      setFilteredCompanies([])
    }
  }, [company, companyList])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploadingResume(true)
    try {
      const data = await apiClient.uploadResume(file)
      setResumeText(data.text)
      setShowTextarea(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to parse resume.')
    } finally {
      setUploadingResume(false)
    }
  }

  const [calibrationPhase, setCalibrationPhase] = useState(0)
  const calibrationMessages = [
    "Parsing Resume structure...",
    "Calibrating Technical Depth...",
    "Aligning Interviewer Persona...",
    "Ready."
  ]

  const handleStart = async () => {
    setStep(4) // Loading state
    setError(null)
    
    let phase = 0
    const interval = setInterval(() => {
      phase++
      if (phase < calibrationMessages.length) {
        setCalibrationPhase(phase)
      }
    }, 1200)

    const startTime = Date.now()

    try {
      let finalCompany = company.toLowerCase().replace(/\s+/g, '_')
      if (finalCompany.includes('general') || finalCompany.includes('not_decided')) {
        finalCompany = 'all_in_one'
      }
      
      const { data } = await apiClient.startSession({
        company: finalCompany,
        role: 'sde',
        round_type: roundType,
        language_pref: language,
        camera_mode: cameraMode,
        resume_text: resumeText || undefined,
      })
      const { data: { session } } = await supabase.auth.getSession()
      
      const params = new URLSearchParams({
        session_id: data.session_id,
        company: data.company_display_name || company,
        round_type: roundType,
        persona: data.voice_persona,
        camera_mode: cameraMode,
        token: session?.access_token || '',
      })

      const elapsed = Date.now() - startTime
      const minWait = 4500
      if (elapsed < minWait) {
        await new Promise(resolve => setTimeout(resolve, minWait - elapsed))
      }

      clearInterval(interval)
      router.push(`/interview/session?${params}`)
    } catch (err: unknown) {
      clearInterval(interval)
      setStep(3)
      const e = err as any
      const detail = e?.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg).join(', '))
      } else if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError(e.message || 'Failed to start session. Please try again.')
      }
    }
  }

  const renderProgressBar = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1 mr-4">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
             <div 
               className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
               style={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}
             />
          </div>
        </div>
        <span className="text-xs font-medium text-[var(--color-text-primary)] whitespace-nowrap">Step {Math.min(step, 3)} of 3</span>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex' }}>
      <Sidebar userName={userName} onSignOut={async () => { await supabase.auth.signOut(); router.push('/auth') }} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar breadcrumb="Start Interview" />

        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            
            {step < 4 && (
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Start Interview Setup</h1>
                <p className="text-[var(--color-text-tertiary)] text-sm">Configure your practice environment for optimal results.</p>
              </div>
            )}

            {step < 4 && renderProgressBar()}

            <AnimatePresence mode="wait">
              {/* Step 1: Configuration */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  {/* 1. Target Company */}
                  <div className="ui-card p-6 border border-[var(--color-border)] rounded-2xl shadow-sm bg-[var(--color-surface)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">1</div>
                      <h3 className="text-[17px] font-semibold text-[var(--color-text-primary)]">Target Company</h3>
                    </div>
                    <p className="text-sm text-[var(--color-text-tertiary)] mb-3">Search or select a company</p>
                    <div className="relative mb-4">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type="text" 
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        onFocus={() => setIsCompanyFocused(true)}
                        onBlur={() => setTimeout(() => setIsCompanyFocused(false), 200)}
                        placeholder="e.g. Google, Amazon, Stripe..." 
                        className="w-full pl-10 pr-4 py-3 border border-[var(--color-border-strong)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:ring-indigo-400/20 focus:border-indigo-500 transition-all bg-[var(--color-surface-sunken)]/50"
                      />
                      <AnimatePresence>
                        {isCompanyFocused && filteredCompanies.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg max-h-60 overflow-y-auto"
                          >
                            {filteredCompanies.map((c, idx) => (
                              <div 
                                key={idx}
                                onClick={() => { setCompany(c); setIsCompanyFocused(false); }}
                                className="px-4 py-2.5 hover:bg-indigo-50 dark:bg-indigo-500/10 cursor-pointer text-sm text-[var(--color-text-secondary)] transition-colors border-b border-gray-50 last:border-0"
                              >
                                {c}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_COMPANIES.map(c => (
                        <button 
                          key={c}
                          onClick={() => setCompany(c)}
                          className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${company.toLowerCase() === c.toLowerCase() ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 border-indigo-200 shadow-sm' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-strong)] hover:bg-[var(--color-surface-sunken)] border'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Interview Type */}
                  <div className="ui-card p-6 border border-[var(--color-border)] rounded-2xl shadow-sm bg-[var(--color-surface)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">2</div>
                      <h3 className="text-[17px] font-semibold text-[var(--color-text-primary)]">Interview Type</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {ROUND_TYPES.map(r => (
                        <button
                          key={r.id}
                          onClick={() => setRoundType(r.id)}
                          className={`p-5 text-left border rounded-2xl transition-all relative overflow-hidden ${roundType === r.id ? 'border-indigo-500 ring-1 ring-indigo-500 dark:ring-indigo-400 bg-indigo-50 dark:bg-indigo-500/20 shadow-md shadow-indigo-100/50 dark:shadow-indigo-900/20' : 'border-[var(--color-border-strong)] hover:border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:shadow-sm'}`}
                        >
                          {roundType === r.id && (
                            <div className="absolute top-3 right-3 text-indigo-500 dark:text-indigo-400">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          )}
                          <r.icon className={`w-6 h-6 mb-3 ${roundType === r.id ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'}`} />
                          <div className={`font-semibold text-[15px] mb-1.5 text-[var(--color-text-primary)]`}>{r.label}</div>
                          <div className="text-[13px] text-[var(--color-text-tertiary)] leading-relaxed">{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Provide Context */}
                  <div className="ui-card p-6 border border-[var(--color-border)] rounded-2xl shadow-sm bg-[var(--color-surface)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">3</div>
                      <h3 className="text-[17px] font-semibold text-[var(--color-text-primary)]">Provide Context <span className="text-red-500 font-normal text-sm ml-1">*</span></h3>
                      {loadedFromProfile && (
                         <div className="ml-auto text-[11px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md uppercase border border-emerald-200 dark:border-emerald-500/30">
                           Loaded from Profile
                         </div>
                      )}
                    </div>
                    <div className={`border-2 border-dashed rounded-2xl transition-colors ${showTextarea ? 'border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10' : 'border-[var(--color-border-strong)] bg-[var(--color-surface-sunken)]/50 hover:bg-[var(--color-surface-sunken)] hover:border-[var(--color-border-strong)]'}`}>
                      {showTextarea ? (
                        <div className="relative p-2">
                           <textarea 
                             value={resumeText} 
                             onChange={e => setResumeText(e.target.value)}
                             placeholder="Paste your resume, job description, or at least type your name and intro here..."
                             className="w-full h-40 p-4 bg-transparent border-none resize-none focus:outline-none text-[14px] text-[var(--color-text-secondary)] placeholder-gray-400"
                           />
                           <div className="absolute bottom-3 right-4 text-[11px] font-medium text-gray-400 bg-[var(--color-surface)] px-2 py-1 rounded shadow-sm border border-[var(--color-border)] flex gap-3 items-center">
                             <label className="cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline">
                               Upload new file
                               <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                             </label>
                             <span>{resumeText.length} chars</span>
                           </div>
                           {uploadingResume && <div className="absolute inset-0 bg-[var(--color-surface)]/50 flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400">Uploading & Parsing...</div>}
                        </div>
                      ) : (
                         <div className="flex flex-col items-center p-8 py-10 relative">
                            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-4">
                               <FileUp className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <div className="font-semibold text-[var(--color-text-primary)] text-[15px] mb-1.5">Context is Required</div>
                            <div className="text-[13px] text-[var(--color-text-tertiary)] mb-6 max-w-sm mx-auto text-center leading-relaxed">Please upload your resume, or type your name and background so the AI knows who it is interviewing.</div>
                            <div className="flex gap-4">
                               <label className="cursor-pointer px-5 py-2.5 border border-[var(--color-border-strong)] rounded-xl text-[13px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface)] shadow-sm hover:shadow hover:text-indigo-600 dark:text-indigo-400 transition-all">
                                  {uploadingResume ? 'Parsing...' : 'Upload File'}
                                  <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
                               </label>
                               <button onClick={() => setShowTextarea(true)} className="px-5 py-2.5 border border-[var(--color-border-strong)] rounded-xl text-[13px] font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface)] shadow-sm hover:shadow hover:text-indigo-600 dark:text-indigo-400 transition-all">
                                  Type / Paste Text
                               </button>
                            </div>
                         </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={() => setStep(2)}
                      disabled={!company || !roundType || !resumeText.trim()}
                      className="px-6 py-3 bg-indigo-50 dark:bg-indigo-500/100 hover:bg-indigo-600 text-white rounded-xl text-[14px] font-medium shadow-[0_2px_10px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Continue to Environment <span className="ml-1">→</span>
                    </button>
                  </div>

                </motion.div>
              )}

              {/* Step 2: Environment */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  {/* Camera Mode */}
                  <div className="ui-card p-6 border border-[var(--color-border)] rounded-2xl shadow-sm bg-[var(--color-surface)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">4</div>
                      <h3 className="text-[17px] font-semibold text-[var(--color-text-primary)]">Camera Mode</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setCameraMode('video')}
                        className={`p-5 text-left border rounded-2xl transition-all relative ${cameraMode === 'video' ? 'border-indigo-500 ring-1 ring-indigo-500 dark:ring-indigo-400 bg-indigo-50 dark:bg-indigo-500/10/20 shadow-md shadow-indigo-100/50 dark:shadow-indigo-900/20' : 'border-[var(--color-border-strong)] hover:border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:shadow-sm'}`}
                      >
                        {cameraMode === 'video' && <CheckCircle className="w-4 h-4 text-indigo-500 dark:text-indigo-400 absolute top-4 right-4" />}
                        <Video className={`w-5 h-5 mb-3 ${cameraMode === 'video' ? 'text-[var(--color-accent)]' : 'text-gray-400'}`} />
                        <div className={`font-semibold text-[15px] mb-1 text-[var(--color-text-primary)]`}>Video Mode</div>
                        <div className="text-[13px] text-[var(--color-text-tertiary)]">Tracks presence (face in frame) to ensure integrity. Highly recommended.</div>
                      </button>
                      <button
                        onClick={() => setCameraMode('audio_only')}
                        className={`p-5 text-left border rounded-2xl transition-all relative ${cameraMode === 'audio_only' ? 'border-indigo-500 ring-1 ring-indigo-500 dark:ring-indigo-400 bg-indigo-50 dark:bg-indigo-500/10/20 shadow-md shadow-indigo-100/50 dark:shadow-indigo-900/20' : 'border-[var(--color-border-strong)] hover:border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:shadow-sm'}`}
                      >
                        {cameraMode === 'audio_only' && <CheckCircle className="w-4 h-4 text-indigo-500 dark:text-indigo-400 absolute top-4 right-4" />}
                        <Mic className={`w-5 h-5 mb-3 ${cameraMode === 'audio_only' ? 'text-[var(--color-accent)]' : 'text-gray-400'}`} />
                        <div className={`font-semibold text-[15px] mb-1 text-[var(--color-text-primary)]`}>Audio Only</div>
                        <div className="text-[13px] text-[var(--color-text-tertiary)]">No video monitoring. Just voice analysis.</div>
                      </button>
                    </div>
                  </div>

                  {/* Device Test */}
                  <div className="ui-card p-6 border border-[var(--color-border)] rounded-2xl shadow-sm bg-[var(--color-surface)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">5</div>
                      <h3 className="text-[17px] font-semibold text-[var(--color-text-primary)]">Check Devices</h3>
                    </div>
                    
                    <div className="border border-[var(--color-border)] bg-[var(--color-surface-sunken)]/50 rounded-xl p-8 flex flex-col items-center justify-center space-y-4 min-h-[250px]">
                      {micStatus === 'idle' && (
                        <button onClick={testDevices} className="px-5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-xl shadow-sm text-sm font-medium hover:bg-[var(--color-surface-sunken)] transition-colors flex items-center gap-2">
                           <MonitorPlay className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                           Start Device Test
                        </button>
                      )}
                      
                      {cameraMode === 'video' && (camStatus === 'testing' || camStatus === 'success') ? (
                        <div className="w-full max-w-sm relative aspect-video bg-black rounded-xl overflow-hidden shadow-inner ring-1 ring-black/5">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        </div>
                      ) : null}

                      {(micStatus === 'testing' || micStatus === 'success') && (
                        <div className="w-full max-w-xs space-y-3 mt-4">
                          <div className="text-center text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface)] py-1.5 px-3 rounded-lg shadow-sm inline-block mx-auto border border-[var(--color-border)]">Please say "Hello, AI"</div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-indigo-50 dark:bg-indigo-500/100 h-full transition-all duration-75" style={{ width: `${Math.min(100, (volume / 128) * 100)}%` }}></div>
                          </div>
                        </div>
                      )}
                      {micStatus === 'success' && (camStatus === 'success' || cameraMode === 'audio_only') && (
                        <div className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2 text-sm bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-100 dark:border-emerald-500/20 mt-2">
                          <CheckCircle className="w-4 h-4" /> {cameraMode === 'video' ? 'Devices working perfectly' : 'Microphone working perfectly'}
                        </div>
                      )}
                      {(micStatus === 'error' || (cameraMode === 'video' && camStatus === 'error')) && (
                        <div className="text-rose-600 dark:text-rose-400 font-medium text-sm text-center bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-100 dark:border-rose-500/20">
                          Device access denied. Please allow {cameraMode === 'video' ? 'camera and microphone' : 'microphone'} access in browser.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-between pt-4">
                    <button onClick={() => { stopDevices(); setStep(1); }} className="px-6 py-3 border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] rounded-xl text-[14px] font-medium hover:bg-[var(--color-surface-sunken)] transition-colors">
                      ← Back
                    </button>
                    <button
                      onClick={() => { stopDevices(); setStep(3); }}
                      disabled={micStatus !== 'success' || camStatus !== 'success'}
                      className="px-6 py-3 bg-indigo-50 dark:bg-indigo-500/100 hover:bg-indigo-600 text-white rounded-xl text-[14px] font-medium shadow-[0_2px_10px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Continue to Finalize <span className="ml-1">→</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Rules & Confirm */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  {/* Language */}
                  <div className="ui-card p-6 border border-[var(--color-border)] rounded-2xl shadow-sm bg-[var(--color-surface)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">6</div>
                      <h3 className="text-[17px] font-semibold text-[var(--color-text-primary)]">Language Preference</h3>
                    </div>
                    <div className="space-y-3">
                      {LANGUAGES.map(l => (
                        <button
                          key={l.id}
                          onClick={() => setLanguage(l.id)}
                          className={`w-full p-4 text-left flex items-center gap-3 border rounded-xl transition-all ${
                            language === l.id ? 'border-indigo-500 ring-1 ring-indigo-500 dark:ring-indigo-400 bg-indigo-50 dark:bg-indigo-500/10/20 shadow-sm' : 'border-[var(--color-border-strong)] hover:border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-sunken)]/50'
                          }`}
                        >
                          <span className="text-xl">{l.icon}</span>
                          <div className="flex-1 flex items-center justify-between">
                            <span className={`font-semibold text-[14px] text-[var(--color-text-primary)]`}>{l.label}</span>
                            {l.recommended && (
                              <span className={`text-[11px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${language === l.id ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'}`}>Recommended</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* House Rules */}
                  <div className="ui-card p-6 border border-[var(--color-border)] rounded-2xl shadow-sm bg-[var(--color-surface)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <h3 className="text-[17px] font-semibold text-[var(--color-text-primary)]">House Rules</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {rules.map((rule, idx) => (
                        <div key={idx} className="bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-xl p-4">
                           <div className="font-semibold text-[var(--color-text-primary)] text-[14px] mb-1 flex items-center gap-2">
                             <CheckSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                             {rule.title}
                           </div>
                           <div className="text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">{rule.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 text-sm rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 flex items-center gap-3 shadow-sm">
                      <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                      {typeof error === 'object' ? (error as any)?.msg || (error as any)?.message || JSON.stringify(error) : error}
                    </div>
                  )}

                  <div className="flex gap-3 justify-between pt-4">
                    <button onClick={() => setStep(2)} className="px-6 py-3 border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] rounded-xl text-[14px] font-medium hover:bg-[var(--color-surface-sunken)] transition-colors">
                      ← Back
                    </button>
                    <button
                      onClick={handleStart}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[15px] font-semibold shadow-[0_4px_14px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Begin Interview <span className="ml-1">→</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Loading */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[400px] text-center bg-[var(--color-surface)] rounded-3xl p-12 border border-[var(--color-border)] shadow-sm">
                  <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-[spin_3s_linear_infinite]" />
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/40 border-t-indigo-600 animate-[spin_1.5s_linear_infinite_reverse]" />
                    <div className="absolute inset-4 rounded-full bg-indigo-50 dark:bg-indigo-500/100/10 animate-pulse shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center">
                      <span className="text-4xl">🤖</span>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Connecting AI Environment</h2>
                  
                  <div className="h-6 overflow-hidden relative w-full flex justify-center mt-2">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={calibrationPhase}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-indigo-600 dark:text-indigo-400 font-medium absolute text-sm"
                      >
                        {calibrationMessages[calibrationPhase]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
