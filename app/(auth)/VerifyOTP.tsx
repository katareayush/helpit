import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../_layout';
import { API_BASE_URL } from '@/lib/api';
import axios from 'axios';

const VerifyOTP = () => {
  const router = useRouter();
  const { setAuthState } = useContext(AuthContext);
  const { phoneNumber } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [isResendActive, setIsResendActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create refs for the OTP digit inputs
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (timer > 0 && !isResendActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendActive(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, isResendActive]);

  // Update the combined OTP whenever individual digits change
  useEffect(() => {
    setOtp(otpDigits.join(''));
  }, [otpDigits]);

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        phoneNumber,
        otp
      });
  
      if (response.data && response.data.data) {
        const { accessToken, serviceProviderData } = response.data.data;
  
        // Important: First store the token in storage
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('userRole', 'service');
        
        if (serviceProviderData) {
          await AsyncStorage.setItem('userData', JSON.stringify(serviceProviderData));
        }
  
        // Set axios auth header directly
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  
        // Then update auth context 
        setAuthState(true, 'service');
  
        // Add a small delay to ensure state updates before navigation
        setTimeout(() => {
          router.replace('/(service)/Dashboard');
        }, 100);
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to verify OTP. Please try again.';
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    
    try {
      await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        phoneNumber
      });

      setTimer(30);
      setIsResendActive(false);

      Alert.alert('Success', 'OTP sent successfully');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  // Handle input for individual OTP digits
  const handleDigitChange = (text: string, index: number) => {
    if (text.length > 1) {
      // If pasting multiple digits
      const pastedText = text.replace(/[^0-9]/g, '').substring(0, 6);
      
      const newOtpDigits = [...otpDigits];
      for (let i = 0; i < pastedText.length; i++) {
        if (index + i < 6) {
          newOtpDigits[index + i] = pastedText[i];
        }
      }
      
      setOtpDigits(newOtpDigits);
      
      // Focus on the next empty input or the last one
      const nextIndex = Math.min(index + pastedText.length, 5);
      if (nextIndex < 6) {
        inputRefs.current[nextIndex]?.focus();
      }
    } else {
      // Update the digit
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = text;
      setOtpDigits(newOtpDigits);
      
      // Auto-focus next input if this one is filled
      if (text !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace in the OTP inputs
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otpDigits[index] === '' && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="px-4 pt-2">
          <TouchableOpacity onPress={goBack} className="flex-row items-center">
            <Ionicons name="chevron-back" size={24} color="black" />
            <Text className="text-base ml-1">Back</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center mt-20 mb-12">
          <Text className="text-4xl font-medium">
            Help<Text className="text-orange-400">it.</Text>
          </Text>
        </View>

        <View className="px-5">
          <Text className="text-xl font-medium text-center mb-5">Verify OTP</Text>

          <Text className="text-center text-base mb-8 text-gray-600">
            Enter the 6-digit code sent to
            <Text className="font-semibold"> {phoneNumber}</Text>
          </Text>

          {/* OTP Input Boxes */}
          <View className="flex-row justify-between mb-8">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <View 
                key={index} 
                className="w-12 h-14 border-b-2 border-gray-300 justify-center items-center mx-1"
              >
                <TextInput
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  className="text-xl font-bold text-center w-full h-full"
                  keyboardType="number-pad"
                  maxLength={1}
                  value={otpDigits[index]}
                  onChangeText={(text) => handleDigitChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  editable={!isLoading}
                  selectionColor="#FF9A3D"
                />
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleVerifyOTP}
            className={`rounded-lg h-12 justify-center items-center mb-4 ${isLoading ? 'bg-orange-300' : 'bg-orange-400'}`}
            disabled={isLoading || otp.length < 6}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">Verify</Text>
            )}
          </TouchableOpacity>

          <View className="items-center mt-5">
            {isResendActive ? (
              <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
                <Text className={`text-base ${isLoading ? 'text-gray-400' : 'text-orange-400 font-medium'}`}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-600 text-base">Resend OTP in {timer}s</Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyOTP;