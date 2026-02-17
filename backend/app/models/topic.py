from datetime import datetime
from app import db

class Topic(db.Model):
    __tablename__ = 'topics'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    notes = db.Column(db.Text, default="")
    code_example = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        from .task import Task  # Local import
        from .day import Day
        
        task = Task.query.get(self.task_id)
        day_number = None
        category = None
        
        if task:
            category = task.category
            day = Day.query.get(task.day_id)
            if day:
                day_number = day.day_number
        
        return {
            'id': self.id,
            'task_id': self.task_id,
            'title': self.title,
            'notes': self.notes,
            'code_example': self.code_example,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'day_number': day_number,
            'category': category
        }