import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { User, Mail, Calendar, Mic, FileText, Briefcase, Code, Check, Loader2, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GRADIENTS = [
  { id: 'indigo-purple', name: 'Indigo Purple', classes: 'from-indigo-500 to-purple-600' },
  { id: 'blue-indigo', name: 'Blue Indigo', classes: 'from-blue-500 to-indigo-600' },
  { id: 'pink-rose', name: 'Pink Rose', classes: 'from-pink-500 to-rose-600' },
  { id: 'green-teal', name: 'Green Teal', classes: 'from-green-500 to-teal-600' },
  { id: 'orange-red', name: 'Orange Red', classes: 'from-orange-400 to-red-500' }
];

export default function Profile() {
  const { token, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('from-indigo-500 to-purple-600');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [dsaSolved, setDsaSolved] = useState(0);
  const [avgInterviewScore, setAvgInterviewScore] = useState(0);

  useEffect(() => {
    fetchProfile();
    loadDSAProgress();
    loadInterviewStats();
  }, []);

  const loadDSAProgress = () => {
    const solved = localStorage.getItem('dsa_solved_problems');
    if (solved) {
      setDsaSolved(JSON.parse(solved).length || 0);
    }
  };

  const loadInterviewStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/interview/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const interviews = res.data.interviews || [];
      if (interviews.length > 0) {
        const avg = interviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / interviews.length;
        setAvgInterviewScore(Number(avg.toFixed(1)));
      }
    } catch (e) { }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(response.data);
      setName(response.data.name || '');
      if (response.data.avatar) setSelectedGradient(response.data.avatar);
    } catch (error) {
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    setUpdatingProfile(true);
    try {
      const response = await axios.put(`${API_URL}/api/users/profile`, {
        name, avatar: selectedGradient
      }, { headers: { Authorization: `Bearer ${token}` } });
      setProfileData(response.data);
      updateUser(response.data);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Profile">
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  const initials = profileData?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const memberSince = profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Joined recently';
  const resumeScore = profileData?.resumeScore || 0;
  const resumeColor = resumeScore >= 75 ? 'text-green-600' : resumeScore >= 50 ? 'text-yellow-600' : 'text-red-500';

  return (
    <Layout title="My Profile">
      <div className="max-w-4xl mx-auto space-y-6 px-4 pb-8">

        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${selectedGradient} flex items-center justify-center text-white text-3xl font-bold shadow-md flex-shrink-0`}>
              {initials}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{profileData?.name}</h2>
                <p className="text-gray-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm">
                  <Mail className="w-4 h-4" /> {profileData?.email}
                </p>
                <p className="text-gray-400 dark:text-slate-500 flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm">
                  <Calendar className="w-4 h-4" /> Member since {memberSince}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Avatar Color:</span>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGradient(g.classes)}
                      className={`w-7 h-7 rounded-full bg-gradient-to-br ${g.classes} ring-offset-2 transition-all hover:scale-110 flex items-center justify-center ${selectedGradient === g.classes ? 'ring-2 ring-indigo-600' : ''}`}
                      title={g.name}
                    >
                      {selectedGradient === g.classes && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'DSA Solved', value: `${dsaSolved}/500`, icon: Code, color: 'green' },
            { label: 'Interviews Done', value: profileData?.interviews_done || 0, icon: Mic, color: 'blue' },
            { label: 'Resume Score', value: `${resumeScore}/100`, icon: FileText, color: 'purple' },
            { label: 'Jobs Applied', value: profileData?.jobs_applied || 0, icon: Briefcase, color: 'orange' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
              <div className={`bg-${color}-50 dark:bg-${color}-950/40 p-2.5 rounded-lg text-${color}-600 dark:text-${color}-400 flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" /> Progress Overview
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-slate-300">DSA Problems Solved</span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">{dsaSolved} / 500</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min((dsaSolved / 500) * 100, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-slate-300">Average Interview Score</span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">{avgInterviewScore} / 10</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${(avgInterviewScore / 10) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-slate-300">Resume ATS Score</span>
                <span className={`font-semibold ${resumeColor}`}>{resumeScore} / 100</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full transition-all ${resumeScore >= 75 ? 'bg-green-500' : resumeScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${resumeScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Edit Name */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" /> Edit Profile
          </h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-600 dark:text-slate-300">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-400 dark:text-slate-500">Email (Read Only)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="email" value={profileData?.email || ''} disabled className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-400 cursor-not-allowed" />
              </div>
            </div>
            <button type="submit" disabled={updatingProfile} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors">
              {updatingProfile ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>

      </div>
    </Layout>
  );
}