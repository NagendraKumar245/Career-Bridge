import os
from datetime import timedelta

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(os.path.dirname(BASE_DIR), 'careerbridge.db'))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'careerbridge-super-secret-key-2024')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    SECRET_KEY = os.getenv('SECRET_KEY', 'careerbridge-flask-secret')
    UPLOAD_FOLDER = os.path.join(os.path.dirname(BASE_DIR), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max
