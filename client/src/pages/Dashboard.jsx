import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Code, Mic, Briefcase, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "Hardships often prepare ordinary people for an extraordinary destiny. - C.S. Lewis",
  "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones."
];

const recentActivities = [
  { id: 1, action: 'Completed mock interview', time: '2 hours ago', type: 'interview' },
  { id: 2, action: 'Updated resume', time: '1 day ago', type: 'resume' },
  { id: 3, action: 'Solved 5 DSA problems', time: '2 days ago', type: 'dsa' },
  { id: 4, action: 'Applied to Google', time: '3 days ago', type: 'job' },
];

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));

    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const statCards = [
    {
      label: 'DSA Solved',
      value: user?.dsa_solved || 0,
      icon: Code,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      label: 'Mock Interviews',
      value: user?.interviews_done || 0,
      icon: Mic,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-700 dark:text-blue-300'
    },
    {
      label: 'Jobs Applied',
      value: user?.jobs_applied || 0,
      icon: Briefcase,
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      textColor: 'text-orange-700 dark:text-orange-300'
    },
    {
      label: 'Resume Score',
      value: `${user?.resumeScore || 0}/100`,
      icon: FileText,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-700 dark:text-purple-300'
    },
  ];

  const quickActions = [
    {
      label: 'Analyze Resume',
      description: 'Get AI feedback on your resume',
      icon: FileText,
      onClick: () => navigate('/resume-analyzer'),
      color: 'from-purple-500 to-indigo-500'
    },
    {
      label: 'Start Mock Interview',
      description: 'Practice with AI-powered interviews',
      icon: Mic,
      onClick: () => navigate('/mock-interview'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Practice DSA',
      description: 'Solve coding problems',
      icon: Code,
      onClick: () => navigate('/dsa-sheet'),
      color: 'from-green-500 to-emerald-500'
    },
  ];

  return (
    <Layout title="Dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            {greeting}, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-slate-400">{currentDate}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${card.bgColor} rounded-xl p-6 border border-gray-100 dark:border-slate-800/60`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`${card.iconColor} bg-white dark:bg-slate-800 rounded-lg p-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-1">{card.value}</p>
                <p className={`${card.textColor} font-medium`}>{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all text-left group"
                >
                  <div className={`bg-gradient-to-br ${action.color} rounded-lg p-3 mb-4 w-fit`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm">{action.description}</p>
                  <ArrowRight className="w-4 h-4 text-gray-400 dark:text-slate-500 mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Recent Activity</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700/50 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'interview' ? 'bg-blue-500' :
                    activity.type === 'resume' ? 'bg-purple-500' :
                    activity.type === 'dsa' ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <span className="text-gray-900 dark:text-slate-300">{activity.action}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-8 text-white">
          <p className="text-lg italic mb-4">"{quote}"</p>
          <p className="text-purple-200 text-sm">Stay motivated and keep pushing forward!</p>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
