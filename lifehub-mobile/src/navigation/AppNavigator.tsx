import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { useAuthStore } from '../store/authStore';
import { ProfileScreen } from '../screens/settings/ProfileScreen';
import { EditProfileScreen } from '../screens/settings/EditProfileScreen';
import { AIScreen } from '../screens/ai/AIScreen';
import { FoodSearchScreen } from '../screens/health/FoodSearchScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore();

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                    <Stack.Screen name="AI" component={AIScreen} />
                    <Stack.Screen name="FoodSearch" component={FoodSearchScreen} />
                </Stack.Navigator>
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
};
