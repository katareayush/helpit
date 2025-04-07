import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DriverDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');

  // Add state for managing bookings
  const [pendingBookings, setPendingBookings] = useState([
    {
      id: 'BK12345',
      serviceType: 'Driver Service',
      pickupLocation: '567 Maple Dr, Heights',
      dropLocation: '456 Park Ave, City',
      passengers: 3,
      vehicleType: 'Sedan',
      dateTime: '2023-06-17 at 09:00',
      distance: '12.5 km',
      fare: '₹700',
      status: 'pending',
    },
  ]);

  const [confirmedBookings, setConfirmedBookings] = useState([]);

  // Update handlers
  const handleAccept = (booking) => {
    setPendingBookings(prev => prev.filter(b => b.id !== booking.id));
    setConfirmedBookings(prev => [...prev, { ...booking, status: 'confirmed' }]);
  };

  const handleDecline = (bookingId) => {
    setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push('/edit-profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Driver</Text>
        </TouchableOpacity>
      </View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Hello, Rakesh</Text>
          <Text style={styles.subGreeting}>You can view and accept booking requests here.</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]} 
          onPress={() => handleTabChange('pending')}
        >
          <Text style={styles.tabText}>Pending Requests</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{pendingBookings.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'confirmed' && styles.activeTab]} 
          onPress={() => handleTabChange('confirmed')}
        >
          <Text style={styles.tabText}>Confirmed Bookings</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'pending' ? (
          pendingBookings.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No pending requests</Text>
            </View>
          ) : (
            pendingBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View style={styles.bookingTitleContainer}>
                    <Ionicons name="home" size={22} color="#FF9966" style={styles.bookingIcon} />
                    <Text style={styles.bookingTitle}>Booking #{booking.id}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Pending</Text>
                  </View>
                </View>

                <View style={styles.bookingDetail}>
                  <Text style={styles.serviceType}>Service: {booking.serviceType}</Text>
                </View>
                <View style={styles.locationContainer}>
                  <View style={styles.fareContainer}>
                    <View style={styles.locationItem}>
                      <Ionicons name="location-outline" size={20} color="#666" />
                      <Text style={styles.locationText}>From: {booking.pickupLocation}</Text>
                    </View>
                    <View style={styles.locationItem}>
                      <Ionicons name="location-outline" size={20} color="#666" />
                      <Text style={styles.locationText}>To: {booking.dropLocation}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{booking.passengers} Passengers</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="car-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{booking.vehicleType}</Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{booking.dateTime}</Text>
                  </View>
                </View>

                <View style={styles.fareContainer}>
                  <View style={styles.distanceContainer}>
                    <Text style={styles.distanceText}>Distance: {booking.distance}</Text>
                  </View>
                  <Text style={styles.fareText}>{booking.fare}</Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.acceptButton} 
                    onPress={() => handleAccept(booking)}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.declineButton} 
                    onPress={() => handleDecline(booking.id)}
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        ) : confirmedBookings.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No confirmed bookings yet</Text>
          </View>
        ) : (
          confirmedBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.bookingTitleContainer}>
                  <Ionicons name="checkmark-circle-outline" size={22} color="#4CAF50" />
                  <Text style={styles.bookingTitle}>Booking #{booking.id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={[styles.statusText, { color: '#4CAF50' }]}>Confirmed</Text>
                </View>
              </View>

              <View style={styles.bookingDetail}>
                <Text style={styles.serviceType}>Service: {booking.serviceType}</Text>
              </View>
              <View style={styles.locationContainer}>
                <View style={styles.fareContainer}>
                  <View style={styles.locationItem}>
                    <Ionicons name="location-outline" size={20} color="#666" />
                    <Text style={styles.locationText}>From: {booking.pickupLocation}</Text>
                  </View>
                  <View style={styles.locationItem}>
                    <Ionicons name="location-outline" size={20} color="#666" />
                    <Text style={styles.locationText}>To: {booking.dropLocation}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{booking.passengers} Passengers</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="car-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{booking.vehicleType}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{booking.dateTime}</Text>
                </View>
              </View>

              <View style={styles.fareContainer}>
                <View style={styles.distanceContainer}>
                  <Text style={styles.distanceText}>Distance: {booking.distance}</Text>
                </View>
                <Text style={styles.fareText}>{booking.fare}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF9966',
    padding: 25,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 16,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#FF9966',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '500',
    color: 'black',
    textAlign: 'left',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666666',
    opacity: 0.9,
    marginTop: 2,
    textAlign: 'left',
  },
  editButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#FF9966',
  },
  editButtonText: {
    color: '#FF9966',
    fontWeight: '500',
    fontSize: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF9966',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  badgeContainer: {
    backgroundColor: '#FF9966',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  bookingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingIcon: {
    marginRight: 6,
    boxSizing: 'border-box',
    borderRadius: 50,
  },
  bookingTitle: {
    fontSize: 19,
    fontWeight: '400',
  },
  statusBadge: {
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FF9966',
    fontSize: 12,
    fontWeight: '500',
  },
  bookingDetail: {
    marginBottom: 12,
  },
  serviceType: {
    fontSize: 13,
    fontWeight: '300',
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: 'black',
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: 'black',
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
    marginTop: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 13,
    color: '#666666',
  },
  fareText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9966',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  acceptButton: {
    backgroundColor: '#FF9966',
    borderRadius: 8,
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  declineButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  declineButtonText: {
    color: '#666666',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});

export default DriverDashboard;