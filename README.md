# 🚀 AI Career OS — ReadyIndex / ProjectX

**AI Career OS** is a full-stack, AI-powered career platform that bridges the gap between **Students** (job seekers) and **Recruiters** (hiring managers). It uses multiple LLMs (Groq LLaMA 3.3, Google Gemini, Sarvam 105B) to automate resume parsing, ATS scoring, job-resume matching, resume customization, and real-time job discovery.

The platform has two completely separate dashboards — one for Students and one for Recruiters — each with its own onboarding flow, feature set, and landing page.

---

## 🏗️ Architecture Overview

```
┌─────────────────────┐        ┌──────────────────────────────┐
│     Next.js 16      │  API   │       FastAPI (Python)        │
│  (React 19 + TS)    │◄──────►│   Routers: auth, students,   │
│  Tailwind CSS 4     │  REST  │   resumes, recruiters, jobs,  │
│  Supabase Auth      │        │   ats, interviews             │
└────────┬────────────┘        └──────────────┬───────────────┘
         │                                     │
         │  Direct DB Access                   │  Service Role Key
         ▼                                     ▼
┌──────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                      │
│  Tables: users, student_profiles, recruiter_profiles,        │
│  company_profiles, resumes, jobs, applications,              │
│  ats_checks, jd_matches, saved_candidates, interviews        │
│  + Storage Bucket: resumes (PDF files)                       │
└──────────────────────────────────────────────────────────────┘
```

### AI / LLM Integrations
| Provider | Model | Used For |
|---|---|---|
| **Groq** | LLaMA 3.3 70B Versatile | Resume parsing, ATS scoring, JD matching, Resume customization (Primary) |
| **Google Gemini** | Gemini 2.0 Flash | Same as above (Fallback when Groq fails) |
| **Sarvam AI** | Sarvam 105B | Live job search — extracting job details from web snippets, scoring jobs against resume |
| **SerpApi** | Google Jobs Engine | Fetching real-time job listings from Google Jobs |
| **DuckDuckGo** | Web Search (ddgs) | Scraping job listings from LinkedIn, Naukri, Indeed as a secondary source |

---

## 👨‍🎓 Student Side — Features (Detailed)

### 1. Authentication (Login / Signup)
- Email + Password signup/login via **Supabase Auth**.
- **Google OAuth** login — one-click sign in with Google.
- Role-based signup — user selects `student` role during signup (passed as `?role=student` query param).
- After signup, user is redirected to the **Onboarding Flow**.

### 2. Student Onboarding Flow
- Multi-step onboarding wizard (`OnboardingFlow.tsx` — 22KB component).
- Collects: Full Name, Phone, Location, Target Role, Work Preference, Portfolio URL, GitHub username, LeetCode username.
- Creates the `student_profiles` record in Supabase with `onboarding_completed = true`.
- Redirects to the Student Dashboard after completion.

### 3. Student Dashboard (Sidebar Navigation)
The student dashboard has 6 pages accessible from the sidebar:

#### 📋 Profile (`/profile`)
- Displays the complete student profile fetched from Supabase `student_profiles` table.
- Shows: Personal info, Education, Experience, Projects, Skills, Achievements, Certifications.
- All data is populated from the parsed resume (via LLM) and the onboarding form.
- **ReadyIndex Score** — an overall readiness metric.
- Profile is a large 31KB component (`ProfileView.tsx`) with detailed card-based sections.

#### 📝 Resume Builder (`/resume`)
- **PDF Upload** — Upload a resume PDF, backend extracts text using **PyMuPDF** (`fitz`).
- **LLM Parsing** — Extracted raw text is sent to Groq (LLaMA 3.3) which returns structured JSON with: education, experience, projects, skills, achievements, certifications.
- **In-Browser Editor** — Rich resume editor (`ResumeEditor.tsx` — 22KB) to edit each section visually.
- **PDF Export** — Export the edited resume as a downloadable PDF using `html2pdf.js`.

#### 🛡️ ATS & JD Tools (`/resume?tab=ats`)
Two powerful AI tools accessible from the resume page:

