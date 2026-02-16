import { create } from 'zustand';

export interface AppState {
    // Theme
    theme: 'light' | 'dark' | 'auto';
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;

    // Language
    language: string;
    setLanguage: (language: string) => void;

    // Network status
    isOnline: boolean;
    setOnline: (online: boolean) => void;

    // Notification badge
    notificationCount: number;
    setNotificationCount: (count: number) => void;
    incrementNotificationCount: () => void;

    // Loading states
    isGlobalLoading: boolean;
    setGlobalLoading: (loading: boolean) => void;

    // Modal/Bottom sheet state
    activeModal: string | null;
    setActiveModal: (modal: string | null) => void;

    // Onboarding
    hasCompletedOnboarding: boolean;
    setHasCompletedOnboarding: (completed: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Theme
    theme: 'auto',
    setTheme: (theme) => set({ theme }),

    // Language
    language: 'en',
    setLanguage: (language) => set({ language }),

    // Network
    isOnline: true,
    setOnline: (isOnline) => set({ isOnline }),

    // Notifications
    notificationCount: 0,
    setNotificationCount: (notificationCount) => set({ notificationCount }),
    incrementNotificationCount: () =>
        set((state) => ({ notificationCount: state.notificationCount + 1 })),

    // Loading
    isGlobalLoading: false,
    setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

    // Modal
    activeModal: null,
    setActiveModal: (activeModal) => set({ activeModal }),

    // Onboarding
    hasCompletedOnboarding: false,
    setHasCompletedOnboarding: (hasCompletedOnboarding) =>
        set({ hasCompletedOnboarding }),
}));

export default useAppStore;
