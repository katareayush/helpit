import React, { useEffect, useState, ReactNode } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthGuardProps {
  children: ReactNode;
  userType: 'customer' | 'service';
  redirectTo: string; 
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, userType, redirectTo }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuthStatus = async (): Promise<void> => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const storedUserRole = await AsyncStorage.getItem('userRole');
        
        if (!token) {
          // No token found, redirect to login
          setIsAuthenticated(false);
          router.replace(redirectTo);
          return;
        }
        
        // Check if user role matches required role for this route
        if (storedUserRole !== userType) {
          setIsAuthenticated(false);
          router.replace(redirectTo);
          return;
        }
        
        // Token exists and role matches - user is authenticated
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        router.replace(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [router, redirectTo, userType]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF9966" />
        <Text style={{ marginTop: 10, color: '#666' }}>Checking authentication...</Text>
      </View>
    );
  }

  // If authenticated, render the children
  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;