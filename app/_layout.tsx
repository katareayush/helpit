import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import 'react-native-reanimated';
import "@/global.css";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { View, Text, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

import React from 'react';

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
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const setAuthState = (isAuth: boolean, role: string) => {
    console.log('Setting auth state:', isAuth, role);
    setIsAuthenticated(isAuth);
    setUserRole(role);
    
    if (isAuth) {
      AsyncStorage.getItem('accessToken').then(token => {
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Set axios auth header');
        }
      });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('Cleared axios auth header');
    }
  };

  useEffect(() => {
    const checkAuthOnLoad = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        const role = await AsyncStorage.getItem('userRole');
        
        console.log('Auth check on load:', { hasToken: !!token, role });
        
        if (token && role) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          setAuthState(true, role);
        }
      } catch (error) {
        console.error('Error checking auth on load:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthOnLoad();
  }, []);

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          console.log('Token expired or invalid, logging out');
          
          await AsyncStorage.multiRemove(['accessToken', 'userRole', 'userData']);
          
          setAuthState(false, '');
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (loaded && !isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  if (!loaded) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF9966" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, setAuthState }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
        </View>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}