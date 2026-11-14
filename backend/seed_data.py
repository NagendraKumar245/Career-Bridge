from datetime import datetime, timedelta
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.student_profile import StudentProfile, Education, Project
from app.models.skill import Skill, StudentSkill
from app.models.job import Job, JobSkill
from app.models.application import Application
from app.models.course import Course
from app.services.resume_parser import SKILL_TAXONOMY
from app.services.job_matcher import calculate_match_score

app = create_app()

def seed_database():
    with app.app_context():
        print("[SEED] Dropping all existing tables...")
        db.drop_all()
        print("[SEED] Creating fresh database tables...")
        db.create_all()

        # ==========================================
        # 1. CREATE ADMIN USER
        # ==========================================
        print("[SEED] Creating admin user...")
        admin = User(
            email='admin@careerbridge.com',
            full_name='Admin User',
            role='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.flush()

        # ==========================================
        # 2. CREATE SKILLS TAXONOMY (80+ skills)
        # ==========================================
        print("[SEED] Seeding comprehensive skills taxonomy...")
        skills_cache = {}
        for category, skill_list in SKILL_TAXONOMY.items():
            for name in skill_list:
                skill = Skill(name=name, category=category)
                db.session.add(skill)
                db.session.flush()
                skills_cache[name.lower()] = skill

        # ==========================================
        # 3. CREATE 5 STUDENT USERS & PROFILES
        # ==========================================
        print("[SEED] Creating student accounts and detailed profiles...")
        students_data = [
            {
                'email': 'john@example.com',
                'password': 'password123',
                'full_name': 'John Smith',
                'university': 'Stanford University',
                'degree': 'Bachelor of Science',
                'field_of_study': 'Computer Science',
                'graduation_year': 2024,
                'gpa': 3.85,
                'bio': 'Aspiring full-stack and frontend engineer passionate about modern web technologies and building scalable, beautiful user interfaces.',
                'phone': '+1 (555) 234-5678',
                'location': 'San Francisco, CA',
                'linkedin_url': 'https://linkedin.com/in/johnsmith-cs',
                'github_url': 'https://github.com/johnsmith',
                'skills': [('Python', 4), ('React', 5), ('JavaScript', 5), ('SQL', 4), ('Git', 4)],
                'educations': [
                    {
                        'institution': 'Stanford University',
                        'degree': 'B.S. Computer Science',
                        'field_of_study': 'Software Systems',
                        'start_date': 'Sep 2020',
                        'end_date': 'Jun 2024',
                        'gpa': 3.85
                    }
                ],
                'projects': [
                    {
                        'title': 'E-Commerce Microservices Store',
                        'description': 'Built a reactive online store with React frontend, Flask microservices, and PostgreSQL database.',
                        'technologies': 'React, JavaScript, Python, Flask, PostgreSQL',
                        'url': 'https://github.com/johnsmith/ecommerce-app'
                    }
                ]
            },
            {
                'email': 'sarah@example.com',
                'password': 'password123',
                'full_name': 'Sarah Johnson',
                'university': 'UC Berkeley',
                'degree': 'Bachelor of Science',
                'field_of_study': 'Data Science & AI',
                'graduation_year': 2024,
                'gpa': 3.92,
                'bio': 'Passionate data scientist experienced in predictive modeling, deep learning architectures, and statistical research.',
                'phone': '+1 (555) 345-6789',
                'location': 'Berkeley, CA',
                'linkedin_url': 'https://linkedin.com/in/sarah-johnson-ds',
                'github_url': 'https://github.com/sarahj-ai',
                'skills': [('Python', 5), ('Machine Learning', 5), ('Pandas', 5), ('TensorFlow', 4), ('Statistics', 5)],
                'educations': [
                    {
                        'institution': 'UC Berkeley',
                        'degree': 'B.S. Data Science',
                        'field_of_study': 'Artificial Intelligence',
                        'start_date': 'Aug 2020',
                        'end_date': 'May 2024',
                        'gpa': 3.92
                    }
                ],
                'projects': [
                    {
                        'title': 'Chest X-Ray Pneumonia Classifier',
                        'description': 'Trained a Convolutional Neural Network with TensorFlow and achieved 96% diagnostic accuracy.',
                        'technologies': 'Python, TensorFlow, Scikit-learn, Pandas',
                        'url': 'https://github.com/sarahj-ai/xray-pneumonia'
                    }
                ]
            },
            {
                'email': 'mike@example.com',
                'password': 'password123',
                'full_name': 'Mike Chen',
                'university': 'University of Washington',
                'degree': 'Bachelor of Science',
                'field_of_study': 'Software Engineering',
                'graduation_year': 2024,
                'gpa': 3.78,
                'bio': 'Backend systems enthusiast with strong foundations in distributed computing, cloud architecture, and microservices.',
                'phone': '+1 (555) 456-7890',
                'location': 'Seattle, WA',
                'linkedin_url': 'https://linkedin.com/in/mikechen-swe',
                'github_url': 'https://github.com/mikechen-dev',
                'skills': [('Java', 5), ('Spring Boot', 4), ('AWS', 4), ('Docker', 4), ('PostgreSQL', 4)],
                'educations': [
                    {
                        'institution': 'University of Washington',
                        'degree': 'B.S. Software Engineering',
                        'field_of_study': 'Distributed Systems',
                        'start_date': 'Sep 2020',
                        'end_date': 'Jun 2024',
                        'gpa': 3.78
                    }
                ],
                'projects': [
                    {
                        'title': 'High-Throughput Order Management System',
                        'description': 'Designed an event-driven backend service processing 10,000 requests/sec with Spring Boot & Docker.',
                        'technologies': 'Java, Spring Boot, Docker, PostgreSQL, AWS',
                        'url': 'https://github.com/mikechen-dev/order-engine'
                    }
                ]
            },
            {
                'email': 'emily@example.com',
                'password': 'password123',
                'full_name': 'Emily Davis',
                'university': 'Carnegie Mellon University',
                'degree': 'Bachelor of Fine Arts & CS',
                'field_of_study': 'Human-Computer Interaction',
                'graduation_year': 2024,
                'gpa': 3.88,
                'bio': 'UI/UX engineer specializing in building delightful accessibility-first interfaces, design systems, and frontend experiences.',
                'phone': '+1 (555) 567-8901',
                'location': 'New York, NY',
                'linkedin_url': 'https://linkedin.com/in/emily-davis-design',
                'github_url': 'https://github.com/emilydavis-ui',
                'skills': [('JavaScript', 5), ('React', 4), ('Figma', 5), ('CSS', 5), ('HTML', 5)],
                'educations': [
                    {
                        'institution': 'Carnegie Mellon University',
                        'degree': 'B.S. Human-Computer Interaction',
                        'field_of_study': 'UX Engineering',
                        'start_date': 'Aug 2020',
                        'end_date': 'May 2024',
                        'gpa': 3.88
                    }
                ],
                'projects': [
                    {
                        'title': 'Accessible UI Component Library',
                        'description': 'Published an accessible open-source design library tested with WCAG 2.1 AAA compliance.',
                        'technologies': 'React, TypeScript, CSS, Figma',
                        'url': 'https://github.com/emilydavis-ui/design-tokens'
                    }
                ]
            },
            {
                'email': 'alex@example.com',
                'password': 'password123',
                'full_name': 'Alex Kumar',
                'university': 'Georgia Tech',
                'degree': 'Bachelor of Science',
                'field_of_study': 'Computer Engineering',
                'graduation_year': 2024,
                'gpa': 3.75,
                'bio': 'DevOps & Cloud Engineer dedicated to automated infrastructure provisioning, GitOps, CI/CD pipelines, and Kubernetes.',
                'phone': '+1 (555) 678-9012',
                'location': 'Austin, TX',
                'linkedin_url': 'https://linkedin.com/in/alexkumar-devops',
                'github_url': 'https://github.com/alexkumar-ops',
                'skills': [('Docker', 5), ('Kubernetes', 4), ('AWS', 5), ('Python', 4), ('Linux', 5), ('Jenkins', 4)],
                'educations': [
                    {
                        'institution': 'Georgia Tech',
                        'degree': 'B.S. Computer Engineering',
                        'field_of_study': 'Systems & Networks',
                        'start_date': 'Aug 2020',
                        'end_date': 'May 2024',
                        'gpa': 3.75
                    }
                ],
                'projects': [
                    {
                        'title': 'Multi-Cloud GitOps Deployment Engine',
                        'description': 'Automated Kubernetes cluster deployments across AWS and GCP using Terraform and ArgoCD.',
                        'technologies': 'Docker, Kubernetes, AWS, Terraform, Linux',
                        'url': 'https://github.com/alexkumar-ops/gitops-infra'
                    }
                ]
            }
        ]

        student_users = {}
        for sdata in students_data:
            user = User(
                email=sdata['email'],
                full_name=sdata['full_name'],
                role='student'
            )
            user.set_password(sdata['password'])
            db.session.add(user)
            db.session.flush()
            student_users[sdata['email']] = user

            profile = StudentProfile(
                user_id=user.id,
                university=sdata['university'],
                degree=sdata['degree'],
                field_of_study=sdata['field_of_study'],
                graduation_year=sdata['graduation_year'],
                gpa=sdata['gpa'],
                bio=sdata['bio'],
                phone=sdata['phone'],
                location=sdata['location'],
                linkedin_url=sdata['linkedin_url'],
                github_url=sdata['github_url']
            )
            db.session.add(profile)
            db.session.flush()

            for sk_name, prof_level in sdata['skills']:
                skill_obj = skills_cache.get(sk_name.lower())
                if skill_obj:
                    st_skill = StudentSkill(
                        profile_id=profile.id,
                        skill_id=skill_obj.id,
                        proficiency_level=prof_level
                    )
                    db.session.add(st_skill)

            for edu in sdata['educations']:
                education = Education(
                    profile_id=profile.id,
                    institution=edu['institution'],
                    degree=edu['degree'],
                    field_of_study=edu['field_of_study'],
                    start_date=edu['start_date'],
                    end_date=edu['end_date'],
                    gpa=edu['gpa']
                )
                db.session.add(education)

            for proj in sdata['projects']:
                project = Project(
                    profile_id=profile.id,
                    title=proj['title'],
                    description=proj['description'],
                    technologies=proj['technologies'],
                    url=proj['url']
                )
                db.session.add(project)

        # ==========================================
        # 4. CREATE 15 JOB LISTINGS
        # ==========================================
        print("[SEED] Creating 15 industry job listings with required skills...")
        jobs_data = [
            {
                'title': 'Frontend Developer',
                'company': 'TechCorp',
                'location': 'San Francisco, CA (Hybrid)',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'TechCorp is looking for a motivated Frontend Developer to build dynamic, responsive web applications using React and modern JavaScript. You will collaborate closely with UI/UX designers and backend developers to deliver seamless user experiences.',
                'requirements': 'Bachelor degree in CS or equivalent. Experience with React, modern JavaScript (ES6+), HTML5, and CSS3. Familiarity with TypeScript and Git is preferred.',
                'salary_min': 85000,
                'salary_max': 110000,
                'deadline': '2026-12-31',
                'skills': [('React', 'required'), ('JavaScript', 'required'), ('CSS', 'required'), ('HTML', 'required'), ('TypeScript', 'preferred')]
            },
            {
                'title': 'Backend Developer',
                'company': 'DataFlow Inc',
                'location': 'Austin, TX (Remote)',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'Join DataFlow Inc to architect and optimize high-throughput RESTful APIs, data pipelines, and microservices in Python. You will work with relational databases and containerized deployments.',
                'requirements': 'Solid understanding of Python and web frameworks (Django/Flask). Good grasp of SQL and relational databases like PostgreSQL. Familiarity with Docker and Redis.',
                'salary_min': 90000,
                'salary_max': 115000,
                'deadline': '2026-12-15',
                'skills': [('Python', 'required'), ('Django', 'required'), ('PostgreSQL', 'required'), ('Docker', 'preferred'), ('Redis', 'preferred')]
            },
            {
                'title': 'Full Stack Developer',
                'company': 'InnovateTech',
                'location': 'New York, NY',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'InnovateTech is seeking a fresh graduate Full Stack Developer eager to build end-to-end applications using modern JavaScript/TypeScript, React, Node.js, and cloud backends.',
                'requirements': 'Strong grasp of JavaScript and React on frontend, Node.js on backend. Experience with MongoDB or SQL databases. Excellent team collaboration and version control skills.',
                'salary_min': 95000,
                'salary_max': 120000,
                'deadline': '2026-11-30',
                'skills': [('JavaScript', 'required'), ('React', 'required'), ('Node.js', 'required'), ('MongoDB', 'preferred'), ('Git', 'required')]
            },
            {
                'title': 'Data Scientist',
                'company': 'AI Solutions',
                'location': 'Boston, MA (Hybrid)',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'AI Solutions is looking for a Data Scientist to build predictive statistical models, clean large datasets, and extract actionable business intelligence using Python and modern ML algorithms.',
                'requirements': 'Degree in Data Science, Statistics, or Computer Science. Proficiency in Python, Pandas, Scikit-learn, and SQL. Experience with TensorFlow or PyTorch is a plus.',
                'salary_min': 98000,
                'salary_max': 125000,
                'deadline': '2026-12-20',
                'skills': [('Python', 'required'), ('Machine Learning', 'required'), ('TensorFlow', 'preferred'), ('SQL', 'required'), ('Statistics', 'required')]
            },
            {
                'title': 'Machine Learning Engineer',
                'company': 'DeepMind Labs',
                'location': 'San Francisco, CA',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'DeepMind Labs is looking for an ML Engineer to implement, train, and deploy deep neural network architectures and NLP pipelines to production systems.',
                'requirements': 'Deep understanding of PyTorch or TensorFlow, Deep Learning concepts, and NLP techniques. Experience deploying models via Docker containers.',
                'salary_min': 115000,
                'salary_max': 145000,
                'deadline': '2026-12-31',
                'skills': [('Python', 'required'), ('PyTorch', 'required'), ('Deep Learning', 'required'), ('NLP', 'required'), ('Docker', 'preferred')]
            },
            {
                'title': 'DevOps Engineer',
                'company': 'CloudScale',
                'location': 'Seattle, WA (Remote)',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'CloudScale is hiring a Junior DevOps Engineer to manage CI/CD pipelines, container orchestration with Kubernetes, and cloud infrastructure on AWS.',
                'requirements': 'Hands-on familiarity with Linux, Docker, AWS, Jenkins or GitHub Actions. Understanding of Infrastructure-as-Code with Terraform.',
                'salary_min': 92000,
                'salary_max': 118000,
                'deadline': '2026-11-28',
                'skills': [('AWS', 'required'), ('Docker', 'required'), ('Kubernetes', 'required'), ('Terraform', 'preferred'), ('Jenkins', 'preferred'), ('Linux', 'required')]
            },
            {
                'title': 'Mobile Developer',
                'company': 'AppWorks',
                'location': 'Los Angeles, CA',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'Develop innovative cross-platform mobile apps using React Native. Work on offline storage, push notifications, and high-performance animations.',
                'requirements': 'Knowledge of React, JavaScript/TypeScript, and mobile application life cycles. Familiarity with Firebase and Git.',
                'salary_min': 85000,
                'salary_max': 105000,
                'deadline': '2026-12-10',
                'skills': [('React', 'required'), ('JavaScript', 'required'), ('Firebase', 'preferred'), ('Git', 'required')]
            },
            {
                'title': 'Data Analyst',
                'company': 'InsightCo',
                'location': 'Chicago, IL (Hybrid)',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'Transform raw data into meaningful executive dashboards and reports. Leverage SQL queries, Tableau visualizations, and Python data manipulation.',
                'requirements': 'Proficiency with SQL and Excel. Experience with Tableau or Power BI. Familiarity with Python (Pandas) and basic statistical concepts.',
                'salary_min': 75000,
                'salary_max': 95000,
                'deadline': '2026-12-15',
                'skills': [('Python', 'required'), ('SQL', 'required'), ('Tableau', 'required'), ('Pandas', 'required'), ('Statistics', 'preferred')]
            },
            {
                'title': 'Cloud Engineer',
                'company': 'SkyNet Systems',
                'location': 'Denver, CO (Remote)',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'Help architect secure and scalable cloud infrastructure across AWS and Azure. Configure serverless functions and container clusters.',
                'requirements': 'Understanding of AWS and Azure core services. Experience with containerization (Docker) and Kubernetes. Terraform scripting.',
                'salary_min': 95000,
                'salary_max': 120000,
                'deadline': '2026-12-25',
                'skills': [('AWS', 'required'), ('Azure', 'preferred'), ('Docker', 'required'), ('Kubernetes', 'required'), ('Terraform', 'preferred')]
            },
            {
                'title': 'UX/UI Developer',
                'company': 'DesignHub',
                'location': 'San Diego, CA (Remote)',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'Bridge the gap between design and technical execution. Translate Figma prototypes into responsive, accessible React components with clean CSS.',
                'requirements': 'Expertise in Figma design tool and prototyping. Strong skills in HTML, modern CSS, JavaScript, and React.',
                'salary_min': 80000,
                'salary_max': 105000,
                'deadline': '2026-12-05',
                'skills': [('JavaScript', 'required'), ('React', 'required'), ('Figma', 'required'), ('CSS', 'required'), ('HTML', 'required')]
            },
            {
                'title': 'Software Engineer',
                'company': 'Google',
                'location': 'Mountain View, CA',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'Develop next-generation technologies that change how millions of users connect, explore, and interact with information and one another at scale.',
                'requirements': 'BS in Computer Science. Strong coding ability in Python, Java, or C++. Strong algorithmic problem solving and Linux systems knowledge.',
                'salary_min': 125000,
                'salary_max': 160000,
                'deadline': '2026-12-31',
                'skills': [('Python', 'required'), ('Java', 'required'), ('C++', 'preferred'), ('Git', 'required'), ('Linux', 'required'), ('Problem Solving', 'required')]
            },
            {
                'title': 'Cybersecurity Analyst',
                'company': 'SecureNet',
                'location': 'Washington, DC',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'Protect critical digital infrastructure against cyber threats. Perform vulnerability scans, analyze log files, and automate security checks with Python.',
                'requirements': 'Knowledge of network protocols, Linux operating system, and cloud security in AWS. Basic scripting in Python.',
                'salary_min': 88000,
                'salary_max': 112000,
                'deadline': '2026-12-18',
                'skills': [('Python', 'required'), ('Linux', 'required'), ('AWS', 'preferred'), ('Git', 'required')]
            },
            {
                'title': 'AI Research Intern',
                'company': 'OpenAI Lab',
                'location': 'San Francisco, CA (On-site)',
                'job_type': 'Internship',
                'experience_level': 'Internship',
                'description': 'Work alongside research scientists exploring foundational transformer models, reinforcement learning with human feedback, and LLM reasoning benchmarks.',
                'requirements': 'Current graduate or senior undergraduate in AI/CS. Strong background in PyTorch, Machine Learning, Deep Learning, and NLP.',
                'salary_min': 65000,
                'salary_max': 85000,
                'deadline': '2026-12-01',
                'skills': [('Python', 'required'), ('Machine Learning', 'required'), ('Deep Learning', 'required'), ('PyTorch', 'required'), ('NLP', 'required')]
            },
            {
                'title': 'QA Engineer',
                'company': 'TestPro',
                'location': 'Dallas, TX (Hybrid)',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'Ensure world-class software reliability by writing automated end-to-end tests, testing RESTful APIs with Postman, and tracking defects in Jira.',
                'requirements': 'Experience writing test scripts in Python. Familiarity with API testing tools (Postman), SQL queries, and Jira for issue tracking.',
                'salary_min': 75000,
                'salary_max': 95000,
                'deadline': '2026-12-12',
                'skills': [('Python', 'required'), ('Jira', 'required'), ('Git', 'required'), ('Postman', 'required'), ('SQL', 'preferred')]
            },
            {
                'title': 'Product Manager',
                'company': 'StartupHub',
                'location': 'San Francisco, CA (Hybrid)',
                'job_type': 'Full-time',
                'experience_level': 'Entry-level',
                'description': 'Coordinate across cross-functional engineering, design, and marketing teams to prioritize roadmap items, write user stories, and launch products.',
                'requirements': 'Strong analytical mindset and problem solving skills. Excellent written and verbal communication. Knowledge of Agile and Scrum workflows.',
                'salary_min': 95000,
                'salary_max': 120000,
                'deadline': '2026-12-28',
                'skills': [('Agile', 'required'), ('Scrum', 'required'), ('Jira', 'required'), ('Communication', 'required'), ('Leadership', 'preferred'), ('Problem Solving', 'required')]
            }
        ]

        created_jobs = {}
        for jdata in jobs_data:
            job = Job(
                title=jdata['title'],
                company=jdata['company'],
                location=jdata['location'],
                job_type=jdata['job_type'],
                experience_level=jdata['experience_level'],
                description=jdata['description'],
                requirements=jdata['requirements'],
                salary_min=jdata['salary_min'],
                salary_max=jdata['salary_max'],
                deadline=jdata['deadline'],
                is_active=True,
                created_by=admin.id
            )
            db.session.add(job)
            db.session.flush()
            created_jobs[jdata['title']] = job

            for skill_name, importance in jdata['skills']:
                skill_obj = skills_cache.get(skill_name.lower())
                if skill_obj:
                    job_skill = JobSkill(
                        job_id=job.id,
                        skill_id=skill_obj.id,
                        importance=importance
                    )
                    db.session.add(job_skill)

        # ==========================================
        # 5. CREATE 22+ COURSES
        # ==========================================
        print("[SEED] Seeding 22+ curated courses mapped to skills...")
        courses_data = [
            {
                'title': 'Python for Everybody Specialization',
                'provider': 'Coursera',
                'url': 'https://www.coursera.org/specializations/python',
                'skill_name': 'Python',
                'difficulty': 'Beginner',
                'duration': '8 weeks (3 hrs/week)',
                'description': 'Learn to program and analyze data with Python. Develop programs to gather, clean, analyze, and visualize data.',
                'rating': 4.8
            },
            {
                'title': 'React - The Complete Guide (incl React Router & Redux)',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
                'skill_name': 'React',
                'difficulty': 'Intermediate',
                'duration': '50 hours',
                'description': 'Dive in and learn React.js from scratch! Learn React, Hooks, Redux, React Router, Next.js and Best Practices.',
                'rating': 4.7
            },
            {
                'title': 'Machine Learning Specialization by Andrew Ng',
                'provider': 'Coursera',
                'url': 'https://www.coursera.org/specializations/machine-learning-introduction',
                'skill_name': 'Machine Learning',
                'difficulty': 'Intermediate',
                'duration': '10 weeks (4 hrs/week)',
                'description': 'Master fundamental AI concepts and practical machine learning skills taught by AI pioneer Andrew Ng.',
                'rating': 4.9
            },
            {
                'title': 'AWS Certified Cloud Practitioner Essentials',
                'provider': 'AWS Training',
                'url': 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/',
                'skill_name': 'AWS',
                'difficulty': 'Beginner',
                'duration': '6 hours',
                'description': 'Official fundamental course to learn core AWS concepts, services, security, architecture, pricing, and support.',
                'rating': 4.6
            },
            {
                'title': 'Docker Mastery: with Kubernetes + Swarm',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/docker-mastery/',
                'skill_name': 'Docker',
                'difficulty': 'Intermediate',
                'duration': '21 hours',
                'description': 'Build, test, deploy containers with the best-selling Docker course. Covers Docker Compose, Swarm, and Kubernetes.',
                'rating': 4.7
            },
            {
                'title': 'Data Structures & Algorithms in Python',
                'provider': 'edX',
                'url': 'https://www.edx.org/course/data-structures-and-algorithms-python',
                'skill_name': 'Problem Solving',
                'difficulty': 'Intermediate',
                'duration': '12 weeks (5 hrs/week)',
                'description': 'Master algorithmic problem solving, time-space complexity, trees, graphs, dynamic programming, and interview questions.',
                'rating': 4.8
            },
            {
                'title': 'The Complete SQL Bootcamp: Go from Zero to Hero',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/the-complete-sql-bootcamp/',
                'skill_name': 'SQL',
                'difficulty': 'Beginner',
                'duration': '9 hours',
                'description': 'Become an expert at SQL querying with PostgreSQL. Learn complex joins, group by, subqueries, and window functions.',
                'rating': 4.7
            },
            {
                'title': 'Deep Learning Specialization',
                'provider': 'Coursera',
                'url': 'https://www.coursera.org/specializations/deep-learning',
                'skill_name': 'Deep Learning',
                'difficulty': 'Advanced',
                'duration': '16 weeks (5 hrs/week)',
                'description': 'Master Deep Learning, CNNs, RNNs, LSTMs, Transformers, and build autonomous AI systems with deeplearning.ai.',
                'rating': 4.9
            },
            {
                'title': 'JavaScript: The Advanced Concepts',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/advanced-javascript-concepts/',
                'skill_name': 'JavaScript',
                'difficulty': 'Intermediate',
                'duration': '25 hours',
                'description': 'Learn modern advanced JavaScript: closures, prototypes, event loops, async/await, memory management, and design patterns.',
                'rating': 4.8
            },
            {
                'title': 'Django 4 and Python Full-Stack Bootcamp',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/python-and-django-full-stack-web-developer-bootcamp/',
                'skill_name': 'Django',
                'difficulty': 'Intermediate',
                'duration': '32 hours',
                'description': 'Build secure, scalable database-driven websites with Python, Django ORM, REST APIs, and PostgreSQL.',
                'rating': 4.6
            },
            {
                'title': 'FastAPI - The Complete Course 2024',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/fastapi-the-complete-course/',
                'skill_name': 'FastAPI',
                'difficulty': 'Intermediate',
                'duration': '18 hours',
                'description': 'Modern Python REST APIs with FastAPI, Pydantic, SQLAlchemy, OAuth2, and automatic Swagger docs generation.',
                'rating': 4.7
            },
            {
                'title': 'PostgreSQL for Everybody Specialization',
                'provider': 'Coursera',
                'url': 'https://www.coursera.org/specializations/postgresql-for-everybody',
                'skill_name': 'PostgreSQL',
                'difficulty': 'Beginner',
                'duration': '6 weeks (4 hrs/week)',
                'description': 'Learn PostgreSQL database design, indexing, transactions, ACID compliance, and SQL query tuning.',
                'rating': 4.6
            },
            {
                'title': 'Certified Kubernetes Administrator (CKA) with Practice Tests',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/',
                'skill_name': 'Kubernetes',
                'difficulty': 'Advanced',
                'duration': '23 hours',
                'description': 'Complete guide to Kubernetes administration, pods, deployments, services, ingress, RBAC, and cluster troubleshooting.',
                'rating': 4.8
            },
            {
                'title': 'Natural Language Processing with Attention Models',
                'provider': 'Coursera',
                'url': 'https://www.coursera.org/learn/attention-models-in-nlp',
                'skill_name': 'NLP',
                'difficulty': 'Advanced',
                'duration': '4 weeks (4 hrs/week)',
                'description': 'Build state-of-the-art NLP models using transformers, self-attention mechanisms, BERT, and GPT architectures.',
                'rating': 4.7
            },
            {
                'title': 'Tableau 2024 A-Z: Hands-On Tableau Training for Data Science',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/tableau10/',
                'skill_name': 'Tableau',
                'difficulty': 'Beginner',
                'duration': '9 hours',
                'description': 'Learn Tableau for data science step-by-step. Build interactive dashboards, heat maps, and business storytelling charts.',
                'rating': 4.6
            },
            {
                'title': 'Git Complete: The Definitive Step-by-Step Guide',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/git-complete/',
                'skill_name': 'Git',
                'difficulty': 'Beginner',
                'duration': '6 hours',
                'description': 'Master Git command line, branching strategies, rebasing, merge conflict resolution, and GitHub collaboration.',
                'rating': 4.7
            },
            {
                'title': 'Figma UI/UX Design Essentials',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/figma-ux-ui-design-user-experience-tutorial-course/',
                'skill_name': 'Figma',
                'difficulty': 'Beginner',
                'duration': '12 hours',
                'description': 'Use Figma like a pro: wireframing, color theory, design systems, auto-layout, interactive micro-prototypes.',
                'rating': 4.8
            },
            {
                'title': 'Linux Mastery: Master the Linux Command Line',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/linux-mastery/',
                'skill_name': 'Linux',
                'difficulty': 'Beginner',
                'duration': '11 hours',
                'description': 'Master Linux fundamentals, bash terminal, permissions, shell scripting, package managers, and server setup.',
                'rating': 4.7
            },
            {
                'title': 'Spring Boot 3, Spring 6 & Hibernate for Beginners',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/spring-hibernate-tutorial/',
                'skill_name': 'Spring Boot',
                'difficulty': 'Intermediate',
                'duration': '34 hours',
                'description': 'Learn Spring Boot 3, Spring MVC, REST APIs, Spring Security, JPA/Hibernate, and enterprise Java development.',
                'rating': 4.7
            },
            {
                'title': 'Terraform for AWS - Beginner to Master',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/terraform-for-aws-beginner-to-master/',
                'skill_name': 'Terraform',
                'difficulty': 'Intermediate',
                'duration': '14 hours',
                'description': 'Learn Infrastructure as Code (IaC) with HashiCorp Terraform on Amazon Web Services cloud infrastructure.',
                'rating': 4.6
            },
            {
                'title': 'Applied Data Science with Python Specialization',
                'provider': 'Coursera',
                'url': 'https://www.coursera.org/specializations/data-science-python',
                'skill_name': 'Pandas',
                'difficulty': 'Intermediate',
                'duration': '20 weeks (4 hrs/week)',
                'description': 'Gain new insights into your data through data visualization, statistical analysis, text mining, and machine learning.',
                'rating': 4.8
            },
            {
                'title': 'Agile Crash Course: Agile Project Management',
                'provider': 'Udemy',
                'url': 'https://www.udemy.com/course/agile-crash-course/',
                'skill_name': 'Agile',
                'difficulty': 'Beginner',
                'duration': '3 hours',
                'description': 'Master Agile values, principles, sprint planning, user stories, retrospectives, and agile team management.',
                'rating': 4.6
            }
        ]

        for cdata in courses_data:
            skill_obj = skills_cache.get(cdata['skill_name'].lower())
            course = Course(
                title=cdata['title'],
                provider=cdata['provider'],
                url=cdata['url'],
                skill_id=skill_obj.id if skill_obj else None,
                difficulty=cdata['difficulty'],
                duration=cdata['duration'],
                description=cdata['description'],
                rating=cdata['rating']
            )
            db.session.add(course)

        # ==========================================
        # 6. CREATE SAMPLE APPLICATIONS
        # ==========================================
        print("[SEED] Creating sample student job applications...")
        # John -> Frontend Developer (status: 'applied')
        john_user = student_users['john@example.com']
        frontend_job = created_jobs['Frontend Developer']
        john_skills = ['Python', 'React', 'JavaScript', 'SQL', 'Git']
        john_score = calculate_match_score(john_skills, frontend_job)
        app1 = Application(
            student_id=john_user.id,
            job_id=frontend_job.id,
            status='applied',
            match_score=john_score,
            cover_letter='I am deeply passionate about creating fast, responsive, and accessible user interfaces with React and modern JavaScript. I would love to contribute to TechCorp!'
        )
        db.session.add(app1)

        # Sarah -> Data Scientist (status: 'interview')
        sarah_user = student_users['sarah@example.com']
        ds_job = created_jobs['Data Scientist']
        sarah_skills = ['Python', 'Machine Learning', 'Pandas', 'TensorFlow', 'Statistics']
        sarah_score = calculate_match_score(sarah_skills, ds_job)
        app2 = Application(
            student_id=sarah_user.id,
            job_id=ds_job.id,
            status='interview',
            match_score=sarah_score,
            cover_letter='With a rigorous background in statistical analysis and machine learning at UC Berkeley, I am excited to apply predictive models at AI Solutions.'
        )
        db.session.add(app2)

        # Mike -> Backend Developer (status: 'reviewed')
        mike_user = student_users['mike@example.com']
        backend_job = created_jobs['Backend Developer']
        mike_skills = ['Java', 'Spring Boot', 'AWS', 'Docker', 'PostgreSQL']
        mike_score = calculate_match_score(mike_skills, backend_job)
        app3 = Application(
            student_id=mike_user.id,
            job_id=backend_job.id,
            status='reviewed',
            match_score=mike_score,
            cover_letter='I have extensive experience designing microservices and containerized relational database architectures that scale reliably.'
        )
        db.session.add(app3)

        # ==========================================
        # COMMIT ALL CHANGES
        # ==========================================
        db.session.commit()
        print("[DONE] Database seeding completed successfully!")
        print(f"   - Admin created: admin@careerbridge.com")
        print(f"   - Students created: 5")
        print(f"   - Skills created: {len(skills_cache)}")
        print(f"   - Jobs created: {len(created_jobs)}")
        print(f"   - Courses created: {len(courses_data)}")
        print(f"   - Applications created: 3")

if __name__ == '__main__':
    seed_database()