**a) ATS Score Checker (`ATSChecker.tsx` — 19KB)**
- Sends the structured resume JSON to `/api/ats/check`.
- Backend uses Groq (with Gemini fallback) to evaluate the resume across **8 dimensions**:
  1. Formatting (0-100)
  2. Content Quality (0-100)
  3. Skills Optimization (0-100)
  4. Keyword Density (0-100)
  5. Section Completeness (0-100)
  6. Readability (0-100)
  7. Structure (0-100)
  8. Overall ATS Compatibility (0-100)
- Returns: `overall_score`, `dimension_scores`, `missing_keywords`, `section_recommendations`, `improvement_tips`, `strengths`, `weaknesses`.
- Results are saved to the `ats_checks` table in Supabase.

**b) JD Matcher + Resume Customizer (`JDMatcher.tsx` — 26KB)**
- **Step 1 — Match:** Paste any Job Description → sends it with resume data to `/api/ats/match-jd` → returns `overall_match_score`, `readiness_score`, `matched_skills`, `missing_skills`, `keyword_matches`, `experience_alignment`, `strengths`, `gaps`, `recommendations`.
- **Step 2 — Customize:** One click sends the resume, JD, and match analysis to `/api/ats/customize` → returns a rewritten resume tailored for that specific JD, with `changes_made` log and `warnings` about what couldn't be added.
- **Strict Truthfulness** — The AI is instructed to NEVER fabricate skills, only rearrange and rephrase existing ones.
- Match results are saved to the `jd_matches` table.

#### 🎯 Jobs on ReadyIndex (`/readyindex-jobs`)
- Browse jobs posted by Recruiters on the platform itself (from `jobs` table).
- Apply directly to these jobs — creates an `applications` record.

#### 💼 Browse Jobs — Live Search (`/jobs`)
- **AI-Powered Job Search** with multiple components:
  - `JobBoardView.tsx` (16KB) — Main job board with filters.
  - `SearchJobsModal.tsx` (16KB) — Upload resume PDF → AI parses it → suggests target roles, location, work mode → runs live search.
  - `FilterBar.tsx` — Filter by keyword, location, work mode (remote/hybrid/onsite), minimum match score.
  - `JobCard.tsx` — Card showing job title, company, location, work mode badge, match score meter, tags, source platform (LinkedIn/Naukri/Indeed/Web).
  - `ApplyModal.tsx` — Apply to a job (manual or auto).
- **Live Search Pipeline** (backend):
  1. SerpApi fetches real jobs from Google Jobs.
  2. DuckDuckGo scrapes `site:linkedin.com/jobs`, `site:naukri.com`, `site:indeed.com`.
  3. Sarvam 105B extracts structured job data from raw web snippets.
  4. Jobs are deduplicated by title+company and URL.
  5. If resume text is provided, each job is scored (0-100) against the resume using Sarvam AI.
  6. Jobs are stored in an in-memory `JobStore` with upsert, save, apply operations.
- **Match Labels**: Strong match (85+), Good match (70+), Fair match (50+), Long shot (<50).
- Seed jobs loaded from `seed_jobs.csv` for demo purposes.

#### ✅ My Applications (`/applications`)
- Track all jobs the student has applied to.
- Shows application status pipeline: `saved → applied → assessment → interview_scheduled → interview_completed → selected/rejected`.
- `MyApplicationsView.tsx` (15KB) — full application tracking dashboard.

---

## 👔 Recruiter Side — Features (Detailed)

### 1. Recruiter Authentication
- Same auth system (email+password or Google OAuth).
- Signup with `?role=recruiter` query param.
- After signup → redirected to **Recruiter Onboarding**.

### 2. Recruiter Onboarding Flow
- `RecruiterOnboardingFlow.tsx` (11KB) — Multi-step form.
- Collects: Full Name, Designation, Phone, Company Name, Company Description, Industry, Website, Company Size, Location.
- Creates both a `company_profiles` record and a `recruiter_profiles` record linked to it.
- Redirects to Recruiter Dashboard after completion.

### 3. Recruiter Dashboard (Sidebar Navigation)
The recruiter dashboard has 5 pages:

