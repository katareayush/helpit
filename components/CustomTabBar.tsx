import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

const CustomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentRoute = pathname.split('/').pop(); // e.g., 'Home', 'MyBookingScreen'

  return (
    <View style={styles.bottomTabBar}>
      <TouchableOpacity style={styles.tabBarItem} onPress={() => router.push('/HomeScreen')}>
        <Ionicons 
          name="home-outline" 
          size={24} 
          color={currentRoute === 'HomeScreen' ? '#FDA172' : '#888'} 
        />
        <Text style={[
          styles.tabBarItemText,
          currentRoute === 'HomeScreen' && styles.activeTabBarItemText
        ]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabBarItem} onPress={() => router.push('/MyBookingScreen')}>
        <Ionicons 
          name="calendar-outline" 
          size={24} 
          color={currentRoute === 'MyBookingScreen' ? '#FDA172' : '#888'} 
        />
        <Text style={[
          styles.tabBarItemText,
          currentRoute === 'MyBookingScreen' && styles.activeTabBarItemText
        ]}>Bookings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabBarItem} onPress={() => router.push('/PaymentsScreen')}>
        <Ionicons 
          name="card-outline" 
          size={24} 
          color={currentRoute === 'PaymentsScreen' ? '#FDA172' : '#888'} 
        />
        <Text style={[
          styles.tabBarItemText,
          currentRoute === 'PaymentsScreen' && styles.activeTabBarItemText
        ]}>Payments</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabBarItem} onPress={() => router.push('/ProfileScreenCustomer')}>
        <Ionicons 
          name="person-outline" 
          size={24} 
          color={currentRoute === 'ProfileScreenCustomer' ? '#FDA172' : '#888'} 
        />
        <Text style={[
          styles.tabBarItemText,
          currentRoute === 'ProfileScreenCustomer' && styles.activeTabBarItemText
        ]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 70,
    paddingBottom: 8,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarItemText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  activeTabBarItemText: {
    color: '#FDA172',
  },
});

export default CustomTabBar;
