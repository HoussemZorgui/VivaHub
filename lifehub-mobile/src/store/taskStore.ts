import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService, ReminderLeadTime, DEFAULT_LEAD_TIMES } from '../services/notification.service';

// Re-export so consumers can import from one place
export type { ReminderLeadTime };
export { DEFAULT_LEAD_TIMES };

export interface SubTask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    category: string;
    status: 'todo' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reminder: boolean;
    reminderDate?: string;          // ISO string — the DUE date/time
    leadTimes: ReminderLeadTime[];  // when to fire notifications (before due)
    notificationIds: string[];      // all scheduled notification IDs for this task
    subtasks: SubTask[];
    tags: string[];
    createdAt: string;
}

export interface TaskState {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'notificationIds'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    toggleTask: (id: string) => void;
    removeTask: (id: string) => Promise<void>;
    reorderTasks: (tasks: Task[]) => void;
    addSubTask: (taskId: string, title: string) => void;
    toggleSubTask: (taskId: string, subTaskId: string) => void;
    updateLeadTimes: (taskId: string, leadTimes: ReminderLeadTime[]) => Promise<void>;
    // kept for compat
    toggleReminder: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: [],

            reorderTasks: (reorderedSubset) => set((state) => {
                const newTasks = [...state.tasks];
                const indices = reorderedSubset
                    .map(nt => state.tasks.findIndex(t => t.id === nt.id))
                    .filter(idx => idx !== -1)
                    .sort((a, b) => a - b);

                if (indices.length !== reorderedSubset.length) return state;

                indices.forEach((originalIdx, i) => {
                    newTasks[originalIdx] = reorderedSubset[i];
                });

                return { tasks: newTasks };
            }),

            addTask: async (task) => {
                const id = Math.random().toString(36).substr(2, 9);
                let notificationIds: string[] = [];

                if (task.reminder && task.reminderDate && task.status !== 'completed') {
                    notificationIds = await notificationService.scheduleTaskReminders(
                        id,
                        task.title,
                        new Date(task.reminderDate),
                        task.leadTimes?.length ? task.leadTimes : DEFAULT_LEAD_TIMES,
                        task.priority,
                        task.category
                    );
                }

                set((state) => ({
                    tasks: [
                        {
                            ...task,
                            id,
                            status: task.status || 'todo',
                            createdAt: new Date().toISOString(),
                            notificationIds,
                            leadTimes: task.leadTimes?.length ? task.leadTimes : DEFAULT_LEAD_TIMES,
                            subtasks: task.subtasks || [],
                            tags: task.tags || [],
                        },
                        ...state.tasks,
                    ],
                }));
            },

            updateTask: async (id, updates) => {
                const state = get();
                const task = state.tasks.find((t) => t.id === id);
                if (!task) return;

                let newNotificationIds = [...(task.notificationIds || [])];

                const reminderChanged = updates.reminderDate && updates.reminderDate !== task.reminderDate;
                const titleChanged = updates.title && updates.title !== task.title;
                const leadTimesChanged = updates.leadTimes && JSON.stringify(updates.leadTimes) !== JSON.stringify(task.leadTimes);
                const reminderToggled = updates.reminder !== undefined && updates.reminder !== task.reminder;
                const statusChanged = updates.status !== undefined && updates.status !== task.status;

                const isCompleted = (updates.status || task.status) === 'completed';

                // If task is being marked as completed → cancel all notifications
                if (statusChanged && updates.status === 'completed') {
                    if (newNotificationIds.length > 0) {
                        await notificationService.cancelNotifications(newNotificationIds);
                        newNotificationIds = [];
                    }
                }
                // If task is being marked as NOT completed → maybe reschedule if reminder is on
                else if ((statusChanged && updates.status !== 'completed' && (updates.reminder ?? task.reminder)) ||
                    (!isCompleted && (reminderChanged || titleChanged || leadTimesChanged || (reminderToggled && updates.reminder === true)))) {

                    // Cancel old
                    if (newNotificationIds.length > 0) {
                        await notificationService.cancelNotifications(newNotificationIds);
                    }

                    const finalReminder = updates.reminder !== undefined ? updates.reminder : task.reminder;
                    const finalDate = updates.reminderDate || task.reminderDate;

                    if (finalReminder && finalDate) {
                        const newLeadTimes = updates.leadTimes || task.leadTimes || DEFAULT_LEAD_TIMES;
                        newNotificationIds = await notificationService.scheduleTaskReminders(
                            id,
                            updates.title || task.title,
                            new Date(finalDate),
                            newLeadTimes,
                            updates.priority || task.priority,
                            updates.category || task.category
                        );
                    } else {
                        newNotificationIds = [];
                    }
                } else if (!isCompleted && reminderToggled && updates.reminder === false) {
                    await notificationService.cancelNotifications(newNotificationIds);
                    newNotificationIds = [];
                }

                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, ...updates, notificationIds: newNotificationIds } : t
                    ),
                }));
            },

            toggleTask: async (id) => {
                const task = get().tasks.find(t => t.id === id);
                if (!task) return;
                const newStatus = task.status === 'completed' ? 'todo' : 'completed';
                await get().updateTask(id, { status: newStatus });
            },

            toggleReminder: async (id) => {
                const task = get().tasks.find((t) => t.id === id);
                if (!task) return;
                await get().updateTask(id, { reminder: !task.reminder });
            },

            removeTask: async (id) => {
                const task = get().tasks.find((t) => t.id === id);
                if (task?.notificationIds?.length) {
                    await notificationService.cancelNotifications(task.notificationIds);
                }
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                }));
            },

            updateLeadTimes: async (taskId, leadTimes) => {
                await get().updateTask(taskId, { leadTimes });
            },

            addSubTask: (taskId, title) =>
                set((state) => ({
                    tasks: state.tasks.map((t) => {
                        if (t.id === taskId) {
                            return {
                                ...t,
                                subtasks: [
                                    ...t.subtasks,
                                    {
                                        id: Math.random().toString(36).substr(2, 5),
                                        title,
                                        completed: false,
                                    },
                                ],
                            };
                        }
                        return t;
                    }),
                })),

            toggleSubTask: (taskId, subTaskId) =>
                set((state) => ({
                    tasks: state.tasks.map((t) => {
                        if (t.id === taskId) {
                            return {
                                ...t,
                                subtasks: t.subtasks.map((st) =>
                                    st.id === subTaskId ? { ...st, completed: !st.completed } : st
                                ),
                            };
                        }
                        return t;
                    }),
                })),
        }),
        {
            name: 'task-storage-v2',       // v2 → forces a clean migration from old format
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                // Migrate old tasks that don't have notificationIds / leadTimes
                if (state) {
                    state.tasks = state.tasks.map((t: any) => ({
                        ...t,
                        notificationIds: t.notificationIds ?? (t.notificationId ? [t.notificationId] : []),
                        leadTimes: t.leadTimes ?? DEFAULT_LEAD_TIMES,
                    }));
                }
            },
        }
    )
);
