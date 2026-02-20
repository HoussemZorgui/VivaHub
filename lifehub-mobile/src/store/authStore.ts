import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { User } from '../services/auth.service';

export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setTokens: (token: string, refreshToken: string) => Promise<void>;
    login: (user: User, token: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<User>) => void;
    loadAuthState: () => Promise<void>;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => {
        set({ user, isAuthenticated: !!user });
    },

    setTokens: async (token, refreshToken) => {
        try {
            await AsyncStorage.multiSet([
                ['@lifehub:token', token],
                ['@lifehub:refreshToken', refreshToken],
            ]);
            set({ token, refreshToken });
        } catch (error) {
            console.error('Error saving tokens:', error);
        }
    },

    login: async (user, token, refreshToken) => {
        try {
            await AsyncStorage.multiSet([
                ['@lifehub:token', token],
                ['@lifehub:refreshToken', refreshToken],
                ['@lifehub:user', JSON.stringify(user)],
            ]);

            set({
                user,
                token,
                refreshToken,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error during login:', error);
        }
    },

    logout: async () => {
        try {
            // Call backend logout to invalidate session in Redis
            try {
                const token = get().token;
                if (token) {
                    await authService.logout();
                }
            } catch (err) {
                console.warn('Backend logout failed, proceeding with local logout');
            }

            await AsyncStorage.multiRemove([
                '@lifehub:token',
                '@lifehub:refreshToken',
                '@lifehub:user',
            ]);

            set({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    },

    updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            set({ user: updatedUser });
            AsyncStorage.setItem('@lifehub:user', JSON.stringify(updatedUser));
        }
    },

    loadAuthState: async () => {
        try {
            set({ isLoading: true });

            const [token, refreshToken, userJson] = await AsyncStorage.multiGet([
                '@lifehub:token',
                '@lifehub:refreshToken',
                '@lifehub:user',
            ]);

            const tokenValue = token[1];
            const refreshTokenValue = refreshToken[1];
            const userValue = userJson[1];

            if (tokenValue && refreshTokenValue && userValue) {
                const user = JSON.parse(userValue) as User;
                set({
                    user,
                    token: tokenValue,
                    refreshToken: refreshTokenValue,
                    isAuthenticated: true,
                });
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    setLoading: (loading) => {
        set({ isLoading: loading });
    },
}));

export default useAuthStore;
