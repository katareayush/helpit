import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
  details: any;
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
      const token = await getAuthToken(); // You need to implement this function to get the token from storage
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
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
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

  const renderBookingItem = ({ item }: { item: BookingProps }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.serviceRow}>
          <View style={styles.serviceIconContainer}>
            {getStatusIcon(item.status)}
          </View>
          <Text style={styles.serviceName}>{item.serviceId?.name || 'Service'}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.providerName}>
          {item.serviceProviderId?.name || 'Awaiting provider'}
        </Text>
      </View>
      <Text style={styles.bookingDate}>
        {formatDate(item.bookingDate)} • {formatTime(item.bookingDate)}
      </Text>
      <View style={styles.fareContainer}>
        <Text style={styles.fareLabel}>Estimated Fare:</Text>
        <Text style={styles.fareValue}>${item.estimatedFare.toFixed(2)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={() => router.push(`/booking/details/${item._id}`)}
      >
        <Text style={styles.detailsButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#FDA172" />
      ) : (
        <Text style={styles.emptyText}>No {activeTab.toLowerCase()} bookings</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchBookings}>
          <Ionicons name="refresh" size={24} color="#FDA172" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['Upcoming', 'Completed', 'Cancelled'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBookings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={getFilteredBookings()}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
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
    // Import AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    // Get the access token from AsyncStorage
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  refreshButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginHorizontal: 16,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#FDA172',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FDA172',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding to account for bottom tab bar
    minHeight: '100%',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIconContainer: {
    marginRight: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#555',
  },
  providerName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  bookingDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  fareLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  fareValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FDA172',
  },
  detailsButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FDA172',
    borderRadius: 6,
    backgroundColor: '#FFF8F3',
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#FDA172',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FDA172',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MyBookingsScreen;