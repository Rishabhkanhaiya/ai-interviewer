<div align="center">
  <img src="https://raw.githubusercontent.com/Rishabhkanhaiya/ai-interviewer-backup/master/screen.png" alt="InterviewAI" width="100%" />

  <h1>🎙️ InterviewAI</h1>
  
  <p>
    <strong>The Next-Generation AI Mock Interview Platform</strong><br/>
    Practice real-time technical, HR, and managerial interviews with a hyper-realistic AI interviewer.
  </p>

  <p>
    <a href="#features">Features</a> • 
    <a href="#tech-stack">Tech Stack</a> • 
    <a href="#getting-started">Getting Started</a> • 
    <a href="#environment-variables">Environment Variables</a> • 
    <a href="#license">License</a>
  </p>
</div>

---

## 🌟 Overview

**InterviewAI** is a full-stack platform that helps candidates prepare for real-world job interviews using real-time generative AI. It streams ultra-fast voice interactions over WebSockets, evaluates user responses dynamically, and provides a detailed scorecard upon completion.

The platform includes a robust **Affiliate System**, a **Credits/Pack Purchasing System**, and a comprehensive **Admin Dashboard** for overseeing revenue and analytics.

---

## ✨ Key Features

### 👨‍💻 For Candidates
- **Real-Time Voice Interviews**: Hyper-realistic latency-free conversations using WebSockets.
- **Tailored Sessions**: Choose from Technical, Behavioral/HR, or Managerial rounds.
- **Context Awareness**: Upload your resume or paste a job description so the AI asks highly relevant questions.
- **Detailed Scorecards**: Get immediate feedback, scores, and areas of improvement after every session.
- **Leaderboard**: Compete with others and rank up by giving great interviews.
- **Dark/Light Theme**: A stunning, glassmorphism-inspired UI with smooth micro-animations.

### 💰 Monetization & Growth
- **Pack Purchases**: Buy interview credits seamlessly via Razorpay integration.
- **Affiliate Program**: Share referral links, earn commissions, and get paid directly via UPI.
- **Global Leaderboard**: Gamification to keep users engaged and practicing.
- **Push Notifications**: Re-engage users with Web Push notifications.

### 🛡️ Admin Dashboard
- **Real-time Metrics**: View active sessions, total revenue, and estimated API costs.
- **Payout Approvals**: Approve or reject affiliate withdrawal requests.
- **System Kill-Switch**: Enable maintenance mode with one click.
- **Blog CMS**: Write and manage SEO-optimized markdown blog posts directly from the dashboard.
- **Broadcast System**: Send push notifications to specific users or broadcast to everyone.

---

## 🛠️ Tech Stack

### Frontend (Next.js 14)
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS + Custom Vanilla CSS (Glassmorphism, Animations)
- **Icons**: Lucide React
- **Auth & DB**: Supabase Client
- **PWA / Notifications**: Service Workers

### Backend (FastAPI)
- **Framework**: FastAPI (Python)
- **Real-time**: WebSockets for audio streaming
- **AI Models**: Groq (Llama 3) for inference
- **Speech**: Sarvam AI for fast Text-to-Speech (TTS) and Speech-to-Text (STT)
- **Caching & Pub/Sub**: Redis
- **Database**: Supabase PostgreSQL

### Infrastructure & Payments
- **Payments**: Razorpay
- **Storage**: Supabase Storage (Resumes, Profile Pictures)
- **Monitoring**: Sentry (Optional)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Redis Server (Running locally or via Docker)
- Supabase Project (Database, Auth, Storage)

### 1. Clone the repository
```bash
git clone https://github.com/Rishabhkanhaiya/ai-interviewer-backup.git
cd ai-interviewer-backup
```

### 2. Setup the Backend
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

Run the backend server:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Setup the Frontend
Navigate to the `frontend` directory and install dependencies:
```bash
cd frontend
npm install
```

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🔐 Environment Variables

You need to create `.env` files in both the frontend and backend directories.

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### Backend (`backend/.env`)
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_supabase_jwt_secret

# AI APIs
GROQ_API_KEY=your_groq_api_key
SARVAM_API_KEY=your_sarvam_api_key

# Database & Redis
DATABASE_URL=your_postgres_connection_string
REDIS_URL=redis://localhost:6379

# Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Notifications
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@interviewai.in
```

---

## 📜 License

This project is proprietary and confidential. Unauthorized copying of this file, via any medium, is strictly prohibited.

<div align="center">
  <p>Built with ❤️ by Rishabh Joshi</p>
</div>
