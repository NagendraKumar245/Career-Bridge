import re
import os

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

SKILL_TAXONOMY = {
    'programming': [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'Go', 'Rust',
        'Ruby', 'PHP', 'Swift', 'Kotlin', 'R', 'MATLAB', 'Scala', 'Perl', 'SQL', 'HTML', 'CSS'
    ],
    'framework': [
        'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask',
        'Spring Boot', '.NET', 'Ruby on Rails', 'FastAPI', 'Next.js', 'Svelte',
        'TensorFlow', 'PyTorch', 'Keras'
    ],
    'database': [
        'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis', 'Cassandra',
        'DynamoDB', 'Oracle', 'Firebase', 'Elasticsearch'
    ],
    'cloud': [
        'AWS', 'Azure', 'Google Cloud', 'Heroku', 'Docker', 'Kubernetes',
        'Terraform', 'Jenkins', 'CI/CD', 'GitHub Actions'
    ],
    'data_science': [
        'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
        'Data Analysis', 'Pandas', 'NumPy', 'Scikit-learn', 'Tableau',
        'Power BI', 'Statistics', 'A/B Testing'
    ],
    'tool': [
        'Git', 'GitHub', 'Linux', 'Jira', 'Figma', 'Adobe XD', 'Postman',
        'VS Code', 'IntelliJ', 'Webpack', 'Vite'
    ],
    'soft_skill': [
        'Communication', 'Leadership', 'Teamwork', 'Problem Solving',
        'Critical Thinking', 'Project Management', 'Agile', 'Scrum', 'Time Management'
    ]
}


def extract_text_from_pdf(file_path):
    """
    Opens PDF with pdfplumber, extracts text from all pages, cleans it.
    Returns cleaned text.
    """
    if not os.path.exists(file_path):
        return ""

    if pdfplumber is None:
        print("Warning: pdfplumber is not installed.")
        return ""

    text_parts = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
    except Exception as e:
        print(f"Error extracting text from PDF {file_path}: {e}")
        return ""

    raw_text = "\n".join(text_parts)
    # Remove non-printable / control characters (keep standard ASCII and newlines)
    cleaned = re.sub(r'[^\x20-\x7E\n\t]', ' ', raw_text)
    # Normalize excessive spaces
    cleaned = re.sub(r'[ \t]+', ' ', cleaned)
    # Normalize multiple newlines
    cleaned = re.sub(r'\n\s*\n+', '\n\n', cleaned).strip()
    return cleaned


def extract_skills_from_text(text):
    """
    Iterates through SKILL_TAXONOMY.
    Checks if each skill appears in the text using boundary-aware regex.
    Returns list of {'name': skill, 'category': category} dicts.
    """
    if not text:
        return []

    found_skills = []
    seen_names = set()

    for category, skills in SKILL_TAXONOMY.items():
        for skill in skills:
            pattern = None
            # Handle special single-letter and symbol cases
            if skill == 'C':
                pattern = r'(?<![A-Za-z0-9])(?:C(?:\s+(?:programming|language|developer))?)(?![A-Za-z0-9\+#])'
            elif skill == 'R':
                pattern = r'(?<![A-Za-z0-9])(?:R(?:\s+(?:programming|language|stats))?)(?![A-Za-z0-9])'
            elif skill == 'Go':
                pattern = r'(?<![A-Za-z0-9])(?:Golang|Go(?:\s+(?:programming|language|developer))?)(?![A-Za-z0-9])'
            elif skill == '.NET':
                pattern = r'(?<![A-Za-z0-9])(?:\.NET|\.net)(?![A-Za-z0-9])'
            elif skill == 'CI/CD':
                pattern = r'(?<![A-Za-z0-9])CI\s*/\s*CD(?![A-Za-z0-9])'
            else:
                escaped = re.escape(skill)
                # Word boundary check compatible with symbols
                pattern = rf'(?<![A-Za-z0-9]){escaped}(?![A-Za-z0-9])'

            if re.search(pattern, text, re.IGNORECASE):
                if skill.lower() not in seen_names:
                    seen_names.add(skill.lower())
                    found_skills.append({
                        'name': skill,
                        'category': category
                    })

    return found_skills


def parse_resume(file_path):
    """
    Extracts text and skills from a resume PDF file.
    Returns {'text': cleaned_text, 'skills': found_skills}
    """
    text = extract_text_from_pdf(file_path)
    skills = extract_skills_from_text(text)
    return {
        'text': text,
        'skills': skills
    }
