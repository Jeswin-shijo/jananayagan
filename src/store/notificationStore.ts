import {create} from 'zustand';
import {Notification} from '@appTypes/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fcmToken: string | null;
  setNotifications: (notifications: Notification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (notification: Notification) => void;
  setFCMToken: (token: string) => void;
}

export const useNotificationStore = create<NotificationState>(set => ({
  notifications: [],
  unreadCount: 0,
  fcmToken: null,

  setNotifications: notifications =>
    set({
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
    }),

  markRead: id =>
    set(state => {
      const updated = state.notifications.map(n =>
        n.id === id ? {...n, isRead: true} : n,
      );
      return {notifications: updated, unreadCount: updated.filter(n => !n.isRead).length};
    }),

  markAllRead: () =>
    set(state => ({
      notifications: state.notifications.map(n => ({...n, isRead: true})),
      unreadCount: 0,
    })),

  addNotification: notification =>
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),

  setFCMToken: fcmToken => set({fcmToken}),
}));
