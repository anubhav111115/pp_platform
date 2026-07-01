import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  TrendingUp
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

function InterviewHistory() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [interviews, setInterviews] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const response = await fetch(`${API_URL}/api/interview/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch interview history');
      }

      setInterviews(data.interviews || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(interviewId) {
    if (expandedId === interviewId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(interviewId);
    if (details[interviewId]) {
      return;
    }

    setDetailsLoadingId(interviewId);
    try {
      const response = await fetch(`${API_URL}/api/interview/${interviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch interview details');
      }

      setDetails((prev) => ({ ...prev, [interviewId]: data }));
    } catch (error) {
      console.error('Failed to fetch interview details:', error);
    } finally {
      setDetailsLoadingId(null);
    }
  }

  function getScoreColor(score) {
    if (score >= 8) return 'bg-green-100 text-green-700';
    if (score >= 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getCompanyInitial(company) {
    return company?.charAt(0).toUpperCase() || 'I';
  }

  if (loading) {
    return (
      <Layout title="Interview History">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Interview History">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-indigo-100">Interview History</p>
          <h1 className="text-3xl font-bold">Review past mock interviews</h1>
          <p className="mt-2 max-w-2xl text-sm text-indigo-100">
            Compare scores, reopen detailed feedback, and track how your answers improve across companies and roles.
          </p>
        </div>

        {interviews.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Briefcase className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-900">No interviews saved yet</h2>
            <p className="mt-2 text-gray-600">Finish and save a mock interview to build your history.</p>
            <button
              type="button"
              onClick={() => navigate('/mock-interview')}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Start Mock Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => {
              const detail = details[interview._id];

              return (
                <div key={interview._id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => handleToggle(interview._id)}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left transition hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-bold text-white">
                        {getCompanyInitial(interview.company)}
                      </div>

                      <div>
                        <h2 className="font-semibold text-gray-900">{interview.company}</h2>
                        <p className="text-sm text-gray-600">
                          {interview.role} | <span className="capitalize">{interview.difficulty}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden items-center gap-2 text-sm text-gray-500 md:flex">
                        <Calendar className="h-4 w-4" />
                        {formatDate(interview.completedAt || interview.createdAt)}
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-bold ${getScoreColor(interview.overallScore)}`}>
                        {interview.overallScore}/10
                      </span>
                      {expandedId === interview._id ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                    </div>
                  </button>

                  {expandedId === interview._id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      {detailsLoadingId === interview._id && !detail ? (
                        <div className="flex items-center justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                      ) : detail ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Full interview breakdown</h3>
                          </div>

                          {detail.questions.map((question, index) => {
                            const answer = detail.answers.find((item) => item.questionIndex === index);

                            return (
                              <div key={`${detail._id}-${index}`} className="rounded-xl border border-gray-200 bg-white p-5">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-medium text-gray-500">Question {index + 1}</p>
                                    <p className="mt-1 font-semibold text-gray-900">{question.question}</p>
                                  </div>
                                  {answer && (
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getScoreColor(answer.score)}`}>
                                      {answer.score}/10
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-3 text-sm text-gray-700">
                                  <div>
                                    <p className="font-semibold text-gray-900">Your answer</p>
                                    <p className="mt-1 leading-6">{answer?.answer || 'No answer saved.'}</p>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">AI feedback</p>
                                    <p className="mt-1 leading-6">{answer?.feedback || 'No feedback available.'}</p>
                                  </div>
                                  {answer?.betterAnswerHint && (
                                    <div className="rounded-lg bg-blue-50 p-3">
                                      <p className="font-semibold text-blue-900">Better answer hint</p>
                                      <p className="mt-1 text-blue-700">{answer.betterAnswerHint}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Unable to load interview details.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default InterviewHistory;
