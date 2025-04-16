import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import "@/global.css";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Set up a simple context for global auth state
import React from 'react';

// Initialize auth state context
export const AuthContext = React.createContext({
  isAuthenticated: false,
  userRole: '',
  setAuthState: (isAuth: boolean, role: string) => {}
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  // Add auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  
  // Setup auth state handler
  const setAuthState = (isAuth: boolean, role: string) => {
    console.log('Setting auth state:', isAuth, role);
    setIsAuthenticated(isAuth);
    setUserRole(role);
    
    // Set default auth header for axios when authenticated
    if (isAuth) {
      AsyncStorage.getItem('accessToken').then(token => {
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      });
    } else {
      axios.defaults.headers.common['Authorization'] = '';
    }
  };

  // Check auth state on initial load
  useEffect(() => {
    const checkAuthOnLoad = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const role = await AsyncStorage.getItem('userRole');
        
        if (token && role) {
          setAuthState(true, role);
        }
      } catch (error) {
        console.error('Error checking auth on load:', error);
      }
    };
    
    checkAuthOnLoad();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, setAuthState }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Update these to match your actual routes */}
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(service)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="_sitemap" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}