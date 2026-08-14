# ⚙️ Setup Guide — AI Career OS

Complete step-by-step setup from cloning to running the application.

---

## Prerequisites
- **Node.js** (v18+) — [Download](https://nodejs.org/)
- **Python** (v3.10+) — [Download](https://python.org/)
- **Git** — [Download](https://git-scm.com/)

---

## Step 1 — Clone the Repository
```bash
git clone https://github.com/<your-username>/ProjectX.git
cd ProjectX
```

---

## Step 2 — Get API Keys

You need **6 credentials** from 4 platforms. Here's exactly where and how to get each one:

### 🔵 Supabase (Database + Auth + Storage)
You need: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (backend), `SUPABASE_ANON_KEY` (frontend).

1. Go to [supabase.com](https://supabase.com) → Click **"Start your project"** → Sign in with GitHub.
2. Click **"New Project"** → Enter project name, password, region → Click **"Create new project"**.
3. Wait for the project to provision (~2 min).
4. Go to **Settings → API** (left sidebar).
5. Copy:
   - **Project URL** → This is your `SUPABASE_URL` (e.g. `https://abcxyz.supabase.co`)
   - **anon (public) key** → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend)
   - **service_role (secret) key** → This is your `SUPABASE_SERVICE_ROLE_KEY` (backend) — ⚠️ Never expose this in frontend!

### 🔵 Setup Google OAuth (for "Login with Google")
1. In Supabase Dashboard → Go to **Authentication → Providers** (left sidebar).
2. Find **Google** in the list → Toggle it **ON**.
3. You'll see it needs a **Client ID** and **Client Secret** from Google Cloud.
4. Go to [Google Cloud Console](https://console.cloud.google.com/) → Create a new project (or use existing).
5. Go to **APIs & Services → Credentials** → Click **"Create Credentials" → OAuth Client ID**.
6. Application type: **Web application**.
7. Under **Authorized redirect URIs**, add:
   ```
   https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
   ```
   (You can find this exact URL in Supabase → Authentication → Providers → Google → **Callback URL**).
8. Click **Create** → Copy the **Client ID** and **Client Secret**.
9. Go back to Supabase → Authentication → Providers → Google → Paste Client ID and Client Secret → **Save**.

### 🔵 Setup Database Tables
1. In Supabase Dashboard → Go to **SQL Editor** (left sidebar).
2. Open the file `supabase/schema.sql` from this project.
3. Copy the entire SQL content → Paste it into the SQL Editor → Click **"Run"**.
4. This creates all 11 tables: `users`, `student_profiles`, `recruiter_profiles`, `company_profiles`, `resumes`, `jobs`, `applications`, `ats_checks`, `jd_matches`, `saved_candidates`, `interviews`.

### 🔵 Setup Supabase Storage
1. Go to **Storage** (left sidebar) → Click **"New Bucket"**.
2. Name: `resumes` → Set as **Public** → Create.
3. This bucket stores uploaded resume PDF files.

### 🟢 Groq API Key (Primary LLM)
1. Go to [console.groq.com](https://console.groq.com/) → Sign up / Log in.
2. Go to **API Keys** (left sidebar) → Click **"Create API Key"**.
3. Copy the key → This is your `GROQ_API_KEY`.
4. Free tier gives 30 RPM (requests per minute) on LLaMA 3.3 70B.

### 🟡 Gemini API Key (Fallback LLM)
1. Go to [Google AI Studio](https://aistudio.google.com/apikey) → Sign in with Google.
2. Click **"Create API Key"** → Select a Google Cloud project (or create one).
3. Copy the key → This is your `GEMINI_API_KEY`.
4. Free tier gives 60 RPM on Gemini 2.0 Flash.

### 🟠 Sarvam API Key (Job Search AI)
1. Go to [sarvam.ai](https://www.sarvam.ai/) → Sign up / Log in.
2. Go to Dashboard → **API Keys** → Create a new key.
3. Copy the key → This is your `SARVAM_API_KEY`.
4. This is used for the live job search pipeline to extract job data from web snippets.

### 🔴 SerpApi Key (Google Jobs Search)
1. Go to [serpapi.com](https://serpapi.com/) → Sign up / Log in.
2. Go to **Dashboard** → Your API Key is displayed on the main page.
3. Copy the key → This is your `SERPAPI_API_KEY`.
4. Free tier gives 100 searches/month.

---

## Step 3 — Backend Setup

```bash
cd backend
```

### Create virtual environment
```bash
python -m venv venv
```

### Activate virtual environment
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### Install dependencies
```bash
pip install -r requirements.txt
```

### Configure environment variables
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### Edit `backend/.env` — Paste all your keys:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key...

GROQ_API_KEY=gsk_your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here

SARVAM_API_KEY=sk_your_sarvam_key_here
SARVAM_BASE_URL=https://api.sarvam.ai/v1/chat/completions
SARVAM_MODEL=sarvam-105b
SERPAPI_API_KEY=your_serpapi_key_here
```

---

## Step 4 — Frontend Setup

```bash
cd ../frontend
```

### Install dependencies
```bash
npm install
```

### Configure environment variables
```bash
# Windows
copy .env.example .env.local

# Mac/Linux
cp .env.example .env.local
```

### Edit `frontend/.env.local` — Paste your Supabase keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ⚠️ The frontend uses the **anon key** (public). The backend uses the **service_role key** (secret). Don't mix them up!

---

## Step 5 — Run the Application

### Option A: Use the batch script (Windows only)
```bash
# From the root project directory
start_servers.bat
```
This opens two terminal windows — one for frontend, one for backend.

### Option B: Run manually (any OS)

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
uvicorn main:app --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## Step 6 — Access the Application

| Service | URL |
|---|---|
| **Frontend** | [http://localhost:3000](http://localhost:3000) |
| **Backend API** | [http://localhost:8000](http://localhost:8000) |
| **API Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## 🔗 Quick API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/resumes/parse` | POST | Upload PDF → returns structured JSON |
| `/api/ats/check` | POST | ATS score check (8 dimensions) |
| `/api/ats/match-jd` | POST | Match resume against a job description |
| `/api/ats/customize` | POST | Customize resume for a specific JD |
| `/api/jobs/` | GET | List all jobs (with filters) |
| `/api/jobs/refresh` | POST | Run live job search pipeline |
| `/api/jobs/parse-resume` | POST | Upload PDF → get suggested roles & location |
| `/api/recruiters/jobs/{id}/bulk-resumes` | POST | Bulk upload candidate PDFs |
| `/api/recruiters/jobs/{id}/candidates` | GET | Get all candidates for a job |
| `/api/recruiters/jobs/{id}/rank` | POST | Auto-rank candidates |
| `/api/interviews/` | POST | Schedule an interview |
| `/api/interviews/{id}/feedback` | PATCH | Submit interview feedback |

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| `SUPABASE_URL or SUPABASE_KEY not found` | Check your `.env` file has the correct keys without extra spaces/quotes |
| `GROQ_API_KEY not found` | Ensure `GROQ_API_KEY` is set in `backend/.env` |
| Google Login not working | Make sure you've configured Google OAuth in Supabase → Authentication → Providers → Google, and added the correct redirect URI in Google Cloud Console |
| `Module not found: fitz` | Run `pip install PyMuPDF` — the package name is PyMuPDF but it's imported as `fitz` |
| Frontend can't reach backend | Ensure backend is running on port 8000 and `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local` |
| Job search returns empty | Check that `SARVAM_API_KEY` and `SERPAPI_API_KEY` are set in `backend/.env` |
