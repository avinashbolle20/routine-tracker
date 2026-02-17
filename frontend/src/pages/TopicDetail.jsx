import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Save, Code, BookOpen, CheckCircle, Loader2 } from 'lucide-react';

const TopicDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [codeExample, setCodeExample] = useState('');

  useEffect(() => {
    fetchTopic();
  }, [taskId]);

  const fetchTopic = async () => {
    setLoading(true);
    setError('');
    try {
      // Try to get existing topic
      const response = await api.get(`/topics/task/${taskId}`);
      const topicData = response.data;
      setTopic(topicData);
      // Initialize form state
      setTitle(topicData.title || '');
      setNotes(topicData.notes || '');
      setCodeExample(topicData.code_example || '');
    } catch (error) {
      // If no topic exists (404), create one
      if (error.response?.status === 404) {
        try {
          const createResponse = await api.post('/topics', { 
            task_id: parseInt(taskId),
            title: '',
            notes: '',
            code_example: ''
          });
          const topicData = createResponse.data;
          setTopic(topicData);
          setTitle(topicData.title || '');
          setNotes(topicData.notes || '');
          setCodeExample(topicData.code_example || '');
        } catch (createError) {
          console.error('Failed to create topic:', createError);
          setError('Failed to create topic. Please try again.');
        }
      } else {
        console.error('Failed to fetch topic:', error);
        setError('Failed to load topic. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!topic) return;
    
    setSaving(true);
    setSaved(false);
    setError('');
    
    try {
      const response = await api.put(`/topics/${topic.id}`, {
        title: title,
        notes: notes,
        code_example: codeExample
      });
      
      setTopic(response.data);
      setSaved(true);
      
      // Reset saved indicator after 2 seconds
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save topic:', error);
      setError(error.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Auto-save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [topic, title, notes, codeExample]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !topic) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/day/${topic?.day_number || 1}`}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Day {topic?.day_number || ''}</span>
        </Link>
        
        <div className="flex items-center space-x-3">
          {saved && (
            <span className="flex items-center space-x-1 text-green-600 dark:text-green-400 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Saved!</span>
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Coding Topic</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter topic title..."
              className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 w-full placeholder-gray-400"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes & Explanation
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your notes, explanations, and key learnings here..."
              className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white transition-all"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Code className="h-4 w-4" />
              <span>Code Example</span>
            </label>
            <textarea
              value={codeExample}
              onChange={(e) => setCodeExample(e.target.value)}
              placeholder="// Paste your code here...
function example() {
  console.log('Hello World');
}"
              className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-xl resize-none focus:ring-2 focus:ring-primary-500 border border-gray-700"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Tips:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
            <li>Use Ctrl+S to quickly save your work</li>
            <li>Include practical examples in your notes</li>
            <li>Test your code before pasting it here</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;