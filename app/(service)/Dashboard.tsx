import React, { useState, useEffect, useContext } from 'react';
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
  Vibration
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { AuthContext } from '../_layout';
import { API_BASE_URL } from '@/lib/api';
import { useBooking } from '../../components/BookingContext';
import Toast from 'react-native-toast-message';
import BookingPopup from '../../components/BookingPopup';

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
  details: string | {
    location?: string;
    locationCoordinates?: any;
    date?: string;
    time?: string;
    duration?: number;
    pickupAddress?: string;
    destination?: string;
    passengers?: number;
    vehicleType?: string;
    [key: string]: any;
  };
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  estimatedFare: number;
  createdAt: string;
  serviceDate?: string;
  bookingHours?: {
    startTime: string;
    endTime: string;
    endDate: string;
    totalNoofHours: number;
  };
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { setAuthState } = useContext(AuthContext);
  const {
    setIncomingBooking,
    isAvailable,
    setAvailability,
    isLoadingAvailability,
    socketConnected,
    getSocket
  } = useBooking();

  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [acceptedBookings, setAcceptedBookings] = useState<Booking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [profileName, setProfileName] = useState('Service Provider');

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
      } catch (err) {
        console.error('Error requesting location permissions:', err);
        setLocationPermission(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    let isMounted = true;

    if (socket && socket.connected) {
      socket.on('new_booking', (data) => {
        if (!isMounted) return;
        handleNewBooking(data);
      });

      socket.on('new_hours_booking', (data) => {
        if (!isMounted) return;
        handleNewBooking(data);
      });

      socket.on('booking_removed', (data) => {
        if (!isMounted) return;
        setPendingBookings(prevBookings =>
          prevBookings.filter(booking => booking._id !== data.bookingId)
        );
      });

      socket.on('booking_cancel_by_user', (data) => {
        if (!isMounted) return;
        Alert.alert('Booking Cancelled', 'User has cancelled the booking');
        setAcceptedBookings(prevBookings =>
          prevBookings.filter(booking => booking._id !== data.bookingId)
        );
        fetchBookings();
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
        if (error.message && (
          error.message.includes("availability") ||
          error.message.includes("active service") ||
          error.message.includes("currently booked")
        )) {
          Alert.alert("Error", error.message);
          fetchProfileData();
        }
      });
    }

    return () => {
      isMounted = false;
      const socket = getSocket();
      if (socket) {
        socket.off('new_booking');
        socket.off('new_hours_booking');
        socket.off('booking_removed');
        socket.off('booking_cancel_by_user');
        socket.off('error');
      }
    };
  }, [socketConnected]);

  const handleNewBooking = (data) => {
    console.log('New booking received:', data);
    Vibration.vibrate([500, 100, 500]);

    const newBooking = {
      _id: data.bookingId,
      userId: data.bookingDetails?.userId || data.userId || { _id: '', name: 'Customer' },
      serviceId: data.bookingDetails?.serviceId || data.serviceId || { _id: '', name: 'Service' },
      details: data.bookingDetails?.details || data.details || '',
      status: 'PENDING' as const,
      estimatedFare: data.estimatedFare || 0,
      createdAt: new Date().toISOString(),
      ...(data.serviceDate && { serviceDate: data.serviceDate }),
      ...(data.bookingHours && { bookingHours: data.bookingHours })
    };

    setPendingBookings(prevBookings => {
      const exists = prevBookings.some(booking => booking._id === data.bookingId);
      if (!exists) {
        setIncomingBooking(newBooking);
        return [newBooking, ...prevBookings];
      }
      return prevBookings;
    });
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const updateLocationOnServer = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      }).catch(() => null);

      if (!location) return;

      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');

      await axios.put(
        `${API_BASE_URL}/service-provider/`,
        {
          currentLocation: {
            lat: 25.45,
            long: 78.54
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to update location on server:', err);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchProfileData(), fetchBookings()]);
      updateLocationOnServer().catch(err => console.error("Location update error:", err));
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
      await Promise.all([fetchProfileData(), fetchBookings()]);
      updateLocationOnServer().catch(err => console.error("Location update error:", err));
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
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get(`${API_BASE_URL}/service-provider/self-identification`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.data) {
        const profileData = response.data.data;
        setProfileName(profileData.name || 'Service Provider');
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
      if (!token) throw new Error('No authentication token found');

      const response = await axios.get(`${API_BASE_URL}/booking/service-provider`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.data?.bookings) {
        let allBookings: Booking[] = [];
        response.data.data.bookings.forEach(group => {
          allBookings = [...allBookings, ...group.bookingData];
        });

        setPendingBookings(allBookings.filter(booking => booking.status === 'PENDING'));
        setAcceptedBookings(allBookings.filter(booking => booking.status === 'ACCEPTED'));
        setCompletedBookings(allBookings.filter(booking => booking.status === 'COMPLETED'));
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
    await AsyncStorage.multiRemove(['accessToken', 'userRole', 'userData']);
    setAuthState(false, '');
    Alert.alert(
      "Session Expired",
      "Your session has expired. Please log in again.",
      [{ text: "OK", onPress: () => router.replace('/SignInService') }]
    );
  };

  const handleToggleAvailability = async () => {
    if (isLoadingAvailability) return;
    const newStatus = !isAvailable;
    try {
      await setAvailability(newStatus);
      Toast.show({
        type: 'success',
        text1: newStatus ? 'You are now available' : 'You are now offline',
        text2: newStatus ? 'You can now receive booking requests' : 'You will not receive new booking requests',
        position: 'bottom',
        visibilityTime: 2000
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Could not update your availability status.',
        position: 'bottom'
      });
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      setIsLoading(true);
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
      if (!token) throw new Error('No authentication token found');

      await axios.post(
        `${API_BASE_URL}/booking/accept`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const bookingToMove = pendingBookings.find(booking => booking._id === bookingId);
      if (bookingToMove) {
        const updatedBooking = { ...bookingToMove, status: 'ACCEPTED' as const };
        setPendingBookings(prev => prev.filter(booking => booking._id !== bookingId));
        setAcceptedBookings(prev => [updatedBooking, ...prev]);
      }

      await fetchBookings();
      setActiveTab('active');
    } catch (error: any) {
      console.error("Error accepting booking:", error);
      Alert.alert(
        "Failed to Accept",
        error.response?.data?.message || "Failed to accept booking. Please try again."
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');

      await axios.post(
        `${API_BASE_URL}/booking/decline`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPendingBookings(prev => prev.filter(booking => booking._id !== bookingId));
      Toast.show({
        type: 'success',
        text1: 'Booking Declined',
        text2: 'The booking request has been declined',
        position: 'bottom',
        visibilityTime: 2000
      });
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
      if (!token) throw new Error('No authentication token found');

      await axios.post(
        `${API_BASE_URL}/booking/cancel/service-provider`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAcceptedBookings(prev => prev.filter(booking => booking._id !== bookingId));
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
      if (!token) throw new Error('No authentication token found');

      await axios.post(
        `${API_BASE_URL}/booking/complete`,
        { bookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const bookingToMove = acceptedBookings.find(booking => booking._id === bookingId);
      if (bookingToMove) {
        const updatedBooking = { ...bookingToMove, status: 'COMPLETED' as const };
        setAcceptedBookings(prev => prev.filter(booking => booking._id !== bookingId));
        setCompletedBookings(prev => [updatedBooking, ...prev]);
      }

      await fetchBookings();
      Alert.alert(
        "Success",
        "Booking completed successfully",
        [{ text: 'OK', onPress: () => setActiveTab('completed') }]
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

  const formatBookingDetails = (booking: Booking): string => {
    const details = booking.details;
    const parts = [];
    
    if (booking.serviceDate) {
      const serviceDate = new Date(booking.serviceDate).toLocaleDateString('en-US');
      parts.push(`Service Date: ${serviceDate}`);
    }
    
    if (booking.bookingHours) {
      if (booking.bookingHours.startTime) {
        const startTime = new Date(booking.bookingHours.startTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
        parts.push(`Start Time: ${startTime}`);
      }
      if (booking.bookingHours.totalNoofHours) {
        parts.push(`Duration: ${booking.bookingHours.totalNoofHours} hour(s)`);
      }
    }
    
    if (details) {
      if (typeof details === 'string') {
        parts.push(details);
      } else if (typeof details === 'object') {
        if (details.location) parts.push(`Location: ${details.location}`);
        if (details.pickupAddress) parts.push(`Pickup: ${details.pickupAddress}`);
        if (details.destination) parts.push(`Destination: ${details.destination}`);
        if (details.passengers) parts.push(`Passengers: ${details.passengers}`);
        if (details.vehicleType) parts.push(`Vehicle: ${details.vehicleType}`);
        if (details.date) parts.push(`Date: ${details.date}`);
        if (details.time) parts.push(`Time: ${details.time}`);
        if (details.duration) parts.push(`Duration: ${details.duration} hour(s)`);
        
        const processedKeys = ['location', 'pickupAddress', 'destination', 'passengers', 'vehicleType', 'date', 'time', 'duration', 'locationCoordinates'];
        const remainingEntries = Object.entries(details)
          .filter(([key, value]) => 
            !processedKeys.includes(key) && 
            value !== null && 
            value !== undefined && 
            value !== ''
          )
          .map(([key, value]) => `${key}: ${value}`);
        
        if (remainingEntries.length > 0) {
          parts.push(...remainingEntries);
        }
      }
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'No details available';
  };

  const renderBookingCard = (booking: Booking) => {
    const isCompleted = booking.status === 'COMPLETED';
    const isAccepted = booking.status === 'ACCEPTED';
    const isPending = booking.status === 'PENDING';
    const formattedDetails = formatBookingDetails(booking);

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

        <View className="mb-3 space-y-2">
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text className="text-sm text-gray-600 ml-2">
              Customer: {booking.userId?.name || 'Customer'}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="briefcase-outline" size={16} color="#666" />
            <Text className="text-sm text-gray-600 ml-2">
              Service: {booking.serviceId?.name || 'Service'}
            </Text>
          </View>
        </View>

        <View className="mb-3 bg-gray-50 rounded-lg p-3">
          <View className="flex-row items-start">
            <Ionicons name="information-circle-outline" size={16} color="#666" className="mt-0.5" />
            <View className="ml-2 flex-1">
              <Text className="text-sm text-gray-700 leading-5">
                {formattedDetails}
              </Text>
            </View>
          </View>
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
          <Text className="text-sm text-gray-600">Estimated Fare</Text>
          <Text className="text-lg font-bold text-[#FFBB84]">₹{booking.estimatedFare.toFixed(2)}</Text>
        </View>

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
        <View className="flex-row justify-between items-center px-4 py-3">
          <Text className="text-lg font-bold">Dashboard</Text>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${isAvailable ? 'bg-green-100' : 'bg-gray-100'}`}
            onPress={handleToggleAvailability}
            disabled={isLoadingAvailability}
          >
            {isLoadingAvailability ? (
              <ActivityIndicator size="small" color="#FFBB84" />
            ) : (
              <Text className={isAvailable ? 'text-green-600' : 'text-gray-600'}>
                {isAvailable ? '✓ Available' : '× Unavailable'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="bg-[#FFBB84] mx-4 p-5 rounded-lg mb-4">
          <Text className="text-xl font-medium text-white">Hello, {profileName}</Text>
          <Text className="text-sm text-white opacity-90 mt-1">
            You can view and manage your booking requests here.
          </Text>
        </View>

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

        {!socketConnected && isAvailable && (
          <TouchableOpacity
            className="mx-4 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex-row items-center"
            onPress={onRefresh}
          >
            <Ionicons name="wifi" size={20} color="#3B82F6" />
            <Text className="ml-2 text-sm text-blue-700 flex-1">
              Connection issue detected. Tap to reconnect
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        )}

        <View className="flex-row justify-around bg-white mb-2 border-b border-gray-100">
          <TouchableOpacity
            className={`py-3 px-6 ${activeTab === 'pending' ? 'border-b-2 border-[#FFBB84]' : ''}`}
            onPress={() => setActiveTab('pending')}
          >
            <Text className={`font-medium ${activeTab === 'pending' ? 'text-[#FFBB84]' : 'text-gray-500'}`}>
              Pending ({pendingBookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`py-3 px-6 ${activeTab === 'active' ? 'border-b-2 border-[#FFBB84]' : ''}`}
            onPress={() => setActiveTab('active')}
          >
            <Text className={`font-medium ${activeTab === 'active' ? 'text-[#FFBB84]' : 'text-gray-500'}`}>
              Active ({acceptedBookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`py-3 px-6 ${activeTab === 'completed' ? 'border-b-2 border-[#FFBB84]' : ''}`}
            onPress={() => setActiveTab('completed')}
          >
            <Text className={`font-medium ${activeTab === 'completed' ? 'text-[#FFBB84]' : 'text-gray-500'}`}>
              Completed ({completedBookings.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-4"
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        >
          {error && (
            <View className="py-4 px-3 my-4 bg-red-50 rounded-lg border border-red-100">
              <Text className="text-red-600 text-center">{error}</Text>
              <TouchableOpacity className="mt-2 py-2 items-center" onPress={onRefresh}>
                <Text className="text-red-500 font-medium">Tap to retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {isLoading && !isRefreshing && (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#FFBB84" />
              <Text className="mt-4 text-gray-500">Loading bookings...</Text>
            </View>
          )}

          {!isLoading &&
            ((activeTab === 'pending' && pendingBookings.length === 0) ||
              (activeTab === 'active' && acceptedBookings.length === 0) ||
              (activeTab === 'completed' && completedBookings.length === 0)) && (
              <View className="py-10 items-center">
                <Ionicons name="document-text-outline" size={48} color="#E5E7EB" />
                <Text className="mt-4 text-gray-400 text-center">
                  {activeTab === 'pending'
                    ? 'No pending bookings to display'
                    : activeTab === 'active'
                      ? 'No active bookings at the moment'
                      : 'No completed bookings yet'}
                </Text>
                {activeTab === 'pending' && !isAvailable && (
                  <TouchableOpacity
                    className="mt-4 py-2 px-4 rounded-full bg-orange-100"
                    onPress={handleToggleAvailability}
                  >
                    <Text className="text-orange-500">Go Online to Receive Bookings</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

          {activeTab === 'pending' && pendingBookings.length > 0 && (
            <View className="py-2">
              {pendingBookings.map(booking => renderBookingCard(booking))}
            </View>
          )}

          {activeTab === 'active' && acceptedBookings.length > 0 && (
            <View className="py-2">
              {acceptedBookings.map(booking => renderBookingCard(booking))}
            </View>
          )}

          {activeTab === 'completed' && completedBookings.length > 0 && (
            <View className="py-2">
              {completedBookings.map(booking => renderBookingCard(booking))}
            </View>
          )}
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 bg-white flex-row h-16 border-t border-gray-100">
          <TouchableOpacity className="flex-1 justify-center items-center">
            <Ionicons name="home" size={24} color="#FFBB84" />
            <Text className="text-xs text-orange-400 mt-1">Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 justify-center items-center"
            onPress={() => router.push('/ProfileScreen')}
          >
            <Ionicons name="person-outline" size={24} color="#888" />
            <Text className="text-xs text-gray-500 mt-1">Profile</Text>
          </TouchableOpacity>
        </View>

        <BookingPopup onAccept={handleAcceptBooking} onDecline={handleDeclineBooking} />
      </SafeAreaView>
    </>
  );
};

export default Dashboard;