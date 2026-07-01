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
      bgColor: 'bg-green-50 dark:bg-[#13131f]',
      iconColor: 'text-green-600 dark:text-green-400',
      textColor: 'text-green-700 dark:text-green-400'
    },
    {
      label: 'Mock Interviews',
      value: user?.interviews_done || 0,
      icon: Mic,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-[#13131f]',
      iconColor: 'text-blue-600 dark:text-blue-400',
      textColor: 'text-blue-700 dark:text-blue-400'
    },
    {
      label: 'Jobs Applied',
      value: user?.jobs_applied || 0,
      icon: Briefcase,
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-[#13131f]',
      iconColor: 'text-orange-600 dark:text-orange-400',
      textColor: 'text-orange-700 dark:text-orange-400'
    },
    {
      label: 'Resume Score',
      value: `${user?.resumeScore || 0}/100`,
      icon: FileText,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-[#13131f]',
      iconColor: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-purple-700 dark:text-purple-400'
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2 transition-colors">
            {greeting}, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base">{currentDate}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${card.bgColor} rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-[#1e1e2e] dark:shadow-[0_0_15px_rgba(99,102,241,0.05)] transition-all duration-200`}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`${card.iconColor} bg-white dark:bg-[#1a1a2e] rounded-lg p-2.5 sm:p-3 shadow-sm border border-gray-50 dark:border-[#2d2d4e]`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-0.5 sm:mb-1 transition-colors">{card.value}</p>
                <p className={`${card.textColor} text-xs sm:text-sm font-semibold tracking-wide uppercase`}>{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4 transition-colors">Quick Actions</h2>
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="bg-white dark:bg-[#13131f] rounded-xl p-6 border border-gray-200 dark:border-[#1e1e2e] hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md dark:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all text-left group flex-1"
                >
                  <div className={`bg-gradient-to-br ${action.color} rounded-lg p-3 mb-4 w-fit shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-400 text-sm mb-3">{action.description}</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4 transition-colors">Recent Activity</h2>
          <div className="bg-white dark:bg-[#13131f] rounded-xl border border-gray-200 dark:border-[#1e1e2e] dark:shadow-[0_0_15px_rgba(99,102,241,0.1)] overflow-hidden transition-all duration-200">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-[#1e1e2e] last:border-b-0 hover:bg-gray-50 dark:hover:bg-[#1e1e2e] transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    activity.type === 'interview' ? 'bg-blue-500' :
                    activity.type === 'resume' ? 'bg-purple-500' :
                    activity.type === 'dsa' ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <span className="text-gray-900 dark:text-slate-200 text-sm sm:text-base truncate">{activity.action}</span>
                </div>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 shrink-0 ml-2">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 sm:p-8 text-white shadow-lg">
          <p className="text-base sm:text-lg italic mb-3 sm:mb-4">"{quote}"</p>
          <p className="text-purple-200 text-xs sm:text-sm font-medium">Stay motivated and keep pushing forward!</p>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
