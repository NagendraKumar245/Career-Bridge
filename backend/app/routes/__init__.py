from app.routes.auth import auth_bp
from app.routes.student import student_bp
from app.routes.jobs import jobs_bp
from app.routes.admin import admin_bp
from app.routes.ai import ai_bp

__all__ = ['auth_bp', 'student_bp', 'jobs_bp', 'admin_bp', 'ai_bp']
