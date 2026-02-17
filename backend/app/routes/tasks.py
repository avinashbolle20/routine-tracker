from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.task import Task
from app.models.day import Day
from app import db

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    """Create new task for a day"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate
    if not all(k in data for k in ['day_id', 'category', 'title']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Verify day belongs to user
    day = Day.query.get_or_404(data['day_id'])
    if day.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    # Validate category
    if data['category'] not in ['coding', 'fitness', 'communication']:
        return jsonify({'error': 'Invalid category'}), 400
    
    task = Task(
        day_id=data['day_id'],
        category=data['category'],
        title=data['title']
    )
    
    db.session.add(task)
    db.session.commit()
    
    # Auto-create topic for coding/communication if requested
    if data.get('auto_create_topic') and data['category'] in ['coding', 'communication']:
        task.create_topic_if_needed()
    
    return jsonify(task.to_dict(include_topic=True)), 201

@tasks_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_task(id):
    """Update task or toggle completion"""
    user_id = get_jwt_identity()
    task = Task.query.get_or_404(id)
    
    # Check ownership
    day = Day.query.get(task.day_id)
    if day.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    if 'completed' in data:
        task.completed = data['completed']
        db.session.commit()
        task.day.update_completion_status()
    
    if 'title' in data:
        task.title = data['title']
        db.session.commit()
    
    return jsonify(task.to_dict(include_topic=True)), 200

@tasks_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_task(id):
    """Delete task"""
    user_id = get_jwt_identity()
    task = Task.query.get_or_404(id)
    
    day = Day.query.get(task.day_id)
    if day.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(task)
    db.session.commit()
    day.update_completion_status()
    return jsonify({'message': 'Task deleted'}), 200

@tasks_bp.route('/<int:id>/toggle', methods=['POST'])
@jwt_required()
def toggle_task(id):
    """Toggle task completion"""
    user_id = get_jwt_identity()
    task = Task.query.get_or_404(id)
    
    day = Day.query.get(task.day_id)
    if day.user_id != user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    new_status = task.toggle_completion()
    return jsonify({
        'completed': new_status,
        'task': task.to_dict()
    }), 200