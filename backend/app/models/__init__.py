from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import all models after db is defined to avoid circular imports
def init_models():
    from .user import User
    from .day import Day
    from .task import Task
    from .topic import Topic
    return User, Day, Task, Topic

__all__ = ['db', 'init_models']