import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  Briefcase,
  GripVertical,
  Plus,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/Skeleton';

const columns = [
  { id: 'applied', label: 'Applied', color: 'border-blue-200 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  { id: 'screening', label: 'Screening', color: 'border-yellow-200 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700' },
  { id: 'interview', label: 'Interview', color: 'border-purple-200 bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
  { id: 'offer', label: 'Offer', color: 'border-green-200 bg-green-50', badge: 'bg-green-100 text-green-700' },
  { id: 'rejected', label: 'Rejected', color: 'border-slate-200 bg-slate-50', badge: 'bg-slate-200 text-slate-700' }
];

const avatarGradients = [
  'from-indigo-500 to-violet-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-slate-600 to-slate-800'
];

function JobCard({ job, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job._id,
    data: { status: job.status }
  });

  const gradient = avatarGradients[job.company.charCodeAt(0) % avatarGradients.length];
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition ${isDragging ? 'opacity-60 shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${gradient} font-bold text-white`}>
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{job.role}</p>
            <p className="text-sm text-gray-600">{job.company}</p>
            <p className="mt-1 text-xs text-gray-500">
              Applied {new Date(job.appliedDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          type="button"
          {...listeners}
          {...attributes}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          title="Drag job"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
          {job.salary || 'Salary N/A'}
        </span>
        <button
          type="button"
          onClick={() => onDelete(job)}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          title="Delete job"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {job.notes && <p className="mt-3 line-clamp-3 text-sm text-gray-600">{job.notes}</p>}
    </div>
  );
}

function DroppableColumn({ column, children, count }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id
  });

  return (
    <div className={`flex h-full min-h-[460px] flex-col rounded-2xl border p-4 ${column.color}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">{column.label}</h2>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${column.badge}`}>{count}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-3 rounded-xl border-2 border-dashed p-3 transition ${
          isOver ? 'border-indigo-400 bg-indigo-50/70' : 'border-transparent'
        }`}
      >
        {children.length ? children : (
          <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white/60 p-6 text-center text-sm text-gray-500">
            Drop jobs here
          </div>
        )}
      </div>
    </div>
  );
}

function JobTracker() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    company: '',
    role: '',
    jobUrl: '',
    salary: '',
    notes: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const response = await fetch(`${API_URL}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch jobs');
      }

      setJobs(data.jobs || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddJob(event) {
    event.preventDefault();

    if (!form.company.trim() || !form.role.trim()) {
      toast.error('Company and role are required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const job = await response.json();
      if (!response.ok) {
        throw new Error(job.message || 'Failed to add job');
      }

      setJobs((prev) => [job, ...prev]);
      setForm({ company: '', role: '', jobUrl: '', salary: '', notes: '' });
      setShowModal(false);
      toast.success('Job added');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteJob(job) {
    const confirmed = window.confirm(`Delete ${job.role} at ${job.company}?`);
    if (!confirmed) {
      return;
    }

    const previousJobs = jobs;
    setJobs((prev) => prev.filter((item) => item._id !== job._id));

    try {
      const response = await fetch(`${API_URL}/api/jobs/${job._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete job');
      }
    } catch (error) {
      setJobs(previousJobs);
      toast.error(error.message);
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const jobId = String(active.id);
    const newStatus = String(over.id);
    const previousJob = jobs.find((job) => job._id === jobId);

    if (!previousJob || previousJob.status === newStatus) {
      return;
    }

    const previousJobs = jobs;
    setJobs((prev) =>
      prev.map((job) => (job._id === jobId ? { ...job, status: newStatus, updatedAt: new Date().toISOString() } : job))
    );

    try {
      const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const updatedJob = await response.json();
      if (!response.ok) {
        throw new Error(updatedJob.message || 'Failed to update status');
      }

      setJobs((prev) => prev.map((job) => (job._id === jobId ? updatedJob : job)));
    } catch (error) {
      setJobs(previousJobs);
      toast.error(error.message);
    }
  }

  const stats = useMemo(() => {
    const total = jobs.length;
    const interviews = jobs.filter((job) => job.status === 'interview').length;
    const offers = jobs.filter((job) => job.status === 'offer').length;
    const responded = jobs.filter((job) => job.status !== 'applied').length;
    const responseRate = total ? Math.round((responded / total) * 100) : 0;

    return { total, interviews, offers, responseRate };
  }, [jobs]);

  if (loading) {
    return (
      <Layout title="Job Tracker">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-5">
            {columns.map((column) => (
              <div key={column.id} className="h-[460px] rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Job Tracker">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-100">Job Tracker</p>
          <h1 className="text-3xl font-bold">Track applications across every stage</h1>
          <p className="mt-2 max-w-3xl text-sm text-blue-100">
            Drag roles across the pipeline, monitor interviews and offers, and keep notes for each application.
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Briefcase className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-900">No applications yet</h2>
            <p className="mt-2 text-gray-600">Add your first job application to start tracking your progress.</p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Add Your First Application
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Total</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Interviews</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.interviews}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Offers</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.offers}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Response rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.responseRate}%</p>
              </div>
            </div>

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div className="grid gap-4 xl:grid-cols-5">
                {columns.map((column) => {
                  const columnJobs = jobs
                    .filter((job) => job.status === column.id)
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                  return (
                    <DroppableColumn key={column.id} column={column} count={columnJobs.length}>
                      {columnJobs.map((job) => (
                        <JobCard key={job._id} job={job} onDelete={handleDeleteJob} />
                      ))}
                    </DroppableColumn>
                  );
                })}
              </div>
            </DndContext>
          </>
        )}

        {jobs.length > 0 && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="fixed bottom-8 right-8 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-4 font-semibold text-white shadow-lg transition hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5" />
            Add Job
          </button>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add Job</h2>
                  <p className="text-sm text-gray-500">Track a new application in your pipeline.</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleAddJob}>
                <input
                  type="text"
                  value={form.company}
                  onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
                  placeholder="Company"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                  placeholder="Role"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="url"
                  value={form.jobUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, jobUrl: event.target.value }))}
                  placeholder="Job URL"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={form.salary}
                  onChange={(event) => setForm((prev) => ({ ...prev, salary: event.target.value }))}
                  placeholder="Salary"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Notes"
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Saving...' : 'Add Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default JobTracker;
