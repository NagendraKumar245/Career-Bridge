from datetime import datetime
from app.extensions import db

class Application(db.Model):
    __tablename__ = 'applications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    status = db.Column(db.String(20), default='applied', nullable=False)  # applied, reviewed, interview, offered, rejected
    applied_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    match_score = db.Column(db.Float)
    cover_letter = db.Column(db.Text)

    # Relationships
    job = db.relationship('Job', back_populates='applications')

    def to_dict(self, include_student=False):
        data = {
            'id': self.id,
            'student_id': self.student_id,
            'job_id': self.job_id,
            'status': self.status,
            'applied_date': self.applied_date.isoformat() if self.applied_date else None,
            'match_score': self.match_score,
            'cover_letter': self.cover_letter,
            'job_title': self.job.title if self.job else None,
            'company': self.job.company if self.job else None,
            'job_location': self.job.location if self.job else None,
            'job_type': self.job.job_type if self.job else None
        }
        if include_student and self.student:
            data['student_name'] = self.student.full_name
            data['student_email'] = self.student.email
        return data

    def __repr__(self):
        return f'<Application student={self.student_id} job={self.job_id} status={self.status}>'
