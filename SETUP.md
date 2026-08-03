# Setup Guide

Yeh guide aapko clone karne ke baad project ko local machine par run karne tak le jayegi.

## 1) Prerequisites

Install kar lo:
- Git
- Node.js 20+ and npm
- Python 3.10+ (recommended)
- A Supabase account

---

## 2) Clone the repository


---

## 3) Backend setup (FastAPI)

```bash
cd backend
python -m venv venv
```

### Activate virtual environment

Windows PowerShell:
```powershell
.\venv\Scripts\activate
```

```

Then install dependencies:
```bash
pip install -r requirements.txt
```

### Create backend environment file

Copy the example file:
```bash
copy .env.example .env
```

Or if you are using Git Bash / Linux / macOS:
```bash
cp .env.example .env
```

Open [backend/.env](backend/.env) and fill the values.

Example values:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# Optional for AI features
GROQ_API_KEY=your-groq-key
GEMINI_API_KEY=your-gemini-key
```

### Run backend

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- http://localhost:8000
- API docs: http://localhost:8000/docs

---

## 4) Frontend setup (Next.js)

Open a new terminal:

```bash
cd frontend
npm install
```

### Create frontend environment file

```bash
copy .env.example .env.local
```

Or:
```bash
cp .env.example .env.local
```

Open [frontend/.env.local](frontend/.env.local) and fill the values.

Example values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run frontend

```bash
npm run dev
```

Frontend will be available at:
- http://localhost:3000

---

## 5) Supabase setup

### A. Create a Supabase project

1. Go to https://supabase.com
2. Create a new project
3. Wait for the database to finish provisioning

### B. Apply the database schema

1. Open the Supabase SQL Editor
2. Open the file [supabase/schema.sql](supabase/schema.sql)
3. Copy its contents and run it in the SQL Editor

### C. Get your API keys

Go to Supabase Dashboard -> Project Settings -> API

Copy:
- Project URL
- anon public key
- service role key

### D. Enable Google OAuth

1. Open Supabase Dashboard -> Authentication -> Providers
2. Enable Google
3. Add your Google OAuth client ID and client secret
4. Set the redirect URLs for local development:
   - http://localhost:3000/onboarding
   - http://127.0.0.1:3000/onboarding
5. In Settings -> Authentication -> URL Configuration, set:
   - Site URL = http://localhost:3000
   - Additional Redirect URLs = http://localhost:3000/onboarding

> Google login will not work unless the Google provider is enabled and the redirect URLs match the ones used by the app.

---

## 6) Optional AI keys

The resume parsing feature uses AI services. If you want that feature to work, add one of the following:
- Groq: `GROQ_API_KEY`
- Gemini: `GEMINI_API_KEY`

If both are missing, resume parsing may fail.

---

## 7) Common issues

### "Supabase URL or Anon Key missing"
Make sure you created [frontend/.env.local](frontend/.env.local) correctly.

### "Google login redirect mismatch"
Make sure the redirect URL in Supabase matches the app URL exactly.

### "Module not found" or dependency errors
Run:
```bash
npm install
pip install -r requirements.txt
```

### "Port already in use"
Use a different port:
```bash
uvicorn main:app --reload --port 8001
```

---

## 8) Final check

If everything is set up correctly:
- Backend: http://localhost:8000/docs should open
- Frontend: http://localhost:3000 should open
- Google login should redirect to onboarding after authentication




## 9) How to Setup Google Auth + Supabase Setup
1.	Get your Google Credentials:
-	Go to the Google Cloud Console.
-	Create a new project (or select an existing one).
-	Go to APIs & Services > Credentials.
-	Click Create Credentials and choose OAuth client ID.
-	Select Web application as the application type.
-	For Authorized JavaScript origins, add your local URL: http://localhost:3000 (and your production URL later).
-	For Authorized redirect URIs, add this exact URL from your Supabase dashboard: https://<your-project-ref>.supabase.co/auth/v1/callback
-	Copy the generated Client ID and Client Secret.
2.	Enable Google Provider in Supabase:
-	Open your Supabase Dashboard and go to your project.
-	Go to Authentication > Providers in the left sidebar.
-	Find Google in the list and click it.
-	Toggle Enable Google Provider to ON.
-	Paste the Client ID and Client Secret you got from Google and Hit Save.

