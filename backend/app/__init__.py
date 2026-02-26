from flask import Flask, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from datetime import timedelta
import os

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_name='production'):

    basedir = os.path.abspath(os.path.dirname(__file__))

    frontend_build_path = os.path.join(basedir, '..', '..', 'frontend', 'dist')

    app = Flask(__name__, static_folder=frontend_build_path, static_url_path='')
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or 'sqlite:///routine_tracker.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # CORS - Allow all for development
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Authorization", "Content-Type"]            
            }})
    
    # Import models to register them with SQLAlchemy
    from app.models.user import User
    from app.models.day import Day
    from app.models.task import Task
    from app.models.topic import Topic
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.days import days_bp
    from app.routes.tasks import tasks_bp
    from app.routes.topics import topics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(days_bp, url_prefix='/api/days')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(topics_bp, url_prefix='/api/topics')
    
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'ok'})
    


    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        if path.startswith('api/'):
            return jsonify({'error': 'not found'}), 404
        
        file_path = os.path.join(app.static_folder, path)
        if path and os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        
        return send_from_directory(app.static_folder, 'index.html')





    # Create tables
    with app.app_context():
        db.create_all()
        print("Database ready!")
    
    return app