import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Switch, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomTabBar from '@/components/CustomTabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from '../_layout';

// API base URL - update with your actual base URL
const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

// User data interface based on the backend response
interface UserData {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  gender: string;
  profilePicture?: string;
  isBlocked: boolean;
  isVerified: boolean;
  currentLocation?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  isNotificationOn: boolean;
  role: string;
}

const ProfileScreenCustomer = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { setAuthState } = useContext(AuthContext);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Get the stored token
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        // If no token, redirect to login
        router.replace('/signInC');
        return;
      }
      
      // Set up request with token
      const response = await axios.get(`${apiUrl}/user/self-identification`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        const user = response.data.data;
        setUserData(user);
        setEmail(user.email || '');
        setNotificationsEnabled(user.isNotificationOn || false);
        setPhoneNumber(user.phoneNumber || '');
        
        // Set location enabled based on whether currentLocation exists
        setLocationEnabled(!!user.currentLocation);
      } else {
        Alert.alert('Error', 'Failed to fetch user data');
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        Alert.alert('Session Expired', 'Please login again');
        await AsyncStorage.removeItem('accessToken');
        router.replace('/signInC');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to fetch profile data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    // Toggle edit mode
    if (!isEditMode) {
      setIsEditMode(true);
      return;
    }
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }
    
    setIsUpdating(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        router.replace('/signInC');
        return;
      }
      
      // Prepare data for update - only send changed fields
      let updateData: any = {};
      
      if (phoneNumber !== userData?.phoneNumber) {
        updateData.phoneNumber = phoneNumber;
      }
      
      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const response = await axios.put(`${apiUrl}/user`, updateData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.success) {
          Alert.alert('Success', 'Profile updated successfully');
          setUserData(response.data.data);
        } else {
          Alert.alert('Error', 'Failed to update profile');
        }
      }
      
      // Exit edit mode regardless of whether API call was made
      setIsEditMode(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleNotification = async (value: boolean) => {
    setNotificationsEnabled(value);
    
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        router.replace('/signInC');
        return;
      }
      
      // Update notification setting immediately in the backend
      const response = await axios.put(`${apiUrl}/user`, {
        isNotificationOn: value
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success) {
        // Update userData with the new value directly
        if (userData) {
          setUserData({
            ...userData,
            isNotificationOn: value
          });
        }
      } else {
        // Revert if failed
        setNotificationsEnabled(!value);
        Alert.alert('Error', 'Failed to update notification settings');
      }
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      // Revert UI state if update fails
      setNotificationsEnabled(!value);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update notification settings');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleBookingHistory = () => {
    router.push('/MyBookingScreen');
  };

  const handlePaymentMethods = () => {
    router.push('/PaymentsScreen');
  };

  const handlePrivacyPolicy = () => {
    router.push('/PrivacyPolicy');
  };

  const handleTermsConditions = () => {
    router.push('/TermsAndCondition');
  };

  const handleLogout = async () => {
  try {
    setIsLoading(true);
    
    delete axios.defaults.headers.common['Authorization'];
    console.log('Cleared axios auth header');
    
    setAuthState(false, null);
    
    const keysToRemove = [
      'accessToken', 
      'userData', 
      'refreshToken',
      'userRole',
      'userPreferences'
    ];
    
    try {
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('AsyncStorage cleared successfully');
    } catch (storageError) {
      console.error('AsyncStorage clear error:', storageError);
    }
    
    setUserData(null);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    router.replace('/');
    
  } catch (error) {
    console.error('Error during logout:', error);
    
    try {
      setAuthState(false, null);
      router.replace('/');
    } catch (navError) {
      console.error('Navigation error:', navError);
      Alert.alert('Severe Error', 'Please restart the application');
    }
  } finally {
    setIsLoading(false);
  }
};

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center" style={{
                paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
              }}>
        <ActivityIndicator size="large" color="#FF9966" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" style={{
      paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
    }}>
      {/* Main Container */}
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-3 bg-white">
          <TouchableOpacity onPress={handleBack} className="p-1">
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-base font-semibold">Profile</Text>
          <TouchableOpacity onPress={handleUpdateProfile} disabled={isUpdating}>
            {isUpdating ? (
              <ActivityIndicator size="small" color="#FF9966" />
            ) : (
              <Text className="text-[#FF9966] font-medium">
                {isEditMode ? 'Save' : 'Edit'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="h-px bg-gray-200" />

        {/* Scrollable Content */}
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Icon and Name */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-[#FFC8A2] justify-center items-center">
              <Ionicons name="person-outline" size={36} color="white" />
            </View>
            <Text className="text-lg font-semibold mt-2" style={{textAlign: 'center'}}>{userData?.name || 'User'}</Text>
          </View>

          {/* Contact Information */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-base font-medium mb-4">Contact Information</Text>
            
            <Text className="text-sm text-gray-600 mb-2">Phone Number</Text>
            <View className="flex-row mb-4">
              {isEditMode ? (
                <TextInput
                  className="flex-1 h-[42px] border border-gray-200 rounded-lg px-3 bg-gray-50 text-gray-800"
                  placeholder="Phone Number"
                  placeholderTextColor="#9ca3af"
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                  editable={!isUpdating}
                  maxLength={10}
                />
              ) : (
                <View className="flex-row items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 w-full">
                  <Ionicons name="call-outline" size={18} color="#9ca3af" style={{marginRight: 8}} />
                  <Text className="flex-1 text-gray-800">{userData?.phoneNumber || 'Not available'}</Text>
                </View>
              )}
            </View>
            
            <Text className="text-sm text-gray-600 mb-2">Email Address</Text>
            <View className="flex-row items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 mb-4">
              <MaterialIcons name="email" size={18} color="#9ca3af" style={{marginRight: 8}} />
              <Text className="flex-1 text-gray-800">{userData?.email || 'Not available'}</Text>
            </View>
          </View>

          {/* Settings */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-base font-medium mb-4">Settings</Text>
            
            <View className="flex-row justify-between items-center py-2">
              <View>
                <Text className="text-sm text-gray-800">Notifications</Text>
                <Text className="text-xs text-gray-500 mt-0.5">Receive booking updates</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotification}
                thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
                trackColor={{ false: '#d1d5db', true: '#FF9966' }}
                ios_backgroundColor="#d1d5db"
              />
            </View>
            
            <View className="flex-row justify-between items-center py-2">
              <View>
                <Text className="text-sm text-gray-800">Location Services</Text>
                <Text className="text-xs text-gray-500 mt-0.5">Allow access to your location</Text>
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
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3"
              onPress={handleBookingHistory}
            >
              <Text className="text-sm text-gray-800">Booking History</Text>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
            
            <View className="h-px bg-gray-200" />
            
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3"
              onPress={handlePaymentMethods}
            >
              <Text className="text-sm text-gray-800">Payment Methods</Text>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-base font-medium mb-4">Legal & Support</Text>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3"
              onPress={handlePrivacyPolicy}
            >
              <Text className="text-sm text-gray-800">Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
            
            <View className="h-px bg-gray-200" />
            
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3"
              onPress={handleTermsConditions}
            >
              <Text className="text-sm text-gray-800">Terms & Conditions</Text>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Log Out */}
          <TouchableOpacity 
            className="flex-row justify-between items-center bg-white rounded-lg px-4 py-3.5 mb-4 shadow-sm"
            onPress={handleLogout}
          >
            <Text className="text-[#FF5757] text-sm font-medium">Log Out</Text>
            <Ionicons name="log-out-outline" size={18} color="#FF5757" />
          </TouchableOpacity>
          
          {/* Add padding at the bottom for TabBar */}
          <View className="h-24" />
        </ScrollView>
      </View>

      {/* Bottom Tab Bar */}
      <CustomTabBar activeRoute="Profile" />
    </SafeAreaView>
  );
};

export default ProfileScreenCustomer;