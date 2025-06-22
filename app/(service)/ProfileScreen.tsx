import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import * as Location from 'expo-location';
import { useBooking } from '../../components/BookingContext';
import { AuthContext } from '../_layout';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface Profile {
  name: string;
  phoneNumber: string;
  email: string;
  gender: string;
  profilePicture: string | null;
  isVerified: boolean;
  serviceIds: string[];
}

interface FormData {
  name: string;
  phoneNumber: string;
  email: string;
  gender: string;
}

const ProfileScreen = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const { setAuthState } = useContext(AuthContext);

  const { isAvailable, isNotificationOn, setAvailability, setNotifications } = useBooking();

  const [lastLocation, setLastLocation] = useState(null);

  useEffect(() => {
    const loadCachedLocation = async () => {
      try {
        const locationStr = await AsyncStorage.getItem('@helpIt:location');
        if (locationStr) {
          setLastLocation(JSON.parse(locationStr));
        }
      } catch (error) {
        console.error('Error loading cached location:', error);
      }
    };

    loadCachedLocation();
  }, []);

  const [profile, setProfile] = useState<Profile>({
    name: '',
    phoneNumber: '',
    email: '',
    gender: '',
    profilePicture: null,
    isVerified: false,
    serviceIds: []
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phoneNumber: '',
    email: '',
    gender: ''
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${API_BASE_URL}/service-provider/self-identification`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.data) {
        const profileData = response.data.data;
        setProfile({
          ...profileData,
          serviceIds: profileData.serviceIds || []
        });

        setFormData({
          name: profileData.name || '',
          phoneNumber: profileData.phoneNumber || '',
          email: profileData.email || '',
          gender: profileData.gender || ''
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Modified handleToggleAvailability function without distance calculation
  const handleToggleAvailability = async () => {
  if (isAvailabilityLoading) return;

  setIsAvailabilityLoading(true);
  const newStatus = !isAvailable;

  try {
    // Simply call the context method - it handles everything now
    await setAvailability(newStatus);

    // Show success toast
    Toast.show({
      type: 'success',
      text1: newStatus ? 'You are now available' : 'You are now offline',
      text2: newStatus ? 'You can now receive booking requests' : 'You will not receive new booking requests',
      position: 'bottom',
      visibilityTime: 2000
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    // Error handling is already done in context, just show a generic message
    Toast.show({
      type: 'error',
      text1: 'Update Failed',
      text2: error.message || 'Could not update your availability status.',
      position: 'bottom'
    });
  } finally {
    setIsAvailabilityLoading(false);
  }
};

  const handleToggleNotification = async () => {
    if (isNotificationLoading) return;

    setIsNotificationLoading(true);
    try {
      await setNotifications(!isNotificationOn);
      Toast.show({
        type: 'success',
        text1: isNotificationOn ? 'Notifications turned off' : 'Notifications turned on',
        position: 'bottom',
        visibilityTime: 2000
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Could not update notification settings.',
        position: 'bottom'
      });
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.put(
        `${API_BASE_URL}/service-provider/`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data?.data) {
        setProfile(prev => ({
          ...prev,
          ...response.data.data
        }));
        setIsEditing(false);
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Your profile information has been updated successfully',
          position: 'bottom',
          visibilityTime: 3000
        });
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);

      if (err.response?.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please log in again.',
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
          onHide: async () => {
            await AsyncStorage.multiRemove(['accessToken', 'userRole', 'userData']);
            router.replace('/login-selection');
          }
        });
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: errorMessage,
          position: 'bottom',
          visibilityTime: 4000
        });
      }
    }
  };

  const handlePrivacyPolicy = () => {
    router.push('/PrivacyPolicyService');
  };

  const handleTermsConditions = () => {
    router.push('/TermsAndConditionService');
  };

  // New improved logout function
  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // Clear axios authorization header first
      delete axios.defaults.headers.common['Authorization'];
      console.log('Cleared axios auth header');
      
      // Update auth context to logged out state
      setAuthState(false, null);
      
      // Define all keys to remove from storage
      const keysToRemove = [
        'accessToken',
        'userData',
        'refreshToken',
        'userRole',
        'userPreferences',
        '@helpIt:location' // Also clear cached location data
      ];
      
      // Clear AsyncStorage with proper error handling
      try {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log('AsyncStorage cleared successfully');
      } catch (storageError) {
        console.error('AsyncStorage clear error:', storageError);
        // Continue as auth context is already updated
      }
      
      // Reset component state
      setProfile({
        name: '',
        phoneNumber: '',
        email: '',
        gender: '',
        profilePicture: null,
        isVerified: false,
        serviceIds: []
      });
      
      // Show toast notification
      Toast.show({
        type: 'info',
        text1: 'Logged Out',
        position: 'bottom',
        visibilityTime: 2000
      });
      
      // Ensure everything is complete before navigation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to the onboarding screen
      router.replace('/');
      
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Still try to reset auth state and navigate
      try {
        setAuthState(false, null);
        router.replace('/');
      } catch (navError) {
        console.error('Navigation error:', navError);
        Toast.show({
          type: 'error',
          text1: 'Logout Failed',
          text2: 'Please restart the application',
          position: 'bottom'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FFB74D" />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-gray-50">
        <Text className="text-red-500 mb-5 text-center">{error}</Text>
        <TouchableOpacity
          className="bg-orange-400 py-3 px-6 rounded-lg"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render Profile Info component
  const renderProfileInfo = () => (
    <View className="space-y-4">
      <View className="mb-3">
        <Text className="text-xs text-gray-600 mb-1">Full Name</Text>
        <View className="flex-row items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
          <Ionicons name="person-outline" size={16} color="#666" style={{ marginRight: 8 }} />
          <Text className="text-sm text-gray-800">{profile.name || 'Not provided'}</Text>
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-xs text-gray-600 mb-1">Phone Number</Text>
        <View className="flex-row items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
          <Ionicons name="call-outline" size={16} color="#666" style={{ marginRight: 8 }} />
          <Text className="text-sm text-gray-800">{profile.phoneNumber}</Text>
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-xs text-gray-600 mb-1">Email Address</Text>
        <View className="flex-row items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
          <Ionicons name="mail-outline" size={16} color="#666" style={{ marginRight: 8 }} />
          <Text className="text-sm text-gray-800">{profile.email || 'Not provided'}</Text>
        </View>
      </View>

      <View className="mb-1">
        <Text className="text-xs text-gray-600 mb-1">Gender</Text>
        <View className="flex-row items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
          <Ionicons name="person-outline" size={16} color="#666" style={{ marginRight: 8 }} />
          <Text className="text-sm text-gray-800">
            {profile.gender === 'MALE' ? 'Male' :
              profile.gender === 'FEMALE' ? 'Female' :
                profile.gender === 'OTHER' ? 'Other' : 'Not specified'}
          </Text>
        </View>
      </View>
    </View>
  );

  // Render Edit Form component
  const renderEditForm = () => (
    <View className="space-y-4">
      <View className="mb-4">
        <Text className="text-sm font-medium mb-2 text-gray-800">Full Name</Text>
        <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3 h-12">
          <Ionicons name="person-outline" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium mb-2 text-gray-800">Phone Number</Text>
        <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3 h-12">
          <Ionicons name="call-outline" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="10-digit mobile number"
            value={formData.phoneNumber}
            onChangeText={(text) => handleInputChange('phoneNumber', text)}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium mb-2 text-gray-800">Email Address</Text>
        <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3 h-12">
          <Ionicons name="mail-outline" size={20} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="your@email.com"
            value={formData.email || ''}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
          />
        </View>
      </View>

      <View className="mb-1">
        <Text className="text-sm font-medium mb-2 text-gray-800">Gender</Text>
        <View className="flex-row justify-between space-x-2">
          {['MALE', 'FEMALE', 'OTHER'].map((gender) => (
            <TouchableOpacity
              key={gender}
              className={`flex-1 h-10 justify-center items-center rounded-lg border ${formData.gender === gender ? 'bg-orange-50 border-orange-400' : 'bg-gray-50 border-gray-200'
                }`}
              onPress={() => handleInputChange('gender', gender)}
            >
              <Text
                className={`font-medium ${formData.gender === gender ? 'text-orange-500' : 'text-gray-600'
                  }`}
              >
                {gender === 'MALE' ? 'Male' : gender === 'FEMALE' ? 'Female' : 'Other'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          className="flex-1"
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
              <TouchableOpacity onPress={() => router.back()} className="p-1">
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text className="text-xl font-semibold">Profile</Text>
              <TouchableOpacity onPress={() => setIsEditing(!isEditing)} className="p-1">
                <Text className="text-orange-400 font-medium">{isEditing ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <View className="items-center mb-5">
              <View className="w-20 h-20 rounded-full bg-orange-400 justify-center items-center mb-3">
                {profile.profilePicture ? (
                  <Image
                    source={{ uri: profile.profilePicture }}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <Ionicons name="person" size={40} color="white" />
                )}
              </View>
              <Text className="text-lg font-semibold mb-1">{profile.name || 'Service Provider'}</Text>
              {profile.isVerified && (
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#FFB74D" />
                  <Text className="ml-1 text-gray-600">Verified Provider</Text>
                </View>
              )}
            </View>

            {isEditing ? (
              /* Edit Form */
              <View className="space-y-4">
                <View className="bg-white rounded-lg p-4 shadow-sm">
                  <Text className="text-base font-semibold mb-4 pb-2 border-b border-gray-100 text-gray-800">Personal Information</Text>
                  {renderEditForm()}
                </View>

                <TouchableOpacity
                  className="bg-orange-400 rounded-lg h-12 justify-center items-center"
                  onPress={handleSubmit}
                >
                  <Text className="text-white font-semibold text-base">Save Changes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* View Mode */
              <>
                {/* Contact Information */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <Text className="text-base font-semibold mb-4 pb-2 border-b border-gray-100 text-gray-800">Contact Information</Text>
                  {renderProfileInfo()}
                </View>

                {/* Manage Profile */}
                <TouchableOpacity
                  className="flex-row justify-between items-center bg-white rounded-lg p-4 mb-4 shadow-sm"
                  onPress={() => setIsEditing(true)}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="create-outline" size={20} color="#FFB74D" />
                    <Text className="text-gray-800 font-medium ml-2">Edit Profile Information</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>

                {/* Settings */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <Text className="text-base font-semibold mb-4 pb-2 border-b border-gray-100 text-gray-800">Settings</Text>

                  <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                    <View>
                      <Text className="text-sm font-medium text-gray-800">Availability Status</Text>
                      <Text className="text-xs text-gray-600">Show as available for new bookings</Text>
                    </View>
                    {isAvailabilityLoading ? (
                      <ActivityIndicator size="small" color="#FFB74D" />
                    ) : (
                      <Switch
                        value={isAvailable}
                        onValueChange={handleToggleAvailability}
                        trackColor={{ false: "#e5e7eb", true: "#FFB74D" }}
                        thumbColor={"#ffffff"}
                        disabled={isAvailabilityLoading}
                      />
                    )}
                  </View>

                  <View className="flex-row justify-between items-center py-3">
                    <View>
                      <Text className="text-sm font-medium text-gray-800">Notifications</Text>
                      <Text className="text-xs text-gray-600">Receive booking updates</Text>
                    </View>
                    {isNotificationLoading ? (
                      <ActivityIndicator size="small" color="#FFB74D" />
                    ) : (
                      <Switch
                        value={isNotificationOn}
                        onValueChange={handleToggleNotification}
                        trackColor={{ false: "#e5e7eb", true: "#FFB74D" }}
                        thumbColor={"#ffffff"}
                        disabled={isNotificationLoading}
                      />
                    )}
                  </View>
                </View>

                {/* Legal & Support */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <Text className="text-base font-semibold mb-4 pb-2 border-b border-gray-100 text-gray-800">Legal & Support</Text>
                  
                  <TouchableOpacity 
                    className="flex-row justify-between items-center py-3 border-b border-gray-100"
                    onPress={handlePrivacyPolicy}
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="shield-checkmark-outline" size={20} color="#FFB74D" />
                      <Text className="text-sm font-medium text-gray-800 ml-2">Privacy Policy</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="flex-row justify-between items-center py-3"
                    onPress={handleTermsConditions}
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="document-text-outline" size={20} color="#FFB74D" />
                      <Text className="text-sm font-medium text-gray-800 ml-2">Terms & Conditions</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity
                  className="flex-row justify-between items-center bg-white rounded-lg p-4 mb-20 border border-red-100"
                  onPress={handleLogout}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="log-out-outline" size={20} color="#FF5252" />
                    <Text className="text-red-500 font-medium ml-2">Log Out</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FF5252" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white flex-row h-16 border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          onPress={() => router.push('/Dashboard')}
        >
          <Ionicons name="home-outline" size={24} color="#888" />
          <Text className="text-xs text-gray-500 mt-1">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 justify-center items-center">
          <Ionicons name="person" size={24} color="#FFB74D" />
          <Text className="text-xs text-orange-400 mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;