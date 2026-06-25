<p align="center">
  <img src="frontend/public/hireflow-favicon.svg" alt="HireFlow" width="72" height="72" />
</p>

<h1 align="center">HireFlow</h1>

<p align="center">
  A full-stack recruitment management platform — browse jobs, post vacancies, manage applications, and schedule interviews.
</p>

<p align="center">
  <a href="https://github.com/mohammad-abu-haded/HireFlow">GitHub Repository</a>
  ·
  <a href="#quick-start">Quick Start</a>
  ·
  <a href="#about-the-project">About</a>
  ·
  <a href="#user-journey">User Journey</a>
</p>

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Step-by-Step Setup (From Zero)](#step-by-step-setup-from-zero)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Node.js](#2-install-nodejs)
  - [3. Install Docker Desktop](#3-install-docker-desktop)
  - [4. Start MongoDB & Redis with Docker](#4-start-mongodb--redis-with-docker)
  - [5. Create Environment Files](#5-create-environment-files)
  - [6. Generate a Secure JWT Secret](#6-generate-a-secure-jwt-secret)
  - [7. Configure Gmail for OTP Emails](#7-configure-gmail-for-otp-emails)
  - [8. Install Backend Dependencies](#8-install-backend-dependencies)
  - [9. Start All Backend Services](#9-start-all-backend-services)
  - [10. Install & Run the Frontend](#10-install--run-the-frontend)
  - [11. Open the App](#11-open-the-app)
- [Environment Variables Reference](#environment-variables-reference)
- [Ports & Services](#ports--services)
- [Demo Mode & Test Accounts](#demo-mode--test-accounts)
- [Troubleshooting](#troubleshooting)
- [About the Project](#about-the-project)
- [Architecture](#architecture)
- [User Journey](#user-journey)
  - [Public Job Board (No Login Required)](#1-public-job-board-no-login-required)
  - [Sign Up & Email Verification](#2-sign-up--email-verification)
  - [Sign In](#3-sign-in)
  - [Demo Mode Setup](#4-demo-mode-setup)
  - [Applicant Mode](#5-applicant-mode)
  - [Employer Mode](#6-employer-mode)
  - [Complete Workflow Summary](#7-complete-workflow-summary)
- [Application Statuses & Interview Types](#application-statuses--interview-types)
- [License](#license)

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, React Router |
| **Backend** | Node.js, Express 5, Microservices architecture |
| **Database** | MongoDB 8 |
| **Cache / Sessions** | Redis 7 |
| **Auth** | JWT, bcrypt, OTP via email |
| **Infrastructure** | Docker Compose (MongoDB + Redis) |

---

## Project Structure

```
HireFlow/
├── docker-compose.yml          # MongoDB + Redis containers
├── frontend/                   # React SPA (Vite)
│   ├── src/
│   │   ├── screens/            # Pages (Login, Jobs, Post Job, etc.)
│   │   ├── components/         # Reusable UI components
│   │   └── context/            # Auth state management
│   └── package.json
└── backend/
    ├── gateway/                # API Gateway → port 5000
    ├── services/
    │   ├── auth-service/       # Registration, login, OTP → port 5001
    │   ├── job-service/        # Job CRUD & search → port 5002
    │   └── application-service/# Applications, CVs, interviews → port 5003
    └── package.json
```

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Minimum Version | Download |
|------|----------------|----------|
| **Git** | Any recent version | [git-scm.com](https://git-scm.com/downloads) |
| **Node.js** | 18.x or 20.x LTS | [nodejs.org](https://nodejs.org/) |
| **Docker Desktop** | Latest stable | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| **A Gmail account** | — | Required for OTP verification emails during sign-up |

> **Tip:** After installing Node.js, verify it works by running `node -v` and `npm -v` in your terminal.

---

## Quick Start

If you already have Node.js and Docker installed:

```bash
# 1. Clone
git clone https://github.com/mohammad-abu-haded/HireFlow.git
cd HireFlow

# 2. Start databases
docker compose up -d

# 3. Create all .env files (see section 5 below), then:
cd backend && npm install

# 4. Start backend (open 4 separate terminals, all from backend/)
node gateway/server.js
node services/auth-service/server.js
node services/job-service/server.js
node services/application-service/server.js

# 5. Start frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Step-by-Step Setup (From Zero)

Follow every step below in order. Do not skip any step.

### 1. Clone the Repository

Open a terminal (PowerShell, Command Prompt, or any terminal on macOS/Linux) and run:

```bash
git clone https://github.com/mohammad-abu-haded/HireFlow.git
```

Then navigate into the project folder:

```bash
cd HireFlow
```

You should now see folders like `frontend/`, `backend/`, and a file called `docker-compose.yml`.

---

### 2. Install Node.js

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS** version (recommended: 20.x or 18.x)
3. Run the installer and accept the default options
4. Restart your terminal after installation
5. Verify the installation:

```bash
node -v
# Expected output example: v20.11.0

npm -v
# Expected output example: 10.2.4
```

---

### 3. Install Docker Desktop

1. Go to [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Download Docker Desktop for your operating system (Windows / macOS / Linux)
3. Install and launch Docker Desktop
4. Wait until Docker shows **"Docker Desktop is running"**
5. Verify Docker works:

```bash
docker --version
docker compose version
```

---

### 4. Start MongoDB & Redis with Docker

Make sure you are inside the `HireFlow` project folder (where `docker-compose.yml` is located), then run:

```bash
docker compose up -d
```

This starts two containers in the background:

| Container | Image | Port |
|-----------|-------|------|
| **mongo** | MongoDB 8.2.1 | `27017` |
| **redis** | Redis 7.0.15 | `6379` |

Verify they are running:

```bash
docker compose ps
```

Both services should show status **running**.

> **Keep Docker Desktop running** while you use HireFlow. If you stop the containers, run `docker compose up -d` again before starting the backend.

---

### 5. Create Environment Files

Each backend microservice needs its own `.env` file. Create these files exactly as shown below.

> **Important:** The `JWT_SECRET` value must be **identical** in all three service `.env` files. Generate it once (see next section) and paste the same value everywhere.

---

#### File: `backend/services/auth-service/.env`

Create a new file at this path and paste:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/authDB
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=PASTE_YOUR_SECRET_HERE
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port the auth service listens on |
| `MONGO_URI` | MongoDB connection string for user accounts |
| `REDIS_URL` | Redis connection for OTP storage and session tokens |
| `JWT_SECRET` | Secret key used to sign JWT tokens (must match all services) |
| `EMAIL_USER` | Your Gmail address used to send OTP emails |
| `EMAIL_PASS` | Gmail **App Password** (not your regular Gmail password) |

---

#### File: `backend/services/job-service/.env`

Create a new file at this path and paste:

```env
PORT=5002
MONGO_URI=mongodb://localhost:27017/jobsDB
JWT_SECRET=PASTE_YOUR_SECRET_HERE
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port the job service listens on |
| `MONGO_URI` | MongoDB connection string for job listings |
| `JWT_SECRET` | Same secret as auth-service and application-service |

---

#### File: `backend/services/application-service/.env`

Create a new file at this path and paste:

```env
PORT=5003
MONGO_URI=mongodb://localhost:27017/applicationsDB
JWT_SECRET=PASTE_YOUR_SECRET_HERE
```

| Variable | Description |
|----------|-------------|
| `PORT` | Port the application service listens on |
| `MONGO_URI` | MongoDB connection string for job applications and interviews |
| `JWT_SECRET` | Same secret as auth-service and job-service |

---

Also create the uploads folder for CV/resume storage:

```bash
mkdir backend/services/application-service/uploads
```

> On Windows PowerShell, use: `New-Item -ItemType Directory -Path backend/services/application-service/uploads`

---

### 6. Generate a Secure JWT Secret

Never use a weak or guessable secret like `123456` or `mysecret`. Generate a cryptographically secure random string.

**Option A — Node.js (recommended, works on all platforms):**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option B — OpenSSL (macOS / Linux / Git Bash on Windows):**

```bash
openssl rand -hex 64
```

**Option C — PowerShell (Windows):**

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

Copy the generated string and replace `PASTE_YOUR_SECRET_HERE` in **all three** `.env` files with the same value.

---

### 7. Configure Gmail for OTP Emails

HireFlow sends a 6-digit OTP to verify new accounts during sign-up. Gmail requires an **App Password** (not your normal password).

1. Go to your [Google Account](https://myaccount.google.com/)
2. Enable **2-Step Verification** (required for App Passwords)
3. Go to **Security → App passwords** (or search "App passwords" in account settings)
4. Create a new App Password:
   - App: **Mail**
   - Device: **Other** → name it `HireFlow`
5. Google will generate a 16-character password (e.g. `abcd efgh ijkl mnop`)
6. Copy it **without spaces** into `EMAIL_PASS` in `backend/services/auth-service/.env`
7. Set `EMAIL_USER` to the Gmail address you used

> If OTP emails are not arriving, check your spam folder and confirm 2-Step Verification is enabled.

---

### 8. Install Backend Dependencies

Open a terminal, navigate to the backend folder, and install packages:

```bash
cd backend
npm install
```

Wait until installation completes with no errors.

---

### 9. Start All Backend Services

You need **4 separate terminal windows/tabs**, all started from the `backend/` directory.

**Terminal 1 — API Gateway (port 5000):**

```bash
cd backend
node gateway/server.js
```

Expected output: `API Gateway running on 5000`

**Terminal 2 — Auth Service (port 5001):**

```bash
cd backend
node services/auth-service/server.js
```

Expected output: `MongoDB connected` → `Auth service running on 5001`

**Terminal 3 — Job Service (port 5002):**

```bash
cd backend
node services/job-service/server.js
```

Expected output: `MongoDB connected` → `Job service running on 5002`

**Terminal 4 — Application Service (port 5003):**

```bash
cd backend
node services/application-service/server.js
```

Expected output: `MongoDB connected` → `Application service running on 5003`

> **All four terminals must stay open** while you use the app. Closing any of them will break related features.

**Startup order:** Start auth, job, and application services first, then the gateway — or start the gateway last after the three services are up.

---

### 10. Install & Run the Frontend

Open a **new terminal** (5th window):

```bash
cd frontend
npm install
npm run dev
```

Expected output:

```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

### 11. Open the App

Open your browser and go to:

**http://localhost:5173**

You should see the HireFlow job portal. You can browse jobs without logging in, or create an account to access the full platform.

---

## Environment Variables Reference

| Service | File Path | Required Variables |
|---------|-----------|-------------------|
| Auth | `backend/services/auth-service/.env` | `PORT`, `MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS` |
| Job | `backend/services/job-service/.env` | `PORT`, `MONGO_URI`, `JWT_SECRET` |
| Application | `backend/services/application-service/.env` | `PORT`, `MONGO_URI`, `JWT_SECRET` |
| Gateway | — | No `.env` file needed (hardcoded port `5000`) |
| Frontend | — | No `.env` file needed (API URL is `http://localhost:5000`) |

---

## Ports & Services

| Port | Service | Purpose |
|------|---------|---------|
| `5173` | Frontend (Vite) | React web application |
| `5000` | API Gateway | Single entry point for all API calls |
| `5001` | Auth Service | Register, login, logout, OTP, `/me` |
| `5002` | Job Service | Create, update, delete, search jobs |
| `5003` | Application Service | Apply to jobs, upload CV, manage interviews |
| `27017` | MongoDB | Database (via Docker) |
| `6379` | Redis | OTP & token cache (via Docker) |

---

## Demo Mode & Test Accounts

After signing in for the first time, you are redirected to **Demo Mode Setup** (`/demo-setup`). Choose one of two options:

| Option | What it does |
|--------|-------------|
| **Start with Sample Data** *(Recommended)* | Creates 5 demo employer accounts, 75+ jobs, 100+ applications, and full interview workflows |
| **Start Fresh** | Creates demo accounts and jobs only — no pre-filled applications |

### Pre-seeded demo accounts

After demo setup, these accounts are available for testing:

| Email | Password |
|-------|----------|
| `test1@domain.com` | `12345678` |
| `test2@domain.com` | `12345678` |
| `test3@domain.com` | `12345678` |
| `test4@domain.com` | `12345678` |
| `test5@domain.com` | `12345678` |

> These are **development-only** credentials. Never use them in production.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoDB connected` never appears | Run `docker compose up -d` and confirm MongoDB is running with `docker compose ps` |
| `ECONNREFUSED` on Redis | Ensure Redis container is running on port `6379` |
| OTP email not received | Verify Gmail App Password, check spam, confirm `EMAIL_USER` / `EMAIL_PASS` are correct |
| `Invalid token` errors | Ensure `JWT_SECRET` is **identical** in all three service `.env` files, then restart all services |
| Frontend shows network errors | Confirm all 4 backend processes are running and gateway is on port `5000` |
| CV upload fails | Create the folder `backend/services/application-service/uploads` |
| Port already in use | Stop the process using that port or change the `PORT` in the relevant `.env` file |
| Docker not starting | Open Docker Desktop and wait until it fully loads before running `docker compose up` |

---

## About the Project

**HireFlow** is a recruitment management system that connects **employers** and **job seekers** in a single platform. One account can switch between two modes:

- **Applicant Mode** — Browse jobs, apply with a CV, track application status, and view scheduled interviews
- **Employer Mode** — Post and manage job listings, review applications, update candidate status, and schedule interviews

### Key features

- Public job board with search and advanced filters (job type, salary, experience, date posted)
- Secure registration with email OTP verification
- JWT-based authentication with Redis session management
- Rich job posting form (title, company, location, salary range, description, skills, benefits, deadline)
- Job lifecycle management (Active → Closed → Expired)
- Application pipeline: Pending → Interview → Accepted / Rejected
- Interview scheduling (Online with meeting link, or On-site with location)
- CV/resume upload and download
- Dashboard statistics for employers (total jobs, active jobs, applications)
- Demo mode with pre-populated sample data for instant exploration
- Responsive sidebar navigation with Applicant / Employer mode switcher

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                      │
│                   http://localhost:5173                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (:5000)                        │
│         /auth  →  :5001  │  /jobs  →  :5002                  │
│              /applications  →  :5003                         │
└──────┬─────────────────────┬─────────────────────┬───────────┘
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐
│ Auth Service│    │ Job Service │    │ Application Service │
│   :5001     │    │   :5002     │    │       :5003         │
│  authDB     │    │   jobsDB    │    │   applicationsDB    │
└──────┬──────┘    └──────┬──────┘    └──────────┬──────────┘
       │                  │                       │
       └──────────────────┼───────────────────────┘
                          ▼
              ┌───────────────────────┐
              │  MongoDB (:27017)     │
              │  Redis (:6379)        │
              └───────────────────────┘
```

---

## User Journey

The sections below describe every screen in the order a new user typically experiences them.

---

### 1. Public Job Board (No Login Required)

**Route:** `/jobs`

When you first open HireFlow, you land on the public job board (unless you previously selected Employer mode in the sidebar).

| Feature | Description |
|---------|-------------|
| **Job listings** | Browse all active job postings as cards showing title, company, location, type, and salary |
| **Search** | Search by job title, company, location, or keywords |
| **Filters** | Filter by job type, salary range, experience level, and date posted |
| **Pagination** | Navigate through pages of results (6 jobs per page) |
| **Job details** | Click any job card to view the full posting |
| **Sign in / Sign up** | Use the top bar or sidebar to authenticate for applying or posting jobs |

> The `/jobs` page is accessible without an account. Applying requires sign-in.

---

### 2. Sign Up & Email Verification

#### Step 2a — Create Account

**Route:** `/signup`

1. Click **Create New Account** from the login page, or navigate to `/signup`
2. Fill in:
   - **Full Name** — your display name
   - **Email Address** — used for login and OTP delivery
   - **Password** — your account password
   - **Confirm Password** — must match password
3. Click **Create Account**
4. If successful, you are redirected to the OTP verification screen

#### Step 2b — Verify OTP

**Route:** `/verify-otp`

1. Check your email inbox (and spam folder) for a **6-digit verification code**
2. Enter the code in the six input boxes
3. A countdown timer shows when the code expires (5 minutes)
4. Click **Resend Code** if needed (rate-limited to prevent abuse)
5. Click **Verify and Continue**
6. On success, you are redirected to the **Login** page — sign in with your new credentials

---

### 3. Sign In

**Route:** `/login`

1. Enter your **Email Address** and **Password**
2. Click **Sign In**
3. On success, you are redirected to **Demo Mode Setup**
4. Use **Back to Careers Portal** to return to the public job board without signing in
5. Use **Create New Account** to go to sign-up

---

### 4. Demo Mode Setup

**Route:** `/demo-setup` *(requires authentication)*

After your first login, choose how to populate your workspace:

#### Option A — Start with Sample Data *(Recommended)*

- Creates 5 demo employer accounts with 75 jobs across roles and locations
- Generates 100+ pre-filled applications with mixed statuses
- Sets up complete interview workflows (online and on-site)
- Best for exploring every feature immediately

#### Option B — Start Fresh

- Creates demo accounts and 75 sample jobs
- No pre-filled applications — submit your own first application
- Best for testing the apply flow from scratch

After choosing, you are redirected to `/jobs` (Applicant view).

---

### 5. Applicant Mode

Switch to **Applicant** in the sidebar mode toggle to access job seeker features.

#### 5a — Browse & Search Jobs

**Route:** `/jobs`

Same as the public board, plus authenticated features:

- Apply directly from job details
- Sidebar shows **My Applications** and **My Interviews**

#### 5b — Job Details

**Route:** `/job-details/:id`

View the complete job posting:

- Job title, company, location, work setting, experience level
- Salary range and application deadline
- Full description, key responsibilities, requirements, and skills
- Benefits list
- **Apply Now** button (if logged in and job is active)

#### 5c — Apply for a Job

**Route:** `/apply-job/:id`

Submit your application with:

| Field | Required |
|-------|----------|
| Full Name | Yes |
| Email | Yes |
| Location | Yes |
| Phone Number | Yes |
| LinkedIn Profile | Optional |
| GitHub Profile | Optional |
| Cover Letter | Yes |
| CV / Resume (PDF, DOC) | Yes |

After submission, a success notification appears and you can track the application under **My Applications**.

#### 5d — My Applications

**Route:** `/my-applications`

Track all jobs you have applied to:

- Filter by status: All, Accepted, Interview, Pending, Rejected
- Paginated list with job title, company, and application date
- Click any card to view job details

#### 5e — My Interviews

**Route:** `/my-interviews`

View interviews scheduled for your applications:

- Filter by type: All, Online, On-site
- See scheduled date/time, interview type, meeting link (online), or location (on-site)
- Search interviews by keyword

---

### 6. Employer Mode

Switch to **Employer** in the sidebar mode toggle to manage hiring.

#### 6a — My Jobs Dashboard

**Route:** `/my-jobs`

Your employer command center:

| Stat Card | Shows |
|-----------|-------|
| **Total Jobs** | All jobs you have posted |
| **Active Jobs** | Currently open listings |
| **Total Applications** | Applications received across all jobs |

Additional features:

- Search your jobs by title, company, or location
- Filter by status: All, Active, Closed, Expired
- Each job card shows title, company, salary, status, and application count
- Actions: View details, Edit, Delete
- **Post New Job** button in the header

#### 6b — Post a New Job

**Route:** `/post-job`

Create a job listing with these sections:

**Basic Information**
- Job Title, Company Name, Location

**Job Configuration**
- Job Type: Full-time, Part-time, Contract, Internship
- Work Setting: On-site, Remote, Hybrid
- Experience Level: Entry, Mid, Senior
- Employment Type & Duration (shown based on job type)
- Salary Range (min / max)
- Application Deadline

**Job Content**
- Job Description
- Key Responsibilities (dynamic list)
- Requirements (dynamic list)
- Required Skills (dynamic list)
- Benefits (dynamic list)

Click **Publish Job** to make the listing active immediately.

#### 6c — Update a Job

**Route:** `/update-job/:id`

Same form as Post Job, pre-filled with existing data. Save changes to update the listing.

#### 6d — Job Details (Employer View)

**Route:** `/job-details/:id`

Employer-specific actions on the job details page:

- **Edit Job** — navigate to update form
- **Close / Reopen Job** — toggle between Active and Closed
- **Extend Deadline** — update an expired job's deadline to reactivate it
- **View Applications** — see all applicants for this job
- **Delete Job** — permanently remove the listing

#### 6e — Applications (All Jobs)

**Route:** `/applications`

Review every application across all your job postings:

- Search by applicant name or email
- Filter by status: All, Pending, Interview, Accepted, Rejected
- Each card shows applicant name, job title, status badge, and submission date
- **View CV** — download the applicant's resume
- **Update Status** — change application status or schedule an interview
- **View Details** — open the full application page

#### 6f — Applications for a Specific Job

**Route:** `/job/:id/applications`

Same as the Applications screen, filtered to a single job posting. Accessed from the job details page via **View Applications**.

#### 6g — Application Details

**Route:** `/applications-details/:id`

Deep dive into a single application:

- Applicant info card (name, status, applied date)
- Contact details: email, phone, LinkedIn, GitHub
- Cover letter
- CV download
- **Update Status** panel — change status and schedule interviews

**Status update options:**

| Status | Action |
|--------|--------|
| **Pending** | Application received, awaiting review |
| **Interview** | Schedule an interview (Online or On-site) with date/time |
| **Accepted** | Candidate accepted for the role |
| **Rejected** | Application declined |

When setting status to **Interview**, configure:
- Interview type: **Online** (with meeting link) or **On-site** (with location address)
- Scheduled date and time

#### 6h — Interviews (Employer)

**Route:** `/interviews`

Manage all interviews you have scheduled as an employer:

- View all supervised interviews across your job postings
- Filter by type: All, Online, On-site
- Search by applicant or job keyword
- See interview date, type, and linked application details

---

### 7. Complete Workflow Summary

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Sign Up    │────▶│  Verify OTP  │────▶│   Sign In    │
│   /signup    │     │ /verify-otp  │     │   /login     │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                         ┌──────────────┐
                                         │  Demo Setup  │
                                         │ /demo-setup  │
                                         └──────┬───────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
                    ▼                           ▼                           ▼
           ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
           │   APPLICANT  │           │   EMPLOYER   │           │    PUBLIC    │
           │     MODE     │           │     MODE     │           │  (no login)  │
           └──────┬───────┘           └──────┬───────┘           └──────┬───────┘
                  │                          │                          │
     ┌────────────┼────────────┐    ┌─────────┼─────────┐                │
     ▼            ▼            ▼    ▼         ▼         ▼                ▼
  Browse      Apply for    My Apps  My Jobs  Post Job  Applications   Browse
  Jobs        a Job                   │         │         │           Jobs
  /jobs       /apply-job/:id  /my-    │    /post-job  /applications   /jobs
              │               apps    │         │         │
              │               │     ▼         ▼         ▼
              │               │  Job Details  Update   Application
              │               │  /job-details  Job     Details
              │               │              │    /applications-details/:id
              │               ▼              ▼
              │          My Interviews  Interviews
              │          /my-interviews /interviews
              ▼
         Application
         submitted →
         Employer reviews →
         Status updated →
         Interview scheduled
```

---

## Application Statuses & Interview Types

### Application statuses

| Status | Meaning | Visible to |
|--------|---------|-----------|
| `PENDING` | Application submitted, awaiting employer review | Both |
| `INTERVIEW` | Candidate invited to interview | Both |
| `ACCEPTED` | Candidate accepted for the position | Both |
| `REJECTED` | Application declined | Both |

### Interview types

| Type | Details |
|------|---------|
| `ONLINE` | Virtual interview — includes a meeting link |
| `ONSITE` | In-person interview — includes a physical location |

### Job statuses

| Status | Meaning |
|--------|---------|
| `ACTIVE` | Job is open and accepting applications |
| `CLOSED` | Job manually closed by the employer |
| `EXPIRED` | Application deadline has passed |

---

## License

This project is open source. See the repository for license details.

---

<p align="center">
  <strong>HireFlow</strong> — Recruitment Management System<br/>
  Built with React, Node.js, MongoDB & Redis
</p>
