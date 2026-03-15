from flask import Flask, jsonify, send_from_directory, request, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from datetime import timedelta
import os
import jwt as pyjwt

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_name='production'):

    basedir = os.path.abspath(os.path.dirname(__file__))

    frontend_build_path = os.path.join(basedir, '..', '..', 'frontend', 'dist')
    static_folder = frontend_build_path if os.path.isdir(frontend_build_path) else None

    app = Flask(__name__, static_folder=static_folder, static_url_path='')
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or 'sqlite:///routine_tracker.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # JWT: return 401 for missing/invalid token so frontend can refresh or redirect to login
    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return jsonify({'error': error_string or 'Missing or invalid token'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        if os.environ.get('FLASK_DEBUG') == '1':
            auth = request.headers.get('Authorization')
            type_hint = ''
            if auth and auth.startswith('Bearer '):
                try:
                    token = auth[7:]
                    payload = pyjwt.decode(token, options={'verify_signature': False})
                    type_hint = f" | payload type={payload.get('type')!r}"
                except Exception as e:
                    type_hint = f" | decode err: {e}"
                print(f"[JWT] Invalid token: {error_string!r}{type_hint}")
        return jsonify({'error': error_string or 'Invalid or expired token'}), 401
    
    # CORS - Allow all for development

# CORS Configuration
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    render_frontend = os.environ.get('FRONTEND_URL')
    if render_frontend:
        # Ensure there is no trailing slash
        allowed_origins.append(render_frontend.rstrip('/'))

    CORS(app, resources={
        r"/api/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
            "expose_headers": ["Authorization"],
            "supports_credentials": True
        }
    })
    
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

    if os.environ.get('ENABLE_AUTH_LOGGING') == '1':
        @app.before_request
        def log_auth_header():
            if request.method != 'OPTIONS' and request.path.startswith('/api/') and request.path != '/api/health':
                auth = request.headers.get('Authorization')
                if auth:
                    preview = auth[:25] + '...' if len(auth) > 25 else auth
                    print(f"[Auth] {request.method} {request.path} Authorization: {preview}")
                else:
                    print(f"[Auth] {request.method} {request.path} Authorization: (missing)")

    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'ok'})

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        if path.startswith('api/'):
            return jsonify({'error': 'not found'}), 404
        if not app.static_folder or not os.path.isdir(app.static_folder):
            frontend_url = os.environ.get('FRONTEND_URL', '').rstrip('/')
            if frontend_url:
                return redirect(frontend_url)
            return jsonify({'message': 'Routine Tracker API', 'docs': '/api/health'}), 200
        file_path = os.path.join(app.static_folder, path)
        if path and os.path.exists(file_path):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')





    # Create tables
    with app.app_context():
        db.create_all()
        print("Database ready!")
    
    return app