import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../_layout';
import { API_BASE_URL } from '@/lib/api';

interface Credentials {
  email: string;
  phoneNumber: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    user: any;
  };
}

const SignInScreen = () => {
  const router = useRouter();
  const { setAuthState } = useContext(AuthContext);
  const [isEmail, setIsEmail] = useState(true);
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleLoginMethod = () => {
    setIsEmail(!isEmail);
  };

  const handleSignIn = async () => {
    if (isEmail && !credentials.email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    if (!isEmail && !credentials.phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    
    if (!credentials.password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const apiData = {
        identifier: isEmail 
          ? credentials.email.trim()
          : credentials.phoneNumber.replace(/[^0-9]/g, ''),
        password: credentials.password
      };

      const response = await axios.post<ApiResponse>(`${API_BASE_URL}/auth/login`, apiData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        const { accessToken, user } = response.data.data!;
        
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        const appRole = user.role === "USER" ? "customer" : user.role.toLowerCase();
        await AsyncStorage.setItem('userRole', appRole);
        
        setAuthState(true, appRole);
        
        router.replace('/(customer)/HomeScreen');
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      const axiosError = error as AxiosError<{message?: string}>;
      
      if (axiosError.response) {
        errorMessage = axiosError.response.data?.message || 'Server error';
        
        if (axiosError.response.status === 404) {
          errorMessage = 'User not found. Please check your credentials or create an account.';
        } else if (axiosError.response.status === 401) {
          errorMessage = 'Invalid credentials. Please check your password.';
        } else if (axiosError.response.status === 403) {
          if (axiosError.response.data?.message?.includes('not verified')) {
            errorMessage = 'Email not verified. Please verify your email address.';
          } else if (axiosError.response.data?.message?.includes('blocked')) {
            errorMessage = 'Your account has been blocked. Please contact support.';
          } else if (axiosError.response.data?.message?.includes('Wait for the Verification')) {
            errorMessage = 'Your account is pending verification. Please wait for the verification process to complete.';
          }
        }
      } else if (axiosError.request) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  const goToSignUp = () => {
    router.push('/(auth)/SignupScreenC');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-4 pt-3">
          <TouchableOpacity onPress={goBack} className="flex-row items-center">
            <Ionicons name="chevron-back" size={24} color="black" />
            <Text className="text-base ml-1">Back</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-4 pt-5">
          <Text className="text-2xl font-medium mb-6">Sign in</Text>

          <View className="flex-row mb-5 border border-gray-200 rounded-lg overflow-hidden">
            <TouchableOpacity 
              className={`flex-1 py-3 items-center ${isEmail ? 'bg-[#FFA07A]' : ''}`}
              onPress={() => setIsEmail(true)}
            >
              <Text className={isEmail ? 'text-white font-semibold' : 'text-gray-600'}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 py-3 items-center ${!isEmail ? 'bg-[#FFA07A]' : ''}`}
              onPress={() => setIsEmail(false)}
            >
              <Text className={!isEmail ? 'text-white font-semibold' : 'text-gray-600'}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {isEmail ? (
            <View className="mb-4">
              <TextInput
                className="h-[50px] border border-gray-200 rounded-lg px-4 text-base"
                placeholder="Email Address"
                placeholderTextColor="#A0A0A0"
                value={credentials.email}
                onChangeText={(text) => setCredentials({...credentials, email: text})}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
          ) : (
            <View className="mb-4">
              <TextInput
                className="h-[50px] border border-gray-200 rounded-lg px-4 text-base"
                placeholder="Phone Number"
                placeholderTextColor="#A0A0A0"
                value={credentials.phoneNumber}
                onChangeText={(text) => setCredentials({...credentials, phoneNumber: text.replace(/[^0-9]/g, '')})}
                keyboardType="phone-pad"
                editable={!loading}
                maxLength={10}
              />
            </View>
          )}

          <View className="relative mb-6">
            <TextInput
              className="h-[50px] border border-gray-200 rounded-lg px-4 text-base pr-12"
              placeholder="Enter Your Password"
              placeholderTextColor="#A0A0A0"
              value={credentials.password}
              onChangeText={(text) => setCredentials({...credentials, password: text})}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[14px]"
              disabled={loading}
            >
              <Ionicons 
                name={showPassword ? "eye" : "eye-off"} 
                size={22} 
                color="#A0A0A0" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={handleSignIn} 
            className="bg-[#FFA07A] rounded-lg h-[50px] justify-center items-center mb-4"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white text-base font-semibold">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center items-center">
            <Text className="text-sm text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={goToSignUp} disabled={loading}>
              <Text className="text-sm text-[#FFA07A] font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInScreen;