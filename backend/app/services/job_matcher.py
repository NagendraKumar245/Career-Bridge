from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.student_profile import StudentProfile
from app.models.job import Job

def calculate_match_score(student_skills, job):
    """
    Calculates match score between student's skills and a job.
    Uses TF-IDF + cosine similarity (60%) and direct skill overlap (40%).
    Returns score as percentage (0 - 100).
    """
    if not student_skills:
        return 0.0

    # Normalize student skills to list of strings
    student_skill_names = []
    for s in student_skills:
        if isinstance(s, str):
            student_skill_names.append(s)
        elif hasattr(s, 'skill') and s.skill:
            student_skill_names.append(s.skill.name)
        elif hasattr(s, 'name'):
            student_skill_names.append(s.name)

    if not student_skill_names:
        return 0.0

    student_text = " ".join(student_skill_names)

    # Job skill names
    job_skill_names = [js.skill.name for js in job.required_skills if js.skill] if hasattr(job, 'required_skills') and job.required_skills else []
    
    # Job text blob combining title, description, requirements, and required skills
    job_text_parts = [
        job.title or "",
        job.description or "",
        job.requirements or "",
        " ".join(job_skill_names)
    ]
    job_text = " ".join([p for p in job_text_parts if p.strip()])

    if not job_text.strip():
        return 0.0

    # 1. TF-IDF Cosine Similarity
    tfidf_score = 0.0
    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([student_text, job_text])
        sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        tfidf_score = float(sim_matrix[0][0])
    except Exception as e:
        print(f"TF-IDF calculation error: {e}")
        tfidf_score = 0.0

    # 2. Direct Skill Overlap Score
    student_skills_lower = {s.lower() for s in student_skill_names}
    if job_skill_names:
        matching_count = sum(1 for js in job_skill_names if js.lower() in student_skills_lower)
        skill_overlap_score = matching_count / len(job_skill_names)
    else:
        skill_overlap_score = tfidf_score

    # Final combined score: 60% TF-IDF + 40% direct overlap
    final_score = (0.6 * tfidf_score + 0.4 * skill_overlap_score) * 100.0
    return round(max(0.0, min(100.0, final_score)), 2)


def get_job_recommendations(user_id, limit=20):
    """
    Ranks all active jobs for a given student user_id.
    Returns top N jobs with match scores.
    """
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    student_skills = []
    if profile and profile.skills:
        student_skills = [s.skill.name for s in profile.skills if s.skill]

    active_jobs = Job.query.filter_by(is_active=True).all()
    recommendations = []

    for job in active_jobs:
        score = calculate_match_score(student_skills, job)
        job_data = job.to_dict()
        job_data['match_score'] = score
        recommendations.append(job_data)

    # Sort descending by match score
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    return recommendations[:limit]
