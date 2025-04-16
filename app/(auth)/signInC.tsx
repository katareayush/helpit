import React, { useState , useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../_layout';

// Update the API base URL
const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

interface CountryCode {
  code: string;
  name: string;
}

interface Credentials {
  email: string;
  countryCode: string;
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
  const [isEmail, setIsEmail] = useState(true); // Toggle between email and phone login
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    countryCode: '+91', // Default value for India
    phoneNumber: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);

  // Country code options
  const countryCodes: CountryCode[] = [
    { code: '+91', name: 'India' },
    { code: '+1', name: 'USA' },
    { code: '+44', name: 'UK' },
    { code: '+971', name: 'UAE' },
    { code: '+61', name: 'Australia' },
    { code: '+86', name: 'China' },
    { code: '+81', name: 'Japan' },
    { code: '+49', name: 'Germany' },
    { code: '+33', name: 'France' },
    { code: '+7', name: 'Russia' },
    { code: '+65', name: 'Singapore' },
    { code: '+82', name: 'South Korea' },
    { code: '+55', name: 'Brazil' },
    { code: '+52', name: 'Mexico' },
    { code: '+27', name: 'South Africa' }
  ];

  const toggleLoginMethod = () => {
    setIsEmail(!isEmail);
  };

  // const handletoken = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem('accessToken');
  //     if (token) {
  //       Alert.alert('Token', `Your token is: ${token}`);
  //       AsyncStorage.removeItem('accessToken'); 
  //       AsyncStorage.removeItem("userData"); 
  //     }
  //   } catch (error) {
  //     console.error('Error retrieving token:', error);
  //   }
  // }

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
      // Prepare the data for login
      const apiData = {
        identifier: isEmail 
          ? credentials.email.trim()
          : `${credentials.countryCode}${credentials.phoneNumber.replace(/[^0-9]/g, '')}`,
        password: credentials.password
      };

      // Make the API call
      const response = await axios.post<ApiResponse>(`${apiUrl}/auth/login`, apiData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        const { accessToken, user } = response.data.data!;
        
        // Store user data - note the role mapping here
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        // Map the backend role "USER" to your app's "customer" role
        const appRole = user.role === "USER" ? "customer" : user.role.toLowerCase();
        await AsyncStorage.setItem('userRole', appRole);
        
        // Update global auth context
        setAuthState(true, appRole);
        
        // console.log('Login successful, attempting navigation with role:', appRole);
        router.replace('/(customer)/HomeScreen');
      }
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      const axiosError = error as AxiosError<{message?: string}>;
      
      if (axiosError.response) {
        errorMessage = axiosError.response.data?.message || 'Server error';
        
        if (axiosError.response.status === 404) {
          errorMessage = 'API endpoint not found. Please contact support.';
        } else if (axiosError.response.status === 401) {
          errorMessage = 'Invalid credentials. Please check your password.';
        } else if (axiosError.response.status === 403) {
          if (axiosError.response.data?.message && axiosError.response.data.message.includes('not verified')) {
            errorMessage = 'Email not verified. Please verify your email address.';
          } else if (axiosError.response.data?.message && axiosError.response.data.message.includes('blocked')) {
            errorMessage = 'Your account has been blocked. Please contact support.';
          }
        }
      } else if (axiosError.request) {
        // Network error or server not responding
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

  const renderCountryCodeModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCountryModal}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl p-5 max-h-[70%]">
            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Select Country Code</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={countryCodes}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row p-4 border-b border-gray-100"
                  onPress={() => {
                    setCredentials({
                      ...credentials,
                      countryCode: item.code
                    });
                    setShowCountryModal(false);
                  }}
                >
                  <Text className="w-16 text-base font-medium">{item.code}</Text>
                  <Text className="text-base text-gray-800">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
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
            <View className="flex-row mb-4">
              <TouchableOpacity
                className="h-[50px] border border-gray-200 rounded-lg px-3 mr-2 flex-row justify-between items-center w-20"
                onPress={() => setShowCountryModal(true)}
                disabled={loading}
              >
                <Text className="text-base">{credentials.countryCode}</Text>
                <AntDesign name="down" size={12} color="#666" />
              </TouchableOpacity>
              
              <TextInput
                className="flex-1 h-[50px] border border-gray-200 rounded-lg px-4 text-base"
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

          {/* <TouchableOpacity 
            onPress={handletoken} 
            className="bg-[#FFA07A] rounded-lg h-[50px] justify-center items-center mb-4"
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white text-base font-semibold">Clear Token</Text>
            )}
          </TouchableOpacity> */}

          <View className="flex-row justify-center items-center">
            <Text className="text-sm text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={goToSignUp} disabled={loading}>
              <Text className="text-sm text-[#FFA07A] font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {renderCountryCodeModal()}
    </SafeAreaView>
  );
};

export default SignInScreen;