#### 💼 Active Jobs (`/recruiter-dashboard`)
- `RecruiterDashboardView.tsx` (23KB) — The main recruiter hub.
- **Create New Jobs** — Post job openings with title, target role, description, required skills, location, work mode, salary, deadline.
- **View All Active Jobs** — See all jobs posted by this recruiter.
- **View Candidates Per Job** — Click on a job → see all applications with candidate name, skills, match score.
- **Rank Candidates** — One-click button to auto-rank all candidates for a job (currently assigns random scores as MVP mock logic, designed to be replaced with real AI scoring).
- **Application Status Management** — Update candidate status through the pipeline.

#### 📄 Bulk Resume Upload (`/recruiter-dashboard/bulk-resume`)
- `BulkResumeView.tsx` (21KB) — A powerful bulk processing tool.
- **Upload Multiple PDFs** — Select a job → upload many resume PDFs at once.
- **Background Processing** — Each PDF is processed in a FastAPI `BackgroundTask`:
  1. Creates a passive `student_profiles` record (name from filename).
  2. Uploads PDF to Supabase Storage (`resumes` bucket).
  3. Creates a `resumes` record.
  4. Creates an `applications` record linking the candidate to the job.
  5. Extracts text using PyMuPDF → parses using LLM → updates `resumes.structured_json` and `student_profiles` with parsed skills, education, etc.
- All processing happens in the background — the recruiter gets an instant response.

#### 📅 Interview Scheduling (`/recruiter-dashboard/interviews`)
- `InterviewsView.tsx` (9KB) — Schedule and manage interviews.
- **Schedule Interview** — Select an application → set date/time, duration, interviewer name, meeting link.
- **View All Interviews** — See all scheduled interviews with candidate name, job title, status.
- **Submit Feedback** — After interview, provide rating (1-5), feedback text, and recommendation (`STRONG_HIRE`, `HIRE`, `NO_HIRE`).
- **Auto Status Update** — Submitting feedback automatically updates the application status to `selected` (for HIRE/STRONG_HIRE) or `rejected` (for NO_HIRE).

#### 👥 Talent Pool (`/recruiter-dashboard/talent`)
- `TalentPoolView.tsx` (14KB) — Browse all student profiles on the platform.
- View candidate skills, experience, and education.
- **Save Candidates** — Bookmark interesting candidates (saved to `saved_candidates` table).

#### 🏢 Company Profile (`/recruiter-dashboard/company`)
- `CompanyProfileView.tsx` (12KB) — View and manage the company profile.
- Displays: Company Name, Description, Industry, Website, Size, Location, Logo.

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

| Table | Purpose |
|---|---|
| `users` | Extends Supabase `auth.users` — stores email and role (student/recruiter/admin) |
| `student_profiles` | Full student data — name, phone, location, target role, skills, education, experience, projects, achievements, certifications, readiness_score, ats_score |
| `company_profiles` | Company info — name, description, industry, website, size, location, logo |
| `recruiter_profiles` | Recruiter info — linked to user and company |
| `resumes` | Uploaded resumes — file_path, raw_text, structured_json, active_version flag |
| `jobs` | Job postings by recruiters — title, description, required_skills, location, work_mode, salary, deadline, status |
| `applications` | Links students to jobs — status pipeline, match_score |
| `ats_checks` | ATS score history — dimension scores, missing keywords, strengths, weaknesses |
| `jd_matches` | JD match history — match scores, matched/missing skills, recommendations |
| `saved_candidates` | Recruiter bookmarks of students |
| `interviews` | Interview records — scheduled_at, duration, interviewer, rating, feedback, recommendation |

---

## 🛠️ Technology Stack

### Backend
| Category | Technology |
|---|---|
| Framework | FastAPI (Python) |
| Server | Uvicorn |
| Database | Supabase (PostgreSQL) via `supabase-py` |
| ORM (Optional) | SQLAlchemy + psycopg2-binary |
| AI - Primary | Groq SDK (LLaMA 3.3 70B) |
| AI - Fallback | Google Generative AI SDK (Gemini 2.0 Flash) |
| AI - Job Search | Sarvam AI API (105B model) |
| Job Search | SerpApi (Google Jobs), ddgs (DuckDuckGo) |
| PDF Parsing | PyMuPDF (fitz) |
| Data Validation | Pydantic |
| File Uploads | python-multipart |
| HTTP Client | requests |

