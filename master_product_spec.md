# AI Mock Interview Platform — Master Product Specification
> Version 1.0 — Final Reference Document. Every decision locked in this conversation is recorded here. No team member builds anything not in this document.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Core Rules — Non-Negotiable](#2-core-rules--non-negotiable)
3. [Tech Stack — Locked](#3-tech-stack--locked)
4. [Design System & Color Theme](#4-design-system--color-theme)
5. [Pages & Screen Specifications](#5-pages--screen-specifications)
6. [Complete Feature List](#6-complete-feature-list)
7. [Sarvam AI Integration Spec](#7-sarvam-ai-integration-spec)
8. [Database Schema](#8-database-schema)
9. [Business Logic & Pricing](#9-business-logic--pricing)
10. [API Cost Calculation](#10-api-cost-calculation)
11. [Security & Infrastructure](#11-security--infrastructure)
12. [30-Phase Build Roadmap](#12-30-phase-build-roadmap)

---

## 1. Product Overview

### What We Are Building
A voice-first, AI-powered mock interview platform designed exclusively for Indian engineering students preparing for campus placements. The platform simulates real Indian company interviews in Hinglish using Sarvam AI's STT and TTS — the only product that understands "matlab", "toh", and Hinglish code explanations without penalising the user.

### Target User
- Engineering students in Pune (initial) — expanding to all Tier 1 and Tier 2 colleges
- 3rd and 4th year students preparing for mass recruiters (TCS, Infosys, Wipro, Accenture) and startups
- Students who are scared of interviews, not bad at their subject
- Age: 19–23, on mobile + laptop, uses WhatsApp and Instagram daily

### Core Value Proposition
> "Practice with an AI that actually understands how Indian students think and speak."

No existing product — LeetCode, InterviewBit, Pramp, or any Indian app — combines voice + Hinglish + company-specific questions + resume grilling + STAR scoring in one place. That gap is the business.

### Revenue Target
- Month 1–2: ₹0 (beta, free users)
- Month 3: ₹40,000+
- Month 5: ₹2,00,000+
- Month 8: ₹5,00,000+ (with college B2B deals)

### Team (4 People)
| Role | Responsibility |
|---|---|
| Backend Lead | FastAPI, WebSocket pipeline, Sarvam STT/TTS, Redis, rate limiting |
| Frontend Lead | Next.js UI, AudioWorklet, mic capture, Razorpay, scorecard |
| AI Lead | GPT-4o-mini state machine, prompt engineering, STAR scoring, question banks |
| Growth Lead | Landing page, WhatsApp outreach, affiliate system, placement calendar tracking |

---

## 2. Core Rules — Non-Negotiable

These rules were decided in our planning and cannot be reversed by any team member without full team agreement.

### V2 Banned List — Do Not Build Until Post-Revenue
The following features are permanently banned from V1 development. Any team member who starts building these before first paying customer forfeits their time:

- **WebRTC audio** — Binary WebSockets over V1. WebRTC added after Month 2.
- **Video / face analysis** — Kills profit margin and adds latency on hostel WiFi.
- **Real-time copilot** — Positions product as cheating tool, not practice tool.
- **3D avatars** — Unnecessary. Audio waveform is the interface.
- **PDF resume parsing** — V1 uses plain text paste. PDF parsing is Week 4.
- **Peer-to-peer matching** — The AI is the interviewer. No human matching.
- **Subscription model** — One-time pack only for V1. Subscriptions in V2.
- **Unlimited sessions** — Every pack has a hard cap. No exceptions.
- **Group discussion mode** — Too complex for V1.
- **Mobile app** — Browser-first only.

### Hard Caps — Always Enforced
- ₹499 pack = 10 rounds = 200 minutes maximum. Hard Redis cap. Cannot be bypassed.
- ₹199 top-up = 5 rounds = 100 minutes.
- Sessions block new questions after 20 minutes (allowing current answer to finish).
- Max 3 concurrent WebSocket sessions per user account at any time.
- Rate limit: max 10 API calls per minute per user to prevent abuse.

---

## 3. Tech Stack — Locked

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| Next.js | 14+ (App Router) | Framework — SSR for landing page SEO, CSR for interview app |
| Tailwind CSS | 3+ | Styling — utility-first, no custom CSS unless necessary |
| Web Audio API + AudioWorklet | Browser native | Mic capture, 16kHz PCM, binary streaming |
| Zustand | Latest | Client state management (interview session state) |
| Framer Motion | Latest | Animations — audio waveform, transitions only |
| React Hook Form | Latest | Form handling (resume paste, signup) |
| Axios | Latest | HTTP client |

### Backend
| Tool | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | Latest | API framework — async, WebSocket support |
| asyncio | Built-in | Non-blocking concurrent session handling |
| websockets | Latest | WebSocket connections to Sarvam endpoints |
| Redis (Upstash) | Latest | Interview transcript memory, rate limiting, session caps |
| PostgreSQL (Supabase) | Latest | Users, payments, affiliates, session records |
| Pydantic | v2 | Data validation, strict JSON models |
| httpx | Latest | Async HTTP client for OpenAI calls |
| python-jose | Latest | JWT token verification |

### AI / Voice
| Tool | Purpose | Cost |
|---|---|---|
| Sarvam Saaras v3 | Real-time STT via WebSocket | ₹30/hour |
| Sarvam Bulbul v3 | Streaming TTS | ₹30/10K characters |
| GPT-4o-mini | Interview logic, STAR scoring, JSON output | ₹0.80/session |
| Sarvam Mayura (V2) | Replace GPT-4o-mini with Indian LLM | TBD |

### Infrastructure
| Service | Plan | Cost | Purpose |
|---|---|---|---|
| Vercel | Free → Pro ₹1,680/mo | Hosting Next.js frontend |
| Railway | Starter ₹420/mo | FastAPI backend — no cold starts |
| Supabase | Free → Pro ₹2,100/mo | PostgreSQL + Auth + Storage |
| Upstash Redis | Free → Pay-per-use | Redis without server management |
| Cloudflare | Free | CDN, DDoS protection, SSL |
| Sentry | Free | Error monitoring |
| UptimeRobot | Free | Uptime alerts every 5 minutes |
| Razorpay | 2% per transaction | Payments |
| GoDaddy | ₹800/year | Domain (.in for Indian trust) |

### What We Rejected and Why
- **Render** — 30-second cold starts kill WebSocket experience
- **Flutter Web** — AudioWorklet support is inconsistent
- **Socket.io** — Overkill; raw WebSocket is enough and lighter
- **MongoDB** — ACID compliance needed for payment records
- **LiveKit (V1)** — Too complex; saves for WebRTC upgrade in V2
- **aiortc** — Research-grade, not production-grade

---

## 4. Design System & Color Theme

### Brand Identity
The product should feel like a serious, premium tool — not a startup toy. Think of how Linear, Vercel, and Notion look. Clean, minimal, fast. Every design decision reinforces the message: "This is a professional tool that takes your placement seriously."

### Color Palette — Primary

| Name | Hex | Usage |
|---|---|---|
| Brand Black | `#0F0F0F` | Primary text, hero headings |
| Brand Navy | `#111827` | Dark backgrounds, nav |
| Accent Indigo | `#4F46E5` | Primary CTAs, active states, highlights |
| Accent Indigo Hover | `#4338CA` | Button hover |
| Accent Indigo Light | `#EEF2FF` | Accent tints, badges |
| Warm Orange | `#F59E0B` | Urgency badges, warning states, filler word highlight |
| Warm Orange Light | `#FFFBEB` | Warning backgrounds |
| Success Green | `#10B981` | STAR score, pass indicators, positive feedback |
| Success Green Light | `#ECFDF5` | Success backgrounds |
| Danger Red | `#EF4444` | Error states, filler word badges, fail indicators |
| Danger Red Light | `#FEF2F2` | Error backgrounds |

### Color Palette — Surfaces

| Name | Hex | Usage |
|---|---|---|
| Page Background | `#FAFAFA` | Base page background (light mode) |
| Card Surface | `#FFFFFF` | All cards, panels, modals |
| Subtle Surface | `#F3F4F6` | Input backgrounds, secondary cards |
| Border | `rgba(0,0,0,0.08)` | All borders — 0.5px hairline |
| Border Strong | `rgba(0,0,0,0.15)` | Hover borders, active inputs |

### Color Palette — Text

| Name | Hex | Usage |
|---|---|---|
| Text Primary | `#111827` | All headings, important body text |
| Text Secondary | `#374151` | Body content, descriptions |
| Text Muted | `#6B7280` | Captions, metadata, placeholder text |
| Text Disabled | `#9CA3AF` | Disabled states |
| Text On Accent | `#FFFFFF` | Text on indigo buttons |

### Dark Mode (V2 — not in V1)
Full dark mode is a V2 feature. V1 ships light mode only. Do not spend time on dark mode in V1.

### Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Hero Heading | Inter | 700 | 56px / 3.5rem |
| Section Heading | Inter | 600 | 36px / 2.25rem |
| Card Heading | Inter | 600 | 20px / 1.25rem |
| Body Large | Inter | 400 | 18px / 1.125rem |
| Body Default | Inter | 400 | 16px / 1rem |
| Body Small | Inter | 400 | 14px / 0.875rem |
| Caption | Inter | 400 | 12px / 0.75rem |
| Code/Mono | JetBrains Mono | 400 | 14px / 0.875rem |

Load from Google Fonts: `Inter` (300, 400, 500, 600, 700) + `JetBrains Mono` (400).

### Spacing System
Use Tailwind's default spacing scale. Core values:
- `4px` — inner component gaps
- `8px` — tight element spacing
- `16px` — card inner padding
- `24px` — section sub-elements
- `32px` — section padding
- `64px` — large section gaps
- `96px` — hero section padding

### Border Radius
- `4px` — tags, badges, small chips
- `8px` — inputs, buttons, small cards
- `12px` — standard cards
- `16px` — large cards, panels
- `24px` — hero cards, feature panels
- `9999px` — pill buttons, round elements

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.08);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.06);
--shadow-focus: 0 0 0 3px rgba(79,70,229,0.2);
```

### Component Standards

**Buttons:**
```
Primary: bg-indigo-600, text-white, hover:bg-indigo-700, rounded-lg, px-6 py-3
Secondary: bg-white, border border-gray-200, text-gray-700, hover:bg-gray-50
Ghost: bg-transparent, text-indigo-600, hover:bg-indigo-50
Destructive: bg-red-500, text-white, hover:bg-red-600
Disabled: opacity-50, cursor-not-allowed
```

**Cards:**
```
Standard: bg-white, border border-black/8, rounded-xl, p-6, shadow-sm
Highlighted: border-indigo-200, bg-indigo-50/30
Active Session: border-indigo-500 (2px), bg-white
```

**Input Fields:**
```
Standard: bg-gray-50, border border-gray-200, rounded-lg, px-4 py-3, focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
Error: border-red-400, bg-red-50
```

**Badges:**
```
V1 MVP: bg-green-100 text-green-800
V2: bg-amber-100 text-amber-800
Sarvam: bg-teal-100 text-teal-800
Company: bg-indigo-100 text-indigo-800
```

---

## 5. Pages & Screen Specifications

### Page 01 — Landing Page (`/`)

**Purpose:** Convert a student who clicked a WhatsApp link into a paying customer. One goal only.

**Sections (top to bottom):**

#### 5.1.1 Navigation Bar
- Logo (left): Product name + icon
- Links (center): Features · Pricing · How it works
- CTA (right): "Try 60s free" (primary indigo button) + "Sign in" (ghost)
- Sticky on scroll with backdrop blur
- Mobile: Hamburger menu, same CTAs

#### 5.1.2 Hero Section
- Badge at top: "🇮🇳 Built for Indian placement drives"
- Headline: "Practice interviews in Hinglish. Get hired."
- Subheadline: "The only AI interviewer that understands how Indian engineers actually speak — and grades your logic, not your accent."
- Two CTAs: "Start free 60-second interview →" (primary large) + "See how it works" (ghost)
- Hero visual: Mockup of interview session UI showing live transcript + audio waveform + AI speaking indicator
- Social proof row below: "Used by 500+ students from COEP, PICT, VIT Pune" (after launch, replace with real numbers)

#### 5.1.3 Pain Section (Why This Exists)
- Section heading: "You know your subject. You just freeze in interviews."
- Three pain cards:
  1. "The AI interviewer that actually understands you" — most tools penalise Hinglish. Ours doesn't.
  2. "Questions based on YOUR resume" — AI reads your projects and grills you on them specifically.
  3. "Know exactly where you failed" — STAR score, WPM, filler words. Not vague feedback.

#### 5.1.4 Live Demo Section
- Heading: "See it for yourself"
- Embed a 60-second demo button that opens a minimal interview session
- Text below: "No login needed. Just allow microphone."
- After demo ends → paywall modal appears

#### 5.1.5 How It Works Section
- 4-step visual flow:
  1. Select your target company and role
  2. Paste your resume summary (5 lines)
  3. Start the voice interview — speak naturally in English or Hinglish
  4. Get your scorecard — download and share on LinkedIn

#### 5.1.6 Features Section
- 6 feature cards in 2×3 grid:
  1. Hinglish AI — understands "matlab" and "toh" — Sarvam Bulbul voice
  2. Company-specific — TCS, Infosys, startups, FAANG
  3. Resume grilling — asks about YOUR projects
  4. Barge-in — interrupt the AI anytime, it stops instantly
  5. STAR scoring — grades your behavioral answers on structure
  6. LinkedIn scorecard — shareable PDF that proves your readiness

#### 5.1.7 Voice Demo Section
- Heading: "Hear your AI interviewer"
- 4 play buttons for different voices (Brian, Emma, Aditi, Kajal)
- Toggle between English and Hindi questions
- Note: "Production uses OpenAI TTS + Sarvam Bulbul for best quality"

#### 5.1.8 Pricing Section
- Two cards:

  **Placement Pack — ₹499 (One-time)**
  - 10 full interview rounds
  - 200 minutes total (hard cap)
  - All company modes (TCS, Infosys, Startup...)
  - Resume-based grilling
  - STAR scoring + WPM + filler detection
  - Downloadable PDF scorecard
  - LinkedIn share card
  - "Buy now — UPI / Card / Net Banking" CTA

  **Top-Up Pack — ₹199**
  - 5 more rounds
  - 100 minutes additional
  - All features included
  - "Add more rounds" CTA

- Below cards: "Anchoring text — One coaching session costs ₹1,500. One Swiggy month costs ₹3,000. Ten realistic AI interviews cost ₹499."
- Affiliate code input field: "Have a referral code? Apply it here."

#### 5.1.9 Testimonials Section (Post-Launch)
- Student photo + name + college + quote
- "83/100 on TCS mock — cleared actual TCS in 3 days" style format
- 3-4 testimonials in carousel

#### 5.1.10 Company Logos / Placement Drives
- "Practice for these companies": TCS, Infosys, Wipro, Accenture, Capgemini, HDFC Bank, Razorpay, Groww, PhonePe, Swiggy
- Grey logos row — professional trust signal

#### 5.1.11 FAQ Section
- 6 FAQs in accordion format:
  1. How is this different from other interview prep apps?
  2. Does the AI understand Hindi and Hinglish?
  3. What happens when my 200 minutes are over?
  4. Can I use this on my phone?
  5. Is my resume data private?
  6. How does the affiliate referral work?

#### 5.1.12 Final CTA Section
- "Your placement drive is in 48 hours. Are you ready?"
- Single large button: "Start your free 60-second interview now"

#### 5.1.13 Footer
- Logo + tagline
- Links: Features · Pricing · Privacy Policy · Terms · Contact
- Social: LinkedIn + Instagram + Twitter
- "Made in Pune, India 🇮🇳"

---

### Page 02 — Authentication (`/auth`)

**Purpose:** Sign up or log in. Email OTP only. No passwords.

**Sections:**
- Centered card layout (max-width 420px)
- Logo at top
- Heading: "Sign in to continue"
- Subheading: "We'll send a 6-digit code to your email"
- Email input field
- "Send code" primary button
- After sending: OTP input (6 boxes, auto-advance)
- "Verify & continue" button
- "Resend code" ghost link (30-second cooldown timer)
- On first login only → name + college onboarding step (single extra screen)

**Onboarding Screen (first-time only):**
- "Tell us about yourself"
- Name input
- College name input (with autocomplete of major Indian colleges)
- Graduation year dropdown (2025, 2026, 2027)
- Target companies (multi-select chips: TCS, Infosys, Wipro, Startup, FAANG, Banking)
- "Let's go →" button
- Skip link

---

### Page 03 — Main Dashboard (`/dashboard`)

**Purpose:** Home screen after login. Shows current status, quick access, recent sessions.

**Layout:** Sidebar navigation (desktop) + top nav (mobile)

**Sidebar items:**
- Dashboard (home icon)
- Start Interview (mic icon)
- My Sessions (history icon)
- Progress (chart icon)
- Affiliate (share icon)
- Settings (gear icon)

**Dashboard Content Sections:**

#### Pack Status Banner
- If has active pack: "You have 6 rounds remaining (120 min left)"
- Progress bar showing minutes used vs total
- "Start now" CTA
- If no pack: "You have no active pack" + "Buy ₹499 pack" button
- If expired: "Your pack is used up. Add 5 more rounds for ₹199."

#### Quick Start Card
- Large card with mic icon
- "Start a new interview"
- Dropdown: Select company (TCS / Infosys / Startup / Custom)
- Dropdown: Select role (SDE / Backend / Frontend / Full Stack)
- "Begin →" button

#### Recent Sessions (last 3)
- Session card: Company + role + date + overall score badge + "View scorecard" link
- "View all sessions →" link

#### Progress Summary (3 metric cards)
- Average score (last 5 sessions)
- WPM improvement %
- Filler word reduction %

#### Upcoming Drives Banner (Growth Lead maintains this)
- "TCS NQT is visiting PICT Pune on [date] — Practice the TCS pack now"
- Links to company-specific interview start

---

### Page 04 — Interview Setup (`/interview/setup`)

**Purpose:** Configure the upcoming session before starting.

**Layout:** Single centered form, step-by-step flow.

**Step 1 — Select Interview Type**
- Company selector (large card grid):
  - TCS NQT
  - Infosys InfyTQ
  - Wipro NLTH
  - Accenture
  - Capgemini
  - D2C Startup (React/Node)
  - FAANG-style (Data Structures focus)
  - HR Behavioral (any company)
  - Custom (I'll describe my target)
- Each card shows: company logo area + round type + typical question style

**Step 2 — Select Round Type**
- Three options (radio cards):
  - HR Round — Behavioral, STAR answers, communication focus
  - Technical Round — DSA, system design, role-specific tech
  - Managerial Round — Leadership, conflict resolution, project ownership

**Step 3 — Language Preference**
- Three options:
  - English only
  - Hinglish (mix — recommended)
  - Hindi primary

**Step 4 — Paste Resume Summary**
- Label: "Paste 5–8 lines from your resume (projects, skills, experience)"
- Large text area (max 800 characters)
- Character counter
- Helper text: "The AI will ask specific questions about what you write here. Include your projects and tech stack."
- Example placeholder text shown

**Step 5 — Confirm & Start**
- Summary card showing selections
- Session preview: "This will use approximately 20 minutes and 1 round from your pack"
- Remaining rounds counter: "You have 6 rounds left after this"
- "Start interview →" large indigo button

---

### Page 05 — Interview Session (`/interview/session`)

**Purpose:** The core product. Real-time voice interview with the AI.

**CRITICAL:** This page has no navigation. No back button. No links out. Full-screen focus mode.

**Layout:**

#### Top Bar
- Company + role badge (left): "TCS NQT · Technical Round"
- Session timer (center): "12:34" — counting up
- Round indicator: "Question 3 of 10"
- Minutes remaining from pack: "187 min left in pack"
- End session button (right): subtle "End session" text — requires confirmation modal

#### Main Interview Area (center)

**AI Interviewer Status Panel:**
- Avatar: Simple animated circle with brand color
- Status indicator below avatar:
  - "Listening..." (green pulse) — when mic is active
  - "Thinking..." (indigo pulse) — when AI is processing
  - "Speaking..." (amber pulse) — when AI TTS is playing
- AI name: "Priya — HR Interviewer" or "Raj — Technical Interviewer" (voice persona name)

**Current Question Display:**
- Large text showing the current question being asked by AI
- Fades in as AI speaks it (synced with TTS)

**Live Transcription Feed:**
- Scrollable box showing real-time STT output
- User's words appear in real-time as they speak
- Color-coded: AI text in gray, user text in black
- Filler words highlighted in amber (um, uh, basically, like, matlab)
- Low-confidence words underlined in red dotted

**Audio Waveform:**
- Simple animated audio waveform bars at bottom
- Animates when user is speaking
- Flat when silent or AI is speaking

**Barge-In Instructions:**
- Small tooltip on first session: "Just start talking to interrupt the AI"
- Not a button — happens automatically via Saaras speech_start event

#### Bottom Bar
- Microphone status icon (green = listening, red = muted)
- Mute toggle button (emergency only — should not be used normally)
- Current WPM live indicator: "~134 WPM" (updates every 10 seconds)
- Current filler count: "3 fillers so far"

---

### Page 06 — Post-Interview Scorecard (`/interview/scorecard/:sessionId`)

**Purpose:** Show the full analysis of the completed session. This is the shareable output.

**Layout:** Single page, vertical scroll, clean editorial design.

#### Header
- "Interview Complete"
- Company + Role + Date
- Duration: "18 minutes 34 seconds"
- Overall score badge: large colored number "76 / 100"
  - 80+ = Green (Excellent)
  - 60–79 = Amber (Good)
  - Below 60 = Red (Needs Work)

#### Section 1 — Score Breakdown (4 metric cards)
- STAR Structure: X / 25
- Technical Accuracy: X / 25
- Communication: X / 25 (WPM + filler + clarity)
- Confidence: X / 25 (pause analysis + low-confidence word count)

#### Section 2 — STAR Method Analysis
- Per-answer STAR breakdown table:
  - Question | S | T | A | R | Total
  - Color-coded cells (green/amber/red per component)
- Below table: "Your weakest area: ACTION — you described what happened but not what YOU did specifically."

#### Section 3 — Voice Analytics
- WPM graph: bar chart per answer (benchmark line at 130 WPM)
- Filler word count: total + per-answer breakdown + most used fillers
- Pause analysis: timeline showing where long pauses (>3 seconds) occurred
- Language mix: "72% English, 28% Hindi/Hinglish" (from Saaras language detection)

#### Section 4 — Answer-by-Answer Feedback
- Expandable cards per question:
  - Question text (AI asked)
  - Your transcript (from Saaras)
  - AI feedback: specific 2–3 sentence improvement note
  - Score breakdown for this answer

#### Section 5 — Top 3 Improvements
- Large, clear, actionable:
  1. Use fewer filler words — you said "basically" 7 times. Replace with a pause.
  2. Add ACTION to behavioral answers — say what YOU did, not what the team did.
  3. Slow down in technical explanations — 160 WPM is too fast for complex topics.

#### Section 6 — Share & Download
- "Download PDF Scorecard" — indigo primary button
- "Share on LinkedIn" — LinkedIn blue button (opens pre-filled post)
- "Share on WhatsApp" — WhatsApp green button (opens pre-filled message)
- LinkedIn card preview: small preview of the shareable graphic
- WhatsApp text: "I just scored [X]/100 on a [TCS NQT] mock interview. Try it free → [link]"

#### Section 7 — Next Steps
- If rounds remaining: "You have 5 rounds left. Practice the weak areas identified above."
  - "Start another interview" button
- If 0 rounds remaining: "You've used all 10 rounds. Add 5 more for ₹199."
  - "Buy top-up pack" button
- Progress note: "Your average score improved from 71 to 76 over your last 3 sessions."

---

### Page 07 — Session History & Progress (`/dashboard/history`)

**Purpose:** See all past sessions and track improvement over time.

**Layout:** Two-column (desktop) — session list left, detail right.

#### Session List (left)
- Filter bar: All / TCS / Infosys / Startup / HR / Technical
- Sort: Most Recent / Highest Score / Lowest Score
- Each session card:
  - Company + role badge
  - Date + time
  - Duration
  - Overall score badge
  - WPM
  - "View scorecard" link

#### Progress Charts (right or full-width on mobile)
- Score trend line chart (last 10 sessions)
- WPM trend line chart
- Filler word trend (should go down over time)
- Best session highlight card
- "Days till graduation" countdown (from onboarding data)

---

### Page 08 — Payment Page (`/buy`)

**Purpose:** Buy a pack. Simple, friction-free, trust-building.

**Layout:** Centered, minimal. Max-width 480px card.

**Sections:**

#### Pack Selector
- Toggle between two options:
  - ₹499 Placement Pack (recommended — highlighted)
  - ₹199 Top-Up Pack

#### Pack Details
- What's included (bullet list with checkmarks)
- Rounds: 10 (or 5)
- Minutes: 200 (or 100) — hard cap noted clearly
- All features listed

#### Affiliate Code Input
- "Have a referral code? Enter it below"
- Code input field
- "Apply" button
- On valid code: "Code applied! Your friend gets ₹100." (show referrer's name)

#### Payment
- "Pay ₹499 with UPI / Card / Net Banking"
- Razorpay standard checkout button
- Payment methods icons: UPI, Visa, Mastercard, Net Banking
- Security note: "100% secure payment via Razorpay. We never see your card details."
- GST included note

#### Post-Payment
- Success screen: "You're ready. Let's practice."
- "Start your first interview →" button
- Email confirmation note: "Receipt sent to [email]"

---

### Page 09 — Affiliate Dashboard (`/affiliate`)

**Purpose:** Let campus partners track their referrals and earnings.

**Sections:**

#### Your Referral Code
- Large code display: "RAHUL2024" (generated from name + year)
- Copy button
- Share on WhatsApp button (pre-filled message)
- Share on Instagram (copy link)
- QR code for WhatsApp status / posters

#### Earnings Summary (3 cards)
- Total referrals this month
- Total earned (₹)
- Pending payout (₹)

#### Referral List Table
- Student name (masked: "Rohit M." for privacy)
- Date of signup
- Amount earned for this referral
- Status: Paid / Pending

#### Payout Details
- UPI ID input (for receiving payment)
- "Payouts processed every Sunday. Minimum payout: ₹200."
- Payout history table

---

### Page 10 — Settings (`/settings`)

**Layout:** Left nav (profile / account / pack / notifications) + content right.

#### Profile Settings
- Name, college, graduation year (editable)
- Email (non-editable — OTP login)
- Target companies (multi-select, editable)

#### Pack & Usage
- Current pack status
- Minutes used vs total (progress bar)
- Rounds remaining
- Expiry note (packs don't expire — but this field shows when added for reference)
- Purchase history table

#### Notifications (V2)
- Email notification: placement drive alerts
- WhatsApp (future)

#### Account
- "Delete my account and all data" — destructive button with confirmation

---

### Page 11 — Admin Dashboard (`/admin`) — Internal Only

**Access:** Restricted to team members via separate auth. Not indexed.

**Sections:**
- Total users (daily + cumulative)
- Revenue today / this week / this month
- API cost today (Sarvam STT + TTS + GPT-4o-mini)
- Net margin today
- Active sessions right now (real-time)
- Error log (last 50 errors from Sentry)
- Affiliate pending payouts (approve / reject)
- Flag list: users who triggered anti-gaming detection

---

### Page 12 — Drive-Specific Landing Pages (`/[company-slug]`)

**Example:** `/tcs-nqt-pune` · `/infosys-pune-2025`

**Purpose:** SEO + panic marketing. Students searching "TCS NQT prep Pune" land here.

**Sections:**
- Hero: "[Company] is visiting your campus. Are you ready?" + countdown timer to drive date
- Company-specific questions preview (3 sample questions)
- "Practice [Company] round now — ₹499"
- Past success stories from students who used this mode
- Same pricing + Razorpay CTA as main payment page

Growth Lead owns updating these pages 48 hours before each known drive.

---

## 6. Complete Feature List

### 6.1 Voice Engine Features (Sarvam-powered)

| # | Feature | V | Sarvam | Description |
|---|---|---|---|---|
| V-01 | Real-time STT streaming | V1 | Yes | Saaras v3 WebSocket — transcript appears as user speaks |
| V-02 | Streaming TTS playback | V1 | Yes | Bulbul v3 streams chunks — first word plays before full sentence ready |
| V-03 | Hinglish understanding | V1 | Yes | Saaras grades logic even when explained using matlab, toh, basically |
| V-04 | Barge-in interruption | V1 | Yes | Saaras speech_start event kills TTS instantly and switches to listen |
| V-05 | Filler word detection | V1 | Yes | Word-level output flags um, uh, like, basically, toh, aur per answer |
| V-06 | Word-level timestamps | V1 | Yes | Every word has start/end time — enables exact pause duration analysis |
| V-07 | Per-word confidence scoring | V1 | Yes | Low-confidence words flagged — detects guessing mid-answer |
| V-08 | Auto language detection | V1 | Yes | Sarvam identifies Hindi vs English vs Hinglish — no toggle needed |
| V-09 | Multi-persona AI voices | V1 | Yes | Different Bulbul voices per interviewer type — stern tech, warm HR |
| V-10 | VAD silence detection | V1 | Yes | Saaras silence gap — knows when user finished vs paused mid-thought |
| V-11 | Emotion-controlled TTS | V2 | Yes | Bulbul pitch/rate control — stern pushback, warm encouragement |
| V-12 | Noise robustness | V2 | Yes | Saaras works in hostel background noise — no quiet room required |

### 6.2 Interview Intelligence Features

| # | Feature | V | Description |
|---|---|---|---|
| I-01 | Company-specific modes | V1 | TCS NQT, Infosys, Wipro, Accenture, Startup, FAANG-style — different question banks |
| I-02 | Role-specific routing | V1 | SDE, React Dev, Backend, Data Science — AI adjusts depth per role |
| I-03 | Multi-round simulation | V1 | HR → Technical → Managerial — each has different AI persona |
| I-04 | Interview state machine | V1 | Intro → Warm-up → Core → Pushback → Closing — structured 20-min arc |
| I-05 | Resume-triggered questions | V1 | AI reads pasted resume, asks about specific projects and tech choices |
| I-06 | Adaptive follow-ups | V1 | Weak answer → probing follow-up — "Why that approach? Sounds unscalable." |
| I-07 | Difficulty auto-scaling | V1 | AI adjusts question depth based on quality of previous answers |
| I-08 | Technical depth probing | V1 | Goes from "what is X" to "how would you implement X at scale" dynamically |
| I-09 | Hinglish logic evaluation | V1 | Grades coding logic not grammar — Hinglish explanations not penalised |
| I-10 | Drive panic mode | V2 | Drive-specific landing page + targeted question set per company |
| I-11 | GD simulation | V2 | Group discussion — AI plays 3 competing participants simultaneously |
| I-12 | Mayura LLM option | V2 | Replace GPT-4o-mini with Sarvam Mayura for 100% Indian AI stack |

### 6.3 Analytics & Scoring Features

| # | Feature | V | Description |
|---|---|---|---|
| A-01 | STAR method scoring | V1 | Situation, Task, Action, Result — each scored separately per answer |
| A-02 | WPM tracking | V1 | Words per minute from Saaras timestamps — benchmark 120–150 WPM |
| A-03 | Filler word score | V1 | Count + % of fillers — displayed as Communication Clarity score |
| A-04 | Pause duration analysis | V1 | Long pauses (>3s) flagged with timestamp — shown as hesitation moments |
| A-05 | Per-word confidence metric | V1 | Saaras confidence scores — low confidence = uncertain answer detected |
| A-06 | Answer completeness score | V1 | Did user actually answer the question? LLM evaluation per answer |
| A-07 | Technical accuracy score | V1 | GPT-4o-mini validates factual correctness of technical answers |
| A-08 | Overall session score | V1 | Weighted composite — 25 pts each for STAR, Technical, Communication, Confidence |
| A-09 | Session progress graphs | V2 | Score trend across all sessions — user sees improvement over time |
| A-10 | Percentile ranking | V2 | User score vs all platform users — "76th percentile for TCS technical" |
| A-11 | Weakness pattern detection | V2 | AI identifies recurring weak topics across sessions |
| A-12 | Topic-wise breakdown radar | V2 | Score per topic — DSA, OOP, Communication, Confidence |

### 6.4 Post-Interview Features

| # | Feature | V | Description |
|---|---|---|---|
| P-01 | PDF scorecard download | V1 | A4 PDF — STAR scores, WPM, fillers, timeline, top 3 improvements |
| P-02 | LinkedIn share card | V1 | Auto-generated graphic with score — students share, product gets billboard |
| P-03 | WhatsApp result share | V1 | One-tap: "I scored 82/100 on TCS mock — try it free → [link]" |
| P-04 | Answer-by-answer feedback | V1 | Every answer gets specific, actionable improvement tip |
| P-05 | Top 3 improvements | V1 | Clear, prioritised next steps — not generic, not vague |
| P-06 | Session transcript | V1 | Full text transcript of entire interview session |
| P-07 | Audio replay with markers | V2 | Playback session with highlighted weak moments from Saaras timestamps |
| P-08 | AI Roast mode | V2 | Brutal Hinglish feedback — viral format — "Bhai ye answer career khatam karega" |

### 6.5 Monetisation Features

| # | Feature | V | Description |
|---|---|---|---|
| M-01 | ₹499 placement pack | V1 | 10 rounds, 200 min hard cap, one-time UPI payment |
| M-02 | ₹199 top-up pack | V1 | 5 more rounds, 100 min — shown on pack expiry with urgency |
| M-03 | Razorpay UPI integration | V1 | UPI + Card + Net Banking via Razorpay standard checkout |
| M-04 | Affiliate code system | V1 | 20% split (₹100) on each ₹499 sale — code tracked in PostgreSQL |
| M-05 | Redis hard cap enforcement | V1 | 200-min cap per pack enforced server-side — cannot be bypassed |
| M-06 | Anti-gaming detection | V1 | Redis hash of transcript fingerprints — detects replayed answers |
| M-07 | ₹299/month season pass | V2 | Unlimited rounds during placement season — recurring revenue |
| M-08 | College B2B license | V2 | ₹15K–40K/month per college — bulk access for placement cells |

### 6.6 Security & Infrastructure Features

| # | Feature | V | Description |
|---|---|---|---|
| S-01 | Supabase OTP auth | V1 | Email + 6-digit OTP — no passwords, sessions tied to real user IDs |
| S-02 | JWT session tokens | V1 | FastAPI verifies Supabase JWT on every WebSocket connection |
| S-03 | Cloudflare CDN + DDoS | V1 | Free tier — blocks attacks, caches assets, provides SSL |
| S-04 | Sentry error monitoring | V1 | Every backend crash reported with full stack trace — free tier |
| S-05 | UptimeRobot alerts | V1 | Pings FastAPI every 5 minutes, SMS alert on downtime — free |
| S-06 | Redis rate limiting | V1 | Max 10 API calls per minute per user, max 3 concurrent sessions |
| S-07 | Session timeout | V1 | New questions blocked after 20 minutes; session allowed to naturally conclude |
| S-08 | Payment webhook verification | V1 | Razorpay webhook signature verified before crediting pack |
| S-09 | Data encryption | V2 | Transcripts encrypted at rest in Supabase storage |

---

## 7. Sarvam AI Integration Spec

### 7.1 STT — Saaras v3 Real-Time

**Endpoint:** `wss://api.sarvam.ai/speech-to-text-realtime/ws`

**Connection flow:**
1. FastAPI opens WebSocket to Sarvam on session start
2. Audio chunks streamed from frontend → FastAPI → Sarvam (in parallel)
3. Sarvam returns word-by-word JSON with timestamps and confidence scores
4. FastAPI processes results, updates Redis transcript, forwards to frontend

**Config params:**
```json
{
  "language": "hi-en",
  "model": "saaras:v3",
  "with_timestamps": true,
  "with_confidence": true,
  "detect_language": true
}
```

**Word-level output used for:**
- Live transcription display (frontend)
- Filler word detection (filter for: um, uh, like, basically, toh, matlab, aur, so, you know)
- WPM calculation (word count ÷ elapsed time)
- Pause detection (gap between word end and next word start > 2.5 seconds)
- Confidence scoring (flag words where confidence < 0.6)

**Barge-in trigger:**
- Listen for `speech_start` event from Saaras
- On detection: immediately stop TTS playback on frontend
- FastAPI flushes Redis TTS buffer for this utterance
- FastAPI closes current TTS WebSocket connection
- FastAPI opens fresh connection and waits for new STT input

### 7.2 TTS — Bulbul v3 Streaming

**Endpoint:** `wss://api.sarvam.ai/text-to-speech/ws`

**Streaming strategy (sentence-boundary):**
1. GPT-4o-mini streams text token by token
2. FastAPI buffers tokens until first sentence boundary (. or ?)
3. FastAPI sends that first sentence to Bulbul v3 immediately
4. While Bulbul generates audio for sentence 1, GPT continues generating sentence 2
5. Audio chunks arrive and are immediately forwarded to frontend for playback
6. This gives perceived sub-800ms latency — user hears first words before AI finishes thinking

**Termination:**
- Use `send_completion_event=True` flag for clean stream end
- Frontend knows TTS is done — switches back to listening state

**Voice persona configs:**

| Persona | Voice ID | Rate | Pitch | Usage |
|---|---|---|---|---|
| Raj (Technical) | `bulbul-v3-male-1` | 1.0 | -0.1 | Technical rounds — neutral, clear |
| Priya (HR) | `bulbul-v3-female-1` | 0.95 | +0.1 | HR rounds — warm, conversational |
| Arjun (Startup) | `bulbul-v3-male-2` | 1.05 | 0.0 | Startup rounds — direct, fast-paced |
| Ananya (Senior) | `bulbul-v3-female-2` | 0.9 | -0.05 | Managerial — calm, measured |

### 7.3 Language Detection

- Saaras auto-detects language per utterance
- Store detected language per answer in PostgreSQL
- Use in scorecard: "Language mix: 68% English, 32% Hindi/Hinglish"
- Do not penalise Hindi/Hinglish answers — this is a product feature, not a bug

### 7.4 Sarvam Startup Program

- Apply at sarvam.ai when MVP is complete and first 10 beta users tested
- If selected: 6–12 months free API credits
- If rejected: continue on pay-per-use (₹30/hr STT, ₹30/10K chars TTS)
- Never build with Sarvam startup credit as a dependency — treat as bonus

---

## 8. Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  college TEXT,
  graduation_year INT,
  target_companies TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  referred_by UUID REFERENCES users(id)
)
```

### Packs Table
```sql
packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  pack_type TEXT NOT NULL,        -- 'placement_499' | 'topup_199'
  rounds_total INT NOT NULL,       -- 10 or 5
  rounds_used INT DEFAULT 0,
  minutes_total INT NOT NULL,      -- 200 or 100
  minutes_used INT DEFAULT 0,
  payment_id TEXT,                 -- Razorpay payment ID
  affiliate_code TEXT,             -- Code used at purchase
  created_at TIMESTAMPTZ DEFAULT now()
)
```

### Sessions Table
```sql
sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  pack_id UUID REFERENCES packs(id) NOT NULL,
  company TEXT NOT NULL,           -- 'tcs_nqt' | 'infosys' | 'startup' | ...
  role TEXT NOT NULL,              -- 'sde' | 'backend' | 'frontend' | ...
  round_type TEXT NOT NULL,        -- 'hr' | 'technical' | 'managerial'
  language_pref TEXT DEFAULT 'hinglish',
  resume_text TEXT,
  status TEXT DEFAULT 'active',    -- 'active' | 'completed' | 'abandoned'
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  overall_score INT,
  star_score INT,
  technical_score INT,
  communication_score INT,
  confidence_score INT,
  wpm_avg INT,
  filler_count INT,
  pause_count INT
)
```

### Session Answers Table
```sql
session_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) NOT NULL,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  answer_transcript TEXT,
  answer_duration_seconds INT,
  wpm INT,
  filler_words JSONB,              -- {word: count, ...}
  pause_timestamps JSONB,          -- [{start, duration}, ...]
  star_s INT, star_t INT, star_a INT, star_r INT,
  answer_score INT,
  ai_feedback TEXT,
  confidence_avg FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

### Payments Table
```sql
payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  razorpay_order_id TEXT,
  amount_paise INT NOT NULL,       -- 49900 for ₹499
  status TEXT NOT NULL,            -- 'pending' | 'completed' | 'failed'
  affiliate_code TEXT,
  pack_id UUID REFERENCES packs(id),
  created_at TIMESTAMPTZ DEFAULT now()
)
```

### Affiliates Table
```sql
affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  code TEXT UNIQUE NOT NULL,
  upi_id TEXT,
  total_referrals INT DEFAULT 0,
  total_earned_paise INT DEFAULT 0,
  total_paid_paise INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

### Affiliate Payouts Table
```sql
affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id) NOT NULL,
  payment_id UUID REFERENCES payments(id) NOT NULL,
  amount_paise INT NOT NULL,       -- 9980 (20% of ₹499)
  status TEXT DEFAULT 'pending',   -- 'pending' | 'paid'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

### Redis Keys Spec

| Key Pattern | TTL | Value | Purpose |
|---|---|---|---|
| `session:{session_id}:transcript` | 2 hours | List of {speaker, text, timestamp} | Live interview context for LLM |
| `session:{session_id}:state` | 2 hours | JSON (current_q, stage, company, role) | Interview state machine |
| `session:{session_id}:minutes` | 2 hours | Float | Running minute counter for cap |
| `user:{user_id}:rate` | 1 minute | Int (increments) | Rate limiting counter |
| `user:{user_id}:active_sessions` | 2 hours | Set of session_ids | Max concurrent session check |
| `pack:{pack_id}:minutes_used` | 30 days | Float | Pack minute usage (synced to DB) |
| `pack:{pack_id}:rounds_used` | 30 days | Int | Pack round usage (synced to DB) |
| `transcript_hash:{user_id}` | 7 days | Set of MD5 hashes | Anti-gaming fingerprints |

---

## 9. Business Logic & Pricing

### Pack Lifecycle
1. User pays ₹499 → Razorpay webhook fires → FastAPI verifies signature → creates `pack` record → credits user
2. User starts session → FastAPI checks: rounds_used < rounds_total AND minutes_used < minutes_total
3. If either cap exceeded → reject session start with clear error message
4. During session: Redis increments minutes_used every 60 seconds
5. If minutes_used hits cap mid-session → FastAPI sends warning to frontend → ends session gracefully after current answer
6. On session complete → PostgreSQL updated with final minutes and round count
7. Redis and PostgreSQL always kept in sync — Redis for speed, PostgreSQL for truth

### Affiliate System Logic
1. Affiliate registers → unique code generated (NAME + YEAR, e.g., RAHUL2025)
2. New buyer enters code at checkout → code stored in Razorpay order metadata
3. Payment completes → webhook fires → if affiliate_code valid → create affiliate_payout record (₹9,980 for ₹499 sale)
4. Every Sunday → admin reviews pending payouts → bulk UPI transfer → mark as paid
5. Minimum payout threshold: ₹200 (accumulate until this is reached)
6. Affiliate sees real-time dashboard (earnings, pending, referral count)

### Anti-Gaming Detection
1. On session end → generate MD5 hash of full transcript
2. Check against `transcript_hash:{user_id}` Redis set
3. If hash already exists → flag session in admin dashboard + do not credit round refund
4. Add new hash to set (TTL 7 days)
5. Detected gaming: admin manually reviews flagged sessions

### Payment Failure Handling
1. Razorpay payment fails → do not create pack → redirect to retry page
2. Webhook fires with failed status → log in payments table, status = 'failed'
3. User sees: "Payment not completed. Try again or contact support."
4. Support email shown on failure page

---

## 10. API Cost Calculation

### Per Session (20-minute interview, user speaks 12 min)

| Component | Calculation | Cost |
|---|---|---|
| Sarvam Saaras STT | 12 min × ₹0.50/min | ₹6.00 |
| Sarvam Bulbul TTS | 10 questions × 300 chars = 3,000 chars × (₹30/10K) | ₹9.00 |
| GPT-4o-mini LLM | ~50K input tokens + 3K output × rates | ₹0.80 |
| **Total per session** | | **₹15.80** |

### Pack Economics (10 sessions, ₹499)

| Item | Amount |
|---|---|
| Revenue per pack | ₹499.00 |
| Razorpay fee (2%) | -₹9.98 |
| API cost (10 sessions × ₹15.80) | -₹158.00 |
| Affiliate cut (if code used, 20%) | -₹99.80 |
| **Net profit (with affiliate)** | **₹231.22** |
| **Net profit (no affiliate)** | **₹331.02** |
| **Margin (with affiliate)** | **46%** |
| **Margin (no affiliate)** | **66%** |

### Monthly Infrastructure Cost at Scale

| Users | Vercel | Railway | Supabase | Total Infra |
|---|---|---|---|---|
| 0–100 | ₹0 (free) | ₹420 | ₹0 (free) | ₹420 |
| 100–500 | ₹1,680 | ₹420 | ₹2,100 | ₹4,200 |
| 500–2000 | ₹1,680 | ₹840 | ₹2,100 | ₹4,620 |

### Revenue Projections

| Month | Packs Sold | Revenue | API + Infra | Net Profit |
|---|---|---|---|---|
| 1 | 0 (beta) | ₹0 | ₹420 | -₹420 |
| 2 | 40 | ₹19,960 | ₹7,740 | ₹12,220 |
| 3 | 120 | ₹59,880 | ₹23,820 | ₹36,060 |
| 4 | 280 | ₹1,39,720 | ₹53,620 | ₹86,100 |
| 5 | 500 | ₹2,49,500 | ₹96,420 | ₹1,53,080 |
| 6 | 700 | ₹3,49,300 | ₹1,29,820 | ₹2,19,480 |

---

## 11. Security & Infrastructure

### Environment Variables Required

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.in
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
```

**Backend (.env):**
```
SARVAM_API_KEY=xxx
OPENAI_API_KEY=xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
REDIS_URL=rediss://xxx.upstash.io:6380
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
SENTRY_DSN=xxx
ENVIRONMENT=production
```

### Deployment Checklist
- [ ] Cloudflare DNS configured — A record pointing to Railway
- [ ] Vercel domain configured — CNAME to Vercel
- [ ] SSL active on both (Cloudflare handles)
- [ ] UptimeRobot monitor added for FastAPI health endpoint `/health`
- [ ] Sentry DSN configured in FastAPI and Next.js
- [ ] Razorpay webhook URL registered: `https://api.yourdomain.in/webhooks/razorpay`
- [ ] All env vars set in Railway and Vercel dashboards
- [ ] Redis TLS connection verified (Upstash requires TLS)
- [ ] Supabase row-level security (RLS) enabled on all tables

### FastAPI Health Endpoint
```python
@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow()}
```

---

## 12. 30-Phase Build Roadmap

### How to Read This
- Each phase = 1–2 days of focused work
- Assigned person owns the phase completely
- Each phase has an acceptance criteria — the phase is not done until criteria is met
- Phases must be completed in order (dependencies exist)

---

### Phase 01 — Project Setup & Monorepo Structure
**Owner:** Backend Lead  
**Duration:** Day 1

**Tasks:**
- Create GitHub repository with monorepo structure: `/frontend` and `/backend` folders
- Set up Next.js 14 app in `/frontend` with Tailwind CSS and TypeScript
- Set up FastAPI project in `/backend` with Poetry for dependency management
- Create `.env.example` files for both — never commit real keys
- Set up ESLint + Prettier for frontend
- Set up Ruff + Black for backend Python
- Create initial README with architecture overview
- Set up GitHub branch rules: `main` is protected, all work in feature branches

**Acceptance Criteria:**
- `npm run dev` in frontend starts Next.js on localhost:3000 with Tailwind working
- `uvicorn main:app --reload` in backend starts FastAPI on localhost:8000
- `/health` endpoint returns `{"status": "ok"}`

---

### Phase 02 — Database Schema & Supabase Setup
**Owner:** Backend Lead  
**Duration:** Day 1–2

**Tasks:**
- Create Supabase project
- Run all SQL from Section 8 of this document to create tables
- Enable Row Level Security on all user-facing tables
- Write RLS policies: users can only read/write their own records
- Create Supabase indexes: `sessions.user_id`, `packs.user_id`, `affiliates.code`
- Set up Supabase storage bucket for PDF scorecards
- Test all table inserts manually in Supabase dashboard

**Acceptance Criteria:**
- All 7 tables exist in Supabase
- RLS prevents user A from reading user B's sessions
- PDF storage bucket exists and is private

---

### Phase 03 — Authentication System (Supabase OTP)
**Owner:** Frontend Lead  
**Duration:** Day 2–3

**Tasks:**
- Install Supabase JS client in Next.js
- Build `/auth` page: email input → OTP input flow
- Implement Supabase `signInWithOtp()` email flow
- Store session token in Supabase auth (handled automatically)
- Create auth middleware for protected routes (redirect to /auth if not logged in)
- Build first-time onboarding screen: name + college + year + target companies
- Save onboarding data to `users` table via FastAPI (not directly to Supabase from frontend)
- Backend: create FastAPI middleware to verify Supabase JWT on protected endpoints

**Acceptance Criteria:**
- User can sign in with email OTP
- New user sees onboarding screen exactly once
- Protected routes redirect to /auth if no session
- FastAPI rejects requests without valid JWT with 401

---

### Phase 04 — Redis Setup & Session Management
**Owner:** Backend Lead  
**Duration:** Day 2

**Tasks:**
- Create Upstash Redis account and database (TLS required)
- Install `redis` Python package
- Create `redis_client.py` with connection pool setup
- Implement helper functions:
  - `set_session_state(session_id, data)` — TTL 2 hours
  - `get_session_state(session_id)` — returns None if expired
  - `increment_session_minutes(session_id, pack_id)` — atomic increment
  - `check_rate_limit(user_id)` — returns True if under limit
  - `check_concurrent_sessions(user_id)` — returns count
- Write unit tests for all Redis helpers

**Acceptance Criteria:**
- All Redis helpers work correctly in unit tests
- Session data persists for 2 hours and auto-expires
- Rate limit correctly blocks at 10 calls/minute

---

### Phase 05 — Sarvam TTS Integration (Text → Voice)
**Owner:** Backend Lead  
**Duration:** Day 3–4

**Tasks:**
- Register for Sarvam AI API key
- Study Bulbul v3 WebSocket documentation thoroughly
- Implement `sarvam_tts.py`:
  - `connect_bulbul(voice_id, rate, pitch)` — open WebSocket connection
  - `stream_text_to_bulbul(ws, text_chunk)` — send text chunk
  - `receive_audio_chunks(ws)` — async generator yielding audio bytes
  - `close_tts_connection(ws)` — with `send_completion_event=True`
- Test with hardcoded text: "Good morning! I am your AI interviewer today."
- Test all 4 voice personas (Raj, Priya, Arjun, Ananya)
- Test Hindi text with Sarvam voices
- Measure latency: time from text send to first audio byte received

**Acceptance Criteria:**
- Audio plays cleanly in terminal test (save to .wav and play)
- All 4 personas produce distinct voices
- First audio chunk arrives within 500ms of text send

---

### Phase 06 — Sarvam STT Integration (Voice → Text)
**Owner:** Backend Lead  
**Duration:** Day 4–5

**Tasks:**
- Implement `sarvam_stt.py`:
  - `connect_saaras(language)` — open WebSocket with config from Section 7.1
  - `stream_audio_to_saaras(ws, audio_chunk)` — stream PCM bytes
  - `receive_transcript(ws)` — async generator yielding word-level JSON
  - Parse word-level output: extract text, timestamp, confidence per word
  - Detect filler words from word list: um, uh, like, basically, toh, matlab, aur, so, you know
- Test with pre-recorded .wav files (English, Hindi, Hinglish)
- Measure accuracy on Hinglish input specifically
- Test language detection output

**Acceptance Criteria:**
- STT correctly transcribes English test audio
- STT correctly transcribes Hinglish test audio (test phrase: "Basically matlab what I'm saying is...")
- Filler word detection correctly flags known fillers
- Word-level timestamps accurate to within 100ms

---

### Phase 07 — Browser Audio Capture (AudioWorklet)
**Owner:** Frontend Lead  
**Duration:** Day 4–5

**Tasks:**
- Create `audio-processor.worklet.js` file in Next.js public folder
- Implement AudioWorklet that captures mic at 16kHz mono PCM
- Convert Float32Array to Int16Array for efficient transmission
- Create `useAudioCapture()` React hook:
  - Request mic permission
  - Start/stop capture
  - Emit audio chunks as ArrayBuffer (binary)
- Create simple test page at `/test-audio`:
  - Button to start recording
  - Shows "Recording..." indicator
  - Logs chunk sizes to console
  - Stop button

**Acceptance Criteria:**
- Chrome/Firefox requests mic permission correctly
- AudioWorklet captures audio at 16kHz
- Binary chunks emitted every 100ms (approx)
- No echo or feedback loop

---

### Phase 08 — WebSocket Audio Pipeline (Frontend → Backend)
**Owner:** Backend Lead + Frontend Lead (parallel, integrate together)  
**Duration:** Day 5–6

**Tasks:**

Frontend:
- Create `useInterviewWebSocket()` hook
- Open WebSocket connection to `wss://api.yourdomain.in/ws/interview/{session_id}`
- Send binary audio chunks as received from AudioWorklet
- Receive messages from backend:
  - `{type: "transcript", text, confidence, is_filler}` → update live transcript
  - `{type: "ai_speaking", text}` → show question text
  - `{type: "audio_chunk", data}` → play audio via Web Audio API
  - `{type: "session_state", state}` → update session UI
  - `{type: "error", message}` → show error
  - `{type: "session_end"}` → redirect to scorecard

Backend:
- Create WebSocket endpoint `/ws/interview/{session_id}`
- Verify JWT on connection open
- Check pack availability before allowing session
- Start Saaras STT WebSocket connection (backend → Sarvam)
- Forward audio chunks: frontend → FastAPI → Sarvam
- Forward transcripts: Sarvam → FastAPI → frontend

**Acceptance Criteria:**
- User speaks into mic
- Text appears in browser within 500ms of speaking
- Pipeline is stable for 5 minutes without disconnection
- Binary audio correctly transmitted (not base64)

---

### Phase 09 — GPT-4o-mini Interview State Machine
**Owner:** AI Lead  
**Duration:** Day 5–7

**Tasks:**
- Design interview state machine:
  ```
  STATES: intro → warmup → core_questions → technical_pushback → closing
  ```
- Write system prompt for each company mode (TCS, Infosys, Startup, HR Behavioral)
- Implement strict JSON output schema:
  ```json
  {
    "next_question": "string",
    "stage": "string",
    "follow_up_needed": boolean,
    "follow_up_reason": "string",
    "evaluation": {
      "star_s": 0-5, "star_t": 0-5, "star_a": 0-5, "star_r": 0-5,
      "technical_score": 0-10,
      "answer_complete": boolean
    }
  }
  ```
- Implement `interview_engine.py`:
  - `get_next_question(state, transcript, resume_text)` — GPT-4o-mini call
  - `evaluate_answer(question, answer, company_mode)` — STAR + technical scoring
  - `generate_final_scorecard(all_answers)` — session-level scoring
- Implement adaptive follow-up logic:
  - If star_a < 3: follow up with "What specifically did YOU do in that situation?"
  - If technical_score < 4: follow up with "Can you explain how that would work at scale?"
  - If answer_complete = false: follow up with "Could you elaborate on that?"
- Load resume_text into system prompt for project-specific questions

**Acceptance Criteria:**
- State machine progresses correctly through all stages in a test run
- JSON output never fails validation (use Pydantic model)
- Adaptive follow-up correctly triggered on weak test answers
- Resume-specific question correctly references project from pasted text

---

### Phase 10 — Sentence-Boundary Streaming (Latency Core)
**Owner:** Backend Lead + AI Lead  
**Duration:** Day 7

**Tasks:**
- Implement sentence boundary detector in FastAPI:
  - Buffer GPT-4o-mini streaming tokens
  - Detect boundaries at: `. ` `? ` `! ` `, ` (comma for natural pause)
  - On boundary: flush buffer to Sarvam TTS immediately
  - Continue buffering next sentence while TTS processes previous
- Measure end-to-end latency: user stops speaking → first AI audio byte plays
- Target: under 800ms
- Log latency for every turn to identify bottlenecks

**Acceptance Criteria:**
- First AI audio word plays within 800ms of user finishing answer
- No audio glitches between sentences (seamless playback)
- Latency log shows consistent sub-800ms performance

---

### Phase 11 — Barge-In Interruption Handling
**Owner:** Backend Lead  
**Duration:** Day 7–8

**Tasks:**
- Listen for `speech_start` event in Saaras STT stream
- On detection:
  - Send `{type: "barge_in"}` message to frontend immediately
  - Flush TTS audio buffer: stop sending audio chunks
  - Close current Bulbul TTS WebSocket connection
  - Wipe current utterance from Redis transcript
  - Open new Saaras STT connection ready for new input
- Frontend on `barge_in`:
  - Stop Web Audio API playback immediately (drain audio buffer)
  - Show "Listening..." state
  - Clear current question display
- Test barge-in: AI speaks a long answer, user interrupts mid-sentence, AI stops

**Acceptance Criteria:**
- AI stops within 200ms of user starting to speak
- No audio bleeding (old TTS audio does not continue playing)
- New question cycle begins correctly after barge-in

---

### Phase 12 — WPM, Pause, and Filler Analysis
**Owner:** AI Lead  
**Duration:** Day 8

**Tasks:**
- Implement `audio_analytics.py`:
  ```python
  def calculate_wpm(word_timestamps: list) -> float
  def detect_pauses(word_timestamps: list, threshold_ms: int = 2500) -> list
  def count_fillers(words: list) -> dict
  def calculate_confidence_avg(words: list) -> float
  ```
- WPM: total_words ÷ (last_word_end_ms - first_word_start_ms) × 60,000
- Pauses: gap between word_end[i] and word_start[i+1] > threshold
- Fillers: match against filler word list, return {word: count} dict
- Confidence average: mean of all word confidence scores
- Store all analytics per answer in `session_answers` table
- Unit test all four functions with sample Saaras outputs

**Acceptance Criteria:**
- WPM calculation correct on test transcript (verify manually)
- Pause detection correctly identifies gaps > 2.5 seconds
- Filler detection correctly flags all words in filler list
- All results correctly stored in PostgreSQL

---

### Phase 13 — Interview Session UI (Frontend)
**Owner:** Frontend Lead  
**Duration:** Day 8–10

**Tasks:**
- Build `/interview/session` page as described in Section 5, Page 05
- Components needed:
  - `<InterviewerAvatar status="listening|thinking|speaking" />`
  - `<LiveTranscriptFeed words={[]} fillerWords={[]} lowConfidenceWords={[]} />`
  - `<AudioWaveform isActive={bool} />`
  - `<SessionTimer startTime={Date} />`
  - `<QuestionCounter current={3} total={10} />`
  - `<MinutesRemaining minutes={187} />`
  - `<EndSessionButton onConfirm={fn} />`
- Wire all components to WebSocket messages from Phase 08
- Filler words highlighted in amber in transcript
- Low confidence words underlined in red dotted
- No navigation, no back button — full screen focus mode
- "End session" requires confirmation modal

**Acceptance Criteria:**
- Full session runs in browser: speak → transcript appears → AI responds with voice
- Barge-in works from UI perspective (voice stops, listening state shown)
- Timer counts up correctly
- Filler words highlighted correctly in transcript feed

---

### Phase 14 — Interview Setup UI (Frontend)
**Owner:** Frontend Lead  
**Duration:** Day 9–10

**Tasks:**
- Build `/interview/setup` page as described in Section 5, Page 04
- 6-step flow with progress indicator at top
- Step 1: Mic Check Gateway (Mandatory: user must speak and volume meter must register audio before proceeding)
- Step 2: Company selector (card grid with icons)
- Step 3: Round type (radio cards)
- Step 4: Language preference (3 options)
- Step 5: Resume paste (text area, 800 char max, counter)
- Step 6: Confirm + start (shows what will be used from pack)
- Navigation: back button between steps
- Validation: company and round type are required, resume is optional
- On "Start interview" → call POST `/api/sessions/start` → receive session_id → redirect to `/interview/session`

**Acceptance Criteria:**
- All 6 steps navigable with back/forward
- Mic check strictly prevents moving forward if no audio is detected
- Required field validation prevents starting without company + round type
- Resume text correctly passed to backend on session start
- Session start correctly debited from pack (rounds_used incremented)

---

### Phase 15 — Pack Management & Rate Limiting
**Owner:** Backend Lead  
**Duration:** Day 10

**Tasks:**
- Implement endpoints:
  - `GET /api/packs/status` — return active pack + minutes used + rounds remaining
  - `POST /api/sessions/start` — validate pack, create session, return session_id
  - `POST /api/sessions/{id}/end` — save final analytics, debit pack, return scorecard
- Pack validation logic:
  - Check `rounds_used < rounds_total` — else 403 "No rounds remaining"
  - Check `minutes_used < minutes_total` — else 403 "No minutes remaining"
  - Increment Redis and PostgreSQL atomically on session start
- Session timeout enforcement:
  - Redis key `session:{id}:question_block` with 20-minute TTL
  - FastAPI checks time elapsed before asking next question — if > 20 min, proceed to closing stage
- Rate limiting middleware: check `user:{id}:rate` before any API call

**Acceptance Criteria:**
- Pack correctly debited on session start
- Session rejected correctly when pack is exhausted
- Session blocks new questions after 20 minutes and naturally concludes
- Rate limit correctly blocks rapid API calls

---

### Phase 16 — Scorecard Generation
**Owner:** AI Lead + Frontend Lead  
**Duration:** Day 11–12

**Tasks:**

AI Lead:
- Implement `scorecard_generator.py`:
  - `calculate_overall_score(session_answers)` — weighted 25pts each category
  - `generate_top_improvements(session_answers)` — GPT-4o-mini generates 3 specific, actionable tips
  - `generate_per_answer_feedback(answer)` — GPT-4o-mini generates 2-3 sentence improvement note
  - `detect_star_weakest_component(answers)` — identify lowest avg S/T/A/R across session
- Store scorecard data in `sessions` table on session end

Frontend Lead:
- Build `/interview/scorecard/:sessionId` page as described in Section 5, Page 06
- Components: score badge, STAR table, communication clarity badge (Fast/Slow/Good), answer cards
- "Download PDF" button (Phase 17)
- "Share LinkedIn" and "Share WhatsApp" buttons
- Overall score colour-coded: 80+ green, 60-79 amber, below 60 red

**Acceptance Criteria:**
- Scorecard displays all analytics correctly after a real test session
- STAR table correctly shows per-answer breakdown
- Communication clarity badges render correctly based on WPM
- Top 3 improvements are specific and relevant (not generic)

---

### Phase 17 — PDF Scorecard Generation
**Owner:** Frontend Lead  
**Duration:** Day 12

**Tasks:**
- Use `react-pdf` or `jsPDF` library in Next.js
- Design PDF template:
  - 1-Page Summary: Logo, overall score, STAR breakdown, top 3 improvements, and actionable feedback
- Generate PDF client-side (avoid server cost)
- Filename: `[CompanyName]-[Date]-Score[X].pdf`
- LinkedIn card: generate 1200×630 PNG (open graph image) using html-to-canvas
- WhatsApp message: pre-compose using `wa.me` link with encoded text

**Acceptance Criteria:**
- PDF downloads correctly in Chrome and Safari
- PDF looks professional — no layout overflow or broken elements
- LinkedIn share button opens LinkedIn compose with image + text pre-filled
- WhatsApp share button opens WhatsApp with pre-written message

---

### Phase 18 — Razorpay Integration
**Owner:** Growth Lead + Backend Lead  
**Duration:** Day 12–13

**Tasks:**

Backend Lead:
- Create Razorpay order creation endpoint: `POST /api/payments/create-order`
- Implement webhook handler: `POST /webhooks/razorpay`
  - Verify Razorpay webhook signature (HMAC SHA256)
  - On `payment.captured` → create pack record in PostgreSQL → update affiliate payouts
  - On `payment.failed` → log failure, send user notification
- Affiliate code validation at order creation: check `affiliates.code` table

Growth Lead:
- Build `/buy` payment page as described in Section 5, Page 08
- Integrate Razorpay JS checkout
- Handle success callback → show success screen + redirect to interview
- Handle failure → show retry page
- Affiliate code input with real-time validation (API call)

**Acceptance Criteria:**
- ₹1 test payment completes end-to-end in Razorpay test mode
- Pack created in PostgreSQL after successful payment
- Affiliate payout record created when code was used
- Webhook signature verification rejects invalid webhooks

---

### Phase 19 — Dashboard UI
**Owner:** Frontend Lead  
**Duration:** Day 13–14

**Tasks:**
- Build `/dashboard` page as described in Section 5, Page 03
- Sidebar navigation with all routes
- Pack status banner (pulls from GET /api/packs/status)
- Low Balance Warning: Lock "Start" button if rounds = 0 and show glowing "Top Up" button. Warning banner if 1 round left.
- Quick start card with company + role selectors → redirects to /interview/setup
- Recent sessions (last 3) from GET /api/sessions?limit=3
- Progress metric cards (average score, WPM trend, filler trend)
- Upcoming drives banner (hardcoded initially, maintained by Growth Lead)
- Mobile: sidebar collapses to bottom tab navigation

**Acceptance Criteria:**
- Dashboard loads and shows correct pack status
- Recent sessions display with correct data
- Navigation works on both desktop and mobile
- Quick start successfully initiates interview setup flow

---

### Phase 20 — Landing Page
**Owner:** Growth Lead + Frontend Lead  
**Duration:** Day 13–15

**Tasks:**

Growth Lead:
- Write all copy: hero headline, subheadline, pain cards, feature descriptions, FAQ answers, CTA text
- Source any placeholder images or mockup screenshots
- Write testimonial placeholders (to be replaced with real ones post-launch)
- Define company logos to show in the logos row

Frontend Lead:
- Build `/` landing page as described in Section 5, Page 01 — all 13 sections
- Animate hero section with Framer Motion (simple fade-in)
- Ensure page scores 90+ on Google Lighthouse for performance
- Mobile responsive for all sections
- All CTAs link to correct destinations

**Acceptance Criteria:**
- Landing page loads in under 2 seconds
- All 13 sections present and correctly styled
- Mobile layout correct on 375px viewport
- All CTAs route to correct pages
- Lighthouse score 90+ performance

---

### Phase 21 — Company Question Banks
**Owner:** AI Lead  
**Duration:** Day 14–15

**Tasks:**
- Research and compile question banks for each mode:
  - TCS NQT: verbal ability, reasoning, Java/SQL definitions, pseudo-code
  - Infosys InfyTQ: Python, data structures, HR behavioral
  - Wipro NLTH: aptitude, communication, technical basics
  - Startup React Dev: React hooks, state management, API integration, system design basics
  - HR Behavioral: STAR-format questions — leadership, conflict, failure, teamwork
  - FAANG-style: DSA, time complexity, system design
- Implement question bank as structured JSON files with difficulty tiers
- Write GPT-4o-mini system prompts per company that inject question bank context
- Implement resume-injection prompt: parse pasted resume text, extract 3–5 key projects, inject as context

**Acceptance Criteria:**
- Each company mode produces distinctly different interview experience
- TCS mode asks Java/SQL definitions, not system design
- Startup mode asks React-specific questions
- Resume-injected questions correctly reference user's stated projects

---

### Phase 22 — Session History & Progress Page
**Owner:** Frontend Lead  
**Duration:** Day 15

**Tasks:**
- Build `/dashboard/history` page as described in Section 5, Page 07
- Session list with filters (by company, round type)
- Sorting (recent, highest score, lowest score)
- Score trend chart (Chart.js line chart)
- Communication clarity trend (badges)
- Each session card links to its scorecard
- Pagination: 10 sessions per page

**Acceptance Criteria:**
- All past sessions display correctly
- Filter by company works correctly
- Score trend chart renders with correct data points
- Links to individual scorecards work

---

### Phase 23 — Affiliate Dashboard
**Owner:** Growth Lead + Backend Lead  
**Duration:** Day 15–16

**Tasks:**

Backend Lead:
- Implement endpoints:
  - `POST /api/affiliates/register` — generate unique code for user
  - `GET /api/affiliates/dashboard` — return referrals, earnings, pending payout
  - `GET /api/affiliates/payouts` — return payout history

Growth Lead:
- Build `/affiliate` page as described in Section 5, Page 09
- Referral code display with copy button
- WhatsApp share button (pre-filled message with referral link)
- QR code generation for referral link (use `qrcode.react` library)
- Earnings summary cards
- Referral list table (masked names for privacy)
- UPI ID input for payout

**Acceptance Criteria:**
- Unique affiliate code generated per user
- WhatsApp share sends correct message with correct link
- QR code correctly encodes referral URL
- Earnings correctly calculated and displayed

---

### Phase 24 — Anti-Gaming & Security Hardening
**Owner:** Backend Lead  
**Duration:** Day 16

**Tasks:**
- Implement transcript fingerprinting:
  - On session end: MD5 hash of normalized transcript (lowercase, strip punctuation)
  - Check against Redis set `transcript_hash:{user_id}` — flag if duplicate
  - Add to set regardless (prevent future gaming)
- Implement session concurrency check:
  - On WebSocket connect: check `user:{id}:active_sessions` Redis set
  - If >= 3 sessions: reject with clear error
- Implement JWT verification middleware on all FastAPI routes
- Verify Razorpay webhook signatures on all webhook calls
- Add CORS configuration: only allow requests from your Vercel domain
- Add input sanitisation on resume text (strip HTML/JS)

**Acceptance Criteria:**
- Duplicate transcript correctly flagged in admin view
- Third concurrent session correctly rejected
- Requests without valid JWT correctly rejected with 401
- CORS correctly blocks requests from other origins

---

### Phase 25 — Error Monitoring & Uptime
**Owner:** Backend Lead  
**Duration:** Day 16

**Tasks:**
- Install Sentry SDK in FastAPI (`sentry-sdk[fastapi]`)
- Install Sentry SDK in Next.js (`@sentry/nextjs`)
- Configure Sentry DSN in both environments
- Set up Sentry alerts: Slack/email notification on new error
- Create UptimeRobot monitor for `https://api.yourdomain.in/health`
- Set UptimeRobot alert: SMS to both Backend Lead and Growth Lead phones
- Create Cloudflare account and configure DNS:
  - Root domain → Vercel
  - `api.` subdomain → Railway
- Enable Cloudflare proxy (orange cloud) on both

**Acceptance Criteria:**
- Throw a test exception → Sentry captures it within 30 seconds
- Take backend offline for 6 minutes → UptimeRobot sends SMS alert
- Cloudflare shows both domains protected (proxied)
- SSL working on both frontend and backend domains

---

### Phase 26 — Settings Page
**Owner:** Frontend Lead  
**Duration:** Day 17

**Tasks:**
- Build `/settings` page as described in Section 5, Page 10
- Profile section: name, college, year, target companies (all editable)
- Pack & Usage section: read-only display from pack API
- Account section: delete account with double confirmation modal
- Update profile hits `PUT /api/users/profile`
- Delete account hits `DELETE /api/users/me` — deletes all user data from Supabase

**Acceptance Criteria:**
- Profile edits save correctly
- Pack status shows correct remaining rounds and minutes
- Delete account removes user from database

---

### Phase 27 — Drive-Specific Landing Pages
**Owner:** Growth Lead  
**Duration:** Day 17–18

**Tasks:**
- Create dynamic route `/[company-slug]` in Next.js
- Build template for drive-specific pages as described in Section 5, Page 12
- Create content file (JSON or MDX) for each company:
  - Company name, logo, drive date, typical questions, CTA text
- Build countdown timer component (days:hours:minutes till drive date)
- Growth Lead maintains drive dates manually — update JSON file per drive
- Generate pages for at minimum: TCS, Infosys, Wipro, Capgemini, Accenture
- Add basic SEO metadata per page (`og:title`, `og:description`)

**Acceptance Criteria:**
- `/tcs-nqt-pune` loads correctly with TCS-specific content
- Countdown timer shows correct time till drive date
- SEO metadata correct (verify with Facebook debugger)
- CTA links to payment page with company pre-selected

---

### Phase 28 — Admin Dashboard (Internal)
**Owner:** Backend Lead + AI Lead  
**Duration:** Day 18–19

**Tasks:**
- Create `/admin` route — restricted to team member email list only
- Build admin dashboard as described in Section 5, Page 11:
  - User count (daily signups + total)
  - Revenue (today, week, month) from payments table
  - API cost estimate (sessions count × ₹15.80)
  - Net margin calculation
  - Real-time active sessions counter (Redis)
  - Last 50 errors (Sentry API integration)
  - Affiliate pending payouts list with approve button
  - Anti-gaming flagged sessions list
  - "Kill Switch" (Maintenance Mode) toggle to prevent new sessions during API outages
- Affiliate payout approval: `POST /api/admin/payouts/approve` → marks as paid in DB

**Acceptance Criteria:**
- Admin page only accessible to team email addresses
- Revenue figure matches sum of payments table
- Affiliate payout approve button correctly updates database
- Anti-gaming flags correctly show duplicate transcript sessions
- Maintenance Mode toggle immediately blocks new session creation with a user-friendly error message

---

### Phase 29 — Beta Testing & Bug Fixes
**Owner:** All 4 team members  
**Duration:** Day 19–21

**Tasks:**
- Recruit 15–20 beta testers from college WhatsApp groups (free access)
- Give each tester a free pack code (manually created in DB)
- Collect feedback via Google Form after each session:
  - Did the voice work clearly?
  - Did the AI understand your Hinglish?
  - Was the scorecard helpful?
  - What would make you pay ₹499 for this?
- Log all errors from Sentry during beta period
- Fix top 5 most critical bugs from Sentry + beta feedback
- AI Lead: improve prompts based on poor scorecard feedback
- Growth Lead: collect first testimonials from beta users
- Measure real-world latency (target under 800ms)

**Acceptance Criteria:**
- 15+ beta sessions completed without crash
- Sentry shows no Critical errors (P0/P1 resolved)
- At least 5 beta users say they would pay ₹499
- Real-world latency under 800ms consistently

---

### Phase 30 — Launch
**Owner:** Growth Lead leads, all support  
**Duration:** Day 21

**Tasks:**

Growth Lead:
- Drop first WhatsApp message in 10 college groups (Pune focus)
- Post first LinkedIn article: "I built an AI that interviews you in Hinglish. Here's how."
- Post first Instagram Reel: screen recording of AI roasting a bad answer
- Activate first 3 affiliate partners (college friends) — give them codes
- Send email to 5 TPOs (Training and Placement Officers) in Pune colleges
- Publish drive-specific landing pages for next 3 known placement drives

All:
- Monitor Sentry for new errors (first hour is critical)
- Monitor Railway/Vercel dashboards for load
- Be available on phone for first 24 hours post-launch

**Acceptance Criteria:**
- First paying customer (₹499 received via Razorpay)
- No critical errors in first 2 hours of launch
- WhatsApp messages sent in minimum 10 groups
- LinkedIn post published

---

## Appendix A — File Structure

```
/
├── frontend/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── [company-slug]/
│   │   │   │   └── page.tsx          # Drive landing pages
│   │   │   └── auth/
│   │   │       └── page.tsx          # OTP auth
│   │   ├── (protected)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx          # Main dashboard
│   │   │   │   └── history/
│   │   │   │       └── page.tsx      # Session history
│   │   │   ├── interview/
│   │   │   │   ├── setup/
│   │   │   │   │   └── page.tsx      # Interview setup
│   │   │   │   ├── session/
│   │   │   │   │   └── page.tsx      # Live interview
│   │   │   │   └── scorecard/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx  # Post-interview
│   │   │   ├── buy/
│   │   │   │   └── page.tsx          # Payment page
│   │   │   ├── affiliate/
│   │   │   │   └── page.tsx          # Affiliate dashboard
│   │   │   ├── settings/
│   │   │   │   └── page.tsx          # Settings
│   │   │   └── admin/
│   │   │       └── page.tsx          # Admin (restricted)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── interview/
│   │   │   ├── InterviewerAvatar.tsx
│   │   │   ├── LiveTranscriptFeed.tsx
│   │   │   ├── AudioWaveform.tsx
│   │   │   ├── SessionTimer.tsx
│   │   │   └── QuestionCounter.tsx
│   │   ├── scorecard/
│   │   │   ├── ScoreCard.tsx
│   │   │   ├── StarTable.tsx
│   │   │   ├── WpmChart.tsx
│   │   │   └── FillerAnalysis.tsx
│   │   └── ui/
│   │       └── [shared components]
│   ├── hooks/
│   │   ├── useAudioCapture.ts
│   │   ├── useInterviewWebSocket.ts
│   │   └── usePackStatus.ts
│   ├── public/
│   │   └── audio-processor.worklet.js
│   └── lib/
│       ├── supabase.ts
│       └── api.ts
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── routers/
│   │   ├── sessions.py
│   │   ├── packs.py
│   │   ├── payments.py
│   │   ├── users.py
│   │   ├── affiliates.py
│   │   └── admin.py
│   ├── websockets/
│   │   └── interview.py
│   ├── services/
│   │   ├── sarvam_stt.py
│   │   ├── sarvam_tts.py
│   │   ├── interview_engine.py
│   │   ├── scorecard_generator.py
│   │   └── audio_analytics.py
│   ├── models/
│   │   └── schemas.py
│   ├── db/
│   │   ├── redis_client.py
│   │   └── supabase_client.py
│   └── question_banks/
│       ├── tcs_nqt.json
│       ├── infosys.json
│       ├── wipro.json
│       ├── startup_react.json
│       ├── hr_behavioral.json
│       └── faang_style.json
│
└── docs/
    └── master_product_spec.md        # This file
```

---

## Appendix B — Launch Checklist

### Pre-Launch (Complete Before Day 21)
- [ ] All Phases 01–28 acceptance criteria met
- [ ] Beta testing completed (Phase 29)
- [ ] Domain purchased and DNS configured
- [ ] Razorpay live mode activated (submit business details 7 days before)
- [ ] All API keys switched to production (not test)
- [ ] Sentry configured for production environment
- [ ] UptimeRobot monitors active
- [ ] Privacy Policy page created (use a template)
- [ ] Terms of Service page created
- [ ] Contact email configured (support@yourdomain.in)
- [ ] All team phones receive UptimeRobot SMS alerts

### Day of Launch
- [ ] WhatsApp messages drafted and ready to send
- [ ] LinkedIn article written and ready to post
- [ ] Instagram Reel edited and ready to post
- [ ] Affiliate codes created for 3 campus partners
- [ ] All 4 team members available on phone
- [ ] Razorpay dashboard open for real-time payment monitoring
- [ ] Railway logs open for real-time error monitoring

---

*This document is the single source of truth. Last updated: Day 0 of build. Any changes require team consensus and this document must be updated immediately.*
