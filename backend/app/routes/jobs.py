import math
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.job import Job
from app.models.student_profile import StudentProfile
from app.models.application import Application
from app.services.job_matcher import calculate_match_score

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('', methods=['GET'])
@jobs_bp.route('/', methods=['GET'])
def get_jobs():
    query = Job.query.filter_by(is_active=True)

    search = request.args.get('search', '').strip()
    if search:
        query = query.filter(
            (Job.title.ilike(f'%{search}%')) |
            (Job.company.ilike(f'%{search}%')) |
            (Job.description.ilike(f'%{search}%'))
        )

    location = request.args.get('location', '').strip()
    if location:
        query = query.filter(Job.location.ilike(f'%{location}%'))

    job_type = request.args.get('job_type', '').strip()
    if job_type:
        query = query.filter(Job.job_type.ilike(f'%{job_type}%'))

    experience_level = request.args.get('experience_level', '').strip()
    if experience_level:
        query = query.filter(Job.experience_level.ilike(f'%{experience_level}%'))

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    page = max(1, page)
    per_page = max(1, min(100, per_page))

    total = query.count()
    jobs = query.order_by(Job.posted_date.desc()).offset((page - 1) * per_page).limit(per_page).all()
    total_pages = math.ceil(total / per_page) if per_page else 1

    return jsonify({
        'jobs': [job.to_dict() for job in jobs],
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': total_pages
    }), 200


@jobs_bp.route('/<int:job_id>', methods=['GET'])
def get_job_detail(job_id):
    job = Job.query.get(job_id)
    if not job or not job.is_active:
        return jsonify({'error': 'Job not found'}), 404

    return jsonify({'job': job.to_dict()}), 200


@jobs_bp.route('/<int:job_id>/apply', methods=['POST'])
@jwt_required()
def apply_to_job(job_id):
    user_id = int(get_jwt_identity())
    job = Job.query.get(job_id)
    if not job or not job.is_active:
        return jsonify({'error': 'Job not found or inactive'}), 404

    # Prevent duplicate applications
    existing = Application.query.filter_by(student_id=user_id, job_id=job_id).first()
    if existing:
        return jsonify({'error': 'You have already applied for this job'}), 400

    # Auto-calculate match score using job_matcher service
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    student_skills = [s.skill.name for s in profile.skills if s.skill] if profile and profile.skills else []
    match_score = calculate_match_score(student_skills, job)

    data = request.get_json() or {}
    cover_letter = data.get('cover_letter', '').strip()

    application = Application(
        student_id=user_id,
        job_id=job_id,
        status='applied',
        match_score=match_score,
        cover_letter=cover_letter
    )
    db.session.add(application)
    db.session.commit()

    return jsonify({
        'message': 'Application submitted successfully',
        'application': application.to_dict()
    }), 201


@jobs_bp.route('/applications', methods=['GET'])
@jwt_required()
def get_student_applications():
    user_id = int(get_jwt_identity())
    query = Application.query.filter_by(student_id=user_id)

    status = request.args.get('status', '').strip()
    if status:
        query = query.filter_by(status=status)

    applications = query.order_by(Application.applied_date.desc()).all()
    return jsonify({
        'applications': [app.to_dict() for app in applications]
    }), 200


@jobs_bp.route('/applications/<int:application_id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(application_id):
    data = request.get_json() or {}
    new_status = data.get('status', '').strip().lower()

    if not new_status:
        return jsonify({'error': 'Status is required'}), 400

    application = Application.query.get(application_id)
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    application.status = new_status
    db.session.commit()

    return jsonify({
        'message': 'Application status updated successfully',
        'application': application.to_dict()
    }), 200
