import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DriverDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pending');

  // Sample booking data
  const [pendingBookings, setPendingBookings] = useState([
    {
      id: 'BK12345',
      serviceType: 'Home Cleaning',
      pickupLocation: '567 Maple Dr, Heights',
      date: '2023-08-17',
      time: '09:00',
      duration: '3 hours',
      fare: '₹700',
      status: 'pending',
    },
  ]);

  const [confirmedBookings, setConfirmedBookings] = useState<{ 
    id: string; 
    serviceType: string; 
    pickupLocation: string; 
    date: string; 
    time: string; 
    duration: string; 
    fare: string; 
    status: string; 
  }[]>([]);

  // Update handlers
  const handleAccept = (booking) => {
    setPendingBookings(prev => prev.filter(b => b.id !== booking.id));
    setConfirmedBookings(prev => [...prev, { ...booking, status: 'confirmed' }]);
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
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-outline" size={24} color="white" />
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Driver</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Hello, Anjali</Text>
          <Text style={styles.subGreeting}>You can view and accept booking requests here.</Text>
        </View>
      </View>

      {/* Updated Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]} 
          onPress={() => handleTabChange('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'confirmed' && styles.activeTab]} 
          onPress={() => handleTabChange('confirmed')}
        >
          <Text style={[styles.tabText, activeTab === 'confirmed' && styles.activeTabText]}>
            Confirmed Bookings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Updated Booking Cards */}
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
                      <Text style={styles.locationText}>Location: {booking.pickupLocation}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>Date: {booking.date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>Time: {booking.time}</Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="timer-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>Duration: {booking.duration}</Text>
                  </View>
                </View>

                <View style={styles.fareContainer}>
                  <Text style={styles.fareText}>{booking.fare}</Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.acceptButton} 
                    onPress={() => handleAccept(booking)}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
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
                  <Ionicons name="home" size={22} color="#FF9966" />
                  <Text style={styles.bookingTitle}> Booking #{booking.id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={[styles.statusText, { color: '#4CAF50' }]}>Confirmed</Text>
                </View>
              </View>

              <View style={styles.bookingDetail}>
                <Text style={styles.serviceType}>       Service: {booking.serviceType}</Text>
              </View>
              <View style={styles.locationContainer}>
                <View style={styles.fareContainer}>
                  <View style={styles.locationItem}>
                    <Ionicons name="location-outline" size={20} color="#666" />
                    <Text style={styles.locationText}>Location: {booking.pickupLocation}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>Date: {booking.date}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>Time: {booking.time}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="timer-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>Duration: {booking.duration}</Text>
                </View>
              </View>

              <View style={styles.fareContainer}>
                <Text style={styles.fareText}>{booking.fare}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={22} color="#9ca3af" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={22} color="#f97316" />
          <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 16,
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
  activeTabText: {
    color: '#000000',
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
    marginBottom: 16,
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  activeNavText: {
    color: '#f97316',
  },
});

export default DriverDashboard;