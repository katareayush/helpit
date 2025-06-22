import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_BASE_URL;

// Define the booking type
export interface IncomingBooking {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  serviceId: {
    _id: string;
    name: string;
  };
  details: string;
  status: 'PENDING';
  estimatedFare: number;
  createdAt: string;
}

// Define context type
interface BookingContextType {
  incomingBooking: IncomingBooking | null;
  setIncomingBooking: (booking: IncomingBooking) => void;
  clearIncomingBooking: () => void;
  isAvailable: boolean;
  isNotificationOn: boolean;
  isLoadingAvailability: boolean;
  socketConnected: boolean;
  setAvailability: (value: boolean) => Promise<void>;
  setNotifications: (value: boolean) => Promise<void>;
  getSocket: () => Socket | null;
}

// Create context with default values
const BookingContext = createContext<BookingContextType>({
  incomingBooking: null,
  setIncomingBooking: () => {},
  clearIncomingBooking: () => {},
  isAvailable: false,
  isNotificationOn: true,
  isLoadingAvailability: false,
  socketConnected: false,
  setAvailability: async () => {},
  setNotifications: async () => {},
  getSocket: () => null,
});

// Create hook for easier context consumption
export const useBooking = () => useContext(BookingContext);

// Context provider component
export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incomingBooking, setIncomingBooking] = useState<IncomingBooking | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isNotificationOn, setIsNotificationOn] = useState<boolean>(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const lastLocationRef = useRef<{latitude: number, longitude: number} | null>(null);
  const initDoneRef = useRef<boolean>(false);
  
  // Initialize socket connection
  useEffect(() => {
    // Only setup once
    if (initDoneRef.current) return;
    
    setupSocket();
    initDoneRef.current = true;
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketConnected(false);
      }
    };
  }, []);
  
  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const availabilityStorage = await AsyncStorage.getItem('@helpIt:availability');
        const notificationsStorage = await AsyncStorage.getItem('@helpIt:notifications');
        const locationStr = await AsyncStorage.getItem('@helpIt:location');
        
        if (availabilityStorage !== null) {
          setIsAvailable(JSON.parse(availabilityStorage));
        }
        
        if (notificationsStorage !== null) {
          setIsNotificationOn(JSON.parse(notificationsStorage));
        } else {
          // Default to true for notifications if not set
          setIsNotificationOn(true);
        }

        if (locationStr) {
          lastLocationRef.current = JSON.parse(locationStr);
        }
        
        // Fetch profile from server to ensure sync
        await fetchProfileData();
      } catch (error) {
        console.error('Error loading settings from storage:', error);
      }
    };

    loadSettings();
  }, []);

  // Setup socket connection
  const setupSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      // Don't create a new socket if one already exists and is connected
      if (socketRef.current && socketRef.current.connected) {
        console.log('Socket already connected');
        return;
      }
      
      // Clean up existing socket if it exists but is disconnected
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      console.log('Setting up new socket connection');
      const socketInstance = io(SOCKET_URL, {
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        setSocketConnected(true);
        
        // Emit userConnect event on connection
        socketInstance.emit('userConnect');
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
        
        // If server rejects availability change, refresh from server
        if (error.message && (
          error.message.includes("availability") || 
          error.message.includes("active service") || 
          error.message.includes("currently booked")
        )) {
          fetchProfileData(); // Refresh profile to get correct state
          
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.message,
            position: 'bottom'
          });
        }
      });

      // Listen for availability update confirmations from server
      socketInstance.on('availabilityUpdated', (data) => {
        console.log('Availability updated on server:', data);
        
        // Update local state with server response
        if (data.serviceProviderId && data.hasOwnProperty('isAvailable')) {
          setIsAvailable(data.isAvailable);
          AsyncStorage.setItem('@helpIt:availability', JSON.stringify(data.isAvailable));
        }
      });

      // Listen for new booking events
      socketInstance.on('new_booking', (data) => {
        console.log('New booking received:', data);
        
        const booking: IncomingBooking = {
          _id: data.bookingId,
          userId: data.bookingDetails.userId || { _id: '', name: 'Customer' },
          serviceId: data.bookingDetails.serviceId || { _id: '', name: 'Service' },
          details: data.bookingDetails.details || data.details || '',
          status: 'PENDING',
          estimatedFare: data.estimatedFare || 0,
          createdAt: new Date().toISOString()
        };
        
        setIncomingBooking(booking);
      });

      socketRef.current = socketInstance;
    } catch (error) {
      console.error('Socket setup error:', error);
    }
  };

  // Fetch profile data to ensure sync
  const fetchProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/service-provider/self-identification`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.data) {
        const profileData = response.data.data;
        const serverAvailability = profileData.isAvailable || false;
        
        // Update state with server values to ensure sync
        setIsAvailable(serverAvailability);
        setIsNotificationOn(profileData.isNotificationOn !== false);
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('@helpIt:availability', JSON.stringify(serverAvailability));
        await AsyncStorage.setItem('@helpIt:notifications', JSON.stringify(profileData.isNotificationOn !== false));
        
        // If socket is connected and server says we should be available, emit to socket
        if (socketRef.current && socketRef.current.connected && serverAvailability) {
          // Get location and emit availability through socket
          let coordinates = lastLocationRef.current;
          
          if (!coordinates) {
            try {
              const { status } = await Location.getForegroundPermissionsAsync();
              if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Balanced
                });
                
                coordinates = {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude

                  // latitude: 25.35, // Placeholder for testing
                  // longitude: 78.57 // Placeholder for testing
                };
                
                lastLocationRef.current = coordinates;
                await AsyncStorage.setItem('@helpIt:location', JSON.stringify(coordinates));
              }
            } catch (error) {
              console.error('Error getting location during sync:', error);
            }
          }
          
          // Emit to socket to sync with Redis
          socketRef.current.emit('setAvailability', {
            isAvailable: serverAvailability,
            coordinates
          });
        } else if (!socketRef.current || !socketRef.current.connected) {
          // If we should be available but socket isn't connected, try to connect
          if (serverAvailability) {
            setupSocket();
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  // Set a new incoming booking
  const handleSetIncomingBooking = (booking: IncomingBooking) => {
    setIncomingBooking(booking);
  };

  // Clear the current incoming booking
  const clearIncomingBooking = () => {
    setIncomingBooking(null);
  };

  // Update availability status - ONLY through socket now
  const handleSetAvailability = async (value: boolean) => {
    setIsLoadingAvailability(true);
    
    try {
      // Make sure socket is connected
      if (!socketRef.current || !socketRef.current.connected) {
        await setupSocket();
        
        // Wait a bit for socket to connect
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!socketRef.current || !socketRef.current.connected) {
          throw new Error('Failed to establish socket connection');
        }
      }

      let coordinates = null;
      
      // Only get coordinates if availability is being turned ON
      if (value) {
        // Check location permissions
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const permResult = await Location.requestForegroundPermissionsAsync();
          if (permResult.status !== 'granted') {
            throw new Error('Location permission is required to be available');
          }
        }
        
        // Get location - use cached first, then fetch fresh
        coordinates = lastLocationRef.current;
        
        if (!coordinates) {
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced
            });
            
            coordinates = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
              // latitude: 25.35, // Placeholder for testing
              // longitude: 78.57 
            };
            
            // Cache location
            lastLocationRef.current = coordinates;
            await AsyncStorage.setItem('@helpIt:location', JSON.stringify(coordinates));
          } catch (error) {
            console.error('Error getting location:', error);
            throw new Error('Could not determine your location');
          }
        }
      }
      
      // Optimistically update local state for responsive UI
      setIsAvailable(value);
      await AsyncStorage.setItem('@helpIt:availability', JSON.stringify(value));
      
      // Emit through socket ONLY - let server handle database update
      const payload = {
        isAvailable: value,
        ...(value && coordinates ? { coordinates } : {})
      };
      
      console.log('Emitting setAvailability via socket:', payload);
      socketRef.current.emit('setAvailability', payload);
      
    } catch (err) {
      console.error('Error updating availability:', err);
      
      // Revert optimistic update on error
      setIsAvailable(!value);
      await AsyncStorage.setItem('@helpIt:availability', JSON.stringify(!value));
      
      // Get latest state from server to ensure sync
      await fetchProfileData();
      
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err.message || 'Failed to update availability setting.',
        position: 'bottom'
      });
      throw err; // Re-throw for component handling
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  // Update notification settings - keep using REST API since it's not real-time
  const handleSetNotifications = async (value: boolean) => {
    try {
      // Update local state first for responsive UI
      setIsNotificationOn(value);
      await AsyncStorage.setItem('@helpIt:notifications', JSON.stringify(value));
      
      // Update server
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.put(
        `${API_BASE_URL}/service-provider/`,
        { isNotificationOn: value },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (err) {
      console.error('Error updating notifications:', err);
      
      // Revert local state on error
      setIsNotificationOn(!value);
      await AsyncStorage.setItem('@helpIt:notifications', JSON.stringify(!value));
      
      if (err.response && err.response.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please log in again.',
          position: 'bottom',
          visibilityTime: 4000
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: 'Failed to update notification setting.',
          position: 'bottom'
        });
      }
      throw err; // Re-throw for component handling
    }
  };

  // Getter for socket instance
  const getSocket = () => socketRef.current;

  return (
    <BookingContext.Provider
      value={{
        incomingBooking,
        setIncomingBooking: handleSetIncomingBooking,
        clearIncomingBooking,
        isAvailable,
        isNotificationOn,
        isLoadingAvailability,
        socketConnected,
        setAvailability: handleSetAvailability,
        setNotifications: handleSetNotifications,
        getSocket,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};