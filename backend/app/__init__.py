import os
from flask import Flask
from app.config import Config
from app.extensions import db, jwt, cors

# Import all models so they register with SQLAlchemy
from app.models import (
    User,
    StudentProfile,
    Education,
    Project,
    Skill,
    StudentSkill,
    Job,
    JobSkill,
    Application,
    Course
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
        supports_credentials=True
    )

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.student import student_bp
    from app.routes.jobs import jobs_bp
    from app.routes.admin import admin_bp
    from app.routes.ai import ai_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')

    # Create tables automatically inside application context
    with app.app_context():
        db.create_all()

    @app.route('/')
    def index():
        return {
            'name': 'CareerBridge API',
            'version': '1.0.0',
            'status': 'healthy'
        }

    return app
