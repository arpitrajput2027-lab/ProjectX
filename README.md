# AI Career OS — ReadyIndex Platform

> **Built by:** Arpit Rajput Lodhi · Bhavneesh · [@arpitrajput2027-lab](https://github.com/arpitrajput2027-lab)

Full-stack AI-powered career intelligence platform. Students upload resumes, connect GitHub/LeetCode profiles, and get an honest "ReadyIndex" score. AI runs ATS checks, JD matching, and resume customization.

**Stack:** Next.js 15 (App Router) + FastAPI + Supabase + Groq (LLaMA 3.3 70B) + Gemini 2.0 Flash fallback

For setup instructions → see [SETUP.md](SETUP.md)

---

## ✅ WHAT IS BUILT (Current Status)

### 🗄️ Database — COMPLETE (10 Tables)
- `users` — extends Supabase `auth.users`, stores role (`student` / `recruiter` / `admin`)
- `student_profiles` — full profile: name, phone, location, target role, work preference, GitHub/LeetCode usernames, readiness score, ATS score + all resume sections as JSONB (`education`, `experience`, `projects`, `skills`, `achievements`, `certifications`)
- `company_profiles` — company metadata (name, industry, size, website, logo)
- `recruiter_profiles` — linked to company, stores designation + contact
- `resumes` — stores file path, raw text, structured JSON per student
- `jobs` — full job listing (title, description, required skills, location, work mode, salary, deadline, status)
- `applications` — tracks student → job with status pipeline: `saved → applied → assessment → interview_scheduled → interview_completed → selected → rejected`
- `ats_checks` — ATS check history per user (scores, keywords, recommendations)
- `jd_matches` — JD match history per user (match score, readiness score, matched/missing skills)

---

### 🐍 Backend (FastAPI) — PARTIAL

| Router | Endpoint | Status | Notes |
|---|---|---|---|
| `/api/auth` | `routers/auth.py` | 🟡 Stub | Login/Signup routes exist, logic placeholder — auth handled by Supabase on frontend |
| `/api/students` | `routers/students.py` | 🟡 Stub | `/onboarding` + `/me` exist, not wired to DB |
| `/api/recruiters` | `routers/recruiters.py` | 🟡 Stub | Placeholder only |
| `/api/jobs` | `routers/jobs.py` | 🟡 Stub | Placeholder only |
| `/api/resumes/parse` | `routers/resumes.py` | ✅ LIVE | PDF upload → PyMuPDF text extract → LLM structured parse → returns JSON |
| `/api/ats/check` | `routers/ats.py` | ✅ LIVE | Takes resume JSON → returns 8-dimension ATS score + feedback + saves to DB |
| `/api/ats/match-jd` | `routers/ats.py` | ✅ LIVE | Resume + JD → match score, readiness score, skill gaps + saves to DB |
| `/api/ats/customize` | `routers/ats.py` | ✅ LIVE | Resume + JD + match → AI-customized resume (no hallucination, rearrange/rephrase only) |

**AI Services (fully built):**
- `llm_service.py` — PDF text → structured JSON extraction (Groq primary, Gemini fallback)
- `ats_service.py` — 3 functions: ATS check, JD match, resume customization (Groq primary, Gemini fallback)
- `parsing.py` — PyMuPDF PDF byte extraction
- `database.py` — Supabase client singleton

**Dependencies:** `fastapi`, `uvicorn`, `supabase`, `pydantic`, `groq`, `google-generativeai`, `PyMuPDF`, `python-multipart`, `python-dotenv`

---

### ⚛️ Frontend (Next.js 15) — PARTIAL

#### Pages / Routes

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ | Routes to correct landing based on role |
| `/auth/login` | ✅ | Supabase auth via AuthModal |
| `/auth/signup` | ✅ | Supabase auth + Google OAuth |
| `/onboarding` | ✅ LIVE | 5-step wizard, fully wired to DB |
| `/(dashboard)/profile` | ✅ LIVE | Full profile management + modals |
| `/(dashboard)/resume` | ✅ LIVE | Resume editor + ATS + JD Matcher tabs |
| `/student` | 🟡 Stub | Placeholder redirect only |
| `/recruiter` | 🟡 Stub | Placeholder redirect only |

#### Feature Components

**`features/landing/`**
- `LandingPage.tsx` — root router, detects role, renders correct landing
- `StudentLandingPage.tsx` ✅ — full ReadyIndex landing: hero with mock score gauge, stats band, problem section, 5-step journey, 6-feature grid, CTA, footer. AuthModal integrated.
- `RecruiterLandingPage.tsx` ✅ — recruiter-facing landing (separate branding/copy)

**`features/onboarding/`**
- `OnboardingFlow.tsx` ✅ — **5-step wizard** wired to Supabase:
  - Step 1: Personal info (name, phone)
  - Step 2: Preferences (target role, work preference, location)
  - Step 3: Resume upload → calls `/api/resumes/parse` → AI parses PDF → stores structured data
  - Step 4: Platform links (GitHub username, LeetCode username)
  - Step 5: Review + submit → saves full profile to `student_profiles`

**`features/profile/`**
- `ProfileView.tsx` ✅ — **Full dashboard profile** (603 lines):
  - Fetches profile from Supabase on load
  - Contact info editable via react-hook-form
  - GitHub stats card (via `github-readme-stats`)
  - LeetCode stats card (via `leetcode-stats-api`)
  - All resume sections: Education, Experience, Projects, Skills, Achievements, Certifications
  - Each section: Add / Edit / Delete via dedicated modals
  - Stats drawer (ATS score display)

**`features/resume/`**
- `ResumeEditor.tsx` ✅ — full structured resume builder with all 6 sections
- `ATSChecker.tsx` ✅ — calls `/api/ats/check`, shows 8-dimension scores, missing keywords, strengths/weaknesses, improvement tips
- `JDMatcher.tsx` ✅ — paste JD → calls `/api/ats/match-jd` → shows match %, skill gaps, keyword hits → calls `/api/ats/customize` for tailored resume output

**`features/jobs/`** — ❌ **EMPTY** (folder exists, nothing built)

#### Modal Components Built (7 total)
- `AuthModal.tsx` ✅ — login/signup (Supabase email + Google OAuth)
- `ProjectModal.tsx` ✅ — add/edit project entries
- `EducationModal.tsx` ✅ — add/edit education entries
- `ExperienceModal.tsx` ✅ — add/edit experience entries
- `SkillModal.tsx` ✅ — add/edit skill categories
- `AchievementModal.tsx` ✅ — add/edit achievements
- `CertificationModal.tsx` ✅ — add/edit certifications

#### Lib
- `supabase.ts` — Supabase browser client (anon key)
- `studentRouting.ts` — routing utility for student flow

---

## ❌ WHAT IS NOT BUILT YET

### Frontend
- **Jobs / Job Board** — `features/jobs/` is completely empty
- **Recruiter Dashboard** — no recruiter-side UI exists at all
- **RAG Resume Chat** — shown on landing page, not implemented
- **Mock Interview Coach** — shown on landing page, not implemented
- **Application Tracking** — DB table exists, no UI
- **ReadyIndex Score dashboard widget** — mentioned in copy, not a real computed widget
- **LeetCode/GitHub real-time score computation** — currently static embed cards only

### Backend
- **Auth router** — stub only, no JWT / session validation middleware
- **Students router** — `/me` not wired to DB
- **Jobs router** — no CRUD implemented
- **Recruiters router** — no CRUD implemented
- **Application matching pipeline** — DB schema exists, no backend logic
- **RAG pipeline** — not started
- **ReadyIndex composite score** — not calculated anywhere in backend

---

## 📁 Actual Project Structure

```text
PROJECT/
├── README.md
├── SETUP.md
├── supabase/
│   └── schema.sql               ← 10 tables + ATS/JD history tables
│
├── backend/                     ← FastAPI
│   ├── main.py                  ← 6 routers registered
│   ├── database.py              ← Supabase client
│   ├── llm_service.py           ← PDF → structured JSON (Groq + Gemini fallback)
│   ├── ats_service.py           ← ATS check + JD match + customize (Groq + Gemini)
│   ├── parsing.py               ← PyMuPDF text extract
│   ├── requirements.txt
│   └── routers/
│       ├── resumes.py           ← /parse ✅ LIVE
│       ├── ats.py               ← /check, /match-jd, /customize ✅ LIVE
│       ├── auth.py              ← 🟡 stub
│       ├── students.py          ← 🟡 stub
│       ├── recruiters.py        ← 🟡 stub
│       └── jobs.py              ← 🟡 stub
│
└── frontend/                    ← Next.js 15 App Router
    └── src/
        ├── lib/
        │   ├── supabase.ts
        │   └── studentRouting.ts
        ├── components/
        │   └── modals/          ← 7 modals ✅
        ├── features/
        │   ├── landing/         ← StudentLandingPage ✅, RecruiterLandingPage ✅
        │   ├── onboarding/      ← OnboardingFlow (5 steps, fully wired) ✅
        │   ├── profile/         ← ProfileView (full profile + CRUD modals) ✅
        │   ├── resume/          ← ResumeEditor, ATSChecker, JDMatcher ✅
        │   └── jobs/            ← ❌ EMPTY
        └── app/
            ├── page.tsx
            ├── layout.tsx
            ├── globals.css
            ├── auth/login/ + auth/signup/   ← ✅
            ├── onboarding/                  ← ✅
            ├── (dashboard)/
            │   ├── layout.tsx
            │   ├── profile/                 ← ✅
            │   └── resume/                  ← ✅
            ├── student/                     ← 🟡 stub
            └── recruiter/                   ← 🟡 stub
```

---

## 🚀 Running the Application

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000  |  API docs at /docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Environment Variables

**`frontend/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**`backend/.env`**
```env
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
```
