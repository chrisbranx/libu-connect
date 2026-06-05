import { create } from 'zustand';
import { api } from '../services/api';

const useDirectoryStore = create((set) => ({
  users: [],
  selectedUser: null,
  loading: false,

  fetchDirectory: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/directory${params ? `?${params}` : ''}`);
      set({ users: res.data, loading: false });
    } catch { set({ loading: false }); }
  },

  fetchUser: async (id) => {
    const res = await api.get(`/directory/${id}`);
    set({ selectedUser: res.data });
    return res.data;
  },
}));

export default useDirectoryStore;
