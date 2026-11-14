from app.extensions import db

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(300), nullable=False)
    provider = db.Column(db.String(100))
    url = db.Column(db.String(500))
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id'), nullable=True)
    difficulty = db.Column(db.String(20))  # Beginner, Intermediate, Advanced
    duration = db.Column(db.String(50))
    description = db.Column(db.Text)
    rating = db.Column(db.Float)

    # Relationships
    skill = db.relationship('Skill')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'provider': self.provider,
            'url': self.url,
            'skill_id': self.skill_id,
            'skill_name': self.skill.name if self.skill else None,
            'category': self.skill.category if self.skill else None,
            'difficulty': self.difficulty,
            'duration': self.duration,
            'description': self.description,
            'rating': self.rating
        }

    def __repr__(self):
        return f'<Course {self.title} ({self.provider})>'
