from flask import Blueprint, request, jsonify
from app.models.day import Day
from app.models.user import User
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity

days_bp = Blueprint('days', __name__)

@days_bp.route('', methods=['GET'])
@jwt_required()
def get_days():
    """Get all days for current user"""
    user_id = get_jwt_identity()
    days = Day.query.filter_by(user_id=user_id).order_by(Day.day_number.asc()).all()
    user = User.query.get(user_id)
    
    return jsonify({
        'days': [day.to_dict() for day in days],
        'progress': user.get_progress() if user else {'completed_days': 0, 'total_days': 0, 'percentage': 0}
    }), 200

@days_bp.route('/<int:day_number>', methods=['GET'])
@jwt_required()
def get_day(day_number):
    """Get specific day with tasks"""
    user_id = get_jwt_identity()
    day = Day.query.filter_by(user_id=user_id, day_number=day_number).first_or_404()
    return jsonify(day.to_dict(include_tasks=True)), 200

@days_bp.route('/<int:day_number>', methods=['PUT'])
@jwt_required()
def update_day(day_number):
    """Update day description and reflection"""
    user_id = get_jwt_identity()
    day = Day.query.filter_by(user_id=user_id, day_number=day_number).first_or_404()
    data = request.get_json()
    
    if 'description' in data:
        day.description = data['description']
    if 'reflection_notes' in data:
        day.reflection_notes = data['reflection_notes']
    
    db.session.commit()
    return jsonify(day.to_dict(include_tasks=True)), 200