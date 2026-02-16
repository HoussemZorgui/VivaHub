import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
    visible: boolean;
    message: string;
    type: ToastType;
    showToast: (message: string, type?: ToastType) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    visible: false,
    message: '',
    type: 'info',
    showToast: (message, type = 'info') => {
        set({ visible: true, message, type });
        // Auto-hide after 3.5 seconds
        setTimeout(() => {
            set({ visible: false });
        }, 3500);
    },
    hideToast: () => set({ visible: false }),
}));
