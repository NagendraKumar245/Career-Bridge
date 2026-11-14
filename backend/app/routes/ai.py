from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.job import Job
from app.models.student_profile import StudentProfile
from app.services.job_matcher import get_job_recommendations
from app.services.skill_analyzer import analyze_skill_gap, get_overall_skill_gaps
from app.services.course_recommender import recommend_courses

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    user_id = int(get_jwt_identity())
    limit = request.args.get('limit', 20, type=int)
    limit = max(1, min(100, limit))

    recommendations = get_job_recommendations(user_id, limit=limit)
    return jsonify({
        'recommendations': recommendations
    }), 200


@ai_bp.route('/skill-gap/<int:job_id>', methods=['GET'])
@jwt_required()
def get_job_skill_gap(job_id):
    user_id = int(get_jwt_identity())
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    student_skills = [s.skill.name for s in profile.skills if s.skill] if profile and profile.skills else []

    gap_analysis = analyze_skill_gap(student_skills, job)
    gap_analysis['job_id'] = job.id
    gap_analysis['job_title'] = job.title
    gap_analysis['company'] = job.company

    return jsonify(gap_analysis), 200


@ai_bp.route('/skill-gap', methods=['GET'])
@jwt_required()
def get_overall_skill_gap_analysis():
    user_id = int(get_jwt_identity())
    gaps = get_overall_skill_gaps(user_id)
    return jsonify({
        'skill_gaps': gaps
    }), 200


@ai_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_course_recommendations():
    user_id = int(get_jwt_identity())
    learning_path = recommend_courses(user_id)
    return jsonify({
        'learning_path': learning_path
    }), 200
