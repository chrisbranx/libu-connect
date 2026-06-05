import { create } from 'zustand';
import { api } from '../services/api';

const useAcademicStore = create((set) => ({
  grades: [],
  summary: null,
  semesters: [],
  loading: false,

  fetchGrades: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/grades');
      set({ grades: res.data, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchSummary: async () => {
    try {
      const res = await api.get('/grades/summary');
      set({ summary: res.data });
    } catch {}
  },

  fetchSemesters: async () => {
    try {
      const res = await api.get('/grades/semesters');
      set({ semesters: res.data });
    } catch {}
  },

  addGrade: async (data) => {
    const res = await api.post('/grades', data);
    set((state) => ({ grades: [...state.grades, res.data] }));
    return res.data;
  },

  updateGrade: async (id, data) => {
    const res = await api.put(`/grades/${id}`, data);
    set((state) => ({ grades: state.grades.map((g) => (g.id === id ? res.data : g)) }));
    return res.data;
  },

  deleteGrade: async (id) => {
    await api.delete(`/grades/${id}`);
    set((state) => ({ grades: state.grades.filter((g) => g.id !== id) }));
  },
}));

export default useAcademicStore;
