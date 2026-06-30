import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Mic,
  History,
  Brain,
  Code2,
  Briefcase,
  BookOpen,
  Sparkles,
  Menu,
  X,
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/resume-analyzer', icon: FileText, label: 'Resume Analyzer' },
  { path: '/mock-interview', icon: Mic, label: 'Mock Interview' },
  { path: '/interview-history', icon: History, label: 'Interview History' },
  { path: '/interview-prep', icon: Brain, label: 'Interview Prep' },
  { path: '/dsa-sheet', icon: Code2, label: 'DSA Sheet' },
  { path: '/job-tracker', icon: Briefcase, label: 'Job Tracker' },
  { path: '/notes', icon: BookOpen, label: 'Notes' },
  { path: '/ai-assistant', icon: Sparkles, label: 'AI Assistant' },
];

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              PrepAI
            </h1>

          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${isActive
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            PrepAI
          </h1>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">v1.0</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${isActive
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email || ''}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  <Menu className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
