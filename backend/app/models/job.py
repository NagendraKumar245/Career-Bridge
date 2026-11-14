from datetime import datetime
from app.extensions import db

class Job(db.Model):
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    job_type = db.Column(db.String(50))  # Full-time, Part-time, Internship, Contract, Remote
    experience_level = db.Column(db.String(50))  # Entry-level, Mid-level, Senior, Internship
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    salary_min = db.Column(db.Integer)
    salary_max = db.Column(db.Integer)
    posted_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    deadline = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

    # Relationships
    required_skills = db.relationship('JobSkill', back_populates='job', lazy=True, cascade='all, delete-orphan')
    applications = db.relationship('Application', back_populates='job', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'job_type': self.job_type,
            'experience_level': self.experience_level,
            'description': self.description,
            'requirements': self.requirements,
            'salary_min': self.salary_min,
            'salary_max': self.salary_max,
            'posted_date': self.posted_date.isoformat() if self.posted_date else None,
            'deadline': self.deadline,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'required_skills': [s.to_dict() for s in self.required_skills] if self.required_skills else [],
            'application_count': len(self.applications) if self.applications else 0
        }

    def __repr__(self):
        return f'<Job {self.title} at {self.company}>'


class JobSkill(db.Model):
    __tablename__ = 'job_skills'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id'), nullable=False)
    importance = db.Column(db.String(20), default='required')  # 'required' or 'preferred'

    # Relationships
    job = db.relationship('Job', back_populates='required_skills')
    skill = db.relationship('Skill')

    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'skill_id': self.skill_id,
            'skill_name': self.skill.name if self.skill else None,
            'category': self.skill.category if self.skill else None,
            'importance': self.importance
        }

    def __repr__(self):
        return f'<JobSkill job={self.job_id} skill={self.skill_id} ({self.importance})>'
