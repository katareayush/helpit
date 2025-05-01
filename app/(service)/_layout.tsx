import React, { useContext, useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../_layout';

export default function ServiceProviderLayout() {
  const { isAuthenticated, userRole, setAuthState } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        const storedRole = await AsyncStorage.getItem('userRole');
        
        console.log('ServiceProviderLayout auth check:', { hasToken: !!token, storedRole });
        
        if (!token || storedRole !== 'service') {
          console.log('Auth failed in service layout, redirecting to sign in');
          
          await AsyncStorage.multiRemove(['accessToken', 'userRole', 'userData']);
          
          setAuthState(false, '');
          
          router.replace('/SignInService');
          return;
        }
        
        setAuthState(true, 'service');
      } catch (error) {
        console.error('Auth check error in service layout:', error);
        router.replace('/SignInService');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF9966" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated || userRole !== 'service') {
    return null;
  }

  // Your existing Stack component here
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" />
      <Stack.Screen name="Dashboard" />
    </Stack>
  );
}