### Frontend
| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Auth & DB Client | Supabase JS SDK |
| HTTP Client | Axios |
| Forms | React Hook Form |
| PDF Export | html2pdf.js |
| Icons | Lucide React |

---

## 📂 Project Structure

```
PROJECT/
├── backend/
│   ├── main.py                    # FastAPI app entry point, CORS, router registration
│   ├── database.py                # Supabase client initialization
│   ├── parsing.py                 # PyMuPDF PDF text extraction
│   ├── llm_service.py             # Resume parsing via Groq/Gemini LLMs
│   ├── ats_service.py             # ATS scoring, JD matching, resume customization
│   ├── jobs_search_pipeline.py    # Live job search (SerpApi + DuckDuckGo + Sarvam)
│   ├── jobs_store.py              # In-memory job store with filtering and scoring
│   ├── jobs_models.py             # Pydantic models for Job, RefreshResponse
│   ├── seed_jobs.csv              # Demo seed job data
│   ├── requirements.txt           # Python dependencies
│   ├── routers/
│   │   ├── auth.py                # Login/Signup endpoints (placeholder)
│   │   ├── students.py            # Student profile endpoints
│   │   ├── resumes.py             # Resume upload & parse endpoints
│   │   ├── recruiters.py          # Bulk resume upload, candidate ranking, job CRUD
│   │   ├── jobs.py                # Job listing, search, save, apply, refresh
│   │   ├── ats.py                 # ATS check, JD match, resume customize
│   │   └── interviews.py          # Interview scheduling & feedback
│   └── .env.example               # Environment variable template
│
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router pages
│   │   │   ├── page.tsx           # Landing page (role selection)
│   │   │   ├── student/           # Student landing page
│   │   │   ├── recruiter/         # Recruiter landing page
│   │   │   ├── auth/login/        # Login page (email + Google OAuth)
│   │   │   ├── auth/signup/       # Signup page (role-based)
│   │   │   ├── onboarding/        # Student onboarding wizard
│   │   │   ├── recruiter-onboarding/  # Recruiter onboarding wizard
│   │   │   ├── (dashboard)/       # Student dashboard layout + pages
│   │   │   │   ├── profile/       # Student profile view
│   │   │   │   ├── resume/        # Resume builder + ATS/JD tools
│   │   │   │   ├── readyindex-jobs/   # Platform jobs listing
│   │   │   │   ├── jobs/          # Live AI job search board
│   │   │   │   └── applications/  # Application tracker
│   │   │   └── (recruiter-dashboard)/  # Recruiter dashboard layout + pages
│   │   │       └── recruiter-dashboard/
│   │   │           ├── page.tsx       # Active jobs + candidates
│   │   │           ├── bulk-resume/   # Bulk resume upload
│   │   │           ├── interviews/    # Interview scheduling
│   │   │           ├── talent/        # Talent pool browser
│   │   │           └── company/       # Company profile
│   │   ├── features/              # Feature-level components
│   │   │   ├── landing/           # Landing pages (Main, Student, Recruiter)
│   │   │   ├── onboarding/        # Student onboarding flow
│   │   │   ├── profile/           # ProfileView component
│   │   │   ├── resume/            # ResumeEditor, ATSChecker, JDMatcher
│   │   │   ├── jobs/              # JobBoard, SearchModal, FilterBar, JobCard, etc.
│   │   │   └── recruiter/         # All recruiter feature components
│   │   ├── components/            # Shared UI components (modals)
│   │   └── lib/                   # Supabase client, routing helpers
│   ├── package.json
│   └── .env.example
│
├── supabase/
│   └── schema.sql                 # Full database schema (all tables + migrations)
│
├── architecture/                  # Architecture screenshots/diagrams
├── start_servers.bat              # Windows batch script to start both servers
└── .gitignore
```
