import { create } from 'zustand';

interface NotificationNavState {
    pendingTaskId: string | null;
    setPendingTaskId: (id: string | null) => void;
}

/**
 * Holds the taskId that should be opened when TasksScreen mounts
 * or when a notification tap is detected while the screen is already visible.
 */
export const useNotificationNavStore = create<NotificationNavState>((set) => ({
    pendingTaskId: null,
    setPendingTaskId: (id) => set({ pendingTaskId: id }),
}));
