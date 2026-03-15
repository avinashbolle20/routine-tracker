from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.topic import Topic
from app.models.task import Task
from app.models.day import Day
from app import db

topics_bp = Blueprint('topics', __name__)

@topics_bp.route('/task/<int:task_id>', methods=['GET'])
@jwt_required()
def get_topic_by_task(task_id):
    """Get topic for specific task"""
    user_id = int(get_jwt_identity())
    task = Task.query.get_or_404(task_id)
    
    day = Day.query.get(task.day_id)
    if day.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    topic = Topic.query.filter_by(task_id=task_id).first()
    if not topic:
        return jsonify({'error': 'No topic found'}), 404
    
    return jsonify(topic.to_dict()), 200

@topics_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_topic(id):
    """Get specific topic"""
    user_id = int(get_jwt_identity())
    topic = Topic.query.get_or_404(id)
    
    task = Task.query.get(topic.task_id)
    day = Day.query.get(task.day_id)
    if day.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify(topic.to_dict()), 200

@topics_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_topic(id):
    """Update topic content"""
    user_id = int(get_jwt_identity())
    topic = Topic.query.get_or_404(id)
    
    # Verify ownership
    task = Task.query.get(topic.task_id)
    day = Day.query.get(task.day_id)
    if day.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Update fields
    if 'title' in data:
        topic.title = data['title']
    if 'notes' in data:
        topic.notes = data['notes']
    if 'code_example' in data:
        topic.code_example = data['code_example']
    
    try:
        db.session.commit()
        return jsonify(topic.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update topic', 'message': str(e)}), 500

@topics_bp.route('', methods=['POST'])
@jwt_required()
def create_topic():
    """Create topic for existing task"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or 'task_id' not in data:
        return jsonify({'error': 'Task ID required'}), 400
    
    task = Task.query.get_or_404(data['task_id'])
    day = Day.query.get(task.day_id)
    
    if day.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    if task.category not in ['coding', 'communication']:
        return jsonify({'error': 'Topics only for coding/communication tasks'}), 400
    
    # Check if topic already exists
    existing = Topic.query.filter_by(task_id=task.id).first()
    if existing:
        return jsonify({'error': 'Topic already exists'}), 409
    
    # Create new topic
    topic = Topic(
        task_id=data['task_id'],
        title=data.get('title', ''),
        notes=data.get('notes', ''),
        code_example=data.get('code_example', '')
    )
    
    db.session.add(topic)
    db.session.commit()
    
    return jsonify(topic.to_dict()), 201