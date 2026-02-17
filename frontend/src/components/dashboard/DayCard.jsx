import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Edit2 } from 'lucide-react';

const DayCard = ({ day, isLocked, onUpdateDescription }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(day.description || '');
  const isCompleted = day.is_completed;
  const progress = day.progress;
  const completionPercent = progress.total_tasks > 0 
    ? (progress.completed_tasks / progress.total_tasks) * 100 
    : 0;

  const handleSave = async () => {
    await onUpdateDescription(day.day_number, description);
    setIsEditing(false);
  };

  return (
    <div
      className={`group relative block p-4 rounded-xl border-2 transition-all duration-300 ${
        isLocked
          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-60'
          : isCompleted
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 hover:shadow-lg hover:scale-105'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md'
      }`}
    >
      <Link to={isLocked ? '#' : `/day/${day.day_number}`} className="block">
        <div className="flex items-start justify-between mb-2">
          <span className={`text-lg font-bold ${
            isCompleted 
              ? 'text-primary-700 dark:text-primary-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            Day {day.day_number}
          </span>
          
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-primary-500" />
          ) : (
            <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
          )}
        </div>

        {!isLocked && (
          <>
            {isEditing ? (
              <div className="mb-3" onClick={(e) => e.preventDefault()}>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSave}
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                  className="w-full text-xs px-2 py-1 border border-primary-300 rounded dark:bg-gray-700 dark:text-white"
                  placeholder="Add description..."
                  autoFocus
                />
              </div>
            ) : (
              <div 
                className="flex items-center justify-between mb-3 group/desc"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                }}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">
                  {day.description || 'Click to add description...'}
                </p>
                <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover/desc:opacity-100 transition-opacity ml-1" />
              </div>
            )}

            {/* Mini progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{progress.completed_tasks}/{progress.total_tasks} tasks</span>
                <span>{Math.round(completionPercent)}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-primary-500' : 'bg-primary-400'
                  }`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </>
        )}
      </Link>
    </div>
  );
};

export default DayCard;