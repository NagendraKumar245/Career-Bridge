# CareerBridge: 5-Member Team Work Breakdown & Task Allocation Matrix
**Project Title:** CareerBridge – AI-Powered Career Readiness & Placement Intelligence Platform  
**Competition / Evaluation:** CodeForge BuildX 2026  
**Document Purpose:** Academic Project Task Distribution, Role Ownership & Viva Preparation Matrix  

---

## Executive Summary & Responsibility Matrix

| Member | Designated Role | Primary Focus Domain | Core Tech Stack | Key Modules / Deliverables Owned |
| :---: | :--- | :--- | :--- | :--- |
| **Member 1** | **Team Lead & Frontend Architect** | UI/UX, Navigation, Global State, Auth Pages | React 19, Tailwind CSS, Context API | `AppLayout`, `Navbar`, `Sidebar`, `AuthContext`, `Landing`, `Login`, `Register` |
| **Member 2** | **Backend & Security Engineer** | REST API, JWT Auth, RBAC Middleware, Admin | Python Flask, JWT, Flask-CORS | Application Factory (`__init__.py`), `auth.py`, `student.py`, `admin.py`, `decorators.py` |
| **Member 3** | **AI/ML & NLP Engineer** | Resume Parsing, Matching Engine, Skill Analysis | Scikit-learn, pdfplumber, TF-IDF | `resume_parser.py`, `job_matcher.py`, `skill_analyzer.py`, `course_recommender.py`, `ai.py` |
| **Member 4** | **Database Architect & Workflow Lead** | Relational Modeling, Job Portal, Applications | SQLAlchemy ORM, SQLite | Models (`User`, `Job`, `Application`, etc.), `seed_data.py`, `jobs.py`, `Jobs.jsx`, `Applications.jsx` |
| **Member 5** | **QA, Testing & Documentation Lead** | End-to-End Testing, Student Dashboard, Reports | Vitest, Axios, BuildX PDF | `Dashboard.jsx`, `Profile.jsx`, `api.js`, Official 14-Page Documentation, Test Matrix |

---

## Detailed Member Breakdown

### 👤 Member 1: Team Lead & Frontend Architect
- **Designation:** Frontend Lead & Client Architect
- **Primary Domain:** User Interface, Layout System, Authentication Flows, Global State Management
- **Key Files & Code Owned:**
  - `frontend/src/App.jsx` – Client-side route declarations and view structure.
  - `frontend/src/context/AuthContext.jsx` – Centralized authentication state, localStorage token sync, and auth guards.
  - `frontend/src/components/layout/AppLayout.jsx` – Responsive layout shell combining sidebar and topbar navigation.
  - `frontend/src/components/layout/Navbar.jsx` – Top navigation bar with user profile details and logout trigger.
  - `frontend/src/components/layout/Sidebar.jsx` – Navigation sidebar with route indicators and role-based links.
  - `frontend/src/pages/Landing.jsx` – Public landing page highlighting platform value propositions.
  - `frontend/src/pages/Login.jsx` & `Register.jsx` – Form interfaces with live validation and error handling.
  - `frontend/src/index.css` – Global Tailwind CSS styling, typography, and utility classes.

#### Core Tasks Completed:
1. Initialized the modern React 19 single-page application using Vite with fast HMR.
2. Built the custom design system utilizing Tailwind CSS, ensuring clean typography and responsive layouts.
3. Designed the global `AuthContext` providing `user`, `token`, `login()`, `register()`, and `logout()` across the entire app.
4. Created route protection wrappers ensuring unauthenticated requests are redirected to login.
5. Coordinated team integration meetings, code reviews, and merged backend API contracts with client components.

#### Viva & Evaluation Preparation (Sample Questions):
- **Q: How does `AuthContext` prevent losing the user session on page refresh?**  
  *Answer:* On application mounting, `useEffect` in `AuthContext` inspects `localStorage` for a saved JWT token. If found, it populates the user state and includes the Bearer token in subsequent Axios headers.
- **Q: How are protected routes enforced in React Router?**  
  *Answer:* An authentication guard checks `token` and `user` state. If neither exists, it redirects the student to `/login` using the `Navigate` component, preserving the intended destination in route state.
- **Q: Why was Tailwind CSS chosen over traditional CSS files?**  
  *Answer:* Tailwind provides utility-first classes that compile down to a minimal CSS bundle, guarantees design consistency across all pages, and eliminates stylesheet conflicts.

---

