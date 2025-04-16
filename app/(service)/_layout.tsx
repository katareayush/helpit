import React, { useContext, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../_layout';

// Layout for service provider protected routes
export default function ServiceProviderLayout() {
  const { isAuthenticated, userRole, setAuthState } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  // Verify service provider authentication and role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const storedRole = await AsyncStorage.getItem('userRole');
        
        setIsLoading(true);
        
        if (!token || storedRole !== 'service') {
          // Not authenticated or wrong role, redirect to login
          setAuthState(false, '');
          router.replace('/SignInService');
          return;
        }
        
        // Check token validity if needed
        // This would be a good place to verify with your backend
        // that the token is still valid
        
        // Set auth state
        setAuthState(true, 'service');
      } catch (error) {
        console.error('Auth check error:', error);
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

  // If not authenticated or wrong role, don't render anything
  // The redirection will happen in the useEffect
  if (!isAuthenticated || userRole !== 'service') {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" />
      <Stack.Screen name="DriverDashboard" />
    </Stack>
  );
}