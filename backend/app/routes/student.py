import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.extensions import db
from app.models.student_profile import StudentProfile, Education, Project
from app.models.skill import Skill, StudentSkill
from app.services.resume_parser import parse_resume, SKILL_TAXONOMY

student_bp = Blueprint('student', __name__)

def _get_or_create_profile(user_id):
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = StudentProfile(user_id=user_id)
        db.session.add(profile)
        db.session.commit()
    return profile


@student_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    profile = _get_or_create_profile(user_id)
    return jsonify({'profile': profile.to_dict()}), 200


@student_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    profile = _get_or_create_profile(user_id)
    data = request.get_json() or {}

    fields = ['university', 'degree', 'field_of_study', 'bio', 'phone', 'location', 'linkedin_url', 'github_url']
    for field in fields:
        if field in data:
            setattr(profile, field, data[field])

    if 'graduation_year' in data:
        try:
            profile.graduation_year = int(data['graduation_year']) if data['graduation_year'] is not None else None
        except (ValueError, TypeError):
            pass

    if 'gpa' in data:
        try:
            profile.gpa = float(data['gpa']) if data['gpa'] is not None else None
        except (ValueError, TypeError):
            pass

    db.session.commit()
    return jsonify({
        'message': 'Profile updated successfully',
        'profile': profile.to_dict()
    }), 200


@student_bp.route('/education', methods=['POST'])
@jwt_required()
def add_education():
    user_id = int(get_jwt_identity())
    profile = _get_or_create_profile(user_id)
    data = request.get_json() or {}

    institution = data.get('institution', '').strip()
    if not institution:
        return jsonify({'error': 'Institution is required'}), 400

    gpa = None
    if 'gpa' in data and data['gpa'] is not None:
        try:
            gpa = float(data['gpa'])
        except (ValueError, TypeError):
            pass

    education = Education(
        profile_id=profile.id,
        institution=institution,
        degree=data.get('degree', '').strip(),
        field_of_study=data.get('field_of_study', '').strip(),
        start_date=data.get('start_date', '').strip(),
        end_date=data.get('end_date', '').strip(),
        gpa=gpa
    )
    db.session.add(education)
    db.session.commit()

    return jsonify({
        'message': 'Education added successfully',
        'education': education.to_dict()
    }), 201


@student_bp.route('/education/<int:education_id>', methods=['DELETE'])
@jwt_required()
def delete_education(education_id):
    user_id = int(get_jwt_identity())
    profile = _get_or_create_profile(user_id)

    education = Education.query.get(education_id)
    if not education or education.profile_id != profile.id:
        return jsonify({'error': 'Education entry not found'}), 404

    db.session.delete(education)
    db.session.commit()

    return jsonify({'message': 'Education deleted successfully'}), 200


@student_bp.route('/projects', methods=['POST'])
@jwt_required()
def add_project():
    user_id = int(get_jwt_identity())
    profile = _get_or_create_profile(user_id)
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Project title is required'}), 400

    project = Project(
        profile_id=profile.id,
        title=title,
        description=data.get('description', '').strip(),
        technologies=data.get('technologies', '').strip(),
        url=data.get('url', '').strip()
    )
    db.session.add(project)
    db.session.commit()

    return jsonify({
        'message': 'Project added successfully',
        'project': project.to_dict()
    }), 201


@student_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    user_id = int(get_jwt_identity())
    profile = _get_or_create_profile(user_id)

    project = Project.query.get(project_id)
    if not project or project.profile_id != profile.id:
        return jsonify({'error': 'Project not found'}), 404

    db.session.delete(project)
    db.session.commit()

    return jsonify({'message': 'Project deleted successfully'}), 200


@student_bp.route('/skills', methods=['POST'])
@jwt_required()
def update_skills():
    user_id = int(get_jwt_identity())
    profile = _get_or_create_profile(user_id)
    data = request.get_json() or {}

    skills_input = data.get('skills', [])
    if not isinstance(skills_input, list):
        return jsonify({'error': 'Skills must be an array of skill objects'}), 400

    # Replace existing skills
    StudentSkill.query.filter_by(profile_id=profile.id).delete()

    created_skills = []
    for item in skills_input:
        if isinstance(item, str):
            skill_name = item.strip()
            proficiency = 3
        else:
            skill_name = (item.get('skill_name') or item.get('name') or '').strip()
            proficiency = item.get('proficiency_level') or item.get('proficiency') or 3

        if not skill_name:
            continue

        try:
            proficiency = int(proficiency)
            proficiency = max(1, min(5, proficiency))
        except (ValueError, TypeError):
            proficiency = 3

        # Find or create skill in skills table
        skill = Skill.query.filter(db.func.lower(Skill.name) == skill_name.lower()).first()
        if not skill:
            # Determine taxonomy category if available
            category = 'tool'
            for cat, cat_skills in SKILL_TAXONOMY.items():
                if any(cs.lower() == skill_name.lower() for cs in cat_skills):
                    category = cat
                    break
            skill = Skill(name=skill_name, category=category)
            db.session.add(skill)
            db.session.flush()

        student_skill = StudentSkill(
            profile_id=profile.id,
            skill_id=skill.id,
            proficiency_level=proficiency
        )
        db.session.add(student_skill)
        created_skills.append(student_skill)

    db.session.commit()

    return jsonify({
        'message': 'Skills updated successfully',
        'skills': [s.to_dict() for s in profile.skills]
    }), 200


@student_bp.route('/resume', methods=['POST'])
@jwt_required()
def upload_resume():
    user_id = int(get_jwt_identity())
    profile = _get_or_create_profile(user_id)

    file = request.files.get('file') or request.files.get('resume')
    if not file or file.filename == '':
        return jsonify({'error': 'No resume file provided'}), 400

    filename = secure_filename(file.filename)
    if not filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF resume files are accepted'}), 400

    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)

    timestamp = int(datetime.utcnow().timestamp())
    saved_filename = f"resume_{profile.id}_{timestamp}_{filename}"
    file_path = os.path.join(upload_folder, saved_filename)
    file.save(file_path)

    profile.resume_path = file_path

    # Extract text and skills using resume_parser service
    parsed_result = parse_resume(file_path)
    extracted_skills = parsed_result.get('skills', [])

    # Auto-add extracted skills to student profile (without deleting existing unless desired)
    existing_skill_ids = {s.skill_id for s in profile.skills}

    for skill_info in extracted_skills:
        name = skill_info['name']
        category = skill_info['category']

        skill = Skill.query.filter(db.func.lower(Skill.name) == name.lower()).first()
        if not skill:
            skill = Skill(name=name, category=category)
            db.session.add(skill)
            db.session.flush()

        if skill.id not in existing_skill_ids:
            student_skill = StudentSkill(
                profile_id=profile.id,
                skill_id=skill.id,
                proficiency_level=3
            )
            db.session.add(student_skill)
            existing_skill_ids.add(skill.id)

    db.session.commit()

    return jsonify({
        'message': 'Resume uploaded and parsed successfully',
        'resume_path': file_path,
        'extracted_skills': extracted_skills,
        'skills': [s.to_dict() for s in profile.skills]
    }), 200