### 👤 Member 2: Backend RESTful API & Security Engineer
- **Designation:** Backend & Security Lead
- **Primary Domain:** REST Architecture, Authentication Services, Security Middleware, Admin Management
- **Key Files & Code Owned:**
  - `backend/app/__init__.py` – Flask application factory (`create_app`), blueprint registration, CORS setup.
  - `backend/app/config.py` – Configuration environments (JWT secrets, upload directories, database paths).
  - `backend/app/extensions.py` – Centralized extension singletons (`db`, `cors`).
  - `backend/app/routes/auth.py` – Login, register, token verification, and current-user endpoints.
  - `backend/app/routes/student.py` – Student profile CRUD operations, bio updates, and preferences.
  - `backend/app/routes/admin.py` – Administrative metrics, student placement status, and coordinator controls.
  - `backend/app/utils/decorators.py` – Custom `@jwt_required` and `@admin_required` endpoint decorators.

#### Core Tasks Completed:
1. Structured the backend following the Flask Application Factory pattern for modular scalability and testability.
2. Implemented secure password hashing via `werkzeug.security` (PBKDF2/SHA256) preventing plaintext password storage.
3. Created JWT generation and verification routines with configurable expiration lifetimes.
4. Developed custom Python decorators (`@jwt_required`, `@admin_required`) that inspect the `Authorization: Bearer <token>` header and attach the decoded `current_user` to the request context.
5. Built Admin API endpoints enabling faculty placement coordinators to track student application volumes and placement readiness across departments.

#### Viva & Evaluation Preparation (Sample Questions):
- **Q: What is the structure of a JSON Web Token (JWT) and how is it validated?**  
  *Answer:* A JWT consists of three Base64URL-encoded parts: Header (algorithm), Payload (claims such as user_id and exp), and Signature. The server validates the signature using the secret key (`SECRET_KEY`) to ensure the payload was not tampered with.
- **Q: How do custom Python decorators work in Flask?**  
  *Answer:* Decorators wrap endpoint functions using `functools.wraps`. They extract the Authorization header, decode the token, check for validity/expiry, and either abort with `401 Unauthorized` or forward control to the route handler.
- **Q: Why use the Flask Application Factory pattern?**  
  *Answer:* It avoids global state, allows configuring different environments (testing, development, production), and isolates extensions to prevent circular import dependencies.

---

### 👤 Member 3: AI/ML & Natural Language Processing Engineer
- **Designation:** AI/ML & Algorithm Lead
- **Primary Domain:** Resume Parsing, Text Processing, TF-IDF Vectorization, Cosine Similarity Matching
- **Key Files & Code Owned:**
  - `backend/app/services/resume_parser.py` – PDF stream extraction and technical keyword normalization.
  - `backend/app/services/job_matcher.py` – Scikit-learn TF-IDF vectorization and cosine match scoring.
  - `backend/app/services/skill_analyzer.py` – Skill gap detection and placement readiness index calculation.
  - `backend/app/services/course_recommender.py` – Recommendation engine mapping skill deficiencies to learning modules.
  - `backend/app/routes/ai.py` – AI recommendation endpoints (`/api/ai/match-jobs`, `/api/ai/recommendations`).
  - `frontend/src/pages/SkillAnalysis.jsx` – Visual representation of skill gaps and recommended courses.

#### Core Tasks Completed:
1. Implemented PDF text extraction using `pdfplumber`, stripping extraneous whitespace, non-ASCII characters, and formatting artifacts.
2. Built a comprehensive canonical technical skill taxonomy covering programming languages, web frameworks, databases, and DevOps tools.
3. Developed the machine learning matching algorithm using `TfidfVectorizer` and `cosine_similarity` from `scikit-learn`:
   $$\text{Cosine Similarity}(u, v) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|_2 \|\mathbf{v}\|_2}$$
4. Engineered the composite Placement Readiness Score algorithm combining profile completeness (20%), verified skill count (40%), and average job compatibility (40%).
5. Created the Course Recommendation logic to automatically suggest high-impact courses for closing detected skill deficiencies.

#### Viva & Evaluation Preparation (Sample Questions):
- **Q: Explain the mathematical intuition behind TF-IDF.**  
  *Answer:* Term Frequency (TF) measures how frequently a term appears in a document, while Inverse Document Frequency (IDF) penalizes common words across the entire corpus. Multiplying them highlights terms that are distinctive and informative for a specific job or resume.
- **Q: Why is Cosine Similarity preferred over Euclidean distance for text matching?**  
  *Answer:* Cosine Similarity measures the angle between vectors rather than their magnitude, making it invariant to resume length. A brief 1-page resume and a 3-page resume with identical technical density will receive equitable match scores.
- **Q: How does the system extract skills from varied resume layouts?**  
  *Answer:* `pdfplumber` extracts raw text page-by-page. The parser normalizes text to lowercase, applies regex boundary checks against a pre-compiled taxonomy, and eliminates false positives with stop-word filtering.

