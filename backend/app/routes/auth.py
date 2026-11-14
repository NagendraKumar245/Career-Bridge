import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.student_profile import StudentProfile

auth_bp = Blueprint('auth', __name__)

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    role = data.get('role', 'student').strip().lower()

    if not email or not password or not full_name:
        return jsonify({'error': 'Email, password, and full name are required'}), 400

    if not re.match(EMAIL_REGEX, email):
        return jsonify({'error': 'Invalid email format'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    if role not in ['student', 'admin']:
        role = 'student'

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email is already registered'}), 400

    user = User(
        email=email,
        full_name=full_name,
        role=role
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Automatically create empty StudentProfile if student
    if role == 'student':
        profile = StudentProfile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'email': user.email}
    )

    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': user.to_dict(include_profile=(role == 'student'))
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={'role': user.role, 'email': user.email}
    )

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict(include_profile=(user.role == 'student'))
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'user': user.to_dict(include_profile=(user.role == 'student'))
    }), 200
