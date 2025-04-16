import React, { useContext, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthContext } from '../_layout';

// Layout for authentication routes (login, signup)
export default function AuthLayout() {
  const { isAuthenticated, userRole } = useContext(AuthContext);
  const router = useRouter();

  // If already authenticated, redirect to the appropriate home screen
  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'customer') {
        router.replace('/(customer)/HomeScreen');
      } else if (userRole === 'service') {
        router.replace('/(service)/ProfileScreen');
      }
    }
  }, [isAuthenticated, userRole, router]);

  return (
    <Stack>
      <Stack.Screen name="login-selection" options={{ headerShown: false }} />
      <Stack.Screen name="Welcome_screen" options={{ headerShown: false }} />
      <Stack.Screen name="SignupScreenC" options={{ headerShown: false }} />
      <Stack.Screen name="signInC" options={{ headerShown: false }} />
      <Stack.Screen name="SignInService" options={{ headerShown: false }} />
    </Stack>
  );
}