---

### 👤 Member 4: Database Architect & Application Lifecycle Engineer
- **Designation:** Database Architect & Core Job Portal Lead
- **Primary Domain:** Relational Schema Design, SQLAlchemy ORM, Data Seeding, Job & Application Lifecycle
- **Key Files & Code Owned:**
  - `backend/app/models/user.py` – Base authentication model (email, password hash, role).
  - `backend/app/models/student_profile.py` – Extended student attributes (department, CGPA, graduation year, skills, resume path).
  - `backend/app/models/job.py` – Job postings (title, company, description, required skills, salary, location).
  - `backend/app/models/application.py` – Application tracking (student ID, job ID, status, applied timestamp).
  - `backend/app/models/course.py` & `skill.py` – Learning resources and skill definitions.
  - `backend/seed_data.py` – Production-grade initial data population script.
  - `backend/app/routes/jobs.py` – Job search, filtering, and job application endpoints.
  - `frontend/src/pages/Jobs.jsx` & `Applications.jsx` – Job browsing, search filters, and application tracking UI.

#### Core Tasks Completed:
1. Designed and implemented the normalized relational database schema with 6 interconnected models.
2. Defined foreign keys, unique constraints (e.g., unique student-job application constraint), and cascade behaviors.
3. Created comprehensive `to_dict()` methods on all models for secure JSON serialization without leaking sensitive credentials.
4. Authored `seed_data.py` with 12+ real-world tech job openings across Full-Stack, AI/ML, Cloud, and Data Engineering roles with curated courses.
5. Implemented the complete job application lifecycle (Applied -> Under Review -> Shortlisted -> Rejected) and built the user-facing job cards and application status timeline.

#### Viva & Evaluation Preparation (Sample Questions):
- **Q: Explain the database relationship between `User`, `StudentProfile`, and `Application`.**  
  *Answer:* `User` has a 1-to-1 relationship with `StudentProfile` (via `user_id` foreign key). `StudentProfile` and `Job` have a Many-to-Many relationship through the `Application` association model, which contains metadata like `status` and `applied_date`.
- **Q: How is data consistency guaranteed when applying for a job?**  
  *Answer:* An application request queries for an existing record with the same `student_id` and `job_id`. If one exists, the server returns a `400 Bad Request` ("Already applied"), preventing duplicate records.
- **Q: Why use SQLite for development and how can it scale to PostgreSQL?**  
  *Answer:* SQLite is self-contained and requires zero configuration for local demonstrations. Because SQLAlchemy acts as an ORM abstraction layer, migrating to PostgreSQL in production only requires updating the connection URI string (`DATABASE_URL`).

---

### 👤 Member 5: Quality Assurance, Full-Stack Testing & Documentation Specialist
- **Designation:** QA Lead, Dashboard Specialist & BuildX Documentation Lead
- **Primary Domain:** End-to-End Verification, Error Handling, Analytics Dashboard, Official BuildX Reports
- **Key Files & Deliverables Owned:**
  - `frontend/src/pages/Dashboard.jsx` – Main student dashboard with readiness score gauge, metrics, and actionable alerts.
  - `frontend/src/pages/Profile.jsx` – Resume upload drag-and-drop, parsed skill tag management, and profile editing.
  - `frontend/src/services/api.js` – Central Axios client instance with response interceptors and token injection.
  - `CareerBridge_BuildX_Documentation.pdf` – Official 14-page CodeForge BuildX 2026 Academic Documentation.
  - `frontend/public/buildx-documentation.html` – Web print-ready companion with one-click A4 print engine.
  - `CareerBridge_Complete_Study_Guide.pdf` – 13-page technical study and viva preparation manual.
  - Quality assurance test cases matrix (Unit, Integration, and UI verification).

#### Core Tasks Completed:
1. Built the central Student Dashboard (`Dashboard.jsx`) featuring visual readiness score rings, quick statistics, and urgent application status notifications.
2. Created the Profile management view (`Profile.jsx`) featuring direct PDF resume upload, instant skill extraction feedback, and profile completeness trackers.
3. Conducted end-to-end integration testing and resolved critical bugs (e.g., React child object error during skill extraction and null-handling in dashboard skill filtering).
4. Formulated the 10-point test case suite covering authentication edge cases, invalid resume formats, score boundary values, and responsiveness.
5. Authored the complete official 14-page CodeForge BuildX 2026 Documentation strictly conforming to formatting rules (A4, Times New Roman, 12pt body, 1.5 line spacing, 1-inch margins, justified text).

