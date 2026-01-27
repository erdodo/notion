import { create } from 'zustand';

import { persist } from './middleware/persistence';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message?: string;
  pageId?: string;
  commentId?: string;
  actorId?: string;
  actorName?: string;
  actorImage?: string;
  read: boolean;
  readAt?: Date | string | null;
  createdAt: Date | string;
  _optimistic?: boolean;
}

interface NotificationsStore {
  notifications: Notification[];
  unreadCount: number;

  getNotifications: () => Notification[];
  getUnreadNotifications: () => Notification[];
  getUnreadCount: () => number;

  setNotifications: (notifications: Notification[]) => void;

  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: () => void;

  handleNewNotification: (notification: Notification) => void;
  handleNotificationRead: (notificationId: string) => void;
}

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      getNotifications: () => {
        return get().notifications;
      },

      getUnreadNotifications: () => {
        return get().notifications.filter((n) => !n.read);
      },

      getUnreadCount: () => {
        return get().unreadCount;
      },

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter((n) => !n.read).length;
        set({ notifications, unreadCount });
      },

      addNotification: (notification) => {
        set((state) => {
          if (state.notifications.find((n) => n.id === notification.id)) {
            return state;
          }
          return {
            notifications: [notification, ...state.notifications],
            unreadCount: notification.read
              ? state.unreadCount
              : state.unreadCount + 1,
          };
        });
      },

      markAsRead: (notificationId) => {
        set((state) => {
          const notification = state.notifications.find(
            (n) => n.id === notificationId
          );
          if (!notification || notification.read) {
            return state;
          }

          return {
            notifications: state.notifications.map((n) =>
              n.id === notificationId
                ? { ...n, read: true, readAt: new Date().toISOString() }
                : n
            ),
            unreadCount: state.unreadCount - 1,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
            readAt: n.read ? n.readAt : new Date().toISOString(),
          })),
          unreadCount: 0,
        }));
      },

      deleteNotification: (notificationId) => {
        set((state) => {
          const notification = state.notifications.find(
            (n) => n.id === notificationId
          );
          const wasUnread = notification && !notification.read;

          return {
            notifications: state.notifications.filter(
              (n) => n.id !== notificationId
            ),
            unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      handleNewNotification: (notification) => {
        get().addNotification(notification);

        if (
          globalThis.window !== undefined &&
          'Notification' in globalThis &&
          Notification.permission === 'granted'
        ) {
          new Notification(notification.title, {
            body: notification.message,
            icon: notification.actorImage,
            tag: notification.id,
          });
        }
      },

      handleNotificationRead: (notificationId) => {
        get().markAsRead(notificationId);
      },
    }),
    {
      name: 'notifications-store',
      partialize: (state) => ({
        notifications: state.notifications.filter((n) => !n._optimistic),
        unreadCount: state.unreadCount,
      }),
      version: 1,
    }
  )
);
