import { create } from 'zustand';
import { api } from '../services/api';

const useScheduleStore = create((set) => ({
  schedules: [],
  upcoming: [],
  loading: false,

  fetchSchedules: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/schedules${params ? `?${params}` : ''}`);
      set({ schedules: res.data, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchUpcoming: async () => {
    try {
      const res = await api.get('/schedules/upcoming');
      set({ upcoming: res.data });
    } catch {}
  },

  createSchedule: async (data) => {
    const res = await api.post('/schedules', data);
    set((state) => ({ schedules: [...state.schedules, res.data] }));
    return res.data;
  },

  updateSchedule: async (id, data) => {
    const res = await api.put(`/schedules/${id}`, data);
    set((state) => ({ schedules: state.schedules.map((s) => (s.id === id ? res.data : s)) }));
    return res.data;
  },

  deleteSchedule: async (id) => {
    await api.delete(`/schedules/${id}`);
    set((state) => ({ schedules: state.schedules.filter((s) => s.id !== id) }));
  },
}));

export default useScheduleStore;
