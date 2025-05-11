import React, { useState, useEffect } from 'react';
import { Slot } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import our new BookingContext provider
import { BookingProvider } from '../../components/BookingContext';

// Your existing AuthContext (unchanged)
export const AuthContext = React.createContext({
  authState: false,
  userRole: '',
  setAuthState: (auth: boolean, role: string) => {},
});

export default function Layout() {
  const [authState, setAuth] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('');
  
  const setAuthState = (auth: boolean, role: string) => {
    setAuth(auth);
    setUserRole(role);
  };

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userRole = await AsyncStorage.getItem('userRole');
      if (token) {
        setAuthState(true, userRole || '');
      }
    } catch (err) {
      console.error('Failed to load auth state:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, userRole, setAuthState }}>
      <BookingProvider>
        <Slot />
      </BookingProvider>
    </AuthContext.Provider>
  );
}