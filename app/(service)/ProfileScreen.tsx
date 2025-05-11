import React, { useState, useEffect } from 'react';
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


const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface Profile {
  name: string;
  phoneNumber: string;
  email: string;
  gender: string;
  profilePicture: string | null;
  isAvailable: boolean;
  isNotificationOn: boolean;
  serviceIds: string[];
  isVerified: boolean;
}

interface FormData {
  name: string;
  phoneNumber: string;
  email: string;
  gender: string;
  isAvailable: boolean;
  isNotificationOn: boolean;
}

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile>({
    name: '',
    phoneNumber: '',
    email: '',
    gender: '',
    profilePicture: null,
    isAvailable: false,
    isNotificationOn: true,
    serviceIds: [],
    isVerified: false
  });

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phoneNumber: '',
    email: '',
    gender: '',
    isAvailable: false,
    isNotificationOn: true,
  });

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
  
      if (response.data && response.data.data) {
        const profileData = response.data.data;
        setProfile({
          ...profileData,
          serviceIds: profileData.serviceIds || []
        });
  
        setFormData({
          name: profileData.name || '',
          phoneNumber: profileData.phoneNumber || '',
          email: profileData.email || '',
          gender: profileData.gender || '',
          isAvailable: profileData.isAvailable || false, // Sync with backend
          isNotificationOn: profileData.isNotificationOn || true,
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: keyof FormData, value: string | boolean) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleToggleChange = async (name: keyof FormData) => {
    const updatedValue = !formData[name];
  
    setFormData({
      ...formData,
      [name]: updatedValue
    });
  
    if (name === 'isAvailable' && updatedValue === true) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
  
        if (status !== 'granted') {
          Toast.show({
            type: 'warning',
            text1: 'Location Required',
            text2: 'Location permission is needed to be available for bookings',
            position: 'bottom',
          });
  
          setFormData(prev => ({
            ...prev,
            isAvailable: false
          }));
          return;
        }
  
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
  
        await updateSettingWithLocation(name, updatedValue, {
          lat: location.coords.latitude,
          long: location.coords.longitude
        });
  
        await AsyncStorage.setItem('@helpIt:location', JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }));
      } catch (error) {
        console.error('Error getting location:', error);
        Toast.show({
          type: 'error',
          text1: 'Location Error',
          text2: 'Could not get your location. Please try again.',
          position: 'bottom'
        });
  
        setFormData(prev => ({
          ...prev,
          isAvailable: false
        }));
      }
    } else {
      await updateSetting(name, updatedValue);
    }
  };

  const updateSettingWithLocation = async (field: keyof FormData, value: boolean, locationData: { lat: number, long: number }) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      const updateData = { 
        [field]: value,
        currentLocation: locationData
      };
  
      const response = await axios.put(
        `${API_BASE_URL}/service-provider/`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      if (response.data && response.data.data) {
        setProfile(prev => ({
          ...prev,
          [field]: value
        }));
        
        Toast.show({
          type: 'success',
          text1: 'Updated',
          text2: `${field === 'isAvailable' ? 'Availability' : 'Notification'} setting updated`,
          position: 'bottom',
          visibilityTime: 2000
        });
      }
    } catch (err) {
      console.error(`Error updating ${field} with location:`, err);
      
      if (err.response && err.response.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please log in again.',
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
          onHide: async () => {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('userRole');
            await AsyncStorage.removeItem('userData');
            router.replace('/SignInService');
          }
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: `Failed to update ${field === 'isAvailable' ? 'availability' : 'notification'} setting.`,
          position: 'bottom'
        });
        
        setFormData(prev => ({
          ...prev,
          [field]: !value
        }));
      }
    }
  };

  const updateSetting = async (field: keyof FormData, value: boolean) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const updateData = { [field]: value };

      const response = await axios.put(
        `${API_BASE_URL}/service-provider/`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.data) {
        setProfile(prev => ({
          ...prev,
          [field]: value
        }));
        
        Toast.show({
          type: 'success',
          text1: 'Updated',
          text2: `${field === 'isAvailable' ? 'Availability' : 'Notification'} setting updated`,
          position: 'bottom',
          visibilityTime: 2000
        });
      }
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      
      if (err.response && err.response.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please log in again.',
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
          onHide: async () => {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('userRole');
            await AsyncStorage.removeItem('userData');
            router.replace('/SignInService');
          }
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: `Failed to update ${field === 'isAvailable' ? 'availability' : 'notification'} setting.`,
          position: 'bottom'
        });
      }
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
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.data) {
        setProfile({
          ...profile,
          ...response.data.data
        });
        setIsEditing(false);
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Your profile information has been updated successfully',
          position: 'bottom',
          visibilityTime: 3000
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.response && err.response.status === 401) {
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please log in again.',
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
          onHide: async () => {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('userRole');
            await AsyncStorage.removeItem('userData');
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'userRole', 'userData']);
      
      Toast.show({
        type: 'info',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully',
        position: 'bottom',
        visibilityTime: 2000
      });
      
      setTimeout(() => {
        router.replace('/SignInService');
      }, 300);
    } catch (error) {
      console.error('Error during logout:', error);
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'Failed to log out. Please try again.',
        position: 'bottom'
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#FFB74D" />
      </View>
    );
  }

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
        {/* <TouchableOpacity
          className="bg-orange-400 py-3 px-6 rounded-lg"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold">Logout</Text>
        </TouchableOpacity> */}
      </View>
    );
  }
  
  return (
    <>
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={true}
          className="flex-1"
          keyboardShouldPersistTaps="handled"
        >
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity onPress={handleBack} className="p-1">
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
                    <TouchableOpacity
                      className={`flex-1 h-10 justify-center items-center rounded-lg border ${
                        formData.gender === 'MALE' ? 'bg-orange-50 border-orange-400' : 'bg-gray-50 border-gray-200'
                      }`}
                      onPress={() => handleInputChange('gender', 'MALE')}
                    >
                      <Text 
                        className={`font-medium ${
                          formData.gender === 'MALE' ? 'text-orange-500' : 'text-gray-600'
                        }`}
                      >
                        Male
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className={`flex-1 h-10 justify-center items-center rounded-lg border ${
                        formData.gender === 'FEMALE' ? 'bg-orange-50 border-orange-400' : 'bg-gray-50 border-gray-200'
                      }`}
                      onPress={() => handleInputChange('gender', 'FEMALE')}
                    >
                      <Text 
                        className={`font-medium ${
                          formData.gender === 'FEMALE' ? 'text-orange-500' : 'text-gray-600'
                        }`}
                      >
                        Female
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className={`flex-1 h-10 justify-center items-center rounded-lg border ${
                        formData.gender === 'OTHER' ? 'bg-orange-50 border-orange-400' : 'bg-gray-50 border-gray-200'
                      }`}
                      onPress={() => handleInputChange('gender', 'OTHER')}
                    >
                      <Text 
                        className={`font-medium ${
                          formData.gender === 'OTHER' ? 'text-orange-500' : 'text-gray-600'
                        }`}
                      >
                        Other
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
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
                <View className="space-y-4">
                  <View className="mb-3">
                    <Text className="text-xs text-gray-600 mb-1">Full Name</Text>
                    <View className="flex-row items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Ionicons name="person-outline" size={16} color="#666" className="mr-2" />
                      <Text className="text-sm text-gray-800">{profile.name || 'Not provided'}</Text>
                    </View>
                  </View>
                  
                  <View className="mb-3">
                    <Text className="text-xs text-gray-600 mb-1">Phone Number</Text>
                    <View className="flex-row items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Ionicons name="call-outline" size={16} color="#666" className="mr-2" />
                      <Text className="text-sm text-gray-800">{profile.phoneNumber}</Text>
                    </View>
                  </View>
                  
                  <View className="mb-3">
                    <Text className="text-xs text-gray-600 mb-1">Email Address</Text>
                    <View className="flex-row items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Ionicons name="mail-outline" size={16} color="#666" className="mr-2" />
                      <Text className="text-sm text-gray-800">{profile.email || 'Not provided'}</Text>
                    </View>
                  </View>
                  
                  <View className="mb-1">
                    <Text className="text-xs text-gray-600 mb-1">Gender</Text>
                    <View className="flex-row items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Ionicons name="person-outline" size={16} color="#666" className="mr-2" />
                      <Text className="text-sm text-gray-800">
                        {profile.gender === 'MALE' ? 'Male' : 
                         profile.gender === 'FEMALE' ? 'Female' : 
                         profile.gender === 'OTHER' ? 'Other' : 'Not specified'}
                      </Text>
                    </View>
                  </View>
                </View>
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
                  <Switch
                    value={formData.isAvailable}
                    onValueChange={() => handleToggleChange('isAvailable')}
                    trackColor={{ false: "#e5e7eb", true: "#FFB74D" }}
                    thumbColor={"#ffffff"}
                  />
                </View>

                <View className="flex-row justify-between items-center py-3">
                  <View>
                    <Text className="text-sm font-medium text-gray-800">Notifications</Text>
                    <Text className="text-xs text-gray-600">Receive booking updates</Text>
                  </View>
                  <Switch
                    value={formData.isNotificationOn}
                    onValueChange={() => handleToggleChange('isNotificationOn')}
                    trackColor={{ false: "#e5e7eb", true: "#FFB74D" }}
                    thumbColor={"#ffffff"}
                  />
                </View>
              </View>

              {/* Additional Links */}
              <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <Ionicons name="document-text-outline" size={20} color="#FFB74D" className="mr-2" />
                    <Text className="text-sm font-medium text-gray-800">Booking History</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
                
                <TouchableOpacity className="flex-row justify-between items-center py-3">
                  <View className="flex-row items-center">
                    <Ionicons name="card-outline" size={20} color="#FFB74D" className="mr-2" />
                    <Text className="text-sm font-medium text-gray-800">Payment Information</Text>
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
                  <Ionicons name="log-out-outline" size={20} color="#FF5252" className="mr-2" />
                  <Text className="text-red-500 font-medium">Log Out</Text>
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
    </>
  )
};

export default ProfileScreen;
