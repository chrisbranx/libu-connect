import { create } from 'zustand';
import { api } from '../services/api';

const useActivitiesStore = create((set) => ({
  activities: [],
  myActivities: [],
  selectedActivity: null,
  loading: false,

  fetchActivities: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/activities${params ? `?${params}` : ''}`);
      set({ activities: res.data, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchMyActivities: async () => {
    try {
      const res = await api.get('/activities/mine');
      set({ myActivities: res.data });
    } catch {}
  },

  fetchActivity: async (id) => {
    const res = await api.get(`/activities/${id}`);
    set({ selectedActivity: res.data });
    return res.data;
  },

  createActivity: async (data) => {
    const res = await api.post('/activities', data);
    set((state) => ({ activities: [res.data, ...state.activities] }));
    return res.data;
  },

  joinActivity: async (id) => {
    const res = await api.post(`/activities/${id}/join`);
    return res.data;
  },

  leaveActivity: async (id) => {
    await api.delete(`/activities/${id}/leave`);
  },
}));

export default useActivitiesStore;
