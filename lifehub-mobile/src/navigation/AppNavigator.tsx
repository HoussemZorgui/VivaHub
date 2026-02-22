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
import { NewsScreen } from '../screens/media/NewsScreen';
import { CurrencyConverterScreen } from '../screens/finance/CurrencyConverterScreen';
import { HealthTrackerScreen } from '../screens/health/HealthTrackerScreen';
import { PomodoroScreen } from '../screens/productivity/PomodoroScreen';
import { CryptoMarketScreen } from '../screens/finance/CryptoMarketScreen';
import { TransactionsScreen } from '../screens/finance/TransactionsScreen';
import { navigationRef } from './navigationRef';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    const { isAuthenticated } = useAuthStore();

    return (
        <NavigationContainer ref={navigationRef}>
            {isAuthenticated ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                    <Stack.Screen name="AI" component={AIScreen} />
                    <Stack.Screen name="FoodSearch" component={FoodSearchScreen} />
                    <Stack.Screen name="News" component={NewsScreen} />
                    <Stack.Screen name="CurrencyConverter" component={CurrencyConverterScreen} />
                    <Stack.Screen name="HealthTracker" component={HealthTrackerScreen} />
                    <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
                    <Stack.Screen name="CryptoMarket" component={CryptoMarketScreen} />
                    <Stack.Screen name="Transactions" component={TransactionsScreen} />
                </Stack.Navigator>
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
};
