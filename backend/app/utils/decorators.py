from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models import User

def get_current_user():
    """Get current authenticated user"""
    verify_jwt_in_request()
    user_id = get_jwt_identity()
    return User.query.get(int(user_id))

def require_auth(fn):
    """Decorator to require authentication"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user = get_current_user()
        if not current_user:
            return {'error': 'Authentication required'}, 401
        return fn(current_user, *args, **kwargs)
    return wrapper

def require_ownership(model_class, id_param='id'):
    """Decorator to ensure user owns the resource"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(current_user, *args, **kwargs):
            resource_id = kwargs.get(id_param)
            resource = model_class.query.get_or_404(resource_id)
            
            # Check ownership through day -> user relationship
            if hasattr(resource, 'user_id'):
                owner_id = resource.user_id
            elif hasattr(resource, 'day'):
                owner_id = resource.day.user_id
            elif hasattr(resource, 'task'):
                owner_id = resource.task.day.user_id
            else:
                return {'error': 'Cannot verify ownership'}, 500
            
            if owner_id != current_user.id:
                return {'error': 'Access denied'}, 403
            
            return fn(current_user, resource, *args, **kwargs)
        return wrapper
    return decorator