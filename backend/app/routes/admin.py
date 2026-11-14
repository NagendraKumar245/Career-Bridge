from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.job import Job, JobSkill
from app.models.skill import Skill
from app.models.application import Application
from app.services.resume_parser import SKILL_TAXONOMY
from app.utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required()
def get_admin_stats():
    total_students = User.query.filter_by(role='student').count()
    total_jobs = Job.query.count()
    total_applications = Application.query.count()
    active_jobs = Job.query.filter_by(is_active=True).count()
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_applications_count = Application.query.filter(Application.applied_date >= seven_days_ago).count()

    return jsonify({
        'total_students': total_students,
        'total_jobs': total_jobs,
        'total_applications': total_applications,
        'active_jobs': active_jobs,
        'recent_applications_count': recent_applications_count
    }), 200


@admin_bp.route('/students', methods=['GET'])
@jwt_required()
@admin_required()
def list_students():
    query = User.query.filter_by(role='student')
    search = request.args.get('search', '').strip()

    if search:
        query = query.filter(
            (User.full_name.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%'))
        )

    students = query.order_by(User.created_at.desc()).all()
    return jsonify({
        'students': [student.to_dict(include_profile=True) for student in students]
    }), 200


@admin_bp.route('/students/<int:student_id>', methods=['GET'])
@jwt_required()
@admin_required()
def get_student_detail(student_id):
    student = User.query.filter_by(id=student_id, role='student').first()
    if not student:
        return jsonify({'error': 'Student not found'}), 404

    return jsonify({'student': student.to_dict(include_profile=True)}), 200


@admin_bp.route('/jobs', methods=['POST'])
@jwt_required()
@admin_required()
def create_job():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    company = data.get('company', '').strip()
    location = data.get('location', '').strip()

    if not title or not company or not location:
        return jsonify({'error': 'Title, company, and location are required'}), 400

    job = Job(
        title=title,
        company=company,
        location=location,
        job_type=data.get('job_type', 'Full-time').strip(),
        experience_level=data.get('experience_level', 'Entry-level').strip(),
        description=data.get('description', '').strip(),
        requirements=data.get('requirements', '').strip(),
        salary_min=data.get('salary_min'),
        salary_max=data.get('salary_max'),
        deadline=data.get('deadline', '').strip(),
        is_active=data.get('is_active', True),
        created_by=user_id
    )
    db.session.add(job)
    db.session.flush()

    # Process skills array: [{skill_name, importance}] or comma-separated string / required_skills
    skills_data = data.get('skills') or data.get('required_skills') or []
    if isinstance(skills_data, str):
        skills_data = [s.strip() for s in skills_data.split(',') if s.strip()]
    for item in skills_data:
        if isinstance(item, str):
            skill_name = item.strip()
            importance = 'required'
        else:
            skill_name = item.get('skill_name', '').strip()
            importance = item.get('importance', 'required').strip().lower()

        if not skill_name:
            continue

        skill = Skill.query.filter(db.func.lower(Skill.name) == skill_name.lower()).first()
        if not skill:
            category = 'tool'
            for cat, cat_skills in SKILL_TAXONOMY.items():
                if any(cs.lower() == skill_name.lower() for cs in cat_skills):
                    category = cat
                    break
            skill = Skill(name=skill_name, category=category)
            db.session.add(skill)
            db.session.flush()

        job_skill = JobSkill(
            job_id=job.id,
            skill_id=skill.id,
            importance=importance
        )
        db.session.add(job_skill)

    db.session.commit()

    return jsonify({
        'message': 'Job created successfully',
        'job': job.to_dict()
    }), 201


@admin_bp.route('/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
@admin_required()
def update_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    data = request.get_json() or {}

    fields = ['title', 'company', 'location', 'job_type', 'experience_level',
              'description', 'requirements', 'salary_min', 'salary_max', 'deadline', 'is_active']
    for field in fields:
        if field in data:
            setattr(job, field, data[field])

    # If skills array or required_skills is provided, update JobSkills
    skills_raw = data.get('skills') if 'skills' in data else data.get('required_skills')
    if skills_raw is not None:
        JobSkill.query.filter_by(job_id=job.id).delete()
        skills_data = skills_raw
        if isinstance(skills_data, str):
            skills_data = [s.strip() for s in skills_data.split(',') if s.strip()]
        for item in skills_data:
            if isinstance(item, str):
                skill_name = item.strip()
                importance = 'required'
            else:
                skill_name = item.get('skill_name', '').strip()
                importance = item.get('importance', 'required').strip().lower()

            if not skill_name:
                continue

            skill = Skill.query.filter(db.func.lower(Skill.name) == skill_name.lower()).first()
            if not skill:
                category = 'tool'
                for cat, cat_skills in SKILL_TAXONOMY.items():
                    if any(cs.lower() == skill_name.lower() for cs in cat_skills):
                        category = cat
                        break
                skill = Skill(name=skill_name, category=category)
                db.session.add(skill)
                db.session.flush()

            job_skill = JobSkill(
                job_id=job.id,
                skill_id=skill.id,
                importance=importance
            )
            db.session.add(job_skill)

    db.session.commit()

    return jsonify({
        'message': 'Job updated successfully',
        'job': job.to_dict()
    }), 200


@admin_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
@admin_required()
def delete_job(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    job.is_active = False
    db.session.commit()

    return jsonify({
        'message': 'Job deleted successfully',
        'job_id': job_id
    }), 200


@admin_bp.route('/applications', methods=['GET'])
@jwt_required()
@admin_required()
def list_all_applications():
    query = Application.query

    status = request.args.get('status', '').strip()
    if status:
        query = query.filter_by(status=status)

    job_id = request.args.get('job_id', type=int)
    if job_id:
        query = query.filter_by(job_id=job_id)

    applications = query.order_by(Application.applied_date.desc()).all()

    return jsonify({
        'applications': [app.to_dict(include_student=True) for app in applications]
    }), 200


@admin_bp.route('/applications/<int:application_id>/status', methods=['PUT'])
@jwt_required()
@admin_required()
def update_application_status(application_id):
    application = Application.query.get(application_id)
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    data = request.get_json() or {}
    status = data.get('status', '').strip().lower()

    if not status:
        return jsonify({'error': 'Status is required'}), 400

    application.status = status
    db.session.commit()

    return jsonify({
        'message': 'Application status updated successfully',
        'application': application.to_dict(include_student=True)
    }), 200
