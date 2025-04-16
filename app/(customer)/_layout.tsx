import React, { useContext, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../_layout';

export default function CustomerLayout() {
  const { isAuthenticated, userRole, setAuthState } = useContext(AuthContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("CustomerLayout: Checking authentication");
        const token = await AsyncStorage.getItem('accessToken');
        const storedRole = await AsyncStorage.getItem('userRole');
        
        console.log("CustomerLayout: Token exists:", !!token, "Role:", storedRole);
        setIsLoading(true);
        
        if (!token || (storedRole !== 'customer' && storedRole !== 'USER')) {
            console.log("CustomerLayout: Auth check failed, redirecting to login");
            setAuthState(false, '');
            router.replace('/(auth)/SignInScreen');
            return;
          }
        
        console.log("CustomerLayout: Auth check passed, setting state");
        setAuthState(true, 'customer');
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/(auth)/SignInScreen');
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

  if (!isAuthenticated || userRole !== 'customer') {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" />
      <Stack.Screen name="ProfileScreenCustomer" />
      <Stack.Screen name="MyBookingScreen" />
      <Stack.Screen name="PaymentsScreen" />
      <Stack.Screen name="DriverServiceScreen" />
      <Stack.Screen name="CleaningServiceListScreen" />
      <Stack.Screen name="CleaningServiceBookingScreen" />
      <Stack.Screen name="HelperServiceScreen" />
    </Stack>
  );
}