from flask_jwt_extended import create_access_token, create_refresh_token
from app.models import User, db

class AuthService:
    @staticmethod
    def register_user(username, email, password):
        """Register new user with 100-day initialization"""
        # Validation
        if User.query.filter_by(username=username).first():
            return None, "Username already exists"
        if User.query.filter_by(email=email).first():
            return None, "Email already registered"
        
        # Create user
        user = User(username=username, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Initialize 100 days
        user.initialize_100_days()
        
        # Generate tokens (identity must be a string for Flask-JWT-Extended)
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, None
    
    @staticmethod
    def login_user(username_or_email, password):
        """Authenticate user and return tokens"""
        # Try username first, then email
        user = User.query.filter_by(username=username_or_email).first() or \
               User.query.filter_by(email=username_or_email).first()
        
        if not user or not user.check_password(password):
            return None, "Invalid credentials"
        
        if not user.is_active:
            return None, "Account deactivated"
        
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, None