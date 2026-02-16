import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

// Temporary Screen Placeholders with premium style
import { HomeScreen } from '../screens/HomeScreen';
import { TasksScreen } from '../screens/productivity/TasksScreen';
import { FinanceScreen } from '../screens/finance/FinanceScreen';
import { HealthScreen } from '../screens/health/HealthScreen';
import { ProfileScreen } from '../screens/settings/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Tasks') iconName = focused ? 'list' : 'list-outline';
                    else if (route.name === 'Finance') iconName = focused ? 'wallet' : 'wallet-outline';
                    else if (route.name === 'Health') iconName = focused ? 'heart' : 'heart-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary[400],
                tabBarInactiveTintColor: theme.colors.text.muted,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 25,
                    left: 20,
                    right: 20,
                    paddingBottom: 10,
                    paddingTop: 10,
                    height: 70,
                    borderRadius: 24,
                    borderTopWidth: 0,
                    backgroundColor: 'rgba(18, 18, 18, 0.9)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                    ...theme.shadows.premium,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                }
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
            <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tâches' }} />
            <Tab.Screen name="Finance" component={FinanceScreen} options={{ title: 'Finance' }} />
            <Tab.Screen name="Health" component={HealthScreen} options={{ title: 'Santé' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
        </Tab.Navigator>
    );
};
