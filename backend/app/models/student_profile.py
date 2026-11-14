import os
from app.extensions import db

class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    university = db.Column(db.String(200))
    degree = db.Column(db.String(100))
    field_of_study = db.Column(db.String(100))
    graduation_year = db.Column(db.Integer)
    gpa = db.Column(db.Float)
    bio = db.Column(db.Text)
    resume_path = db.Column(db.String(500))
    phone = db.Column(db.String(20))
    location = db.Column(db.String(100))
    linkedin_url = db.Column(db.String(300))
    github_url = db.Column(db.String(300))

    # Relationships
    educations = db.relationship('Education', backref='profile', lazy=True, cascade='all, delete-orphan')
    projects = db.relationship('Project', backref='profile', lazy=True, cascade='all, delete-orphan')
    skills = db.relationship('StudentSkill', backref='profile', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'university': self.university,
            'degree': self.degree,
            'field_of_study': self.field_of_study,
            'graduation_year': self.graduation_year,
            'gpa': self.gpa,
            'bio': self.bio,
            'resume_path': self.resume_path,
            'resume_filename': os.path.basename(self.resume_path) if self.resume_path else None,
            'phone': self.phone,
            'location': self.location,
            'linkedin_url': self.linkedin_url,
            'github_url': self.github_url,
            'educations': [edu.to_dict() for edu in self.educations] if self.educations else [],
            'projects': [proj.to_dict() for proj in self.projects] if self.projects else [],
            'skills': [skill.to_dict() for skill in self.skills] if self.skills else []
        }

    def __repr__(self):
        return f'<StudentProfile user_id={self.user_id}>'


class Education(db.Model):
    __tablename__ = 'educations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    institution = db.Column(db.String(200), nullable=False)
    degree = db.Column(db.String(100))
    field_of_study = db.Column(db.String(100))
    start_date = db.Column(db.String(20))
    end_date = db.Column(db.String(20))
    gpa = db.Column(db.Float)

    def to_dict(self):
        return {
            'id': self.id,
            'profile_id': self.profile_id,
            'institution': self.institution,
            'degree': self.degree,
            'field_of_study': self.field_of_study,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'gpa': self.gpa
        }

    def __repr__(self):
        return f'<Education {self.institution} ({self.degree})>'


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    technologies = db.Column(db.String(500))
    url = db.Column(db.String(300))

    def to_dict(self):
        return {
            'id': self.id,
            'profile_id': self.profile_id,
            'title': self.title,
            'description': self.description,
            'technologies': self.technologies,
            'url': self.url
        }

    def __repr__(self):
        return f'<Project {self.title}>'
