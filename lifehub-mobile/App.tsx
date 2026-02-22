import React, { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from './src/store/authStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Toast } from './src/components/common/Toast';
import { notificationService } from './src/services/notification.service';
import { navigationRef } from './src/navigation/navigationRef';
import { useNotificationNavStore } from './src/store/notificationNavStore';
import * as Notifications from 'expo-notifications';

export default function App() {
  const { loadAuthState, isLoading } = useAuthStore();
  const setPendingTaskId = useNotificationNavStore(s => s.setPendingTaskId);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    loadAuthState();

    // Init notifications (channel + permissions)
    notificationService.init();

    // ── Foreground notification received (just show it) ──────────────────────
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // expo-notifications already shows it via setNotificationHandler — nothing to do
    });

    // ── User TAPPED a notification banner ────────────────────────────────────
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      const taskId: string | undefined = data?.taskId;

      if (taskId) {
        // Signal TasksScreen to open this task
        setPendingTaskId(taskId);

        // Navigate to Tasks tab (works whether app was closed or in background)
        if (navigationRef.isReady()) {
          navigationRef.navigate('MainTabs', { screen: 'Tasks' });
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Handle cold-start: app opened by tapping a notification while fully closed
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (!response) return;
      const data = response.notification.request.content.data as any;
      const taskId: string | undefined = data?.taskId;
      if (taskId) {
        setPendingTaskId(taskId);
      }
    });
  }, []);

  if (isLoading) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppNavigator />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
