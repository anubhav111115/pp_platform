import { useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Clock3,
  Loader2,
  Search,
  Star,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const companies = [
  { name: 'Google', color: 'from-blue-500 to-green-400' },
  { name: 'Amazon', color: 'from-orange-500 to-yellow-400' },
  { name: 'Microsoft', color: 'from-sky-500 to-indigo-500' },
  { name: 'Meta', color: 'from-blue-600 to-cyan-400' },
  { name: 'Netflix', color: 'from-red-600 to-rose-500' },
  { name: 'Adobe', color: 'from-red-500 to-pink-500' },
  { name: 'Uber', color: 'from-slate-700 to-slate-900' },
  { name: 'Atlassian', color: 'from-blue-500 to-indigo-600' },
  { name: 'Salesforce', color: 'from-cyan-500 to-blue-500' },
  { name: 'Flipkart', color: 'from-yellow-400 to-blue-500' },
  { name: 'Infosys', color: 'from-indigo-500 to-violet-500' },
  { name: 'TCS', color: 'from-emerald-500 to-teal-500' }
];

const roles = [
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'SDE Intern',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer'
];

function InterviewPrep() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [company, setCompany] = useState('Google');
  const [role, setRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [expandedRound, setExpandedRound] = useState(null);
  const [guide, setGuide] = useState(null);

  async function handleGetPrepGuide() {
    if (!company.trim() || !role.trim()) {
      toast.error('Please enter both company and role');
      return;
    }

    setLoading(true);
    setExpandedRound(null);

    try {
      const response = await fetch(`${API_URL}/api/prep/company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate prep guide');
      }

      setGuide(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function getDifficultyBadge(difficulty) {
    if (difficulty === 'hard') return 'bg-red-100 text-red-700';
    if (difficulty === 'easy') return 'bg-green-100 text-green-700';
    return 'bg-yellow-100 text-yellow-700';
  }

  function getResourceBadge(type) {
    if (type === 'video') return 'bg-red-100 text-red-700';
    if (type === 'practice') return 'bg-indigo-100 text-indigo-700';
    return 'bg-emerald-100 text-emerald-700';
  }

  return (
    <Layout title="Interview Prep">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-indigo-100">Interview Prep</p>
          <h1 className="text-3xl font-bold">Company-specific interview preparation</h1>
          <p className="mt-2 max-w-3xl text-sm text-indigo-100">
            Generate a targeted preparation guide with interview rounds, likely topics, insider tips, and recommended resources for your target company and role.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Company</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Search company name"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Role</label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-gray-700">Popular companies</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {companies.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setCompany(item.name)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    company === item.name ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${item.color} font-bold text-white`}>
                    {item.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetPrepGuide}
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Prep Guide...
              </>
            ) : (
              <>
                <Star className="h-5 w-5" />
                Get Prep Guide
              </>
            )}
          </button>
        </div>

        {guide && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr,0.8fr,0.8fr]">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
                <p className="text-sm text-gray-500">Target company</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">{company}</h2>
                <p className="mt-2 text-sm text-gray-600">{guide.overview}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">Difficulty</p>
                <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${getDifficultyBadge(guide.difficulty)}`}>
                  {guide.difficulty}
                </span>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <TrendingUp className="h-4 w-4" />
                  <p className="text-sm">Average CTC</p>
                </div>
                <p className="mt-3 text-xl font-bold text-gray-900">{guide.avg_ctc}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock3 className="h-4 w-4" />
                  <p className="text-sm">Prep time</p>
                </div>
                <p className="mt-3 text-xl font-bold text-gray-900">{guide.preparation_time}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">Interview Rounds</h3>
                <div className="mt-4 space-y-3">
                  {guide.interview_rounds.map((round, index) => (
                    <div key={`${round.round}-${index}`} className="overflow-hidden rounded-xl border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setExpandedRound(expandedRound === index ? null : index)}
                        className="flex w-full items-center justify-between p-4 text-left transition hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{round.round}</p>
                          <p className="mt-1 text-sm text-gray-500">{round.description}</p>
                        </div>
                        {expandedRound === index ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                      </button>
                      {expandedRound === index && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <p className="text-sm text-gray-600">{round.description}</p>
                          <ul className="mt-3 space-y-2">
                            {(round.tips || []).map((tip, tipIndex) => (
                              <li key={`${tip}-${tipIndex}`} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-yellow-700" />
                    <h3 className="text-lg font-semibold text-yellow-900">Insider Tips</h3>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {guide.insider_tips.map((tip, index) => (
                      <li key={`${tip}-${index}`} className="text-sm text-yellow-900">
                        {index + 1}. {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Commonly Asked Topics</h3>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {guide.commonly_asked_topics.map((topic, index) => {
                      const sizeClass = index < 4 ? 'text-sm px-4 py-2' : index < 8 ? 'text-xs px-3 py-1.5' : 'text-xs px-2.5 py-1';

                      return (
                        <span
                          key={`${topic}-${index}`}
                          className={`rounded-full bg-indigo-100 font-medium text-indigo-700 ${sizeClass}`}
                        >
                          {topic}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">Recommended Resources</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {guide.recommended_resources.map((resource, index) => (
                  <a
                    key={`${resource.title}-${index}`}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-gray-200 p-5 transition hover:border-indigo-300 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getResourceBadge(resource.type)}`}>
                        {resource.type}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <h4 className="mt-4 font-semibold text-gray-900">{resource.title}</h4>
                    <p className="mt-2 break-all text-xs text-gray-500">{resource.url}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default InterviewPrep;
