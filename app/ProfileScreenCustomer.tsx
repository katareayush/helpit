import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomTabBar from '@/components/CustomTabBar';

const ProfileScreenCustomer = () => {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

    const handleBack = () => {
        router.back();
    };

  const handleBookingHistory = () => {
    router.push('/MyBookingScreen');
  };

  const handlePaymentMethods = () => {
    router.push('/PaymentsScreen');
  };

  const handleLogout = () => {
    // Add logout logic
    router.replace('/login-selection');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Content */}
      <View style={styles.content}>
        {/* Profile Icon and Name */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-outline" size={36} color="white" />
          </View>
          <Text style={styles.userName}>Aditya Agarwal</Text>
        </View>

        {/* Contact Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
            <Text style={styles.inputText}>8923612313</Text>
          </View>
          
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={18} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              placeholder="Enter email address"
              style={styles.input}
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>Receive booking updates</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
              trackColor={{ false: '#d1d5db', true: '#FF9966' }}
              ios_backgroundColor="#d1d5db"
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Location Services</Text>
              <Text style={styles.settingDescription}>Allow access to your location</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              thumbColor={locationEnabled ? '#ffffff' : '#f4f3f4'}
              trackColor={{ false: '#d1d5db', true: '#FF9966' }}
              ios_backgroundColor="#d1d5db"
            />
          </View>
        </View>

        {/* Navigation Options */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={handleBookingHistory}
          >
            <Text style={styles.navText}>Booking History</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
          
          <View style={styles.navDivider} />
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={handlePaymentMethods}
          >
            <Text style={styles.navText}>Payment Methods</Text>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
          <Ionicons name="log-out-outline" size={18} color="#FF5757" />
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Tab Bar */}
      <CustomTabBar activeRoute="Profile" />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    color: '#FF9966',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFC8A2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    color: '#374151',
  },
  input: {
    flex: 1,
    color: '#374151',
    padding: 0,
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#374151',
  },
  settingDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  navItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  navDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  navText: {
    fontSize: 15,
    color: '#374151',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    color: '#FF5757',
    fontSize: 15,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FF5757',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  deleteText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ProfileScreenCustomer;