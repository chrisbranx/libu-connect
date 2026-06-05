import { create } from 'zustand';
import { api } from '../services/api';

const useNotesStore = create((set) => ({
  notes: [],
  sharedNotes: [],
  selectedNote: null,
  loading: false,

  fetchNotes: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/notes${params ? `?${params}` : ''}`);
      set({ notes: res.data, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchSharedNotes: async () => {
    try {
      const res = await api.get('/notes/shared');
      set({ sharedNotes: res.data });
    } catch {}
  },

  fetchNote: async (id) => {
    const res = await api.get(`/notes/${id}`);
    set({ selectedNote: res.data });
    return res.data;
  },

  createNote: async (data) => {
    const res = await api.post('/notes', data);
    set((state) => ({ notes: [res.data, ...state.notes] }));
    return res.data;
  },

  updateNote: async (id, data) => {
    const res = await api.put(`/notes/${id}`, data);
    set((state) => ({ notes: state.notes.map((n) => (n.id === id ? res.data : n)), selectedNote: res.data }));
    return res.data;
  },

  deleteNote: async (id) => {
    await api.delete(`/notes/${id}`);
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id), selectedNote: null }));
  },

  togglePin: async (id) => {
    const res = await api.post(`/notes/${id}/pin`);
    set((state) => ({ notes: state.notes.map((n) => (n.id === id ? res.data : n)) }));
    return res.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload('/notes/upload', formData);
  },
}));

export default useNotesStore;
