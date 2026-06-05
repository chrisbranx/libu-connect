import { create } from 'zustand';
import { api } from '../services/api';

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/notifications');
      const notifications = res.data;
      set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length, loading: false });
    } catch { set({ loading: false }); }
  },

  markAsRead: async (id) => {
    await api.put(`/notifications/${id}`);
    set((state) => {
      const notifications = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
    });
  },

  markAllAsRead: async () => {
    await api.put('/notifications/read-all');
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
  })),
}));

export default useNotificationStore;
