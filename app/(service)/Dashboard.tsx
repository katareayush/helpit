import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  Platform,
  Vibration
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { AuthContext } from '../_layout';
import { API_BASE_URL } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { Audio } from 'expo-av';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_BASE_URL;

interface Booking {
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
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  estimatedFare: number;
  createdAt: string;
}

interface ServiceGroup {
  service: {
    _id: string;
    name: string;
    isActive: boolean;
  };
  bookingData: Booking[];
}

interface ProfileData {
  name: string;
  isAvailable: boolean;
  isNotificationOn: boolean;
  phoneNumber: string;
  currentLocation?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { setAuthState } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [acceptedBookings, setAcceptedBookings] = useState<Booking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Service Provider',
    isAvailable: false,
    isNotificationOn: true,
    phoneNumber: ''
  });

  // Request location permissions when component mounts
  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (!isMounted) return;
        
        if (status !== 'granted') {
          setLocationPermission(false);
          Alert.alert(
            'Location Permission Required',
            'Please enable location services to receive bookings near you.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        setLocationPermission(true);
        await updateLocationOnServer();
        
        // Start location tracking if available
        if (profile.isAvailable) {
          startLocationTracking();
        }
      } catch (err) {
        console.error('Error requesting location permissions:', err);
      }
    })();
    
    // Cleanup interval on unmount
    return () => {
      isMounted = false;
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
        locationUpdateInterval.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // Unload sound
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const setupSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token || !isMounted) return;
        
        // Disconnect existing socket if any
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        
        // Create new socket connection
        socketRef.current = io(SOCKET_URL, {
          query: { token },
          transports: ['websocket', 'polling']
        });
        
        // Socket connection events
        socketRef.current.on('connect', () => {
          console.log('Socket connected', socketRef.current?.id);
          
          // Register as service provider
          socketRef.current?.emit('setAvailability', {
            isAvailable: profile.isAvailable,
            coordinates: profile.currentLocation ? {
              latitude: profile.currentLocation.coordinates[1],
              longitude: profile.currentLocation.coordinates[0]
            } : undefined
          });
        });
        
        // Listen for new bookings
        socketRef.current.on('new_booking', (data) => {
          if (!isMounted) return;
          
          console.log('New booking received:', data);
          playNotificationSound();
          Vibration.vibrate([500, 100, 500]);
          
          // Add the new booking to pending bookings
          setPendingBookings(prevBookings => {
            // Check if booking already exists
            const exists = prevBookings.some(booking => booking._id === data.bookingId);
            if (!exists) {
              const newBooking: Booking = {
                _id: data.bookingId,
                userId: data.bookingDetails.userId || { _id: '', name: 'Customer' },
                serviceId: data.bookingDetails.serviceId || { _id: '', name: 'Service' },
                details: data.bookingDetails.details || data.details || '',
                status: 'PENDING',
                estimatedFare: data.estimatedFare || 0,
                createdAt: new Date().toISOString()
              };
              
              // Show alert for new booking
              Alert.alert(
                'New Booking Request',
                `You have a new booking request for ${newBooking.serviceId.name}`,
                [
                  { text: 'View', onPress: () => setActiveTab('pending') },
                  { text: 'Dismiss' }
                ]
              );
              
              return [newBooking, ...prevBookings];
            }
            return prevBookings;
          });
        });
        
        // Listen for booking removals (when another SP accepts it)
        socketRef.current.on('booking_removed', (data) => {
          if (!isMounted) return;
          
          console.log('Booking removed:', data);
          setPendingBookings(prevBookings => 
            prevBookings.filter(booking => booking._id !== data.bookingId)
          );
        });
        
        // Listen for booking cancellations by user
        socketRef.current.on('booking_cancel_by_user', (data) => {
          if (!isMounted) return;
          
          console.log('Booking cancelled by user:', data);
          Alert.alert('Booking Cancelled', 'User has cancelled the booking');
          
          // Move from accepted to cancelled (we don't show cancelled, so remove)
          setAcceptedBookings(prevBookings => 
            prevBookings.filter(booking => booking._id !== data.bookingId)
          );
          
          // Refresh bookings to ensure UI is updated
          fetchBookings();
        });
        
        socketRef.current.on('error', (error) => {
          console.error('Socket error:', error);
        });
        
        socketRef.current.on('disconnect', () => {
          console.log('Socket disconnected');
        });
      } catch (error) {
        console.error('Socket setup error:', error);
      }
    };
    
    setupSocket();
    
    return () => {
      isMounted = false;
      // Socket cleanup handled in main useEffect
    };
  }, [profile.isAvailable]);

  // Load and play notification sound
  const playNotificationSound = async () => {
    try {
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Load new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/notification.mp3')
      );
      
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Start or stop location tracking when availability changes
  useEffect(() => {
    if (profile.isAvailable && locationPermission) {
      startLocationTracking();
      
      // Update socket availability status
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('setAvailability', {
          isAvailable: true,
          coordinates: profile.currentLocation ? {
            latitude: profile.currentLocation.coordinates[1],
            longitude: profile.currentLocation.coordinates[0]
          } : undefined
        });
      }
    } else if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
      locationUpdateInterval.current = null;
      
      // Update socket availability status
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('setAvailability', {
          isAvailable: false
        });
      }
    }
    
    // No need for cleanup here as it's handled in the main useEffect
  }, [profile.isAvailable, locationPermission]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const startLocationTracking = () => {
    // Clear any existing interval
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
    }
    
    // Update location immediately
    updateLocationOnServer();
    
    // Then set interval to update every 5 minutes (adjust as needed)
    locationUpdateInterval.current = setInterval(updateLocationOnServer, 5 * 60 * 1000);
  };

  const updateLocationOnServer = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');
      
      // Format location data for the API
      // The backend expects { currentLocation: { lat: number, long: number } }
      await axios.put(
        `${API_BASE_URL}/service-provider/`,
        { 
          currentLocation: {
            lat: location.coords.latitude,
            long: location.coords.longitude
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Location updated on server:', {
        lat: location.coords.latitude,
        long: location.coords.longitude
      });
      
      // Also update socket with location if available
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('setAvailability', {
          isAvailable: profile.isAvailable,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }
        });
      }
    } catch (err) {
      console.error('Failed to update location on server:', err);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchProfileData(),
        fetchBookings(),
        updateLocationOnServer()
      ]);
    } catch (err) {
      console.error("Failed to load initial data:", err);
      setError("Failed to load data. Pull down to refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchProfileData(),
        fetchBookings(),
        updateLocationOnServer()
      ]);
    } catch (err) {
      console.error("Refresh failed:", err);
      setError("Failed to refresh data. Try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`${API_BASE_URL}/service-provider/self-identification`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.data) {
        const profileData = response.data.data;
        
        setProfile({
          name: profileData.name || 'Service Provider',
          isAvailable: profileData.isAvailable || false,
          isNotificationOn: profileData.isNotificationOn || true,
          phoneNumber: profileData.phoneNumber || '',
          currentLocation: profileData.currentLocation
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      
      if (error.response?.status === 401) {
        await handleAuthError();
      }
      
      throw error;
    }
  };

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`${API_BASE_URL}/booking/service-provider`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.data && response.data.data.bookings) {
        const serviceGroups: ServiceGroup[] = response.data.data.bookings;
        
        // Flatten all bookings from service groups
        let allBookings: Booking[] = [];
        serviceGroups.forEach(group => {
          allBookings = [...allBookings, ...group.bookingData];
        });
        
        // Filter bookings by status
        const pending = allBookings.filter(booking => booking.status === 'PENDING');
        const accepted = allBookings.filter(booking => booking.status === 'ACCEPTED');
        const completed = allBookings.filter(booking => booking.status === 'COMPLETED');
        
        setPendingBookings(pending);
        setAcceptedBookings(accepted);
        setCompletedBookings(completed);
      }
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      
      if (error.response?.status === 401) {
        await handleAuthError();
      }
      
      throw error;
    }
  };

  const handleAuthError = async () => {
    // Clear tokens and redirect to login
    await AsyncStorage.multiRemove(['accessToken', 'userRole', 'userData']);
    setAuthState(false, '');
    Alert.alert(
      "Session Expired",
      "Your session has expired. Please log in again.",
      [{ text: "OK", onPress: () => router.replace('/SignInService') }]
    );
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      setIsLoading(true);
      
      // Check if we have location permission before accepting booking
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Location Required", 
          "We need your location to accept bookings. Please enable location services."
        );
        setIsLoading(false);
        return;
      }
      
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      await axios.post(
        `${API_BASE_URL}/booking/accept`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Move booking from pending to accepted immediately for better UX
      const bookingToMove = pendingBookings.find(booking => booking._id === bookingId);
      if (bookingToMove) {
        const updatedBooking = { ...bookingToMove, status: 'ACCEPTED' };
        setPendingBookings(prev => prev.filter(booking => booking._id !== bookingId));
        setAcceptedBookings(prev => [updatedBooking, ...prev]);
      }
      
      // Still refresh bookings after accepting to ensure data consistency
      await fetchBookings();
      
      Alert.alert("Success", "Booking accepted successfully");
      
      // Change to active tab to show the accepted booking
      setActiveTab('active');
    } catch (error: any) {
      console.error("Error accepting booking:", error);
      Alert.alert(
        "Failed to Accept",
        error.response?.data?.message || "Failed to accept booking. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      setIsLoading(true);
      
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      await axios.post(
        `${API_BASE_URL}/booking/decline`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove declined booking from list immediately for better UX
      setPendingBookings(prev => prev.filter(booking => booking._id !== bookingId));
      
      Alert.alert("Success", "Booking declined");
    } catch (error: any) {
      console.error("Error declining booking:", error);
      Alert.alert(
        "Failed to Decline",
        error.response?.data?.message || "Failed to decline booking. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setIsLoading(true);
      
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      await axios.post(
        `${API_BASE_URL}/booking/cancel/service-provider`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove cancelled booking from accepted list immediately for better UX
      setAcceptedBookings(prev => prev.filter(booking => booking._id !== bookingId));
      
      // Still refresh bookings to ensure data consistency
      await fetchBookings();
      
      Alert.alert("Success", "Booking cancelled");
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      Alert.alert(
        "Failed to Cancel",
        error.response?.data?.message || "Failed to cancel booking. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      setIsLoading(true);
      
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      await axios.post(
        `${API_BASE_URL}/booking/complete`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Move booking from accepted to completed immediately for better UX
      const bookingToMove = acceptedBookings.find(booking => booking._id === bookingId);
      if (bookingToMove) {
        const updatedBooking = { ...bookingToMove, status: 'COMPLETED' };
        setAcceptedBookings(prev => prev.filter(booking => booking._id !== bookingId));
        setCompletedBookings(prev => [updatedBooking, ...prev]);
      }
      
      // Still refresh bookings to ensure data consistency
      await fetchBookings();
      
      Alert.alert(
        "Success", 
        "Booking completed successfully",
        [
          { text: 'OK', onPress: () => setActiveTab('completed') }
        ]
      );
    } catch (error: any) {
      console.error("Error completing booking:", error);
      Alert.alert(
        "Failed to Complete",
        error.response?.data?.message || "Failed to complete booking. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      setIsLoading(true);
      
      // Check location permission when toggling to available
      if (!profile.isAvailable) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            "Location Required", 
            "We need your location to mark you as available. Please enable location services."
          );
          setIsLoading(false);
          return;
        }
        
        // Update location before setting availability
        await updateLocationOnServer();
      }
      
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Toggle availability status
      const newAvailability = !profile.isAvailable;
      
      await axios.put(
        `${API_BASE_URL}/service-provider/`,
        { isAvailable: newAvailability },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        isAvailable: newAvailability
      }));
      
      // Socket will be updated via useEffect when profile.isAvailable changes
      
      Alert.alert(
        "Status Updated",
        `You are now ${newAvailability ? 'available' : 'unavailable'} for new bookings`
      );
    } catch (error: any) {
      console.error("Error toggling availability:", error);
      Alert.alert(
        "Update Failed",
        error.response?.data?.message || "Failed to update availability status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'pending' | 'active' | 'completed') => {
    setActiveTab(tab);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Render booking card
  const renderBookingCard = (booking: Booking) => {
    const isCompleted = booking.status === 'COMPLETED';
    const isAccepted = booking.status === 'ACCEPTED';
    const isPending = booking.status === 'PENDING';
    
    return (
      <View key={booking._id} className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-gray-100">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Ionicons name="document-text-outline" size={22} color="#FFBB84" />
            <Text className="text-lg font-medium ml-2">Booking #{booking._id.slice(-6)}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${
            isPending ? 'bg-amber-50' : 
            isAccepted ? 'bg-blue-50' : 
            isCompleted ? 'bg-green-50' : 'bg-gray-50'
          }`}>
            <Text className={`text-xs font-medium ${
              isPending ? 'text-amber-600' : 
              isAccepted ? 'text-blue-600' : 
              isCompleted ? 'text-green-600' : 'text-gray-600'
            }`}>
              {booking.status}
            </Text>
          </View>
        </View>

        <View className="mb-3">
          <Text className="text-sm text-gray-600">Service: {booking.serviceId?.name}</Text>
        </View>
        
        <View className="mb-3">
          <Text className="text-sm text-gray-600">Customer: {booking.userId?.name || 'Customer'}</Text>
        </View>
        
        <View className="mb-3">
          <Text className="text-sm text-gray-600">Details: {booking.details}</Text>
        </View>

        <View className="flex-row mb-3">
          <View className="flex-row items-center mr-4">
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text className="ml-1.5 text-sm text-gray-700">
              {formatDate(booking.createdAt)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text className="ml-1.5 text-sm text-gray-700">
              {formatTime(booking.createdAt)}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center border-t border-gray-100 pt-3 mt-1">
          <Text className="text-lg font-bold text-[#FFBB84]">₹{booking.estimatedFare.toFixed(2)}</Text>
        </View>

        {/* Action buttons based on booking status */}
        {isPending && (
          <View className="flex-row justify-between mt-4 space-x-2">
            <TouchableOpacity 
              className="flex-1 bg-[#FFBB84] rounded-lg py-3 items-center"
              onPress={() => handleAcceptBooking(booking._id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-sm">Accept</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
              onPress={() => handleDeclineBooking(booking._id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#4B5563" />
              ) : (
                <Text className="text-gray-800 font-semibold text-sm">Decline</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isAccepted && (
          <View className="flex-row justify-between mt-4 space-x-2">
            <TouchableOpacity 
              className="flex-1 bg-green-500 rounded-lg py-3 items-center"
              onPress={() => handleCompleteBooking(booking._id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-sm">Complete</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 bg-red-100 rounded-lg py-3 items-center"
              onPress={() => handleCancelBooking(booking._id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Text className="text-red-500 font-semibold text-sm">Cancel</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Top Header with availability toggle */}
        <View className="flex-row justify-between items-center px-4 py-3">
          <Text className="text-lg font-bold">Dashboard</Text>
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full ${
              profile.isAvailable ? 'bg-green-100' : 'bg-gray-100'
            }`}
            onPress={toggleAvailability}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={profile.isAvailable ? '#22C55E' : '#6B7280'} />
            ) : (
              <Text className={profile.isAvailable ? 'text-green-600' : 'text-gray-600'}>
                {profile.isAvailable ? '✓ Available' : '× Unavailable'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View className="bg-[#FFBB84] mx-4 p-5 rounded-lg mb-4">
          <Text className="text-xl font-medium text-white">Hello, {profile.name}</Text>
          <Text className="text-sm text-white opacity-90 mt-1">
            You can view and manage your booking requests here.
          </Text>
        </View>

        {/* Location Status */}
        {!locationPermission && (
          <TouchableOpacity 
            className="mx-4 mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex-row items-center"
            onPress={async () => {
              const { status } = await Location.requestForegroundPermissionsAsync();
              setLocationPermission(status === 'granted');
              if (status === 'granted') {
                updateLocationOnServer();
              }
            }}
          >
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text className="ml-2 text-sm text-yellow-700 flex-1">
              Location permission is required to receive nearby bookings
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#F59E0B" />
          </TouchableOpacity>
        )}

        {/* Socket Connection Status */}
        {!socketRef.current?.connected && (
          <TouchableOpacity 
            className="mx-4 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex-row items-center"
            onPress={async () => {
              // Force reconnect socket
              const token = await AsyncStorage.getItem('accessToken');
              if (token && !socketRef.current?.connected) {
                if (socketRef.current) {
                  socketRef.current.disconnect();
                }
                
                socketRef.current = io(SOCKET_URL, {
                  query: { token },
                  transports: ['websocket', 'polling']
                });
                
                Alert.alert('Reconnecting', 'Attempting to reconnect to server...');
              }
            }}
          >
            <Ionicons name="wifi-outline" size={20} color="#3B82F6" />
            <Text className="ml-2 text-sm text-blue-700 flex-1">
              Connection issue. Tap to reconnect.
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        )}

        {/* Tabs */}
        <View className="flex-row border-b border-gray-200 bg-white">
          <TouchableOpacity 
            className={`flex-1 py-3 items-center justify-center ${activeTab === 'pending' ? 'border-b-2 border-[#FFBB84]' : ''}`}
            onPress={() => handleTabChange('pending')}
          >
            <Text className={`text-sm font-medium ${activeTab === 'pending' ? 'text-gray-900' : 'text-gray-600'}`}>
              Pending ({pendingBookings.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 py-3 items-center justify-center ${activeTab === 'active' ? 'border-b-2 border-[#FFBB84]' : ''}`}
            onPress={() => handleTabChange('active')}
          >
            <Text className={`text-sm font-medium ${activeTab === 'active' ? 'text-gray-900' : 'text-gray-600'}`}>
              Active ({acceptedBookings.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 py-3 items-center justify-center ${activeTab === 'completed' ? 'border-b-2 border-[#FFBB84]' : ''}`}
            onPress={() => handleTabChange('completed')}
          >
            <Text className={`text-sm font-medium ${activeTab === 'completed' ? 'text-gray-900' : 'text-gray-600'}`}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        {isLoading && !isRefreshing ? (
          <View className="flex-1 justify-center items-center p-4">
            <ActivityIndicator size="large" color="#FFBB84" />
            <Text className="mt-4 text-gray-600">Loading bookings...</Text>
          </View>
        ) : (
          <ScrollView 
            className="flex-1 px-4 pt-3 pb-20" 
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#FFBB84"]} />
            }
            showsVerticalScrollIndicator={false}
          >
            {error ? (
              <View className="flex-1 justify-center items-center p-6">
                <Ionicons name="alert-circle-outline" size={40} color="#FF4D4D" />
                <Text className="text-base text-red-500 text-center mt-2 mb-4">{error}</Text>
                <TouchableOpacity 
                  className="bg-[#FFBB84] px-4 py-2 rounded-lg"
                  onPress={onRefresh}
                >
                  <Text className="text-white font-medium">Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : activeTab === 'pending' ? (
              pendingBookings.length === 0 ? (
                <View className="flex-1 justify-center items-center p-10">
                  <Ionicons name="document-outline" size={40} color="#CCCCCC" />
                  <Text className="text-base text-gray-500 text-center mt-3">
                    No pending booking requests
                  </Text>
                </View>
              ) : (
                pendingBookings.map(booking => renderBookingCard(booking))
              )
            ) : activeTab === 'active' ? (
              acceptedBookings.length === 0 ? (
                <View className="flex-1 justify-center items-center p-10">
                  <Ionicons name="calendar-outline" size={40} color="#CCCCCC" />
                  <Text className="text-base text-gray-500 text-center mt-3">
                    No active bookings
                  </Text>
                </View>
              ) : (
                acceptedBookings.map(booking => renderBookingCard(booking))
              )
            ) : (
              completedBookings.length === 0 ? (
                <View className="flex-1 justify-center items-center p-10">
                  <Ionicons name="checkmark-circle-outline" size={40} color="#CCCCCC" />
                  <Text className="text-base text-gray-500 text-center mt-3">
                    No completed bookings
                  </Text>
                </View>
              ) : (
                completedBookings.map(booking => renderBookingCard(booking))
              )
            )}
            
            {/* Extra padding at bottom */}
            <View className="h-20" />
          </ScrollView>
        )}

        {/* Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex-row justify-around items-center px-6">
          <TouchableOpacity
            className="items-center"
          >
            <Ionicons name="home" size={24} color="#FFBB84" />
            <Text className="text-xs text-[#FFBB84] mt-1">Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push('/ProfileScreen')}
          >
            <Ionicons name="person-outline" size={24} color="gray" />
            <Text className="text-xs text-gray-500 mt-1">Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Dashboard;