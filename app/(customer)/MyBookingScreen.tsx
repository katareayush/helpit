import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomTabBar from '@/components/CustomTabBar';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

type TabType = 'Upcoming' | 'Completed' | 'Cancelled';

interface BookingProps {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
  };
  serviceProviderId: {
    _id: string;
    name: string;
  } | null;
  status: 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'COMPLETED';
  details: {
    address?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    description?: string;
    bookingTime?: string;
    // Add other fields from your actual data structure
  };
  estimatedFare: number;
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
}

const MyBookingsScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('Upcoming');
  const [bookings, setBookings] = useState<BookingProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/booking/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data && response.data.data.bookings) {
        setBookings(response.data.data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
      Alert.alert('Error', 'Failed to load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel a booking
  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              setCancellingBookingId(bookingId);
              const token = await getAuthToken();
              if (!token) {
                Alert.alert('Error', 'Authentication token not found. Please log in again.');
                setCancellingBookingId(null);
                return;
              }

              await axios.post(
                `${API_BASE_URL}/booking/cancel/user`,
                { bookingId },
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );

              // Update the booking status locally
              setBookings(prevBookings => 
                prevBookings.map(booking => 
                  booking._id === bookingId 
                    ? { ...booking, status: 'CANCELLED' } 
                    : booking
                )
              );
              
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (err) {
              console.error('Error cancelling booking:', err);
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            } finally {
              setCancellingBookingId(null);
            }
          }
        }
      ]
    );
  };

  // Filter bookings based on active tab
  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'Upcoming':
        // Show both PENDING and ACCEPTED bookings in Upcoming tab
        return bookings.filter(booking => 
          booking.status === 'PENDING' || booking.status === 'ACCEPTED'
        );
      case 'Completed':
        return bookings.filter(booking => booking.status === 'COMPLETED');
      case 'Cancelled':
        return bookings.filter(booking => booking.status === 'CANCELLED');
      default:
        return [];
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Ionicons name="time" size={20} color="#FDA172" />;
      case 'ACCEPTED':
        return <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />;
      case 'COMPLETED':
        return <Ionicons name="checkmark-done-circle" size={20} color="#4CAF50" />;
      case 'CANCELLED':
        return <Ionicons name="close-circle" size={20} color="#F44336" />;
      default:
        return <Ionicons name="help-circle" size={20} color="#9E9E9E" />;
    }
  };

  const canCancelBooking = (booking: BookingProps) => {
    return booking.status === 'PENDING' || booking.status === 'ACCEPTED';
  };

  const renderBookingItem = ({ item }: { item: BookingProps }) => (
    <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center flex-1">
          <View className="mr-2">
            {getStatusIcon(item.status)}
          </View>
          <Text className="text-base font-semibold text-gray-800 flex-1">
            {item.serviceId?.name || 'Service'}
          </Text>
          <View className={`px-2 py-1 rounded ${
            item.status === 'PENDING' ? 'bg-orange-100' : 
            item.status === 'ACCEPTED' ? 'bg-green-100' : 
            item.status === 'COMPLETED' ? 'bg-green-100' : 
            'bg-red-100'
          }`}>
            <Text className={`text-xs font-medium ${
              item.status === 'PENDING' ? 'text-orange-600' : 
              item.status === 'ACCEPTED' ? 'text-green-600' : 
              item.status === 'COMPLETED' ? 'text-green-600' : 
              'text-red-600'
            }`}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
      
      <Text className="text-sm text-gray-600 mb-1">
        {item.serviceProviderId?.name || 'Awaiting provider'}
      </Text>
      
      {item.details?.address && (
        <Text className="text-sm text-gray-500 mb-1">
          <Text className="font-medium">Address:</Text> {item.details.address}
        </Text>
      )}
      
      {item.details?.description && (
        <Text className="text-sm text-gray-500 mb-1">
          <Text className="font-medium">Description:</Text> {item.details.description}
        </Text>
      )}
      
      <Text className="text-sm text-gray-500 mb-3">
        {formatDate(item.bookingDate)} • {formatTime(item.bookingDate)}
      </Text>
      
      <View className="flex-row justify-between items-center mb-4 px-1">
        <Text className="text-sm font-medium text-gray-700">Estimated Fare:</Text>
        <Text className="text-base font-semibold text-orange-500">₹{item.estimatedFare.toFixed(2)}</Text>
      </View>
      
      <View className="flex-row">
        {canCancelBooking(item) && (
          <TouchableOpacity 
            className="w-full items-center py-2.5 border border-red-500 rounded-md bg-red-500"
            onPress={() => handleCancelBooking(item._id)}
            disabled={cancellingBookingId === item._id}
          >
            {cancellingBookingId === item._id ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-sm font-medium text-white">Cancel Booking</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View className="items-center justify-center py-10">
      {loading ? (
        <ActivityIndicator size="large" color="#FDA172" />
      ) : (
        <Text className="text-base text-gray-500">No {activeTab.toLowerCase()} bookings</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white justify-between">
        <TouchableOpacity className="p-1" onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-lg font-medium text-gray-800">My Bookings</Text>
        <TouchableOpacity className="p-1" onPress={fetchBookings}>
          <Ionicons name="refresh" size={24} color="#FDA172" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row mb-5 rounded-lg overflow-hidden border border-gray-200 mx-4 mt-4">
        {(['Upcoming', 'Completed', 'Cancelled'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-3 items-center bg-white ${
              activeTab === tab ? 'border-b-2 border-orange-400' : ''
            }`}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === tab ? 'text-orange-400' : 'text-gray-600'
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      {error ? (
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-base text-red-500 mb-4 text-center">{error}</Text>
          <TouchableOpacity 
            className="px-5 py-2.5 bg-orange-400 rounded-md"
            onPress={fetchBookings}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={getFilteredBookings()}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          className="px-4 pb-20"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshing={loading}
          onRefresh={fetchBookings}
        />
      )}

      <CustomTabBar activeRoute="Bookings" />
    </SafeAreaView>
  );
};

// Helper function to get auth token from AsyncStorage
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      console.warn('No access token found in AsyncStorage');
      return null;
    }
    return token;
  } catch (error) {
    console.error('Error getting access token from AsyncStorage:', error);
    return null;
  }
};

export default MyBookingsScreen;