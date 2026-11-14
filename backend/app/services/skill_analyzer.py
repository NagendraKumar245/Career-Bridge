from collections import Counter
from app.models.student_profile import StudentProfile
from app.models.job import Job
from app.services.job_matcher import get_job_recommendations

def analyze_skill_gap(student_skills, job):
    """
    Compares student's skills against job's required skills.
    Returns:
        matching_skills: list of skill names present in both
        missing_skills: list of job skills absent in student skills
        match_percentage: percentage of job skills satisfied (0 - 100)
        gap_percentage: 100 - match_percentage
    """
    # Normalize student skills
    student_skill_names = []
    for s in (student_skills or []):
        if isinstance(s, str):
            student_skill_names.append(s)
        elif hasattr(s, 'skill') and s.skill:
            student_skill_names.append(s.skill.name)
        elif hasattr(s, 'name'):
            student_skill_names.append(s.name)

    student_skills_map = {s.lower(): s for s in student_skill_names}

    # Job required skills
    job_skills = []
    if hasattr(job, 'required_skills') and job.required_skills:
        for js in job.required_skills:
            if js.skill:
                job_skills.append(js.skill.name)

    if not job_skills:
        return {
            'matching_skills': [],
            'missing_skills': [],
            'match_percentage': 100.0,
            'gap_percentage': 0.0
        }

    matching_skills = []
    missing_skills = []

    for js in job_skills:
        if js.lower() in student_skills_map:
            matching_skills.append(js)
        else:
            missing_skills.append(js)

    total_job_skills = len(job_skills)
    match_percentage = round((len(matching_skills) / total_job_skills) * 100.0, 2)
    gap_percentage = round(100.0 - match_percentage, 2)

    return {
        'matching_skills': matching_skills,
        'missing_skills': missing_skills,
        'match_percentage': match_percentage,
        'gap_percentage': gap_percentage
    }


def get_overall_skill_gaps(user_id):
    """
    Aggregates skill gaps across the top 10 recommended jobs for a student.
    Returns prioritized list of missing skills with frequency count.
    """
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    student_skills = []
    if profile and profile.skills:
        student_skills = [s.skill.name for s in profile.skills if s.skill]

    student_skills_lower = {s.lower() for s in student_skills}

    # Get top 10 recommended jobs
    top_jobs_data = get_job_recommendations(user_id, limit=10)
    top_job_ids = [j['id'] for j in top_jobs_data]

    if not top_job_ids:
        return []

    jobs = Job.query.filter(Job.id.in_(top_job_ids)).all()

    missing_skills_counter = Counter()

    for job in jobs:
        if job.required_skills:
            for js in job.required_skills:
                if js.skill:
                    skill_name = js.skill.name
                    if skill_name.lower() not in student_skills_lower:
                        missing_skills_counter[skill_name] += 1

    sorted_gaps = [
        {'skill_name': skill, 'frequency': count}
        for skill, count in missing_skills_counter.most_common()
    ]

    return sorted_gaps
