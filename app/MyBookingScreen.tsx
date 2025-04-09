import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type TabType = 'Upcoming' | 'Completed' | 'Cancelled';

interface BookingProps {
  id: string;
  service: string;
  date: string;
  time: string;
  provider: string;
}

const MyBookingsScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('Upcoming');

  const handleBack = () => {
    router.back();
  };

  // Sample data for bookings
  const upcomingBookings: BookingProps[] = [
    {
      id: '1',
      service: 'Home Cleaning',
      date: '2023-08-20',
      time: '2:30 PM',
      provider: 'John Smith',
    },
    // Add more sample bookings if needed
  ];

  const completedBookings: BookingProps[] = [];
  const cancelledBookings: BookingProps[] = [];

  // Get the appropriate bookings based on active tab
  const getBookings = () => {
    switch (activeTab) {
      case 'Upcoming':
        return upcomingBookings;
      case 'Completed':
        return completedBookings;
      case 'Cancelled':
        return cancelledBookings;
      default:
        return [];
    }
  };

  const renderBookingItem = ({ item }: { item: BookingProps }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.serviceRow}>
          <View style={styles.serviceIconContainer}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.serviceName}>{item.service}</Text>
        </View>
        <Text style={styles.providerName}>{item.provider}</Text>
      </View>
      <Text style={styles.bookingDate}>
        {item.date.replace(/-/g, '/')} • {item.time}
      </Text>
      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No {activeTab.toLowerCase()} bookings</Text>
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
        <View style={styles.placeholderView} />
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
      <FlatList
        data={getBookings()}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
      />

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity 
          style={styles.tabBarItem}
          onPress={() => router.push('/Home')}
        >
          <Ionicons name="home-outline" size={24} color="#888" />
          <Text style={styles.tabBarItemText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBarItem, styles.activeTabBarItem]}>
          <Ionicons name="calendar-outline" size={24} color="#FDA172" />
          <Text style={styles.activeTabBarItemText}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabBarItem}
          onPress={() => router.push('/PaymentsScreen')}
        >
          <Ionicons name="card-outline" size={24} color="#888" />
          <Text style={styles.tabBarItemText}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabBarItem}
          
        >
          <Ionicons name="person-outline" size={24} color="#888" />
          <Text style={styles.tabBarItemText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333',
    marginLeft: 16, // Add margin to move text right of back button
  },
  placeholderView: {
    flex: 1, // This will push the placeholder to take remaining space
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
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
    backgroundColor: '#white',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding to account for bottom tab bar
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
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
  },
  serviceIconContainer: {
    marginRight: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  providerName: {
    fontSize: 14,
    color: '#666',
  },
  bookingDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  detailsButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 60,
    paddingBottom: 8,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabBarItem: {
  },
  tabBarItemText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  activeTabBarItemText: {
    fontSize: 12,
    color: '#FDA172',
    marginTop: 4,
  },
});

export default MyBookingsScreen;