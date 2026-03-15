import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import DayCard from '../components/dashboard/DayCard';
import ProgressRing from '../components/dashboard/ProgressRing';
import { Trophy, Calendar, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, updateUserProgress } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && typeof token === 'string' && token !== 'undefined' && token !== 'null') {
      fetchDays();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDays = async () => {
    try {
      const response = await api.get('/days');
      setDays(response.data.days);
      updateUserProgress(response.data.progress);
    } catch (error) {
      console.error('Failed to fetch days:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDescription = async (dayNumber, description) => {
    try {
      await api.put(`/days/${dayNumber}`, { description });
      fetchDays(); // Refresh to show updated data
    } catch (error) {
      console.error('Failed to update description:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const progress = user?.progress || { completed_days: 0, total_days: 100, percentage: 0 };
  const currentStreak = calculateStreak(days);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {progress.completed_days}/{progress.total_days}
              </p>
              <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                days completed
              </p>
            </div>
            <ProgressRing progress={progress.percentage} size={100} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentStreak}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">days in a row</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Next Milestone</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.ceil((progress.completed_days + 1) / 10) * 10}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">days target</p>
            </div>
          </div>
        </div>
      </div>

      {/* 100-Day Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            <span>Your 100-Day Journey</span>
          </h2>
          <div className="flex space-x-2 text-sm">
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full border-2 border-gray-300"></div>
              <span className="text-gray-600 dark:text-gray-400">Pending</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
          {days.map((day) => (
            <DayCard 
              key={day.id} 
              day={day} 
              isLocked={false}
              onUpdateDescription={handleUpdateDescription}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate current streak
function calculateStreak(days) {
  if (!days || days.length === 0) return 0;
  
  let streak = 0;
  const sortedDays = [...days].sort((a, b) => b.day_number - a.day_number);
  
  for (const day of sortedDays) {
    if (day.is_completed) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export default Dashboard;