import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { useAuthStore } from './src/store/authStore';
import { LoginScreen } from './src/screens/auth/LoginScreen';

export default function App() {
  const { loadAuthState, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadAuthState();
  }, []);

  if (isLoading) {
    // TODO: Add splash screen
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {/* TODO: Add Navigation */}
        <LoginScreen navigation={{}} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
