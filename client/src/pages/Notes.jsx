import { useEffect, useMemo, useRef, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import {
  BookOpen,
  Pin,
  Plus,
  Search,
  Star,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

function Notes() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const skipAutosaveRef = useRef(false);
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saveState, setSaveState] = useState('idle');

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (!draft || !activeNoteId) {
      return undefined;
    }

    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return undefined;
    }

    setSaveState('saving');
    const timeoutId = setTimeout(() => {
      saveNote(draft);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [draft, activeNoteId]);

  async function fetchNotes() {
    try {
      const response = await fetch(`${API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch notes');
      }

      const incomingNotes = data.notes || [];
      setNotes(incomingNotes);

      if (incomingNotes.length) {
        setActiveNoteId(incomingNotes[0]._id);
        skipAutosaveRef.current = true;
        setDraft({
          ...incomingNotes[0],
          tagsInput: (incomingNotes[0].tags || []).join(', ')
        });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveNote(nextDraft) {
    try {
      const payload = {
        title: nextDraft.title,
        content: nextDraft.content,
        tags: nextDraft.tagsInput.split(',').map((item) => item.trim()).filter(Boolean),
        pinned: nextDraft.pinned
      };

      const response = await fetch(`${API_URL}/api/notes/${nextDraft._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const saved = await response.json();
      if (!response.ok) {
        throw new Error(saved.message || 'Failed to save note');
      }

      const hydratedNote = {
        ...saved,
        tagsInput: (saved.tags || []).join(', ')
      };

      setNotes((prev) =>
        [...prev.map((note) => (note._id === saved._id ? saved : note))].sort((a, b) => {
          if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        })
      );
      setDraft(hydratedNote);
      setSaveState('saved');
    } catch (error) {
      setSaveState('idle');
      toast.error(error.message);
    }
  }

  async function handleCreateNote() {
    setCreating(true);
    try {
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: '',
          tags: [],
          pinned: false
        })
      });

      const note = await response.json();
      if (!response.ok) {
        throw new Error(note.message || 'Failed to create note');
      }

      setNotes((prev) => [note, ...prev]);
      setActiveNoteId(note._id);
      skipAutosaveRef.current = true;
      setDraft({ ...note, tagsInput: '' });
      setSaveState('idle');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteNote() {
    if (!draft) {
      return;
    }

    const confirmed = window.confirm(`Delete "${draft.title}"?`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/notes/${draft._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete note');
      }

      const remainingNotes = notes.filter((note) => note._id !== draft._id);
      setNotes(remainingNotes);
      if (remainingNotes.length) {
        setActiveNoteId(remainingNotes[0]._id);
        skipAutosaveRef.current = true;
        setDraft({ ...remainingNotes[0], tagsInput: (remainingNotes[0].tags || []).join(', ') });
      } else {
        setActiveNoteId(null);
        setDraft(null);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  function selectNote(note) {
    setActiveNoteId(note._id);
    skipAutosaveRef.current = true;
    setDraft({
      ...note,
      tagsInput: (note.tags || []).join(', ')
    });
    setSaveState('idle');
  }

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return notes;
    }

    return notes.filter((note) => {
      const haystack = `${note.title} ${note.content} ${(note.tags || []).join(' ')}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [notes, search]);

  if (loading) {
    return (
      <Layout title="Notes">
        <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex h-full">
            <div className="flex w-[280px] flex-col border-r border-gray-200 bg-gray-50">
              <div className="border-b border-gray-200 p-4">
                <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mb-4" />
                <div className="h-10 w-full bg-gray-200 animate-pulse rounded-xl" />
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
                ))}
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="border-b border-gray-200 p-4">
                <div className="h-10 w-3/4 bg-gray-200 animate-pulse rounded-xl mb-4" />
                <div className="h-10 w-full bg-gray-200 animate-pulse rounded-xl" />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="h-64 bg-gray-200 animate-pulse rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Notes">
      <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex h-full">
          <div className="flex w-[280px] flex-col border-r border-gray-200 bg-gray-50">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Notes</h1>
                  <p className="text-sm text-gray-500">Markdown knowledge base</p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateNote}
                  disabled={creating}
                  className="rounded-xl bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  title="New note"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search notes"
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {filteredNotes.length ? filteredNotes.map((note) => (
                <button
                  key={note._id}
                  type="button"
                  onClick={() => selectNote(note)}
                  className={`mb-2 w-full rounded-xl border p-3 text-left transition ${
                    activeNoteId === note._id ? 'border-indigo-300 bg-white shadow-sm' : 'border-transparent bg-transparent hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 font-semibold text-gray-900">{note.title}</p>
                    {note.pinned && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{note.content || 'Empty note'}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(note.tags || []).slice(0, 3).map((tag) => (
                      <span key={`${note._id}-${tag}`} className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              )) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-gray-500">
                  <BookOpen className="mb-3 h-10 w-10 text-gray-300" />
                  No notes found
                </div>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            {draft ? (
              <>
                <div className="border-b border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                        placeholder="Note title"
                        className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setDraft((prev) => ({ ...prev, pinned: !prev.pinned }))}
                        className={`rounded-xl p-3 transition ${draft.pinned ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        title="Pin note"
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : 'Ready'}
                      </span>
                      <button
                        type="button"
                        onClick={handleDeleteNote}
                        className="rounded-xl bg-red-50 p-3 text-red-600 transition hover:bg-red-100"
                        title="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-gray-600">Tags</label>
                    <input
                      type="text"
                      value={draft.tagsInput}
                      onChange={(event) => setDraft((prev) => ({ ...prev, tagsInput: event.target.value }))}
                      placeholder="frontend, interviews, resume"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4" data-color-mode="light">
                  <MDEditor
                    value={draft.content}
                    onChange={(value) => setDraft((prev) => ({ ...prev, content: value || '' }))}
                    height="100%"
                  />
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <BookOpen className="mb-4 h-12 w-12 text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-900">Start capturing your thoughts</h2>
                <p className="mt-2 text-sm text-gray-500">Use markdown to capture interview tips, study notes, and application research.</p>
                <button
                  type="button"
                  onClick={handleCreateNote}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                  Create Your First Note
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Notes;
