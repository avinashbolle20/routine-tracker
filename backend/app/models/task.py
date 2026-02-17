from datetime import datetime
from app import db

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    day_id = db.Column(db.Integer, db.ForeignKey('days.id'), nullable=False, index=True)
    category = db.Column(db.Enum('coding', 'fitness', 'communication', name='task_categories'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self, include_topic=False):
        data = {
            'id': self.id,
            'day_id': self.day_id,
            'category': self.category,
            'title': self.title,
            'completed': self.completed,
            'created_at': self.created_at.isoformat(),
            'has_topic': False
        }
        
        if include_topic:
            from .topic import Topic  # Local import
            topic = Topic.query.filter_by(task_id=self.id).first()
            if topic:
                data['has_topic'] = True
                data['topic'] = topic.to_dict()
        
        return data
    
    def toggle_completion(self):
        """Toggle task completion and update day status"""
        self.completed = not self.completed
        db.session.commit()
        
        from .day import Day  # Local import
        day = Day.query.get(self.day_id)
        if day:
            day.update_completion_status()
        return self.completed
    
    def create_topic_if_needed(self, title=None, notes="", code_example=""):
        """Auto-create topic for coding/communication tasks"""
        from .topic import Topic  # Local import
        
        if self.category in ['coding', 'communication']:
            existing = Topic.query.filter_by(task_id=self.id).first()
            if not existing:
                topic_title = title or f"{self.category.title()}: {self.title}"
                topic = Topic(
                    task_id=self.id,
                    title=topic_title,
                    notes=notes,
                    code_example=code_example
                )
                db.session.add(topic)
                db.session.commit()
                return topic
            return existing
        return None