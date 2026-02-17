from datetime import datetime
from app import db

class Day(db.Model):
    __tablename__ = 'days'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    day_number = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(500), default="")
    motivation_quote = db.Column(db.String(500), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    reflection_notes = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'day_number', name='unique_user_day'),
    )
    
    def update_completion_status(self):
        """Auto-update completion based on tasks"""
        from .task import Task  # Local import
        tasks_list = Task.query.filter_by(day_id=self.id).all()
        if not tasks_list:
            self.is_completed = False
        else:
            self.is_completed = all(task.completed for task in tasks_list)
        db.session.commit()
    
    def to_dict(self, include_tasks=False):
        from .task import Task  # Local import
        
        data = {
            'id': self.id,
            'day_number': self.day_number,
            'description': self.description,
            'motivation_quote': self.motivation_quote,
            'is_completed': self.is_completed,
            'reflection_notes': self.reflection_notes,
            'progress': {
                'total_tasks': Task.query.filter_by(day_id=self.id).count(),
                'completed_tasks': Task.query.filter_by(day_id=self.id, completed=True).count()
            },
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_tasks:
            data['tasks'] = [task.to_dict() for task in Task.query.filter_by(day_id=self.id).order_by(Task.created_at.asc()).all()]
        
        return data