#### Viva & Evaluation Preparation (Sample Questions):
- **Q: How does the dashboard compute and display the circular readiness score?**  
  *Answer:* The dashboard queries `/api/student/profile` and `/api/ai/match-jobs`. It extracts the readiness score ($0-100\%$) and renders a SVG circular progress ring using dynamic `strokeDasharray` and color thresholds (Green $\ge 75\%$, Amber $\ge 50\%$, Red $< 50\%$).
- **Q: What was the root cause of the React resume upload blank screen bug and how did you resolve it?**  
  *Answer:* The resume parser returned skills as an array of structured objects `[{ name, category }]`. `Profile.jsx` attempted to render `{skill}` directly in JSX rather than `{skill.name}`, triggering a React unhandled exception. Unpacking the object resolved the issue.
- **Q: Walk through your testing methodology for verifying the PDF parsing endpoint.**  
  *Answer:* We tested positive cases (clean single-page resumes with standard headings), negative cases (encrypted/corrupt PDFs, non-PDF file extensions), and edge cases (image-only scanned PDFs without text streams) to ensure graceful error handling.

---

## Complete Work Breakdown Structure (WBS) Table

| Task ID | Work Breakdown Item | Primary Owner | Secondary Reviewer | Status |
| :---: | :--- | :---: | :---: | :---: |
| **WBS 1.1** | Project Architecture & Tech Stack Selection | Member 1 (Lead) | All Members | Completed |
| **WBS 1.2** | UI Layout, Responsive Navbar & Sidebar Navigation | Member 1 | Member 5 | Completed |
| **WBS 1.3** | Client Authentication State & Protected Routing | Member 1 | Member 2 | Completed |
| **WBS 2.1** | Flask Application Factory & CORS Architecture | Member 2 | Member 1 | Completed |
| **WBS 2.2** | JWT Authentication Service & Password Hashing | Member 2 | Member 4 | Completed |
| **WBS 2.3** | Security Decorators (`@jwt_required`, `@admin_required`) | Member 2 | Member 1 | Completed |
| **WBS 3.1** | PDF Text Ingestion Pipeline (`pdfplumber`) | Member 3 | Member 5 | Completed |
| **WBS 3.2** | Canonical Technical Skill Taxonomy & Regex Extractor | Member 3 | Member 4 | Completed |
| **WBS 3.3** | TF-IDF Vectorizer & Cosine Similarity Algorithm | Member 3 | Member 2 | Completed |
| **WBS 3.4** | Placement Readiness Scoring & Skill Gap Logic | Member 3 | Member 5 | Completed |
| **WBS 4.1** | Relational Database Schema Design (SQLAlchemy ORM) | Member 4 | Member 2 | Completed |
| **WBS 4.2** | Production Seed Data Generation (`seed_data.py`) | Member 4 | Member 3 | Completed |
| **WBS 4.3** | Job Portal Endpoints & Application Status Workflow | Member 4 | Member 1 | Completed |
| **WBS 5.1** | Interactive Student Dashboard & Score Visualization | Member 5 | Member 1 | Completed |
| **WBS 5.2** | End-to-End System Testing & Bug Remediation | Member 5 | All Members | Completed |
| **WBS 5.3** | BuildX 2026 14-Page Documentation & Study Guide | Member 5 | Member 1 | Completed |

---

## Tips for Presentation & Viva Success

1. **Live Demonstration Flow (5-Minute Team Presentation)**:
   - **Member 1 (0:00 - 1:00)**: Introduces the problem statement, business value, and demonstrates the Landing & Login pages.
   - **Member 5 (1:00 - 2:00)**: Walks through the Student Dashboard, Readiness Score gauge, and demonstrates uploading a sample PDF resume in the Profile page.
   - **Member 3 (2:00 - 3:00)**: Demonstrates the instant skill extraction, explains the TF-IDF and Cosine Similarity matching algorithms, and shows the Skill Analysis page.
   - **Member 4 (3:00 - 4:00)**: Demonstrates searching and filtering jobs in the Job Portal, applying for a job, and tracking the status in the Applications page.
   - **Member 2 (4:00 - 5:00)**: Demonstrates the Admin Dashboard, explains the JWT security model, and summarizes the system architecture and future enhancements.

2. **Common Mentor Trap**:
   - Mentors frequently ask: *"Did you use any pre-trained external API for the matching or did you write the algorithms yourself?"*
   - **Team Response (Led by Member 3)**: *"We built the core text extraction and matching engine locally using Python's `pdfplumber` and `scikit-learn`'s `TfidfVectorizer` and `cosine_similarity`. It requires zero external cloud API subscriptions, ensuring zero latency and 100% data privacy."*
