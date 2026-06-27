import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Lightbulb,
  Loader2,
  Star,
  StarHalf,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const popularCompanies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Adobe', 'Atlassian', 'Uber'];
const difficultyOptions = ['easy', 'medium', 'hard'];
const QUESTION_TIME_SECONDS = 120;

function MockInterview() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [screen, setScreen] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('medium');
  const [useResume, setUseResume] = useState(false);

  const [interviewId, setInterviewId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [savedToHistory, setSavedToHistory] = useState(false);

  const timerRef = useRef(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isTimeLow = timeLeft <= 30;

  useEffect(() => {
    if (screen !== 'interview' || feedback || timeLeft <= 0) {
      clearInterval(timerRef.current);
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [screen, feedback, timeLeft]);

  const overallScore = useMemo(() => {
    if (!answers.length) {
      return 0;
    }

    const total = answers.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
    return Number((total / answers.length).toFixed(1));
  }, [answers]);

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function getTypeBadgeStyles(type) {
    if (type === 'technical') return 'bg-blue-100 text-blue-700';
    if (type === 'behavioral') return 'bg-purple-100 text-purple-700';
    return 'bg-emerald-100 text-emerald-700';
  }

  function getVerdictColor(verdict) {
    if (verdict === 'excellent') return 'bg-green-100 text-green-700';
    if (verdict === 'good') return 'bg-blue-100 text-blue-700';
    if (verdict === 'average') return 'bg-yellow-100 text-yellow-700';
    if (verdict === 'poor') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  }

  function getVerdictTextColor(verdict) {
    if (verdict === 'excellent') return 'text-green-600';
    if (verdict === 'good') return 'text-blue-600';
    if (verdict === 'average') return 'text-yellow-600';
    if (verdict === 'poor') return 'text-red-600';
    return 'text-gray-600';
  }

  function renderStars(scoreOutOfTen) {
    const fiveStarScore = scoreOutOfTen / 2;
    const fullStars = Math.floor(fiveStarScore);
    const hasHalfStar = fiveStarScore % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center justify-center gap-1">
        {[...Array(fullStars)].map((_, index) => (
          <Star key={`full-${index}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, index) => (
          <Star key={`empty-${index}`} className="h-5 w-5 text-gray-300" />
        ))}
      </div>
    );
  }

  function resetInterviewState() {
    clearInterval(timerRef.current);
    setInterviewId('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswer('');
    setTimeLeft(QUESTION_TIME_SECONDS);
    setFeedback(null);
    setAnswers([]);
    setResults(null);
    setExpandedQuestion(null);
    setSavedToHistory(false);
  }

  async function handleGenerateQuestions() {
    if (!company.trim() || !role.trim()) {
      toast.error('Please enter both company and role');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          difficulty,
          useResume
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate questions');
      }

      if (useResume && !data.resumeUsed) {
        toast('No uploaded resume found, so questions were generated without resume context.');
      }

      setInterviewId(data.interviewId);
      setQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setAnswer('');
      setTimeLeft(QUESTION_TIME_SECONDS);
      setFeedback(null);
      setAnswers([]);
      setResults(null);
      setExpandedQuestion(null);
      setSavedToHistory(false);
      setScreen('interview');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) {
      toast.error('Please enter your answer before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/interview/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          interviewId,
          questionIndex: currentQuestionIndex,
          answer: answer.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to evaluate answer');
      }

      const answerRecord = {
        questionIndex: currentQuestionIndex,
        question: currentQuestion.question,
        type: currentQuestion.type,
        answer: answer.trim(),
        score: data.score,
        feedback: data.feedback,
        betterAnswerHint: data.better_answer_hint,
        keywordsUsed: data.keywords_used || [],
        keywordsMissed: data.keywords_missed || [],
        verdict: data.verdict
      };

      setFeedback(answerRecord);
      setAnswers((prev) => {
        const filtered = prev.filter((item) => item.questionIndex !== currentQuestionIndex);
        return [...filtered, answerRecord].sort((a, b) => a.questionIndex - b.questionIndex);
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleNextQuestion() {
    if (currentQuestionIndex === questions.length - 1) {
      setResults({
        company,
        role,
        difficulty,
        overallScore,
        questions,
        answers
      });
      setScreen('results');
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setAnswer('');
    setFeedback(null);
    setTimeLeft(QUESTION_TIME_SECONDS);
  }

  async function handleSaveToHistory() {
    if (!interviewId || savedToHistory) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/interview/${interviewId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save interview');
      }

      setResults(data);
      setSavedToHistory(true);
      toast.success('Interview saved to history');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTryAgain() {
    resetInterviewState();
    await handleGenerateQuestions();
  }

  function handleNewInterview() {
    resetInterviewState();
    setCompany('');
    setRole('Software Engineer');
    setDifficulty('medium');
    setUseResume(false);
    setScreen('setup');
  }

  if (screen === 'setup') {
    return (
      <Layout title="Mock Interview">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-indigo-100">Mock Interview</p>
              <h1 className="mb-2 text-3xl font-bold">Practice with real AI feedback</h1>
              <p className="max-w-2xl text-sm text-indigo-100">
                Generate five tailored interview questions, answer them one at a time, and review detailed feedback before saving the session to your history.
              </p>
            </div>
            <button
              onClick={() => navigate('/interview-history')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/15 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20"
            >
              <History className="h-4 w-4" />
              Interview History
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Target Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Google, Amazon, Microsoft..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {popularCompanies.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCompany(item)}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        company === item ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Target Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="Software Engineer"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {difficultyOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDifficulty(item)}
                      className={`rounded-lg px-4 py-3 text-sm font-medium capitalize transition ${
                        difficulty === item ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Use my resume</p>
                    <p className="text-sm text-gray-500">Pull context from your latest uploaded resume if one exists.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUseResume((prev) => !prev)}
                  className={`h-7 w-14 rounded-full transition ${useResume ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white transition-transform ${useResume ? 'translate-x-7' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateQuestions}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Star className="h-5 w-5" />
                  Generate Questions
                </>
              )}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (screen === 'interview' && currentQuestion) {
    return (
      <Layout title="Mock Interview">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {company} | {role} | {difficulty}
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h2>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${isTimeLow ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-indigo-600 transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${getTypeBadgeStyles(currentQuestion.type)}`}>
                  {currentQuestion.type}
                </span>
                <h3 className="mt-3 text-xl font-semibold text-gray-900">{currentQuestion.question}</h3>
              </div>
            </div>

            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Write your answer here. Use STAR for behavioral questions or explain trade-offs for technical ones."
              disabled={Boolean(feedback)}
              className="min-h-[220px] w-full rounded-xl border border-gray-300 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
            />

            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>{timeLeft === 0 ? 'Time is up. You can still submit your answer.' : 'Suggested limit: 2 minutes per question'}</span>
            </div>

            {!feedback ? (
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={submitting || !answer.trim()}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Evaluating Answer...
                  </>
                ) : (
                  'Submit Answer'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-semibold text-white transition hover:bg-emerald-700"
              >
                {currentQuestionIndex === questions.length - 1 ? 'View Results' : 'Next Question'}
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {feedback && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className={`text-3xl font-bold ${getVerdictTextColor(feedback.verdict)}`}>{feedback.score}/10</p>
                    <p className="text-sm text-gray-500">AI score</p>
                  </div>
                  {renderStars(feedback.score)}
                </div>
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium capitalize ${getVerdictColor(feedback.verdict)}`}>
                  {feedback.verdict}
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">Detailed feedback</h4>
                  <p className="text-gray-600">{feedback.feedback}</p>
                </div>

                {feedback.betterAnswerHint && (
                  <div className="rounded-xl bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Better answer hint</h4>
                        <p className="mt-1 text-sm text-blue-700">{feedback.betterAnswerHint}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-green-900">
                      <Check className="h-4 w-4" />
                      Keywords used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {feedback.keywordsUsed.length ? feedback.keywordsUsed.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-white px-2.5 py-1 text-xs text-green-700 ring-1 ring-green-200">
                          {keyword}
                        </span>
                      )) : <span className="text-sm text-green-800">No strong keywords detected yet.</span>}
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-red-900">
                      <X className="h-4 w-4" />
                      Keywords missed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {feedback.keywordsMissed.length ? feedback.keywordsMissed.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-white px-2.5 py-1 text-xs text-red-700 ring-1 ring-red-200">
                          {keyword}
                        </span>
                      )) : <span className="text-sm text-red-800">No missing keywords were flagged.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  if (screen === 'results' && results) {
    return (
      <Layout title="Interview Results">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-indigo-100">Interview Complete</p>
            <h1 className="text-3xl font-bold">Your mock interview results</h1>
            <p className="mt-2 text-indigo-100">
              Review the breakdown below, then save the session to your interview history when you are ready.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">Overall Score</p>
              <div className="mt-4 text-6xl font-bold text-gray-900">{results.overallScore}</div>
              <p className="mt-2 text-gray-500">out of 10</p>
              <div className="mt-4">{renderStars(results.overallScore)}</div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <p className="text-gray-500">Company</p>
                  <p className="font-semibold text-gray-900">{results.company}</p>
                </div>
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-semibold text-gray-900">{results.role}</p>
                </div>
                <div>
                  <p className="text-gray-500">Difficulty</p>
                  <p className="font-semibold capitalize text-gray-900">{results.difficulty}</p>
                </div>
                <div>
                  <p className="text-gray-500">Questions answered</p>
                  <p className="font-semibold text-gray-900">{results.answers.length}/5</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Per-question breakdown</h2>
            <div className="mt-4 space-y-3">
              {results.answers.map((item, index) => (
                <div key={item.questionIndex} className="flex items-center gap-4">
                  <span className="w-10 text-sm font-medium text-gray-600">Q{index + 1}</span>
                  <div className="h-3 flex-1 rounded-full bg-gray-200">
                    <div
                      className={`h-3 rounded-full ${
                        item.score >= 8 ? 'bg-green-500' : item.score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.score * 10}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-semibold text-gray-900">{item.score}/10</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {results.answers.map((item, index) => (
              <div key={item.questionIndex} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedQuestion((prev) => (prev === index ? null : index))}
                  className="flex w-full items-center justify-between p-5 text-left transition hover:bg-gray-50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                        {index + 1}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getTypeBadgeStyles(item.type)}`}>
                        {item.type}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getVerdictColor(item.verdict)}`}>
                        {item.verdict}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">{item.question}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{item.score}/10</span>
                    {expandedQuestion === index ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                  </div>
                </button>

                {expandedQuestion === index && (
                  <div className="space-y-4 border-t border-gray-200 bg-gray-50 p-5">
                    <div>
                      <h3 className="mb-2 font-semibold text-gray-900">Your answer</h3>
                      <p className="text-sm leading-6 text-gray-700">{item.answer}</p>
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold text-gray-900">AI feedback</h3>
                      <p className="text-sm leading-6 text-gray-700">{item.feedback}</p>
                    </div>
                    {item.betterAnswerHint && (
                      <div className="rounded-xl bg-blue-50 p-4">
                        <p className="font-semibold text-blue-900">Better answer hint</p>
                        <p className="mt-1 text-sm text-blue-700">{item.betterAnswerHint}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <button
              type="button"
              onClick={handleSaveToHistory}
              disabled={saving || savedToHistory}
              className="rounded-xl bg-indigo-600 px-5 py-4 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : savedToHistory ? 'Saved to History' : 'Save to History'}
            </button>
            <button
              type="button"
              onClick={handleTryAgain}
              disabled={loading}
              className="rounded-xl border border-gray-300 bg-white px-5 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={handleNewInterview}
              className="rounded-xl border border-gray-300 bg-white px-5 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              New Interview
            </button>
            <button
              type="button"
              onClick={() => navigate('/interview-history')}
              className="rounded-xl border border-gray-300 bg-white px-5 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              View History
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return null;
}

export default MockInterview;
