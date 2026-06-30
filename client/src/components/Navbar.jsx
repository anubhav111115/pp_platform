import { useState } from 'react';
import { Bell, Menu, User, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button (mobile) + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        </div>

        {/* Right side - Theme toggle + Notifications + User dropdown */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="relative p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Notification bell */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to profile
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700 text-left dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to settings
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-gray-700 text-left dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-red-600 text-left dark:hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;