import { useEffect, useMemo, useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code,
  ExternalLink,
  Filter,
  Loader2,
  Star,
  Target,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'prepai-dsa-solved-problems';
const topics = ['Array', 'String', 'LinkedList', 'Stack', 'Queue', 'Tree', 'Graph', 'DP', 'Greedy', 'Binary Search', 'Backtracking', 'Heap', 'Trie', 'Sliding Window'];
const difficultyFilters = ['all', 'easy', 'medium', 'hard'];

import { problemCatalog } from './dsa_problems';

function DSASheet() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [activeTopic, setActiveTopic] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [expandedDay, setExpandedDay] = useState(null);
  const [solvedProblemIds, setSolvedProblemIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [daysAvailable, setDaysAvailable] = useState(14);
  const [targetCompany, setTargetCompany] = useState('Google');
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSolvedProblemIds(JSON.parse(stored));
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solvedProblemIds));
  }, [solvedProblemIds]);

  const filteredProblems = useMemo(() => {
    return problemCatalog.filter((problem) => {
      const topicMatch = activeTopic === 'all' || problem.topic === activeTopic;
      const difficultyMatch = activeDifficulty === 'all' || problem.difficulty.toLowerCase() === activeDifficulty.toLowerCase();
      return topicMatch && difficultyMatch;
    });
  }, [activeDifficulty, activeTopic]);

  const topicProgress = useMemo(() => {
    return topics.map((topic) => {
      const topicProblems = problemCatalog.filter((problem) => problem.topic === topic);
      const solvedCount = topicProblems.filter((problem) => solvedProblemIds.includes(problem.id)).length;
      const percentage = topicProblems.length ? Math.round((solvedCount / topicProblems.length) * 100) : 0;

      return {
        topic,
        solvedCount,
        totalCount: topicProblems.length,
        percentage
      };
    });
  }, [solvedProblemIds]);

  const weakTopics = useMemo(() => {
    return [...topicProgress]
      .sort((a, b) => a.percentage - b.percentage || a.solvedCount - b.solvedCount)
      .slice(0, 4)
      .map((item) => item.topic);
  }, [topicProgress]);

  const overallSolved = solvedProblemIds.length;

  function toggleSolved(problemId) {
    setSolvedProblemIds((prev) =>
      prev.includes(problemId) ? prev.filter((id) => id !== problemId) : [...prev, problemId]
    );
  }

  async function handleGenerateStudyPlan() {
    if (!targetCompany.trim()) {
      toast.error('Please enter a target company');
      return;
    }

    setRecommendationLoading(true);
    setExpandedDay(null);

    try {
      const response = await fetch(`${API_URL}/api/prep/dsa-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          weakTopics,
          targetCompany: targetCompany.trim(),
          daysAvailable
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate study plan');
      }

      setStudyPlan(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRecommendationLoading(false);
    }
  }

  function getDifficultyStyle(difficulty) {
    const lower = (difficulty || '').toLowerCase();
    if (lower === 'hard') return 'bg-red-100 text-red-700';
    if (lower === 'easy') return 'bg-green-100 text-green-700';
    return 'bg-yellow-100 text-yellow-700';
  }

  return (
    <Layout title="DSA Sheet">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 p-8 text-white">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-100">DSA Sheet</p>
          <h1 className="text-3xl font-bold">Track practice and get AI recommendations</h1>
          <p className="mt-2 max-w-3xl text-sm text-emerald-50">
            Practice across 150 curated DSA problems, track solved progress per topic, and generate a company-specific study plan from your weakest areas.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,1fr,1fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total problems</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{problemCatalog.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Solved</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{overallSolved}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Progress</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{Math.round((overallSolved / problemCatalog.length) * 100)}%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">Narrow the sheet by topic and difficulty.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              <Star className="h-4 w-4" />
              Get AI Recommendations
            </button>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm font-medium text-gray-700">Topics</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTopic('all')}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${activeTopic === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                All
              </button>
              {topics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setActiveTopic(topic)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${activeTopic === topic ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm font-medium text-gray-700">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {difficultyFilters.map((difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => setActiveDifficulty(difficulty)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${activeDifficulty === difficulty ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Solved per topic</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topicProgress.map((item) => (
              <div key={item.topic} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{item.topic}</span>
                  <span className="text-sm text-gray-500">
                    {item.solvedCount}/{item.totalCount}
                  </span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${item.percentage}%` }} />
                </div>
                <p className="mt-2 text-sm text-gray-500">{item.percentage}% solved</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Problem Bank</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Showing {filteredProblems.length} problems matching the current filters.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProblems.map((problem) => {
              const solved = solvedProblemIds.includes(problem.id);

              return (
                <div
                  key={problem.id}
                  className={`rounded-xl border p-5 transition ${solved ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{problem.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{problem.topic}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getDifficultyStyle(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <a
                      href={problem.leetcode_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      LC #{problem.leetcode_number}
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => toggleSolved(problem.id)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        solved ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {solved ? 'Solved' : 'Mark Solved'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI DSA Recommendations</h2>
                  <p className="mt-1 text-sm text-gray-500">Generate a study plan from your weakest topics.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Weak areas</h3>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {weakTopics.map((topic) => (
                      <span key={topic} className="rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-[0.8fr,1.2fr]">
                  <div>
                    <p className="mb-3 text-sm font-medium text-gray-700">Days available</p>
                    <div className="flex gap-2">
                      {[7, 14, 30].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setDaysAvailable(day)}
                          className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${daysAvailable === day ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {day} days
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">Target company</label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(event) => setTargetCompany(event.target.value)}
                      placeholder="Google, Amazon, Microsoft..."
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateStudyPlan}
                  disabled={recommendationLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {recommendationLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Study Plan...
                    </>
                  ) : (
                    <>
                      <Star className="h-5 w-5" />
                      Generate Study Plan
                    </>
                  )}
                </button>

                {studyPlan && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-[1fr,1fr]">
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Daily target</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{studyPlan.daily_target} problems/day</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Priority topics</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {studyPlan.priority_topics.map((topic) => (
                            <span key={topic} className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {studyPlan.study_plan.map((dayPlan, index) => (
                        <div key={`${dayPlan.day}-${dayPlan.topic}-${index}`} className="overflow-hidden rounded-xl border border-gray-200">
                          <button
                            type="button"
                            onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                            className="flex w-full items-center justify-between p-4 text-left transition hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">Day {dayPlan.day}: {dayPlan.topic}</p>
                              <p className="mt-1 text-sm text-gray-500">{(dayPlan.problems || []).length} suggested problems</p>
                            </div>
                            {expandedDay === index ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                          </button>
                          {expandedDay === index && (
                            <div className="border-t border-gray-200 bg-gray-50 p-4">
                              <div className="space-y-3">
                                {(dayPlan.problems || []).map((problem, problemIndex) => (
                                  <div key={`${problem.name}-${problemIndex}`} className="rounded-lg border border-gray-200 bg-white p-4">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="font-medium text-gray-900">{problem.name}</p>
                                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getDifficultyStyle(problem.difficulty)}`}>
                                        {problem.difficulty}
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">LeetCode #{problem.leetcode_number}</p>
                                    <p className="mt-2 text-sm text-gray-700">{problem.why_important}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DSASheet;
