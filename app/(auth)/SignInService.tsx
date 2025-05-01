import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';

const SignInService = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        phoneNumber,
      });

      router.push({
        pathname: '/VerifyOTP',
        params: { phoneNumber }
      });
    } catch (error: any) {
      console.error('OTP request error:', error);
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = 'Service provider not found. Please contact the administrator.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  const handlePhoneNumberChange = (text: string) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    if (cleanedText.length <= 10) {
      setPhoneNumber(cleanedText);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-4 pt-2.5">
          <TouchableOpacity onPress={goBack} className="flex-row items-center">
            <Ionicons name="chevron-back" size={24} color="black" />
            <Text className="text-base ml-1">Back</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center mt-20 mb-12">
          <Text className="text-[35px] font-medium">
            Help<Text className="text-[#FF9966]">it.</Text>
          </Text>
        </View>

        <View className="px-5">
          <Text className="text-[23px] font-medium text-center mb-5">Sign in</Text>
          
          <View className="mb-5">
            <TextInput
              className="h-[50px] border border-[#E0E0E0] rounded-lg px-4 text-base"
              placeholder="Phone Number"
              placeholderTextColor="#A0A0A0"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <TouchableOpacity 
            onPress={handleGetOTP} 
            className={`rounded-lg h-[50px] justify-center items-center mb-4 ${isLoading ? 'bg-[#FFCC99]' : 'bg-[#FF9966]'}`}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? 'Sending...' : 'Get OTP'}
            </Text>
          </TouchableOpacity>
          
          <Text className="text-center text-[#666666] text-sm mt-5">
            Note: Only service providers registered by the administrator can login.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInService;