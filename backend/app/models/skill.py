from app.extensions import db

class Skill(db.Model):
    __tablename__ = 'skills'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    category = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category
        }

    def __repr__(self):
        return f'<Skill {self.name} ({self.category})>'


class StudentSkill(db.Model):
    __tablename__ = 'student_skills'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id'), nullable=False)
    proficiency_level = db.Column(db.Integer, default=3)

    # Relationship
    skill = db.relationship('Skill')

    def to_dict(self):
        return {
            'id': self.id,
            'profile_id': self.profile_id,
            'skill_id': self.skill_id,
            'skill_name': self.skill.name if self.skill else None,
            'category': self.skill.category if self.skill else None,
            'proficiency_level': self.proficiency_level
        }

    def __repr__(self):
        return f'<StudentSkill {self.profile_id} - {self.skill_id} ({self.proficiency_level})>'
