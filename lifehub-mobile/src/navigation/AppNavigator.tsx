import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { useAuthStore } from '../store/authStore';

export const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore();

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <MainTabNavigator />
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
};
