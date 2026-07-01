import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Lock, Bell, Sun, Moon, Trash2, Loader2, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Settings() {
  const { token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('prepai_notifications');
    return saved ? JSON.parse(saved) : { email: true, mockInterviews: true, jobUpdates: false };
  });

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!newPassword) return toast.error('New password is required');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setUpdatingPassword(true);
    try {
      await axios.put(`${API_URL}/api/users/password`, { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleToggleNotification = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('prepai_notifications', JSON.stringify(updated));
    toast.success('Preference updated!');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return toast.error('Please type DELETE to confirm.');
    setDeletingAccount(true);
    try {
      await axios.delete(`${API_URL}/api/users/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Account deleted.');
      logout();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <Layout title="Settings">
      <div className="max-w-3xl mx-auto space-y-6 px-4 pb-8">

        {/* Change Password */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" /> Change Password
          </h3>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            {[
              { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, placeholder: '••••••••', required: false },
              { label: 'New Password', value: newPassword, setter: setNewPassword, placeholder: 'Min 6 characters', required: true },
              { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, placeholder: 'Re-type new password', required: true },
            ].map(({ label, value, setter, placeholder, required }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-sm font-medium text-gray-600 dark:text-slate-300">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
            <button type="submit" disabled={updatingPassword} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors">
              {updatingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Notifications + Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Notifications */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" /> Notifications
            </h3>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Alerts', desc: 'Placement tips and updates' },
                { key: 'mockInterviews', label: 'Interview Reminders', desc: 'Complete pending interviews' },
                { key: 'jobUpdates', label: 'Job Tracking', desc: 'Status change notifications' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggleNotification(key)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifications[key] ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-700'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications[key] ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-indigo-600" />}
              Appearance
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">Toggle between Light and Dark mode.</p>
            <div className="flex gap-3">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`flex-1 py-3 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all text-sm ${theme === 'light' ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-400' : 'bg-white border-gray-200 text-gray-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'}`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`flex-1 py-3 rounded-lg border font-medium flex items-center justify-center gap-2 transition-all text-sm ${theme === 'dark' ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-400' : 'bg-white border-gray-200 text-gray-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'}`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
            </div>
          </div>

        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/50 dark:bg-red-950/10 rounded-xl p-6 border border-red-200 dark:border-red-900/30 space-y-4">
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-300">Deleting your account will permanently erase all your data. This cannot be undone.</p>
          <button onClick={() => setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors">
            <Trash2 className="w-4 h-4" /> Delete My Account
          </button>
        </div>

      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-7 h-7" />
              <h4 className="text-lg font-bold">Confirm Deletion</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300">Type <span className="font-bold text-gray-900 dark:text-white">DELETE</span> to confirm.</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full py-2.5 px-4 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} className="py-2 px-5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deletingAccount || deleteConfirmText !== 'DELETE'} className="py-2 px-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition">
                {deletingAccount && <Loader2 className="w-4 h-4 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}