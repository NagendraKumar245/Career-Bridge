# CareerBridge – AI-Powered Job Matching Platform for Fresh Graduates

A full-stack web application that helps fresh graduates find relevant jobs using AI-powered matching, skill gap analysis, and personalized course recommendations.

## 🚀 Features

- **Student Registration & Login** – JWT-based authentication with role management
- **Student Profile Builder** – Education history, skills, projects, and bio
- **PDF Resume Upload & Parsing** – Extracts skills from uploaded resumes using pdfplumber
- **AI Job Matching** – TF-IDF + Cosine Similarity scoring (scikit-learn)
- **Skill Gap Analysis** – Identifies missing skills for target jobs
- **Course Recommendations** – Suggests learning resources for skill gaps
- **Job Application Tracking** – Track application status (Applied → Interview → Offered)
- **Admin Dashboard** – Manage students, job listings, and applications

## 🛠️ Technology Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS v3   |
| Backend     | Python Flask 3.1                    |
| Database    | SQLite (default) / MySQL (optional) |
| AI/ML       | scikit-learn (TF-IDF + Cosine Sim)  |
| Auth        | Flask-JWT-Extended                  |
| PDF Parsing | pdfplumber                          |

## 📁 Project Structure

```
careerbridge/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Configuration
│   │   ├── extensions.py        # DB, JWT, CORS instances
│   │   ├── models/              # SQLAlchemy models
│   │   ├── routes/              # API blueprints (auth, student, jobs, admin, ai)
│   │   ├── services/            # Business logic (resume parser, job matcher, etc.)
│   │   └── utils/               # Decorators, validators
│   ├── uploads/                 # Resume PDF storage
│   ├── seed_data.py             # Sample data seeder
│   ├── requirements.txt
│   └── run.py                   # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/layout/   # Navbar, Sidebar, AppLayout
│   │   ├── context/             # AuthContext (JWT state management)
│   │   ├── pages/               # 9 pages (Landing, Dashboard, Profile, Jobs, etc.)
│   │   ├── services/api.js      # Axios API client
│   │   ├── App.jsx              # React Router config
│   │   └── index.css            # Tailwind + glassmorphism design system
│   ├── tailwind.config.js
│   ├── vite.config.js           # Dev server with API proxy
│   └── package.json
│
└── README.md
```

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) – [Download](https://nodejs.org/)
- **Python** (3.8 or higher) – [Download](https://python.org/)
- **pip** (Python package manager, comes with Python)

## 🏁 Getting Started

### 1. Clone or navigate to the project directory

```bash
cd careerbridge
```

### 2. Set up the Backend

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Seed the database with sample data
python seed_data.py

# Start the Flask server (runs on http://localhost:5000)
python run.py
```

### 3. Set up the Frontend

Open a **new terminal** and run:

```bash
# Navigate to the frontend directory
cd careerbridge/frontend

# Install Node.js dependencies
npm install

# Start the development server (runs on http://localhost:5173)
npm run dev
```

### 4. Open the Application

Open your browser and navigate to: **http://localhost:5173**

## 🔑 Default Login Credentials

### Student Accounts
| Email               | Password    | Name          | Skills Focus          |
|---------------------|-------------|---------------|-----------------------|
| john@example.com    | password123 | John Smith    | Python, React, JS     |
| sarah@example.com   | password123 | Sarah Johnson | Data Science, ML      |
| mike@example.com    | password123 | Mike Chen     | Java, Spring, AWS     |
| emily@example.com   | password123 | Emily Davis   | UX/UI, React, Figma   |
| alex@example.com    | password123 | Alex Kumar    | DevOps, Docker, K8s   |

### Admin Account
| Email                    | Password | Role  |
|--------------------------|----------|-------|
| admin@careerbridge.com   | admin123 | Admin |

## 📡 API Endpoints

### Authentication
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | /api/auth/register  | Register new user   |
| POST   | /api/auth/login     | Login, get JWT      |
| GET    | /api/auth/me        | Get current user    |

### Student Profile
| Method | Endpoint                    | Description             |
|--------|-----------------------------|-------------------------|
| GET    | /api/student/profile        | Get profile             |
| PUT    | /api/student/profile        | Update profile          |
| POST   | /api/student/education      | Add education           |
| DELETE | /api/student/education/:id  | Delete education        |
| POST   | /api/student/projects       | Add project             |
| DELETE | /api/student/projects/:id   | Delete project          |
| POST   | /api/student/skills         | Update skills           |
| POST   | /api/student/resume         | Upload PDF resume       |

### Jobs
| Method | Endpoint                          | Description             |
|--------|-----------------------------------|-------------------------|
| GET    | /api/jobs                         | List jobs (with filters)|
| GET    | /api/jobs/:id                     | Job detail              |
| POST   | /api/jobs/:id/apply               | Apply to a job          |
| GET    | /api/jobs/applications            | My applications         |

### AI/ML
| Method | Endpoint                    | Description                    |
|--------|-----------------------------|--------------------------------|
| GET    | /api/ai/recommendations     | AI job recommendations         |
| GET    | /api/ai/skill-gap/:job_id   | Skill gap for specific job     |
| GET    | /api/ai/skill-gap           | Overall skill gap analysis     |
| GET    | /api/ai/courses             | Course recommendations         |

### Admin
| Method | Endpoint                          | Description             |
|--------|-----------------------------------|-------------------------|
| GET    | /api/admin/stats                  | Platform statistics     |
| GET    | /api/admin/students               | List all students       |
| GET    | /api/admin/students/:id           | Student detail          |
| POST   | /api/admin/jobs                   | Create job listing      |
| PUT    | /api/admin/jobs/:id               | Update job listing      |
| DELETE | /api/admin/jobs/:id               | Deactivate job          |
| GET    | /api/admin/applications           | All applications        |
| PUT    | /api/admin/applications/:id/status| Update app status       |

## 🤖 How the AI Matching Works

1. **Resume Parsing**: When a student uploads a PDF resume, `pdfplumber` extracts text and a regex-based skill extractor identifies technical skills against a curated taxonomy of 80+ skills.

2. **TF-IDF Vectorization**: Student skill profiles and job descriptions are converted into TF-IDF vectors using scikit-learn's `TfidfVectorizer` with unigram+bigram features.

3. **Cosine Similarity**: Match scores are calculated as:
   - 60% TF-IDF cosine similarity (semantic matching)
   - 40% Direct skill overlap (exact skill match)

4. **Skill Gap Analysis**: Compares student skills against job requirements to identify missing skills, sorted by demand frequency across all matching jobs.

5. **Course Recommendations**: Maps identified skill gaps to courses in the database, prioritized by gap frequency and course rating.

## 🔧 Configuration

### Using MySQL Instead of SQLite

1. Install MySQL and create a database:
   ```sql
   CREATE DATABASE careerbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Install PyMySQL:
   ```bash
   pip install pymysql cryptography
   ```

3. Set the DATABASE_URL environment variable:
   ```bash
   # Windows
   set DATABASE_URL=mysql+pymysql://root:password@localhost:3306/careerbridge

   # macOS/Linux
   export DATABASE_URL=mysql+pymysql://root:password@localhost:3306/careerbridge
   ```

4. Re-run the seed script:
   ```bash
   python seed_data.py
   ```

## 📝 License

This project is for educational purposes.
