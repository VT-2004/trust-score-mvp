<div align="center">

# 🛡️ TrustScore AI — Developer Authenticity & Resume ATS Verifier

[![Live Demo](https://img.shields.io/badge/Demo-trust--score--mvp.vercel.app-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://trust-score-mvp.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/VT-2004/trust-score-mvp?style=for-the-badge&color=f59e0b)](https://github.com/VT-2004/trust-score-mvp/stargazers)
[![Status](https://img.shields.io/badge/Status-Active%20Production-success?style=for-the-badge)]()

**Cross-examine candidate resumes, claimed skills, and commit entropy against live, public GitHub repository footprints.**

[Explore Live Demo](https://trust-score-mvp.vercel.app/) • [Report Bug](https://github.com/VT-2004/trust-score-mvp/issues) • [Request Feature](https://github.com/VT-2004/trust-score-mvp/issues)

</div>

---

## 🌟 Key Features

### 🔍 1. Developer Authenticity Profiler
- **Deep Commit & Rhythm Analysis**: Audits commit timing entropy, midnight push ratios, single-burst vs organic commit distributions, and PR collaboration metrics.
- **Assignment vs Standalone Repo Classification**: Distinguishes between tutorial forks, take-home coding challenges, and genuine production repositories.
- **AI-Powered Plausibility & Interview Prompts**: Generates technical probing questions tailored to the candidate's actual commit footprint.

### 📄 2. Dual Candidate Resume ATS & GitHub Comparator
- **Client-Side PDF Text Extraction**: In-browser text parser powered by `pdfjs-dist` to cleanly extract text from uploaded `.pdf`, `.docx`, and `.txt` resumes.
- **Zero-Leakage PII Redaction**: Automatically sanitizes emails, phone numbers, and physical addresses before AI cross-examination.
- **Side-by-Side ATS Scoring**: Compares candidate skill claims vs tangible repository proof and produces a definitive hiring verdict.

### ⚔️ 3. Head-to-Head Repository Comparator
- Benchmark two GitHub profiles or repositories simultaneously across commit cadence, language diversity, and verified code signals.

### 🔒 4. Privacy-First Architecture & Private Audit History
- **100% Private Audits**: No candidate tests or credentials are broadcast publicly.
- **5 Free Tests Guest Quota**: Visitors get 5 complimentary audits saved in `localStorage`.
- **Database-Backed Accounts**: Register with Email & Password (with built-in password recovery) to unlock unlimited audits and sync local test history.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TD
    A[Frontend: React + Vite + Vanilla CSS] -->|Client PDF Extraction| B[pdfjs-dist]
    A -->|REST API Requests| C[Backend: Express.js]
    C -->|Fetch Profiles & Repos| D[GitHub REST API]
    C -->|PII Redaction + Reasoning| E[Groq Llama-3 AI Engine]
    C -->|User Accounts & Audit Logs| F[PostgreSQL / Neon DB]
    A -->|Static Hosting| G[Vercel CDN]
    C -->|Production Server| H[Render Web Service]
```

- **Frontend**: React 18, Vite, Lucide Icons, PDF.js (`pdfjs-dist`), Vanilla Design System (Dark/Light mode, Glassmorphism, 100% Mobile Responsive).
- **Backend**: Node.js, Express, `bcryptjs`, `jsonwebtoken`, `pg` (PostgreSQL), `multer`.
- **AI & Analytics**: Groq Cloud (Llama-3-70B) with heuristic fallback engine.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- GitHub Personal Access Token (for raised API limits)
- Groq API Key (free from [console.groq.com](https://console.groq.com))

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/VT-2004/trust-score-mvp.git
cd trust-score-mvp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=3001
GITHUB_TOKEN=ghp_your_github_token
GROQ_API_KEY=gsk_your_groq_api_key
DATABASE_URL=postgres://user:password@host:5432/dbname
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Run Locally
```bash
# In backend/
npm start

# In frontend/ (in a separate terminal)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/VT-2004">VT-2004</a></sub>
</div>
