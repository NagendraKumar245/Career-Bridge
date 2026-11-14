from app.models.course import Course
from app.models.skill import Skill
from app.services.skill_analyzer import get_overall_skill_gaps

def recommend_courses(user_id):
    """
    Finds courses to bridge the student's identified skill gaps.
    Returns prioritized learning path sorted by skill gap frequency and course rating.
    """
    gaps = get_overall_skill_gaps(user_id)
    learning_path = []

    for gap in gaps:
        skill_name = gap['skill_name']
        freq = gap['frequency']

        # Find courses mapped to this skill
        courses = Course.query.join(Skill).filter(
            Skill.name.ilike(skill_name)
        ).order_by(Course.rating.desc()).all()

        if courses:
            learning_path.append({
                'skill_name': skill_name,
                'gap_frequency': freq,
                'courses': [c.to_dict() for c in courses]
            })

    # If no specific skill gap courses found (e.g. fresh profile or no gaps),
    # recommend top rated beginner/intermediate courses as suggestions
    if not learning_path:
        top_courses = Course.query.order_by(Course.rating.desc()).limit(5).all()
        if top_courses:
            learning_path.append({
                'skill_name': 'Foundational Recommendations',
                'gap_frequency': 0,
                'courses': [c.to_dict() for c in top_courses]
            })

    return learning_path
