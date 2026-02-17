from datetime import datetime
from app import db
import bcrypt

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def set_password(self, password):
        salt = bcrypt.gensalt(rounds=12)
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'progress': self.get_progress()
        }
    
    def get_progress(self):
        try:
            from .day import Day  # Import here to avoid circular import
            total_days = Day.query.filter_by(user_id=self.id).count()
            if total_days == 0:
                return {'completed_days': 0, 'total_days': 0, 'percentage': 0}
            completed_days = Day.query.filter_by(user_id=self.id, is_completed=True).count()
            return {
                'completed_days': completed_days,
                'total_days': total_days,
                'percentage': round((completed_days / total_days) * 100, 1)
            }
        except Exception:
            return {'completed_days': 0, 'total_days': 0, 'percentage': 0}
    
    def initialize_100_days(self):
        """Create 100 days for new user with motivational quotes"""
        try:
            from .day import Day  # Import here to avoid circular import
            
            quotes = [
                "The journey of a thousand miles begins with one step.",
                "Success is the sum of small efforts repeated day in and day out.",
                "Don't watch the clock; do what it does. Keep going.",
                "The only way to do great work is to love what you do.",
                "Believe you can and you're halfway there.",
                "Your limitation—it's only your imagination.",
                "Push yourself, because no one else is going to do it for you.",
                "Great things never come from comfort zones.",
                "Dream it. Wish it. Do it.",
                "Success doesn't just find you. You have to go out and get it.",
                "The harder you work for something, the greater you'll feel when you achieve it.",
                "Dream bigger. Do bigger.",
                "Don't stop when you're tired. Stop when you're done.",
                "Wake up with determination. Go to bed with satisfaction.",
                "Do something today that your future self will thank you for.",
                "Little things make big days.",
                "The key to success is to focus on goals, not obstacles.",
                "Dream it. Believe it. Build it.",
                "Success is what comes after you stop making excuses.",
                "The only limit to our realization of tomorrow is our doubts of today.",
                "Creativity is intelligence having fun.",
                "The future belongs to those who believe in the beauty of their dreams.",
                "Don't let yesterday take up too much of today.",
                "You learn more from failure than from success.",
                "It's not whether you get knocked down, it's whether you get up.",
                "If you are working on something exciting, it will keep you motivated.",
                "We generate fears while we sit. We overcome them by action.",
                "Everything you've ever wanted is on the other side of fear.",
                "Hardships often prepare ordinary people for an extraordinary destiny.",
                "Dream big and dare to fail.",
                "It always seems impossible until it's done.",
                "Keep your face always toward the sunshine—and shadows will fall behind you.",
                "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
                "Do what you can, with what you have, where you are.",
                "Start where you are. Use what you have. Do what you can.",
                "Fall seven times, stand up eight.",
                "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                "Your time is limited, don't waste it living someone else's life.",
                "Winning isn't everything, but wanting to win is.",
                "I am not a product of my circumstances. I am a product of my decisions.",
                "You can never cross the ocean until you have the courage to lose sight of the shore.",
                "I've learned that people will forget what you said, but never how you made them feel.",
                "Either you run the day, or the day runs you.",
                "Whether you think you can or you think you can't, you're right.",
                "The two most important days in your life are the day you are born and the day you find out why.",
                "Whatever you can do, or dream you can, begin it. Boldness has genius, power and magic in it.",
                "The best revenge is massive success.",
                "People often say that motivation doesn't last. Well, neither does bathing. That's why we recommend it daily.",
                "Life shrinks or expands in proportion to one's courage.",
                "There is only one way to avoid criticism: do nothing, say nothing, and be nothing.",
                "Ask and it will be given to you; search, and you will find.",
                "The only person you are destined to become is the person you decide to be.",
                "Go confidently in the direction of your dreams. Live the life you have imagined.",
                "Certain things catch your eye, but pursue only those that capture the heart.",
                "Believe in yourself! Have faith in your abilities!",
                "If you can dream it, you can achieve it.",
                "Where there is a will, there is a way.",
                "Don't let what you cannot do interfere with what you can do.",
                "It does not matter how slowly you go as long as you do not stop.",
                "The secret of getting ahead is getting started.",
                "All our dreams can come true, if we have the courage to pursue them.",
                "Good things come to people who wait, but better things come to those who go out and get them.",
                "If you do what you always did, you will get what you always got.",
                "Success is walking from failure to failure with no loss of enthusiasm.",
                "Just when the caterpillar thought the world was ending, he turned into a butterfly.",
                "Successful entrepreneurs are givers and not takers of positive energy.",
                "Try not to become a person of success, but rather try to become a person of value.",
                "Great minds discuss ideas; average minds discuss events; small minds discuss people.",
                "I have not failed. I've just found 10,000 ways that won't work.",
                "If you don't value your time, neither will others.",
                "A successful man is one who can lay a firm foundation with the bricks others have thrown at him.",
                "No one can make you feel inferior without your consent.",
                "The whole secret of a successful life is to find out what is one's destiny to do, and then do it.",
                "If you're going through hell, keep going.",
                "What seems to us as bitter trials are often blessings in disguise.",
                "The distance between insanity and genius is measured only by success.",
                "Don't be afraid to give up the good to go for the great.",
                "Happiness is a butterfly, which when pursued, is always beyond your grasp.",
                "If you can't explain it simply, you don't understand it well enough.",
                "Blessed are those who can give without remembering and take without forgetting.",
                "Do one thing every day that scares you.",
                "What's the point of being alive if you don't at least try to do something remarkable.",
                "Life is not about finding yourself. Life is about creating yourself.",
                "Nothing in the world is more common than unsuccessful people with talent.",
                "Knowledge is being aware of what you can do. Wisdom is knowing when not to do it.",
                "Your problem isn't the problem. Your reaction is the problem.",
                "You can do anything, but not everything.",
                "Innovation distinguishes between a leader and a follower.",
                "There are two types of people who will tell you that you cannot make a difference.",
                "Thinking should become your capital asset, no matter whatever ups and downs you come across.",
                "I find that the harder I work, the more luck I seem to have.",
                "The starting point of all achievement is desire.",
                "Success is the sum of small efforts, repeated day-in and day-out.",
                "If you want to achieve excellence, you can get there today.",
                "All progress takes place outside the comfort zone.",
                "You may only succeed if you desire succeeding.",
                "Courage is resistance to fear, mastery of fear--not absence of fear.",
                "Only put off until tomorrow what you are willing to die having left undone.",
                "We become what we think about most of the time.",
                "The only place where success comes before work is in the dictionary.",
                "The best reason to start an organization is to make meaning.",
                "I don't know the key to success, but the key to failure is trying to please everybody.",
                "Success is liking yourself, liking what you do, and liking how you do it.",
                "Motivation is what gets you started. Habit is what keeps you going.",
                "People rarely succeed unless they have fun in what they are doing."
            ]
            
            for i in range(1, 101):
                day = Day(
                    user_id=self.id,
                    day_number=i,
                    motivation_quote=quotes[i-1] if i <= len(quotes) else f"Day {i}: Keep pushing forward!"
                )
                db.session.add(day)
            
            db.session.commit()
            print(f"Created 100 days for user {self.username}")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error initializing days: {e}")
            raise