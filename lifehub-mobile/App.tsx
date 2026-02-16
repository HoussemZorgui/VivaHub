import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { useAuthStore } from './src/store/authStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Toast } from './src/components/common/Toast';

export default function App() {
  const { loadAuthState, isLoading } = useAuthStore();

  useEffect(() => {
    loadAuthState();
  }, []);

  if (isLoading) {
    return null;
  }

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
  container: {
    flex: 1,
  },
});
