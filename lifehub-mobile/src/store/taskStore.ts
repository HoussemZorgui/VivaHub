import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notification.service';

export interface Task {
    id: string;
    title: string;
    category: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    reminder: boolean;
    reminderDate?: string; // ISO string
    notificationId?: string;
}

export interface TaskState {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
    toggleTask: (id: string) => void;
    toggleReminder: (id: string) => Promise<void>;
    removeTask: (id: string) => Promise<void>;
    reorderTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: [],

            reorderTasks: (tasks) => set({ tasks }),

            addTask: async (task) => {
                const id = Math.random().toString(36).substr(2, 9);
                let notificationId: string | undefined;

                if (task.reminder && task.reminderDate) {
                    const scheduledId = await notificationService.scheduleTaskReminder(
                        id,
                        task.title,
                        new Date(task.reminderDate)
                    );
                    if (scheduledId) notificationId = scheduledId;
                }

                set((state) => ({
                    tasks: [...state.tasks, { ...task, id, completed: false, notificationId }]
                }));
            },

            toggleTask: (id) => set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
            })),

            toggleReminder: async (id) => {
                const tasks = get().tasks;
                const task = tasks.find(t => t.id === id);
                if (!task) return;

                let newNotificationId = task.notificationId;

                if (task.reminder && task.notificationId) {
                    // Cancel existing
                    await notificationService.cancelNotification(task.notificationId);
                    newNotificationId = undefined;
                } else if (!task.reminder && task.reminderDate) {
                    // Enable reminder
                    const scheduledId = await notificationService.scheduleTaskReminder(
                        id,
                        task.title,
                        new Date(task.reminderDate)
                    );
                    if (scheduledId) newNotificationId = scheduledId;
                }

                set((state) => ({
                    tasks: state.tasks.map(t =>
                        t.id === id ? { ...t, reminder: !t.reminder, notificationId: newNotificationId } : t
                    )
                }));
            },

            removeTask: async (id) => {
                const task = get().tasks.find(t => t.id === id);
                if (task?.notificationId) {
                    await notificationService.cancelNotification(task.notificationId);
                }
                set((state) => ({
                    tasks: state.tasks.filter(t => t.id !== id)
                }));
            },
        }),
        {
            name: 'task-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
