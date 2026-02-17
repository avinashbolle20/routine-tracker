import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Code, 
  Dumbbell, 
  MessageCircle,
  BookOpen,
  Edit2,
  Save,
  Trash2,
  X,
  ExternalLink
} from 'lucide-react';

const categoryConfig = {
  coding: {
    icon: <Code className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    label: 'Coding',
    isClickable: true // Only coding is clickable
  },
  fitness: {
    icon: <Dumbbell className="h-5 w-5" />,
    color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    bgColor: 'bg-orange-50 dark:bg-orange-900/10',
    label: 'Fitness',
    isClickable: false
  },
  communication: {
    icon: <MessageCircle className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    bgColor: 'bg-purple-50 dark:bg-purple-900/10',
    label: 'Communication',
    isClickable: false
  }
};

const DayDetail = () => {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', category: 'coding' });
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  useEffect(() => {
    fetchDay();
  }, [dayNumber]);

  const fetchDay = async () => {
    try {
      const response = await api.get(`/days/${dayNumber}`);
      setDay(response.data);
      setNotes(response.data.reflection_notes || '');
    } catch (error) {
      console.error('Failed to fetch day:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await api.post('/tasks', {
        day_id: day.id,
        category: newTask.category,
        title: newTask.title,
        auto_create_topic: true
      });
      setNewTask({ title: '', category: 'coding' });
      setShowAddTask(false);
      fetchDay();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      await api.post(`/tasks/${taskId}/toggle`);
      fetchDay();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchDay();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const startEditTask = (task) => {
    setEditingTask(task.id);
    setEditTaskTitle(task.title);
  };

  const saveEditTask = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}`, { title: editTaskTitle });
      setEditingTask(null);
      fetchDay();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const cancelEditTask = () => {
    setEditingTask(null);
    setEditTaskTitle('');
  };

  const saveNotes = async () => {
    try {
      await api.put(`/days/${dayNumber}`, { reflection_notes: notes });
      setEditingNotes(false);
      fetchDay();
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!day) return null;

  // Group tasks by category
  const groupedTasks = {
    coding: day.tasks?.filter(t => t.category === 'coding') || [],
    fitness: day.tasks?.filter(t => t.category === 'fitness') || [],
    communication: day.tasks?.filter(t => t.category === 'communication') || []
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
          day.is_completed 
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {day.is_completed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
          <span className="font-medium">
            {day.is_completed ? 'Day Completed' : 'In Progress'}
          </span>
        </div>
      </div>

      {/* Quote Card */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-lg">
        <BookOpen className="h-8 w-8 mb-4 opacity-80" />
        <blockquote className="text-xl md:text-2xl font-medium italic leading-relaxed">
          "{day.motivation_quote}"
        </blockquote>
        <p className="mt-4 text-primary-100 text-sm">Daily Motivation • Day {day.day_number}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tasks</h2>
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </button>
            </div>

            {showAddTask && (
              <form onSubmit={handleAddTask} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
                <input
                  type="text"
                  placeholder="What do you want to accomplish?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <div className="flex space-x-2">
                  {['coding', 'fitness', 'communication'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, category: cat })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                        newTask.category === cat
                          ? categoryConfig[cat].color
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {categoryConfig[cat].label}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Tasks by Category */}
            <div className="space-y-6">
              {['coding', 'fitness', 'communication'].map((category) => {
                const tasks = groupedTasks[category];
                if (tasks.length === 0) return null;
                
                const config = categoryConfig[category];
                
                return (
                  <div key={category} className="space-y-3">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${config.bgColor}`}>
                      <div className={`p-1.5 rounded-md ${config.color}`}>
                        {config.icon}
                      </div>
                      <span className={`font-semibold capitalize ${config.color.split(' ')[1]}`}>
                        {config.label}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({tasks.length})
                      </span>
                    </div>
                    
                    <div className="space-y-2 pl-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`group flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            task.completed
                              ? 'border-primary-200 bg-primary-50 dark:border-primary-900 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`flex-shrink-0 ${
                                task.completed ? 'text-primary-500' : 'text-gray-300 dark:text-gray-600'
                              } hover:scale-110 transition-transform`}
                            >
                              {task.completed ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : (
                                <Circle className="h-6 w-6" />
                              )}
                            </button>
                            
                            <div className={`p-2 rounded-lg ${config.color}`}>
                              {config.icon}
                            </div>
                            
                            {editingTask === task.id ? (
                              <div className="flex-1 flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={editTaskTitle}
                                  onChange={(e) => setEditTaskTitle(e.target.value)}
                                  className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                  autoFocus
                                />
                                <button
                                  onClick={() => saveEditTask(task.id)}
                                  className="p-1 text-green-600 hover:text-green-700"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={cancelEditTask}
                                  className="p-1 text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex-1 min-w-0">
                                {/* CODING TASKS - Always clickable link */}
                                {config.isClickable ? (
                                  <Link
                                    to={`/topic/${task.id}`}
                                    className="group/link inline-flex items-center space-x-2 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  >
                                    <span className="border-b border-transparent hover:border-blue-600 dark:hover:border-blue-400">{task.title}</span>
                                    <ExternalLink className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                  </Link>
                                ) : (
                                  <span 
                                    className={`font-medium ${
                                      task.completed 
                                        ? 'text-gray-500 line-through' 
                                        : 'text-gray-900 dark:text-white'
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Show view topic button only for coding */}
                            {config.isClickable && (
                              <Link
                                to={`/topic/${task.id}`}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="View Topic Details"
                              >
                                <BookOpen className="h-4 w-4" />
                              </Link>
                            )}
                            
                            {editingTask !== task.id && (
                              <>
                                <button
                                  onClick={() => startEditTask(task)}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="Edit Task"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Delete Task"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {day.tasks?.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No tasks yet. Add your first task to get started!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reflection Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Daily Reflection</h3>
            {editingNotes ? (
              <button
                onClick={saveNotes}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <Save className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setEditingNotes(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {editingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reflect on your day..."
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <div className="h-64 overflow-y-auto">
              {notes ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{notes}</p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  No reflection notes yet. Click edit to add your thoughts.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayDetail;