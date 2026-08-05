# AI Mock Interview Platform — Phase 2: Growth, Marketing & Viral Expansion
> Version 1.0 — Continues from master_product_spec.md (Phases 01–30). This document covers Phases 31–60. Every marketing channel, affiliate system, viral strategy, and publishing method documented in full detail.

---

## Table of Contents

1. [Phase 2 Overview](#1-phase-2-overview)
2. [Enhanced Affiliate & Freelancer Program](#2-enhanced-affiliate--freelancer-program)
3. [Phases 31–60 — Detailed Build Plan](#3-phases-3160--detailed-build-plan)
4. [Complete Marketing Strategy — Every Channel](#4-complete-marketing-strategy--every-channel)
5. [Viral Growth Playbook](#5-viral-growth-playbook)
6. [B2B Sales Strategy](#6-b2b-sales-strategy)
7. [Content Marketing System](#7-content-marketing-system)
8. [Paid Advertising Playbook](#8-paid-advertising-playbook)
9. [Community Building](#9-community-building)
10. [PR & Media Strategy](#10-pr--media-strategy)
11. [Retention & Customer Success](#11-retention--customer-success)
12. [Publishing & App Distribution](#12-publishing--app-distribution)
13. [Monthly Marketing Calendar](#13-monthly-marketing-calendar)

---

## 1. Phase 2 Overview

### What Phase 2 Is
Phase 1 (Phases 01–30) built the product and launched it. Phase 2 is everything that makes it grow. The product now exists and charges money. Phase 2 makes it known, loved, viral, and scalable.

### Phase 2 Goals
- Month 4: 500 paying users
- Month 6: 1,000 paying users, ₹5L/month revenue
- Month 8: 3 college B2B deals signed, ₹10L/month revenue
- Month 12: Market leader in Indian placement prep, 10,000+ users

### Who Owns Phase 2
Phase 2 is primarily owned by the Growth Lead but all 4 team members contribute content, outreach, and community. Growth Lead is the coordinator — not the only worker.

### The Core Growth Insight
Your product has a built-in viral loop that most startups would pay crores to engineer:
> Student practices → gets scorecard → shares it on LinkedIn → 200 connections see it → some are also placement-scared → they sign up.

Every single marketing decision in this document amplifies this loop.

---

## 2. Enhanced Affiliate & Freelancer Program

### 2.1 Two Types of Affiliates

The Phase 1 affiliate system covers friends and students sharing referral codes. Phase 2 expands this into a structured two-tier program with distinct rules, payouts, and onboarding for each type.

**Tier 1 — Student Ambassadors (Campus Partners)**
- Who: Engineering students on campus, typically in placement committees or active in college WhatsApp groups
- How they join: Sign up from dashboard → get code instantly → start sharing
- Commission: 20% = ₹100 per ₹499 sale
- Payout: Weekly, every Sunday, UPI direct, minimum ₹200
- Tools given: WhatsApp message templates, Instagram story templates, poster PDF

**Tier 2 — Freelancer Marketers (External Marketers)**
- Who: Digital marketing freelancers, content creators, placement YouTubers, LinkedIn educators, edtech influencers — anyone outside the college who markets professionally
- How they join: Separate application form at `/become-affiliate` — reviewed manually by Growth Lead within 48 hours
- Commission: 25% = ₹125 per ₹499 sale (higher because they bring outside traffic)
- Scale bonus: Hits 25 sales in a month → promoted to 30% = ₹150 per sale permanently
- Payout: Weekly, every Sunday, UPI or bank transfer, minimum ₹500
- Tools given: Full marketing kit (below), dedicated affiliate manager contact, performance reports

### 2.2 Tiered Commission Structure

| Tier | Who | Sales/Month | Commission | Per Sale |
|---|---|---|---|---|
| Campus Partner | Student | Any | 20% | ₹100 |
| Freelancer Standard | External marketer | 1–24 | 25% | ₹125 |
| Freelancer Pro | External marketer | 25–49 | 28% | ₹140 |
| Freelancer Elite | External marketer | 50+ | 30% | ₹150 |
| College B2B Partner | TPO / placement consultant | Bulk deal | Negotiated | Custom |

Commission tiers reset on the 1st of every month. Earned tier for month carries into next month only if same or higher sales are maintained.

### 2.3 Freelancer Application Form

Build a dedicated page at `/become-affiliate` with:

**Application Fields:**
- Full name and email
- City and state
- Type of marketer: Student / Content Creator / YouTuber / LinkedIn Creator / Instagram Creator / Digital Marketing Professional / Placement Consultant / Other
- Platform links (Instagram, YouTube, LinkedIn — at least one required)
- Audience size (followers / connections / subscribers)
- How they plan to promote the product (free text, min 100 words — this filters serious applicants from lazy ones)
- Previous affiliate experience (optional)
- Expected monthly sales target (their own estimate)

**Review Process:**
- Growth Lead reviews within 48 hours
- Approval criteria: real audience, realistic promotion plan, no spam history
- On approval: auto-generate unique code with prefix `FL-` (e.g., `FL-AYUSH23`) to distinguish from student codes
- Send welcome email with full marketing kit and onboarding instructions

### 2.4 Marketing Kit for Affiliates

Every approved affiliate (both tiers) receives a Marketing Kit — a Google Drive folder link with:

**Written Content:**
- 5 pre-written WhatsApp message templates (formal, casual, urgent, funny, factual)
- 3 Instagram caption templates (story, reel, post)
- 2 LinkedIn post templates (professional, personal story)
- 1 Twitter/X thread template (10 tweets)
- 3 email marketing templates (for those with email lists)
- FAQ document (answers to 15 common questions about the product)

**Visual Assets:**
- Product logo (PNG, SVG, white and dark versions)
- 4 Instagram Story templates (editable Canva links)
- 2 Instagram Post templates (editable Canva links)
- 1 LinkedIn banner template
- 1 WhatsApp status image
- 3 poster designs for college notice boards (A4, printable PDF)
- 1 QR code linking to their unique referral URL (downloadable PNG)

**Video Assets:**
- 60-second product demo video (MP4, no watermark — for affiliate to post on their channel)
- 15-second teaser clip (for Instagram Reels / YouTube Shorts)
- B-roll footage of interview session UI (for affiliates making their own videos)
- Thumbnail template for YouTube (Canva link)

**Data & Proof:**
- Before/after example: student score improvement across sessions
- Sample scorecard PDF (anonymised)
- 5 real beta user quotes (with permission)
- Placement success story (once available post-launch)

### 2.5 Affiliate Dashboard (Extended for Freelancers)

The Phase 1 affiliate dashboard (Page 09) is extended for Tier 2 freelancers with:

**Additional metrics:**
- Clicks on referral link (not just conversions) — requires UTM tracking
- Conversion rate (clicks ÷ signups)
- Earnings by week chart
- Current tier status + how many sales to next tier
- Best performing day/channel (requires affiliate to tag their links by channel)

**Link management:**
- Ability to create sub-links: `yourdomain.in?ref=FL-AYUSH23&src=instagram` vs `src=youtube`
- Each sub-link tracked separately in dashboard
- Shows which platform is converting best for them

**Leaderboard (opt-in):**
- Monthly leaderboard of top 10 affiliates by sales
- Names shown only if affiliate opts in
- Top 3 each month get a "Featured Affiliate" badge on the leaderboard
- Top affiliate each month gets a public shoutout on the product's Instagram

### 2.6 Freelancer Affiliate Payout Automation

**Payout Rules:**
- Every Sunday: system generates payout list automatically
- Growth Lead reviews, approves bulk transfer
- UPI preferred; NEFT bank transfer for amounts above ₹5,000
- GST invoice generated automatically for amounts above ₹50,000 (legal compliance)
- Tax deduction at source (TDS): 5% deducted for affiliates earning above ₹15,000/quarter (legal compliance) — inform affiliates upfront

**Payout failure handling:**
- If UPI transfer fails: affiliate notified by email immediately
- 72-hour window to correct UPI ID
- Unclaimed payouts held for 60 days, then credited to next payout cycle

### 2.7 Affiliate Fraud Prevention

**Detection rules:**
- Same device buying with affiliate's own code → flagged, payout withheld
- Unusual spike: affiliate who averaged 2 sales/month suddenly shows 50 in one day → manual review triggered
- Chargebacks: if a buyer reverses payment, affiliate payout for that sale is clawed back from next payout
- IP clustering: if 10+ sales come from same IP in 24 hours → auto-freeze, manual review

---

## 3. Phases 31–60 — Detailed Build Plan

### Phase 31 — Progressive Web App (PWA)
**Owner:** Frontend Lead  
**Duration:** 2 days  

**Why:** Students need to use this on their phone without downloading anything. A PWA gives app-like experience (home screen icon, offline splash screen, push notifications) without app store dependency.

**Tasks:**
- Add `manifest.json` to Next.js with correct metadata:
  - App name, short name, theme colour (#4F46E5 indigo), background colour
  - Icons: 192×192 and 512×512 PNG versions of logo
  - Display: standalone (full screen, no browser bar)
  - Start URL: `/dashboard`
- Implement service worker using `next-pwa` package
- Cache strategy: network-first for API calls, cache-first for static assets
- Add "Add to Home Screen" prompt:
  - Banner appears after 3rd session if user hasn't installed yet
  - "Install App" button triggers native browser install prompt
- Test on Android Chrome and iOS Safari
- Offline page: if connection lost mid-session, show friendly error with reconnect button

**Acceptance Criteria:**
- Chrome on Android shows "Add to Home Screen" prompt
- App opens from home screen with no browser bar
- Logo icon shows correctly on home screen
- Offline page shows if connection is lost

---

### Phase 32 — Analytics Infrastructure
**Owner:** AI Lead + Backend Lead  
**Duration:** 2 days  

**Why:** You cannot improve what you cannot measure. Know exactly where users drop off, which company modes convert best, and what makes users buy.

**Tool:** PostHog (open source, self-hostable, GDPR-compliant, free for up to 1M events/month)

**Tasks:**
- Install PostHog JS in Next.js
- Install PostHog Python SDK in FastAPI
- Track the following events:

**Frontend events:**
- `page_viewed` — every page, with page name property
- `interview_setup_started` — company, role, language
- `interview_session_started` — session ID, company, role
- `interview_session_completed` — session ID, duration, score
- `interview_session_abandoned` — when user leaves mid-session
- `scorecard_viewed` — session ID, score
- `scorecard_pdf_downloaded` — session ID
- `scorecard_linkedin_shared` — session ID
- `scorecard_whatsapp_shared` — session ID
- `payment_page_viewed` — pack type
- `payment_initiated` — amount, has affiliate code
- `payment_completed` — amount, affiliate code
- `affiliate_code_applied` — code value
- `referral_link_clicked` — from landing page CTA buttons

**Backend events:**
- `sarvam_stt_connected` — session ID, latency
- `sarvam_tts_connected` — session ID, voice persona
- `barge_in_triggered` — session ID, question number
- `session_cap_reached` — pack ID, minutes vs rounds
- `anti_gaming_flagged` — user ID, session ID

**Funnels to monitor in PostHog:**
1. Landing → Auth → Dashboard → Setup → Session → Scorecard → Payment
2. Payment Page → Payment Initiated → Payment Completed
3. Scorecard → LinkedIn Share → (referral tracking)
4. Affiliate Link → Landing → Signup → Purchase

**Acceptance Criteria:**
- All events firing correctly (verified in PostHog dashboard)
- Funnel report shows % drop-off at each step
- Session replay working (PostHog session recordings)

---

### Phase 33 — Email Marketing System
**Owner:** Growth Lead + Backend Lead  
**Duration:** 3 days  

**Tool:** Resend (email API) + React Email (templates)

**Email Sequences to Build:**

**Sequence 1 — Welcome Series (triggered on signup):**
- Email 1 (immediate): "Your account is ready. Here's how to get the most out of your first session." — includes tips, link to setup page
- Email 2 (Day 2, if no session started): "Most students who land their first job practice at least 5 times before the real interview. Start yours today."
- Email 3 (Day 4, if no purchase): "Your ₹499 vs a placement coaching class at ₹1,500. The math is obvious."

**Sequence 2 — Post-Session (triggered after first session):**
- Email 1 (immediate): Full scorecard summary in email body + download link
- Email 2 (Day 3): "Your weakest area was [X]. Here's how to fix it before your next session."
- Email 3 (Day 7): "You have [N] rounds left. Drive season is picking up. Use them before it's too late."

**Sequence 3 — Pack Expiry (triggered at 80% usage):**
- Email 1: "You've used 8 of your 10 rounds. 2 left. Make them count."
- Email 2 (at 100% usage): "You've used all 10 rounds. Add 5 more for ₹199. Your scores improved [X]% — keep going."

**Sequence 4 — Re-engagement (triggered if no session in 7 days):**
- Email 1: "You haven't practiced in 7 days. [Company Name] placement drive is coming. Don't let the gap hurt you."
- Email 2 (Day 14 no session): "Quick question — did anything go wrong with your account? Reply and we'll help."

**Sequence 5 — Drive Panic (triggered by Growth Lead manually 72 hrs before a known drive):**
- Segment: users whose target companies include the upcoming drive company
- Subject: "TCS NQT is visiting [College] in 72 hours. Are you ready?"
- Body: drive-specific tips + direct link to TCS mode interview setup

**Sequence 6 — Affiliate Welcome (triggered on affiliate approval):**
- Email 1 (immediate): Welcome + unique code + marketing kit link + how payouts work
- Email 2 (Day 3): Tips for promoting the product (best-performing messages, what converts)
- Email 3 (Day 7): "Your first week stats: [X clicks, Y signups, Z earnings]. Here's how top affiliates are promoting."

**Technical Setup:**
- Resend domain verification for `mail.yourdomain.in`
- FastAPI triggers email sends via Resend API based on events
- All sequences stored as React Email templates in `/frontend/emails/` folder
- Unsubscribe link in every email (legal requirement)
- Email open rate and click rate tracked via Resend dashboard

**Acceptance Criteria:**
- All 6 sequences trigger correctly based on conditions
- Emails render correctly on Gmail mobile and desktop
- Unsubscribe works and updates user preference in database
- Resend dashboard shows delivery rates above 95%

---

### Phase 34 — Push Notifications (Web Push)
**Owner:** Frontend Lead + Backend Lead  
**Duration:** 2 days  

**Tool:** Browser Web Push API (no third-party service needed)

**Tasks:**
- Implement push notification permission request:
  - Show after user completes their FIRST session (not on signup — too early)
  - "Get reminded before placement drives near you. Allow notifications?"
  - Permission prompt appears after scorecard page loads
- Generate VAPID keys for backend
- FastAPI stores push subscription endpoint per user in PostgreSQL
- Implement notification types:
  - Drive alert: "TCS NQT is visiting colleges this week. Practice now →"
  - Streak reminder: "You practiced 3 days in a row. Keep going today →"
  - Pack expiry: "2 rounds left in your pack →"
  - New feature: "We just added [Company] interview mode. Try it →"
- Schedule notifications: daily at 7pm (peak student activity time)
- Respect user timezone from browser

**Acceptance Criteria:**
- Push notification appears on Chrome Android correctly
- Permission not asked too early (only after first session)
- Drive alert sends correctly to users with matching target company

---

### Phase 35 — WhatsApp Business API Broadcasts
**Owner:** Growth Lead + Backend Lead  
**Duration:** 3 days  

**Tool:** Sarvam or Wati or Interakt (WhatsApp Business API providers in India)

**Why WhatsApp:** Your users live on WhatsApp. Email open rates are 20–25%. WhatsApp open rates are 95%+. This is your highest-ROI communication channel.

**Tasks:**
- Register WhatsApp Business API account (use Wati — Indian provider, cheapest)
- Get business phone number verified
- Create message templates (require WhatsApp approval, submit 5–7 days before needed):

**Template 1 — Drive Alert:**
"Hi [Name]! 🚨 [Company] placement drive is visiting Pune colleges this week. Practice their exact interview format before it's too late → [link]"

**Template 2 — Score Milestone:**
"Congrats [Name]! 🎉 Your interview score improved from [X] to [Y] — top 20% of all users. 2 rounds left in your pack. Keep the streak going → [link]"

**Template 3 — Pack Expiry:**
"Hey [Name], you've used all 10 rounds. Add 5 more for ₹199 and keep practising → [link]"

**Template 4 — Weekly Summary:**
"[Name]'s Weekly Report: [N] sessions, avg score [X], top skill: [Y]. Click to see full breakdown → [link]"

**Template 5 — Referral Earnings:**
"[Name], ₹[X] earned this week from your referral code [CODE]. [N] students signed up through you. Keep sharing! → [link]"

- FastAPI sends WhatsApp messages via Wati API triggered by same events as email
- WhatsApp messages sent only if user opted in (checkbox on onboarding screen)
- Opt-out link in every message template

**Acceptance Criteria:**
- All 5 templates approved by WhatsApp
- Drive alert sends correctly to opted-in users
- Opt-out correctly removes user from future messages

---

### Phase 36 — SEO & Blog Infrastructure
**Owner:** Growth Lead + Frontend Lead  
**Duration:** 3 days  

**Why SEO:** Students actively search "TCS NQT preparation", "how to crack Infosys interview", "mock interview in Hindi". If you rank for these terms, you get free students every day forever. This compounds over months.

**Technical Setup:**
- Add Next.js metadata API for all pages (og:title, og:description, og:image)
- Create `/blog` section using Next.js MDX or a headless CMS (Contentful free tier)
- Submit sitemap to Google Search Console
- Submit sitemap to Bing Webmaster Tools
- Add structured data (JSON-LD) for:
  - Organization schema on homepage
  - FAQ schema on FAQ section
  - Article schema on every blog post
  - BreadcrumbList schema on all pages
- Set up Google Analytics 4 (alongside PostHog)
- Set up Google Search Console
- Configure canonical URLs for all pages
- Add `robots.txt` to allow all crawling

**Target Keywords (ranked by priority):**

High priority (search volume + low competition):
- "TCS NQT mock interview"
- "mock interview in Hindi"
- "Infosys interview preparation 2025"
- "AI mock interview India"
- "placement interview practice Hinglish"
- "STAR method interview practice"
- "TCS NQT preparation free"
- "mock interview for freshers India"

Medium priority:
- "interview practice app India"
- "how to crack TCS NQT"
- "Wipro interview questions"
- "software engineer interview prep India"
- "placement preparation for engineering students"

Long-tail (easy to rank, high intent):
- "how to answer tell me about yourself in Hindi interview"
- "what questions does TCS ask in NQT"
- "how to reduce filler words in interview"
- "STAR method examples for freshers India"

**Blog Post Plan (first 20 articles — Growth Lead writes 1 per week):**

| # | Title | Target Keyword | Word Count |
|---|---|---|---|
| 1 | "TCS NQT Interview: 25 Questions They Actually Ask" | TCS NQT interview questions | 2,500 |
| 2 | "How to Answer 'Tell Me About Yourself' in Hinglish Without Sounding Stupid" | tell me about yourself interview India | 1,800 |
| 3 | "The STAR Method Explained With Indian Examples" | STAR method interview India | 2,000 |
| 4 | "Why You Freeze in Interviews — And How to Fix It" | interview anxiety India students | 1,500 |
| 5 | "Infosys InfyTQ Interview: Complete Preparation Guide 2025" | Infosys interview preparation | 2,500 |
| 6 | "Speaking at 130 WPM: Why Your Pace Is Killing Your Interviews" | speaking pace interview | 1,500 |
| 7 | "Filler Words That Are Destroying Your Interview Score" | filler words interview | 1,500 |
| 8 | "Wipro NLTH Interview: What to Expect Round by Round" | Wipro NLTH interview | 2,000 |
| 9 | "How to Practice for Interviews Alone (Without a Partner)" | solo interview practice | 1,800 |
| 10 | "Top 10 HR Round Questions for Indian Engineering Freshers" | HR round questions freshers India | 2,000 |
| 11 | "System Design Interview for Freshers: Where to Start" | system design interview freshers | 2,500 |
| 12 | "Accenture Interview Process: Complete Guide" | Accenture interview India | 2,000 |
| 13 | "How to Talk About Your College Projects in an Interview" | college project interview questions | 1,800 |
| 14 | "Placement Season 2025: Which Companies Are Visiting Which Colleges" | placement season 2025 India | 2,000 |
| 15 | "DSA Basics Every Fresher Must Know Before TCS, Infosys Interview" | DSA for placements India | 2,500 |
| 16 | "Group Discussion Tips for Engineering Placement Drives" | group discussion placement | 1,800 |
| 17 | "Resume Projects That Get You Shortlisted" | resume projects engineering freshers | 2,000 |
| 18 | "Mock Interview vs Real Interview: What's Actually Different" | mock interview India | 1,500 |
| 19 | "How AI Is Changing Placement Preparation in India" | AI interview preparation India | 2,000 |
| 20 | "Complete Capgemini Interview Preparation Guide" | Capgemini interview | 2,000 |

**Acceptance Criteria:**
- All pages have correct meta titles and descriptions
- Blog section is live and indexed by Google
- First 5 blog posts published
- Google Search Console shows site indexed

---

### Phase 37 — Social Media Accounts Setup
**Owner:** Growth Lead  
**Duration:** 1 day  

**Platforms to create (all of them, immediately):**

| Platform | Handle | Purpose | Post Frequency |
|---|---|---|---|
| Instagram | @[productname] | Reels (AI roast, tips), Stories | Daily |
| LinkedIn Company Page | [Product Name] | Articles, scorecard shares, updates | 3x/week |
| YouTube | [Product Name] | Long-form guides, demo videos | 1x/week |
| YouTube Shorts | Same channel | Shorts from Reels | 3x/week |
| Twitter/X | @[productname] | Hot takes, threads, quick tips | Daily |
| Reddit | u/[productname] | Helpful answers (not spam) | As needed |
| Telegram Channel | [Product Name] | Drive alerts, tips, product updates | 2x/week |
| WhatsApp Channel | [Product Name] | Drive alerts only | 1–2x/week |
| Quora | [Product Name] | Answer placement questions | 3x/week |

**Profile setup for each:**
- Profile picture: logo (consistent everywhere)
- Bio: "AI mock interviews in Hinglish. Practice for TCS, Infosys, startups. Try free →"
- Website link in all bios
- Highlight pinned story/post: product demo video

---

### Phase 38 — Instagram Content System
**Owner:** Growth Lead  
**Duration:** Ongoing from Week 3  

**Content pillars (rotate between these):**

**Pillar 1 — AI Roast Content (highest virality potential)**
Format: Screen recording of AI giving brutal Hinglish feedback on a bad answer
Script: Someone gives a vague answer → AI responds in Hinglish: "Bhai, Situation toh bataya, Task bhi theek tha, lekin Action mein tu ghayab ho gaya. TCS wala recruiter toh so gaya hoga."
Caption: "This AI is more honest than your placement mentor 💀 Practice before it's too late → [link in bio]"
Post every Monday and Thursday.

**Pillar 2 — Tips & Tricks (educational, saves & shares)**
Format: Carousel post (5–8 slides)
Example: "5 filler words killing your interview score (and what to say instead)"
Slide 1: Problem statement
Slides 2–6: Each filler word + replacement
Slide 7: CTA — "Practice with AI to catch your own fillers → link in bio"
Post every Wednesday.

**Pillar 3 — Transformation Story**
Format: Before/after scorecard
"Priya scored 52/100 on Day 1. After 8 rounds, she scored 84/100. She joined Razorpay last month."
Post with permission. Blur identifying details if needed.
Post every Friday.

**Pillar 4 — Relatable Memes (engagement, saves, shares)**
Format: Meme template with placement-specific captions
Example: Drake meme — "Practicing interviews with your friend who says 'achi h achi h' / Practicing with AI that says your WPM is 165 and you said basically 9 times"
Post Tuesday and Sunday.

**Pillar 5 — Behind the Build (founder story)**
Format: Casual talking-head reel, no editing
Content: "We built an AI interviewer in 3 weeks. Here's what we learned."
"Day 1 of building vs Day 30."
"Our first paying customer story."
This builds personal brand and trust. Post every 2 weeks.

**Reel script template (AI Roast — fill in and record):**
```
[0-2s] Hook: "This AI interviewer has NO filter 😭"
[2-15s] Show someone giving a weak answer (voiceover or text on screen)
[15-25s] Show AI response in Hinglish — brutal but fair
[25-28s] Score: "Communication: 40/100. Filler words: 8."
[28-30s] CTA: "Practice free → link in bio"
```

**Posting schedule:**
- Monday: AI Roast Reel
- Tuesday: Meme Post
- Wednesday: Tips Carousel
- Thursday: AI Roast Reel or Short
- Friday: Transformation story or founder content
- Saturday: Poll / Q&A Story
- Sunday: Meme or Motivational

**Instagram Story content (daily):**
- Question box: "What company interview are you preparing for?"
- Poll: "Biggest interview fear: Filler words / Going blank / Speaking too fast"
- Drive countdown: "TCS NQT in 5 days 🚨"
- Behind-the-scenes of building the product

---

### Phase 39 — LinkedIn Content System
**Owner:** Growth Lead (personal profile, not just company page)  
**Duration:** Ongoing  

**Why personal LinkedIn matters more than company page:**
LinkedIn's algorithm shows personal posts to 10x more people than company page posts. The founder's personal LinkedIn is the primary channel, not the company page.

**Post types and cadence:**

**Type 1 — Founder Story Posts (3x/month)**
Format: Personal narrative, 300–500 words, no images needed
Example opener: "I'm a 3rd year engineering student in Pune. I watched my friend fail 8 placement interviews despite being smarter than half the people who got placed. So I built something."
End with product link and CTA.
These get the most shares and comments from the startup community.

**Type 2 — Product Insight Posts (2x/week)**
Format: Insight from data + lesson
Example: "We analysed 500 mock interviews on our platform. Here's what separates students who score above 80% from those who score below 60%:"
[3–5 bullet points with insights]
"We built [Product] to fix exactly these patterns → link"
Tag: #placement #engineering #India #interviewprep

**Type 3 — Scorecard Post Template (encourage users to post)**
Every time a user downloads their scorecard, the LinkedIn share button auto-populates this caption:
"Just completed a mock interview session on [Product] — scored [X]/100 for [Company] round. My weak areas: [top 2 from scorecard]. Working on it before the actual drive. If you're also prepping for placements, this tool is genuinely useful → [referral link]"
This is user-generated content. It works because it's authentic and reaches recruiters directly.

**Type 4 — Thread-style Long Posts (1x/week)**
Format: 10-point "guide" style
Example: "How to crack a TCS NQT interview if you have 7 days left:"
Point 1 through 10 — each valuable, practical, specific.
Last line: "We simulate every one of these scenarios in our AI mock interviewer → link"

**Type 5 — College Shoutouts**
Tag specific colleges when students from those colleges share scores.
"Proud of this student from PICT Pune who went from 58 to 87 in 3 weeks."
Colleges love seeing their name tagged. Their official pages reshare. You get reach to 10,000+ students.

---

### Phase 40 — YouTube Strategy
**Owner:** Growth Lead + AI Lead  
**Duration:** Ongoing from Month 2  

**Channel structure:**

**Long-form videos (1x/week):**
- "Full TCS NQT Interview Simulation — AI Interviewer in Hinglish" (30–40 min)
  Literally record a full session, edit out the worst parts, add commentary
  This single video alone can drive hundreds of signups from search
  
- "How We Built an AI Interviewer in 3 Weeks" — founder story, technical breakdown, behind the scenes

- "Scoring 92/100 on Our AI Interviewer — Full Walkthrough"

- "Interview Mistakes Indian Students Make (Ranked Worst to Most Common)"

- "DSA Revision in 2 Hours for Placement Drive Tomorrow"

**YouTube Shorts (3x/week):**
Same Reels content repurposed as Shorts. Upload directly to YouTube Shorts tab.

**SEO for YouTube:**
- Title format: "[Company] Interview [Year] — [Specific Topic]"
- Description: first 3 lines are searchable (include all target keywords)
- Tags: TCS NQT, placement preparation, interview practice India, mock interview
- Thumbnail: face + text overlay + high contrast (CTR >8% target)
- End screen: link to product, link to next video
- Cards: link to product at minute 5 and minute 15 of every long video

---

### Phase 41 — Campus Ambassador Program
**Owner:** Growth Lead  
**Duration:** Month 2 onwards  

**Program name:** "Drive Squad" — sounds cooler than "campus ambassador"

**What ambassadors get:**
- Unique referral code starting with `DS-` (Drive Squad)
- 25% commission (₹125 per sale) — higher than standard student affiliate
- "Drive Squad" badge on their profile inside the product
- Certificate of recognition (real value for resume/LinkedIn)
- Invitation to private WhatsApp group with the founding team
- Monthly call with Growth Lead to discuss strategy
- First access to all new features before public launch

**What ambassadors do:**
- Post about the product in their college WhatsApp groups (not spam — once per placement season)
- Put up printed posters on college notice boards (PDF provided in marketing kit)
- Mention it to batchmates personally
- Post their own scorecard on Instagram/LinkedIn once a month
- Attend campus placement preparation events and mention the product

**Selection criteria:**
- Must be 3rd or 4th year engineering student
- Must be active in at least 3 college WhatsApp groups
- Must have used the product at least twice themselves
- Must be able to commit 2–3 hours per month

**Application:** Simple Google Form linked from dashboard — "Become a Drive Squad member"
**Selection:** Growth Lead reviews, approves within 48 hours

**Target:** 5 ambassadors per college, 20 colleges in Pune by Month 3, expanding to 100 colleges nationally by Month 6.

---

### Phase 42 — Influencer Outreach System
**Owner:** Growth Lead  
**Duration:** Month 2 onwards  

**Target influencer categories:**

**Tier A — Placement YouTubers (most valuable)**
Names to research and approach: channels covering TCS NQT prep, placement interviews, DSA — look for 10K–500K subscribers, genuine student audience
Pitch: Free premium access (lifetime) + 30% commission + affiliate marketing kit
What you ask for: 1 video featuring the product (sponsored segment) + honest review

**Tier B — LinkedIn Placement Educators (second most valuable)**
People who post "how I got placed at [company]" content with 10K–100K followers
Pitch: Free access + 30% commission
What you ask for: 1 LinkedIn post + story sharing

**Tier C — Instagram Study/Placement Accounts**
Accounts posting placement tips, study motivation, coding memes — 5K–100K followers
Pitch: Free access + 30% commission + co-created Reel content
What you ask for: 1 Reel featuring the product + story

**Tier D — College Influencers (micro, high trust)**
Students within single colleges with 500–5,000 followers but very tight-knit audience
Pitch: Free access + 25% commission
What you ask for: 1 Instagram story + WhatsApp group mention

**Outreach message template (for DM):**

Subject: Quick question + free access to something useful

"Hi [Name],

I've followed your content on [platform] — your [specific post/video] on [topic] was genuinely helpful.

We just built an AI mock interviewer that works in Hinglish — literally the first one in India. Students select TCS/Infosys/startup mode, speak their answers, and get scored on STAR method, WPM, and filler words. 500+ students in Pune have beta-tested it.

I'd love to give you free lifetime access + our highest affiliate commission (30%). If you try it and genuinely like it, one post from you would mean a lot. If you don't like it after trying, no obligation at all.

Interested? I'll set up your account in 5 minutes.

[Founder name]
[Product name] — [link]"

**Tracking:**
- All influencer outreach tracked in a Google Sheet: Name, Platform, Followers, Outreach Date, Reply Date, Status, Commission Rate, Sales Generated
- Follow up once after 5 days if no reply. Never follow up more than twice.

---

### Phase 43 — Telegram & Discord Community
**Owner:** Growth Lead  
**Duration:** Month 2 onwards  

**Telegram Channel (broadcast only — for announcements):**
- Drive alerts: "TCS NQT confirmed at PICT Pune — [date]"
- Product updates: new features, new company modes
- Weekly interview tip (1 tip every Monday)
- User scorecards (with permission) — motivation for others
- Target: 2,000 subscribers by Month 6

**Telegram Group (community — two-way conversation):**
- Name: "Interview Prep India 🇮🇳"
- Open to all students, not just product users
- Growth Lead moderates daily: answer questions, share resources, keep it active
- Rules: no spam, no job postings, no self-promotion (only the product can be mentioned naturally)
- Product is mentioned naturally when relevant, never forced
- Target: 5,000 members by Month 6

**Discord Server (for more engaged users):**
- Channels: #general, #tcs-prep, #infosys-prep, #startup-prep, #scorecards, #placement-news, #resources
- Bot: share daily practice reminders in #general
- Weekly live event: "Practice together" — everyone does one session simultaneously, shares scores in #scorecards
- Target: 500 members by Month 4

---

### Phase 44 — Reddit Strategy
**Owner:** Growth Lead  
**Duration:** Ongoing from Month 1  

**Subreddits to be active in:**
- r/india (3.2M members)
- r/developersIndia (200K members)
- r/cscareerquestions (800K members — global but Indian context works)
- r/learnprogramming (3M members)
- r/indiasocial (500K members)
- r/pune (local — perfect for early growth)
- r/Mumbai, r/bangalore, r/hyderabad (as you expand)
- r/EngineeringStudents (India-specific)

**Rules:**
- Never directly advertise. Reddit users hate this and will downvote and report.
- Be a genuine community member. Answer questions helpfully.
- When relevant, naturally mention the product.

**Strategy:**

Week 1–4: Build karma. Respond to placement questions helpfully with zero product mention. Build account credibility.

Week 5 onwards: When someone posts "How do I prepare for TCS NQT?" or "Any mock interview resources?" — respond with a genuinely helpful answer + natural product mention at the end.

**Template response for placement questions:**
"I'll give you what actually worked for the people I know who cleared TCS NQT:

1. [Genuine tip 1]
2. [Genuine tip 2]
3. [Genuine tip 3 — about voice practice]

For the actual interview simulation part, we built a tool called [Product] that does AI mock interviews in Hinglish specifically for Indian company formats — happy to share if you want to try it. We're in beta and giving free access to a few people."

Post this ONLY when it's genuinely relevant. Over-posting gets accounts banned.

**Once per month:** Post a proper case study or data post
Example title: "We analysed 1,000 mock interview answers. Here's what separates students who get placed from those who don't." (Full post with actual data from PostHog)
This gets upvoted heavily and drives hundreds of signups.

---

### Phase 45 — Twitter/X Strategy
**Owner:** Growth Lead  
**Duration:** Ongoing from Month 1  

**Account purpose:** Founder's personal account is more important than company account on X.

**Content types:**

**Daily hot take (the best content on X):**
"Unpopular opinion: The reason most engineering students fail placements is not that they don't know DSA. It's that they've never heard themselves speak in an interview."
These get replies, debates, and retweets. They drive follows and clicks.

**Thread (weekly):**
"10 things we learned from analysing 500 Hinglish mock interviews: 🧵"
Real data from your platform. Specific, interesting, shareable.

**Scorecard flex retweets:**
Retweet every time a user tweets about the product with their scorecard. Add comment.

**Build in public:**
Tweet weekly metrics openly. "Week 8: 180 paying users. ₹89,820 revenue. Our biggest issue this week was [problem]. Here's how we're solving it."
This builds an audience of people following your journey, not just your product.

---

### Phase 46 — Quora Strategy
**Owner:** Growth Lead  
**Duration:** Ongoing from Month 1  

**Why Quora:** Quora answers rank on Google. A great Quora answer stays and drives traffic for years.

**Target questions to answer:**
- "How do I prepare for a TCS NQT interview?"
- "What questions are asked in Infosys campus interviews?"
- "How can I improve my communication skills for interviews?"
- "What is the STAR method for interviews? Give examples."
- "Best resources for placement preparation in India?"
- "How can I reduce filler words in my speech?"
- "Is there any AI tool for interview practice in Hindi?"

**Answer format:**
- Long, detailed, genuine answer (500–1000 words)
- Include personal experience or data from the product
- Mention the product naturally in the last 20% of the answer — never in the first line
- Add relevant images (scorecard screenshot, WPM chart)
- Answer format: structured with headers, bullet points, readable

Target: 2 Quora answers per week for the first 3 months.

---

### Phase 47 — Product Hunt Launch
**Owner:** Growth Lead + All Team  
**Duration:** 1 full day (the launch day)  
**Timing:** Schedule for Month 3 (after beta users give you testimonials and the product is polished)

**Pre-launch (2 weeks before):**
- Create Product Hunt account for all 4 team members — upvote activity matters
- Find a "Hunter" with 500+ followers to hunt the product (DM top hunters on Product Hunt, offer product credit)
- Build a "coming soon" page on Product Hunt to collect followers
- Notify all beta users to upvote on launch day
- Prepare:
  - Tagline (max 60 chars): "AI mock interviews in Hinglish for Indian students"
  - Description (300 words): product story, key features, why it's different
  - Gallery: 5 screenshots (landing, session UI, scorecard, company select, affiliate dashboard)
  - Demo video: 60-second product walkthrough
  - First comment: the founder story (post this yourself within first 5 minutes)

**Launch day strategy:**
- Launch at 12:01am PST (Product Hunt resets daily at this time)
- All 4 team members available the entire day
- Respond to every single comment within 30 minutes
- Post in your Telegram group, Discord, all WhatsApp groups: "We launched on Product Hunt today! Upvote takes 5 seconds → [link]"
- Post on LinkedIn, Instagram, Twitter simultaneously
- Message all your beta users individually (WhatsApp/LinkedIn) asking them to upvote and leave a comment
- Target: Top 5 Product of the Day

**What Product Hunt launch gets you:**
- Email to 100,000+ Product Hunt subscribers
- International visibility (could get Indian diaspora abroad to share)
- Press coverage from tech blogs who monitor Product Hunt
- 200–500 new signups on launch day if you hit top 5
- Permanent "Featured on Product Hunt" badge for your website

---

### Phase 48 — PR & Media Outreach
**Owner:** Growth Lead  
**Duration:** Month 3 onwards  

**Target publications:**

**Tier 1 (highest impact):**
- YourStory (India's biggest startup media) — pitch: "Pune student built India's first Hinglish AI interviewer"
- Inc42 — pitch: "EdTech startup targeting India's 30 lakh engineering fresher market"
- The Hindu — education section
- Economic Times Startup — founder story angle

**Tier 2:**
- Entrackr
- VCCircle
- Business Standard startup section
- Mint startup section

**Tier 3 (college-specific):**
- College magazines and newspapers (Target Times of COEP, Prisma of PICT etc.)
- Engineering college YouTube channels
- College fest tech talks (speaker opportunity)

**PR pitch angles (pick one per publication):**

Angle 1 — "Students built this" (most likely to get covered):
"Four engineering students from Pune built India's first AI mock interviewer that speaks in Hinglish and costs less than a single coaching class. They're already at 500 paying users in 3 months."

Angle 2 — Market gap story:
"India produces 30 lakh engineering graduates every year. 70% fail their first interview. No one was solving this specifically for Indian communication styles. Until now."

Angle 3 — Data story (pitch this to data-driven publications):
"After 1,000 AI mock interviews, we found the real reason Indian students fail placements: it's not knowledge, it's these 5 specific communication patterns."

**How to pitch:**
- Find journalist email (LinkedIn, publication website, Twitter)
- Subject line: "Indian students built [Product] — AI mock interview in Hinglish — 500 users in 3 months [Free to try]"
- Email body: 3 short paragraphs — who, what, why it matters
- Attach: 2–3 screenshots, product link, 1 user testimonial
- Follow up once after 7 days if no reply

---

### Phase 49 — College Fest & Event Marketing
**Owner:** Growth Lead  
**Duration:** Month 2 onwards  

**Target events:**
- College tech fests (Mindspark at COEP, Credenz at PICT, TechFiesta at VIT Pune etc.)
- Placement preparation workshops organised by TPOs
- Hackathons (participate, not just sponsor)
- IEEE/ACM college chapter events
- College cultural fests (placement anxiety is universal — relevant at any fest)

**What to do at events:**

Option A — Sponsor a prize at hackathon:
Cost: ₹2,000–5,000. Give ₹499 packs as prizes.
Benefit: Product name announced during prize distribution, 200+ students hear about it.

Option B — Run a live demo at fest:
Set up a laptop at a booth (negotiate a free stall for being a "student startup" — most fests give this)
Let students do a 2-minute live interview with the AI
When they see their score — they buy or tell their friends immediately

Option C — Speaker slot:
Pitch to fest organisers: "A student who built an AI startup will share how they did it in 21 days — free talk"
At end of talk, demo the product to a captive audience of 50–200 students

Option D — Sponsor placement preparation workshop:
Approach TPO: "We'll sponsor your placement preparation session — free access for all attendees + branded materials"
TPO saves money, you get 100+ student sign-ups in one session

---

### Phase 50 — College B2B Sales Pipeline
**Owner:** Growth Lead (sales), Backend Lead (B2B features)  
**Duration:** Month 3 onwards  

**Target buyers:**
- Training & Placement Officers (TPOs) at engineering colleges
- Heads of placement cells (student bodies at premium colleges)
- Coding bootcamps and placement training institutes
- UPSC/banking coaching institutes (future expansion)

**B2B product offering:**

**Package 1 — Starter (small colleges):**
- ₹15,000/month
- Up to 100 students with unlimited sessions
- College-branded login page (logo on dashboard)
- Monthly analytics report (PDF) on batch performance
- Drive alerts customised for the college's known recruiters

**Package 2 — Growth (mid-size colleges):**
- ₹30,000/month
- Up to 300 students with unlimited sessions
- All Starter features +
- TPO dashboard: see every student's scores, progress, weaknesses
- Custom company modes (add company that specifically recruits from their campus)
- Quarterly review call with founding team

**Package 3 — Enterprise (large colleges or chains):**
- ₹60,000+/month (negotiated)
- Unlimited students
- All Growth features +
- White-label option (platform branded as "[College Name] Placement Prep")
- Dedicated support via WhatsApp Business
- Priority feature requests

**Sales process:**

Step 1: Growth Lead identifies TPO name and email from college website
Step 2: Send cold email + LinkedIn message simultaneously:
"Subject: Free placement preparation tool for [College Name] students

Hi [Name],

I'm [Founder], a student from Pune. We built an AI mock interviewer that simulates TCS, Infosys, and startup interviews in Hinglish. 500+ students are already using it and averaging a 23% score improvement in 3 sessions.

I'd love to offer free access to 20 students from [College Name] this week — no cost, no commitment. If your students find it useful, we can discuss a formal partnership.

Would a 15-minute call this week work?

[Founder name] | [Product name] | [Mobile number]"

Step 3: Free pilot — 20 students, 2 weeks, full access
Step 4: Share pilot results with TPO (aggregate scores, improvement data)
Step 5: Propose paid package based on college size
Step 6: Contract signing → onboarding → monthly invoice

**B2B backend features needed (build when first deal is close):**
- College admin dashboard (see all students under their account)
- Bulk student invite via CSV upload
- Aggregate analytics: batch average score, weakest areas, most common company modes
- Branded login page (pass college_id in URL, show college logo in nav)
- Custom company modes: TPO uploads 5–10 actual questions from companies that visited last year

---

### Phase 51 — A/B Testing Infrastructure
**Owner:** Frontend Lead + AI Lead  
**Duration:** Month 2  

**Tool:** PostHog feature flags (already installed in Phase 32)

**Tests to run immediately:**

**Test 1 — Pricing page copy:**
- Variant A: "10 rounds for ₹499" (feature-focused)
- Variant B: "Less than ₹50 per interview" (value-focused)
- Variant C: "Cheaper than one Swiggy order per interview" (comparison-focused)
- Measure: payment completion rate

**Test 2 — Landing page hero headline:**
- Variant A: "Practice interviews in Hinglish. Get hired."
- Variant B: "The AI interviewer that understands how Indian engineers speak."
- Variant C: "Stop failing interviews. Start practicing."
- Measure: click rate on primary CTA

**Test 3 — Free demo vs no free demo:**
- Variant A: 60-second free demo before paywall
- Variant B: Direct to payment page with video only
- Measure: payment conversion rate

**Test 4 — Scorecard share button placement:**
- Variant A: Share buttons at top of scorecard
- Variant B: Share buttons at bottom after all content
- Measure: LinkedIn share rate

**Test 5 — Email subject lines:**
- Test 3 different subjects for each email sequence
- Measure: open rate

---

### Phase 52 — Customer Support System
**Owner:** Growth Lead  
**Duration:** Month 2  

**Level 1 — Self-serve (first point of support):**
- Knowledge base at `/help` — 30 FAQs covering:
  - Technical issues (mic not working, audio issues)
  - Account issues (OTP not received)
  - Payment issues (paid but no pack credited)
  - Product questions (how scoring works, what minutes means)
- Video walkthroughs: 3 short screen recordings for common issues

**Level 2 — WhatsApp support:**
- Dedicated support WhatsApp number (separate from broadcast number)
- Growth Lead responds within 2 hours during 9am–10pm
- After 10pm: auto-reply "We'll respond first thing tomorrow morning"
- First response script for common issues (copy-paste templates)

**Level 3 — Email support:**
- support@yourdomain.in
- 24-hour response target
- Powered by Resend — all support emails in shared inbox

**Escalation:**
- Payment issues → Backend Lead resolves within 4 hours
- Bug reports → Filed as GitHub issue immediately, user notified within 24 hours
- Abuse reports → Admin dashboard flag, resolved within 12 hours

**NPS Survey:**
- After 3rd completed session: in-product popup
- "How likely are you to recommend this to a friend? (0–10)"
- If score 9–10: ask for LinkedIn testimonial
- If score 7–8: ask what would make it a 10
- If score 0–6: ask what went wrong, escalate to Growth Lead personally

---

### Phase 53 — Retention & Re-engagement System
**Owner:** AI Lead + Growth Lead  
**Duration:** Month 3 onwards  

**Retention metrics to track (PostHog):**
- Day 1 retention: % of users who complete a second session within 24 hours
- Day 7 retention: % of users still active after 1 week
- Day 30 retention: % of users who completed all 10 rounds
- Round completion rate: average rounds completed per pack purchased

**Retention mechanics already built:**
- Email sequences (Phase 33)
- Push notifications (Phase 34)
- WhatsApp broadcasts (Phase 35)

**Additional retention features:**
- Streak system: "Practice X days in a row" badge on dashboard
- Personal best tracking: "Your best score ever: 87/100 (TCS Technical)"
- Weekly progress email every Monday: "Your week in numbers"
- "Your placement drive is in [N] days" countdown on dashboard (if user set target drive)

**Win-back campaign (for users who stopped):**
- 14 days no session → personal email from founder (not automation)
- Subject: "Quick question about your placement prep"
- Body: "Hey [Name], I noticed you haven't practiced in 2 weeks. Is everything going well? Placement drives are picking up — just wanted to check in. If something isn't working with the product, reply and I'll fix it personally."
- This personal touch has the highest open and reply rate of any email

---

### Phase 54 — Paid Advertising (Meta + Google)
**Owner:** Growth Lead  
**Duration:** Month 3 onwards (only after organic is proven)  
**Budget:** Start at ₹3,000/month. Scale based on ROAS.

**Golden Rule:** Only spend on paid ads after you've proven people buy organically. Ads amplify what already works — they don't fix what doesn't.

**Meta Ads (Instagram + Facebook):**

**Audience targeting:**
- Age: 19–24
- Location: Pune, Mumbai, Bengaluru, Hyderabad, Chennai, Delhi NCR (expand city by city)
- Interest: Engineering, Programming, Campus Placement, TCS, Infosys, LeetCode, Coding
- Behaviour: Recently active on LinkedIn

**Ad formats:**
- Video ad (best for this product): 15-second clip showing AI asking a question → student answering → score appearing
- Carousel ad: 5 slides — "What our AI tracks: WPM / Filler words / STAR score / Confidence / Technical accuracy"
- Static image: Scorecard screenshot + "₹499 for 10 interview rounds. Cheaper than dinner."

**Campaign structure:**
- Campaign 1: Awareness (reach + video views) — ₹1,000/month — drive recognition
- Campaign 2: Conversion (purchase) — ₹2,000/month — direct CTAs
- Retargeting: Users who visited payment page but didn't pay — ₹500/month

**Google Ads:**
- Only search ads (not display — display is too broad)
- Keywords: "TCS interview practice", "mock interview app India", "placement interview prep"
- Budget: ₹1,500/month
- Bid strategy: Target CPA ₹200 (you can afford this — each sale is ₹499)

---

### Phase 55 — Seasonal Campaign System
**Owner:** Growth Lead  
**Duration:** Ongoing  

**Placement season peaks:** August–November (on-campus drives), January–March (off-campus)

**Seasonal campaigns:**

**"Drive Season Sprint" (August, September):**
- 72-hour drive-specific landing pages for every known drive
- Email + WhatsApp blast to all users 72 hours before
- Instagram countdown stories
- Special "Drive Pack" — same ₹499 but adds 2 bonus rounds for drives happening this week
- Partner with Drive Squad ambassadors to post 48 hours before

**"New Year New Job" (January):**
- Off-campus placement push
- "2025 Placement Season starts now. Are you ready?"
- Limited time: ₹399 instead of ₹499 for first week of January only
- LinkedIn campaign: share progress scorecard with #NewYearNewJob hashtag

**"Exam Over, Placement Starts" (November, after semester exams):**
- Students relieved after exams, now anxious about placements
- "Exams done. Now comes the real test."
- Target: students who signed up but never bought a pack

---

### Phase 56 — Viral Mechanic Engineering
**Owner:** All team  
**Duration:** Month 2 onwards  

Every viral mechanic below should be built intentionally. Nothing should go viral by accident.

**Mechanic 1 — The LinkedIn Scorecard Flex**
Already designed. The scorecard PDF includes:
- "[Product Name] Assessment" at top (brand visible even when shared)
- Student name + company simulated + date
- Score badge (large, colourful, screen-grabs well)
- 3 analytics bars (WPM, STAR, Communication)
- "Practice at [yourdomain.in]" at bottom

When students post this on LinkedIn, the product name is visible to every recruiter and fellow student in their network. 200 connections × 500 active users = 100,000 impressions per week of pure organic brand.

**Mechanic 2 — The AI Roast Challenge**
Create an Instagram challenge: #AIRoastedMe
Rules: Post your worst AI feedback moment (screengrab or video), tag two friends, tag @[productname]
Prize: Top 3 roasts each month get 1 month free top-up pack
This produces user-generated content at zero cost.

**Mechanic 3 — The Score Leaderboard**
Add an optional public leaderboard: "Top scorers this week for TCS NQT"
Students are competitive by nature — being on the leaderboard is motivation AND social proof
"Priya from PICT Pune scored 94/100 for TCS Technical this week" → viral in Pune engineering circles

**Mechanic 4 — Referral Streak**
When a user's referred friend buys a pack, the referrer gets:
- ₹100 credit (already planned)
- PLUS a "Referral Streak" badge that shows how many people they've helped
- Badge visible on their profile and scorecard
Students compete to have the highest referral streak — social status drives sharing

**Mechanic 5 — The "48 Hours" Panic Email**
When a known placement drive is 48 hours away:
- Email subject: "48 hours. 1 interview. ₹499 or regret."
- This email has the highest open and click rate of any email you'll ever send
- It works because it's true, specific, and urgent — not manufactured urgency

**Mechanic 6 — The Placement Victory Post**
After a student gets placed, prompt them in-app:
- "Did you get placed? 🎉 Tell us about it!"
- If yes: ask them to submit a short testimonial
- Auto-generate a "Placement Success" image with their company logo, score improvement, and quote
- Share on product's social media with their permission
- This is the most powerful social proof possible — real placements, real data

**Mechanic 7 — WhatsApp Chain Template**
Pre-written message designed to be forwarded:
"Bhai/behen, if you have a placement drive coming up, try this AI mock interviewer — it actually works in Hinglish and knows TCS/Infosys questions. First 60 seconds is free, no login needed. → [link]

Share it to your placement WhatsApp group too — everyone benefits."
The last line asks them to forward it. This alone multiplied our beta user base by 5x.

**Mechanic 8 — The "Build in Public" Twitter/LinkedIn Series**
Document building the startup openly:
- Week 1 revenue: ₹0
- Week 8 revenue: ₹89,820 (screenshot of Razorpay dashboard)
- First B2B deal: "We just signed our first college — 200 students get access"
This audience becomes your most loyal customers and marketers. They're invested in your success.

---

## 4. Complete Marketing Strategy — Every Channel

### Master Channel List

| Channel | Type | Cost | Effort | Speed to Results | Priority |
|---|---|---|---|---|---|
| WhatsApp groups (college) | Organic | Free | Low | Immediate | 🔴 Critical |
| LinkedIn (personal posts) | Organic | Free | Medium | 1–2 weeks | 🔴 Critical |
| Instagram Reels | Organic | Free | High | 2–6 weeks | 🔴 Critical |
| Affiliate/referral program | Performance | ₹100–150/sale | Low setup | Immediate | 🔴 Critical |
| SEO / Blog | Organic | Free | High | 3–6 months | 🟡 Important |
| Telegram community | Organic | Free | Medium | 1–2 months | 🟡 Important |
| YouTube | Organic | Free | High | 1–3 months | 🟡 Important |
| Reddit | Organic | Free | Medium | 1–4 months | 🟡 Important |
| Email marketing | Owned | ₹0 (Resend free) | Low | Immediate | 🔴 Critical |
| WhatsApp Business API | Owned | ₹1–2/message | Low | Immediate | 🔴 Critical |
| Push notifications | Owned | Free | Low | Immediate | 🟡 Important |
| Product Hunt | One-time | Free | Medium | 1 day | 🟡 Important |
| College fests / events | Offline | ₹2,000–5,000 | High | Immediate | 🟡 Important |
| Campus ambassadors | Performance | ₹100/sale | Medium setup | 2–4 weeks | 🔴 Critical |
| Freelancer affiliates | Performance | ₹125–150/sale | Medium | 2–4 weeks | 🔴 Critical |
| Influencer outreach | Performance | Free (commission) | Medium | 2–6 weeks | 🟡 Important |
| B2B college sales | Direct sales | Free (time only) | High | 1–3 months | 🔴 Critical |
| PR / Media | Earned | Free | Medium | 1–3 months | 🟢 Nice |
| Meta ads | Paid | ₹3,000+/month | Medium | 1–2 weeks | 🟢 Month 3+ |
| Google Search ads | Paid | ₹1,500+/month | Low | 1 week | 🟢 Month 3+ |
| Twitter/X | Organic | Free | Medium | 1–3 months | 🟢 Nice |
| Quora | Organic | Free | Medium | 1–6 months | 🟡 Important |
| Discord server | Organic | Free | High | 2–4 months | 🟢 Nice |
| YouTube Shorts | Organic | Free | Medium | 2–8 weeks | 🟡 Important |

---

## 5. Viral Growth Playbook

### The Core Viral Loop

```
Student hears about product (WhatsApp / LinkedIn)
    ↓
Tries 60-second free demo — AI gives harsh honest feedback
    ↓
Feels "I actually need to fix this" — buys ₹499 pack
    ↓
Completes sessions, gets scorecard
    ↓
Shares scorecard on LinkedIn (social proof / flex)
    ↓
200 connections see it — 10 click, 3 sign up
    ↓
Loop repeats — with NO marketing spend
```

### Amplifiers

Every feature below amplifies the viral loop:

1. Scorecard branded with product name — brand spreads with every share
2. LinkedIn pre-filled post — reduces friction of sharing to one click
3. WhatsApp chain template — reduces friction of recommending to friends
4. Referral code = ₹100 for the sender — financial incentive to share
5. AI Roast content — entertaining, spreads on its own
6. Score leaderboard — competition drives engagement and mention

### Viral Coefficient Target

Target K-factor (viral coefficient) of 0.3:
- Every 10 new users should bring in 3 more via referral
- At K=0.3 with 100 paid users: word of mouth brings 30 more → they bring 9 more → 3 more
- This alone reduces your effective customer acquisition cost by 30%
- Track K-factor weekly in PostHog: (invites sent × conversion rate)

---

## 6. B2B Sales Strategy

### Why B2B Is Your Best Revenue Source

One B2B deal (college at ₹30,000/month) = 60 individual pack sales.
Time to close a B2B deal: 2–4 weeks (with right approach).
Time to close 60 individual sales: months of marketing.

### B2B Decision-Making Structure in Indian Colleges

| Decision Maker | Role | What They Care About |
|---|---|---|
| TPO (Training & Placement Officer) | Final approver | Placement % improvement, cost, ease of implementation |
| Placement Cell President (student) | Influencer | Whether students actually like it |
| Director/Principal | Budget approver at some colleges | Cost, brand, recognition |
| HOD (Head of Department) | Occasional influencer | Technical credibility |

**Strategy:** Always get a student to recommend it to TPO before you cold email. The TPO trusts their own students more than any salesperson.

**The sequence that works:**
1. Get 2–3 students from the target college to use the product (free access)
2. Those students share their scores, talk about it, the TPO hears about it
3. Growth Lead sends cold email to TPO: "I believe 3 of your students have already tried this"
4. TPO is now warm — they've heard the name from their own students first
5. Offer free pilot for 20 students
6. Present pilot results at end of 2 weeks
7. Propose paid contract

### B2B Pricing Negotiation

**NEVER start at your bottom price.** Start 30% above and negotiate.

If target price is ₹30,000/month: open at ₹40,000/month.
Standard objections and responses:

"Too expensive" → "What's your current budget for placement preparation tools? Let's see what fits." (If they have zero budget: offer revenue-share model — ₹200 per placed student)

"We already have [other tool]" → "Can you tell me what that tool does? Most tools we've seen are text-based and don't handle voice practice or Hinglish. If yours does all that, we may not be the right fit — but I'd love to show you the difference."

"I need to check with the director" → "Absolutely. Would you like me to prepare a 1-page summary for the director? I can have it ready today."

---

## 7. Content Marketing System

### Content Calendar — Month 3 onwards

**Weekly production targets:**

| Content | Owner | Count/Week | Platform |
|---|---|---|---|
| Instagram Reels | Growth Lead | 2 | Instagram |
| Instagram Posts | Growth Lead | 3 | Instagram |
| LinkedIn personal posts | Founder/Growth Lead | 3 | LinkedIn |
| Twitter/X posts | Growth Lead | 7 | Twitter |
| Blog articles | Growth Lead | 1 | Blog |
| Quora answers | Growth Lead | 2 | Quora |
| Telegram channel posts | Growth Lead | 2 | Telegram |
| YouTube Shorts | Growth Lead | 2 | YouTube |

**Content production workflow:**
1. Monday: Plan week's content (30 min)
2. Tuesday: Write blog article (2–3 hours)
3. Wednesday: Record 2 Reels (1–2 hours)
4. Thursday: Write LinkedIn + Twitter posts (1 hour)
5. Friday: Schedule everything for next week using Buffer (free plan)

**Repurposing chain:**
Blog article → LinkedIn post (extract key points) → Twitter thread (extract 10 points) → Instagram carousel (visualise the 10 points) → YouTube Short (record yourself explaining the best point)

One blog article becomes 4 additional pieces of content. This multiplies your output without multiplying your time.

---

## 8. Paid Advertising Playbook

### When to Start Paid Ads
Only start paid ads when:
- ✅ You have at least 50 organic paying customers
- ✅ You have at least 3 genuine testimonials
- ✅ Your landing page converts at 3%+ (verified in PostHog)
- ✅ Your payment flow works flawlessly
- ✅ You have ₹5,000/month budget you can afford to lose entirely

Starting paid ads before these conditions = burning money.

### ROAS Target (Return on Ad Spend)
- Target ROAS: 4x (spend ₹1, make ₹4)
- At ₹3,000/month spend: need ₹12,000 in attributed sales minimum
- At ₹499/pack: need 24 sales from ads to break even on ₹3,000 spend
- This means CAC (customer acquisition cost) from ads must be under ₹125

### Creative Testing Process
- Launch 3 different video creatives simultaneously with small budget (₹500 each)
- After 1 week: kill the 2 lowest performers, scale the winner
- Every 2 weeks: introduce 1 new creative to test against current winner
- Never let a creative run without a fresh competitor to test against

---

## 9. Community Building

### The Community Flywheel

```
Product brings students together
    ↓
Students share tips, prep together in community
    ↓
Community makes product stickier (students stay engaged)
    ↓
Community members recruit their friends
    ↓
Community grows → more social proof → more signups
```

### Community Platforms Priority

**Telegram (primary):** Open to all students, not just paying users. Drive alerts, weekly tips, resource sharing. 0 cost to participate — builds brand awareness in people before they pay.

**Discord (engaged users only):** More active community. Weekly "study together" sessions. Invite only for users who completed 5+ sessions. Creates a sense of exclusivity.

**WhatsApp Community:** Groups limited to 1,000 people but very high engagement. Use for specific college groups. Drive Squad ambassadors manage their college's WhatsApp group.

### Community Content (Growth Lead runs this)

**Weekly events:**
- Monday: Weekly tip of the week (in Telegram + Discord)
- Wednesday: "Ask the AI" — post a sample question, community discusses best answer before AI reveals scoring
- Friday: Score board — users share their week's best session score
- Sunday: Drive alert roundup — all known drives in next 2 weeks

---

## 10. PR & Media Strategy

### Press Release Template

**Headline:** "Pune Student Team Builds India's First Hinglish AI Interviewer — ₹499 vs ₹1,500 Coaching Classes"

**Lead paragraph:** [Product name], built by four engineering students from Pune, has launched an AI-powered mock interview platform designed specifically for Indian placement drives. The product simulates TCS, Infosys, and startup interviews in Hinglish — understanding answers given in Hindi, English, or a mix of both — and provides objective scoring based on the STAR method, speaking pace, and filler word frequency.

**Data paragraph:** In its first three months, [Product] has served [X] users across Pune engineering colleges, with students averaging a [X]% improvement in interview scores after five sessions. The platform costs ₹499 for ten sessions — compared to ₹1,500 or more for a single session with a human placement coach.

**Quote from founder:** "[Quote about why you built this — personal, emotional, honest]"

**Quote from user:** "[Student name], a [year] student at [college], said: '[Genuine quote about the product impact]'"

**Call to action:** [Product name] is available at [website]. First 60 seconds of each interview are free with no login required.

### Journalist Relationship Building

Before pitching: follow journalists who cover edtech and Indian startups on Twitter/LinkedIn. Like and comment on their posts for 2–4 weeks before pitching. When your pitch arrives, they already recognise your name.

---

## 11. Retention & Customer Success

### Retention Targets

| Metric | Target | How to Measure |
|---|---|---|
| % completing all 10 rounds | 70%+ | PostHog — sessions per user |
| % buying top-up after 10 rounds | 30%+ | Razorpay → second purchase rate |
| NPS score | 50+ | In-product survey |
| Day 7 retention | 60%+ | PostHog |
| Referral rate | 20%+ | Affiliates DB — % users who refer |

### The One Metric That Predicts Everything

Users who complete 3+ sessions are 5x more likely to:
- Buy a top-up pack
- Refer a friend
- Post on LinkedIn
- Respond to survey

**First-session-to-second-session conversion is your most important retention metric.** Everything — emails, push notifications, product design — should funnel toward getting users to start their second session within 48 hours of the first.

---

## 12. Publishing & App Distribution

### Web App (Primary — Already Done)
- Hosted on Vercel at yourdomain.in
- Cloudflare CDN
- PWA installable (Phase 31)

### Google Play Store (Month 4)
- Build as Progressive Web App first (Phase 31)
- If PWA metrics look good: wrap in Capacitor to create Android APK
- Google Play Store listing:
  - App name: [Product Name] — AI Interview Practice
  - Short description: "Practice TCS, Infosys & startup interviews in Hinglish. AI scores your WPM, filler words & STAR answers."
  - Category: Education
  - Screenshots: 5 phone screenshots of interview session, scorecard, setup screen
  - Feature graphic: 1024×500 banner
  - Video: 30-second demo (optional)
  - Privacy policy URL (required)
- Developer account: ₹2,000 one-time registration fee

### Apple App Store (Month 5 — if Android shows demand)
- Apple Developer Account: $99/year = ~₹8,300
- Same Capacitor wrapper with iOS build
- App Review guidelines: ensure no misleading claims in app description

### App Store Optimisation (ASO)
Same as SEO but for app stores:
- Include target keywords in app title and description
- Ask beta users to leave 5-star reviews in first week
- Respond to every review (shows activity to algorithm)
- Update app every 2 weeks (triggers algorithm boost)

---

## 13. Monthly Marketing Calendar

### Month 1 (Post-Launch)
- Week 1: WhatsApp drops in 20 college groups, first LinkedIn article, Instagram page setup
- Week 2: First 5 beta user testimonials collected, first blog post published
- Week 3: Product Hunt preparation begins, affiliate program opens for students
- Week 4: Campus ambassador (Drive Squad) program launched, first 5 ambassadors onboarded

### Month 2
- Week 1: Product Hunt launch day, all hands on deck
- Week 2: First influencer outreach (20 DMs sent), Telegram community launched
- Week 3: First YouTube video published, Reddit activity begins
- Week 4: First B2B cold email outreach to 10 TPOs

### Month 3
- Week 1: First Meta ads launched (₹3,000 test budget)
- Week 2: First press release sent to YourStory and Inc42
- Week 3: First college fest attendance/sponsorship
- Week 4: B2B follow-ups, first pilot college identified

### Month 4
- Week 1: Google Play Store submission
- Week 2: First B2B deal target — 2-week pilot ends, proposal sent
- Week 3: "Drive Season Sprint" campaign for placement season
- Week 4: Scale Meta ads if ROAS positive

### Month 5
- Revenue target: ₹2,00,000+
- Focus: B2B deals (2+ signed), affiliate scale-up, SEO starting to show results
- Google ads budget increase if positive ROAS
- Discord community launch

### Month 6
- Revenue target: ₹3,50,000+
- First national expansion: Mumbai, Bengaluru
- 3+ college B2B deals active
- Product Hunt "Golden Kitty" nomination consideration
- Apply for startup accelerator programs (NASSCOM 10000 Startups, TiE Pune, etc.)

---

## Appendix — Freelancer Affiliate Onboarding Email

**Subject:** You're approved as a [Product Name] affiliate — here's everything you need

"Hi [Name],

Welcome to the [Product Name] affiliate program. You're approved at our Freelancer Standard tier — 25% commission (₹125 per ₹499 sale).

Your unique referral code: **[CODE]**
Your referral link: yourdomain.in?ref=[CODE]

**Your first week checklist:**
- [ ] Download your marketing kit → [Google Drive link]
- [ ] Try the product yourself (free access for affiliates) → [link]
- [ ] Share your first post this week using one of the templates in the kit
- [ ] Message me on WhatsApp if you have any questions → [number]

**How payouts work:**
Payouts every Sunday via UPI. Minimum ₹500 to trigger payout. You'll get a message every Sunday with your weekly earnings.

**How to reach 30% commission:**
Refer 25 paying customers in any single month → your commission upgrades to 30% permanently. Our top affiliate last month earned ₹3,750 from 25 referrals.

I'm personally available on WhatsApp to help you succeed. If you're struggling to convert, message me and we'll figure out what to change.

Good luck — let's build this together.

[Founder name]
[Product name]"

---

*This document continues from master_product_spec.md (Phases 01–30). Together, these two documents cover the complete product, launch, and growth strategy. Total phases: 60. Read both before writing a single line of code or sending a single marketing message.*
