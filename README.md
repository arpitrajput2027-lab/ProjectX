# AI Career OS Platform


Arpit_Rajput_Lodhi
arpitrajput2027-lab
Welcome to the AI Career OS Project. This is an MVP implementation built using **Next.js (App Router)** for the frontend, **FastAPI** for the backend, and **Supabase** for database and authentication.

For full local setup instructions, including Supabase configuration, Google OAuth, backend/frontend startup, and environment files, see [SETUP.md](SETUP.md).

## 📁 Project Structure

This project follows a highly modular, feature-based architecture to make code readable and debugging easier.

```text
PROJECT/
├── README.md                <-- You are here
├── backend/                 <-- FastAPI Python Backend
│   ├── main.py              <-- FastAPI entrypoint
│   ├── database.py          <-- Supabase connection
│   ├── routers/             <-- Feature routers (auth, students, resumes, jobs)
│   ├── models/              <-- Database models
│   └── schemas/             <-- Pydantic validation schemas
│
├── frontend/                <-- Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/      <-- Login & Signup
│   │   │   ├── (dashboard)/ <-- Dashboard layouts (Student & Recruiter)
│   │   │   ├── onboarding/  <-- Step-by-step student onboarding
│   │   │   └── page.tsx     <-- Landing Page
│   │   ├── features/        <-- Modular feature components
│   │   │   ├── landing/     <-- Landing page specific components
│   │   │   ├── onboarding/  <-- Onboarding forms & steps
│   │   │   ├── profile/     <-- Student profile (GitHub/LeetCode stats cards)
│   │   │   ├── resume/      <-- Resume editor (from ProjectX)
│   │   │   └── jobs/        <-- Job board and recruiter components
│   │   └── lib/             <-- Supabase client, utils
│
└── supabase/
    └── schema.sql           <-- Database schema definitions
```

---

## 🚀 Setting up Supabase

Since this project relies heavily on Supabase for Authentication and Database, you need to set it up before running the frontend or backend.

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, select your organization, give it a name (e.g., `ai-career-os`), and set a strong database password. Wait for the project to provision.

### Step 2: Apply the Database Schema
1. In your Supabase dashboard, go to the **SQL Editor** on the left menu.
2. Click **New Query**.
3. Copy the entire contents of `PROJECT/supabase/schema.sql` and paste it into the editor.
4. Click **Run** (or `Ctrl+Enter`). This will create all the necessary tables (`users`, `student_profiles`, `jobs`, etc.) and set up relationships.

### Step 3: Get API Keys
1. In your Supabase dashboard, go to **Project Settings** (the gear icon) > **API**.
2. Find the **Project URL** and the **anon** (public) key. You will need these for the frontend.
3. Find the **service_role** key. You will need this for the backend to bypass RLS and perform admin operations.

### Step 4: Configure Environment Variables

**Frontend (`frontend/.env.local`)**:
Create a file named `.env.local` inside the `frontend/` folder and add:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (`backend/.env`)**:
Create a file named `.env` inside the `backend/` folder and add:
```env
SUPABASE_URL=your_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
# Optionally, if using SQLAlchemy directly:
DATABASE_URL=your_database_connection_string
```

---

## 🛠️ Running the Application

### 1. Run the Backend
Open a terminal in `PROJECT/backend/`:
```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000` (docs at `/docs`).

### 2. Run the Frontend
Open a new terminal in `PROJECT/frontend/`:
```bash
# Install dependencies (only needed once)
npm install

# Run the development server
npm run dev
```
The website will be available at `http://localhost:3000`.

---

## ✨ Features Implemented in MVP
- **Landing Page**: Using the deep-neutral "ReadyIndex" theme.
- **Onboarding**: Step-by-step UI to collect student details.
- **Dashboard Profile**: Displays live GitHub and LeetCode stat cards dynamically (e.g., `https://github-readme-stats.vercel.app/api?username=...`).
- **Dashboard Resume**: Resume editor adapted from the `ProjectX` codebase.
