import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FoodItem {
    id: string;
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity: number;
    unit: string;
    imageUrl?: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    date: string; // ISO date string YYYY-MM-DD
}

export interface DailyGoal {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface HealthState {
    dailyLog: Record<string, FoodItem[]>; // Key is date YYYY-MM-DD
    details: DailyGoal;

    // Actions
    addFoodItem: (item: Omit<FoodItem, 'id'>) => void;
    removeFoodItem: (id: string, date: string) => void;
    setDailyGoal: (goal: Partial<DailyGoal>) => void;

    // Selectors
    getTodayLog: () => FoodItem[];
    getTodayStats: () => { calories: number; protein: number; carbs: number; fat: number };
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const useHealthStore = create<HealthState>()(
    persist(
        (set, get) => ({
            dailyLog: {},
            details: {
                calories: 2500,
                protein: 150,
                carbs: 300,
                fat: 80,
            },

            addFoodItem: (item) => set((state) => {
                const today = item.date || getTodayDate();
                const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
                const currentLog = state.dailyLog[today] || [];
                return {
                    dailyLog: {
                        ...state.dailyLog,
                        [today]: [...currentLog, newItem]
                    }
                };
            }),

            removeFoodItem: (id, date) => set((state) => {
                const targetDate = date || getTodayDate();
                const currentLog = state.dailyLog[targetDate] || [];
                return {
                    dailyLog: {
                        ...state.dailyLog,
                        [targetDate]: currentLog.filter(item => item.id !== id)
                    }
                };
            }),

            setDailyGoal: (goal) => set((state) => ({
                details: { ...state.details, ...goal }
            })),

            getTodayLog: () => {
                const today = getTodayDate();
                return get().dailyLog[today] || [];
            },

            getTodayStats: () => {
                const today = getTodayDate();
                const log = get().dailyLog[today] || [];
                return log.reduce((acc, item) => ({
                    calories: acc.calories + item.calories,
                    protein: acc.protein + item.protein,
                    carbs: acc.carbs + item.carbs,
                    fat: acc.fat + item.fat,
                }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
            }
        }),
        {
            name: 'health-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
