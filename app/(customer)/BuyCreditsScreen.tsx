import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

interface PlanData {
  id: 'weekly' | 'monthly';
  duration: string;
  price: number;
  credits: number; 
  savings: number;
  description: string;
}

const SubscriptionPlansScreen = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentFormData, setPaymentFormData] = useState(null);

  const plans: PlanData[] = [
    {
      id: 'weekly',
      duration: '7 days',
      price: 800,
      credits: 7, 
      savings: 200,
      description: '1 hour per day'
    },
    {
      id: 'monthly',
      duration: '30 days',
      price: 2800,
      credits: 30, 
      savings: 600,
      description: '1 hour per day'
    }
  ];

  const handleBack = () => {
    if (showPaymentWebView) {
      setShowPaymentWebView(false);
      setPaymentUrl('');
      setPaymentFormData(null);
    } else {
      router.back();
    }
  };

  const initiatePayment = async (planData: PlanData) => {
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        router.replace('/signInC');
        return;
      }
      
      const response = await axios.post(`${apiUrl}/credits/buy`, {
        credits: planData.credits,
        amount: planData.price
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success) {
        const { payuParams, payuUrl } = response.data.data;
        setPaymentFormData(payuParams);
        setPaymentUrl(payuUrl);
        setShowPaymentWebView(true);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      
      if (error.response && error.response.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        await AsyncStorage.removeItem('accessToken');
        router.replace('/signInC');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to initiate payment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPlan = () => {
    const selectedPlanData = plans.find(plan => plan.id === selectedPlan);
    if (!selectedPlanData) return;

    Alert.alert(
      'Confirm Plan',
      `You have selected the ${selectedPlanData.duration} plan for ₹${selectedPlanData.price}.\n\nYou'll get ${selectedPlanData.credits} hours of access (${selectedPlanData.description}).\n\nProceed to payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => initiatePayment(selectedPlanData)
        }
      ]
    );
  };

  const generatePaymentForm = (params: any) => {
    const formFields = Object.entries(params)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Processing Payment...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .loading {
            text-align: center;
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #FF9966;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loading">
          <div class="spinner"></div>
          <p>Redirecting to payment gateway...</p>
        </div>
        <form id="payuForm" action="${paymentUrl}" method="post">
          ${formFields}
        </form>
        <script>
          document.getElementById('payuForm').submit();
        </script>
      </body>
      </html>
    `;
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    if (url.includes('/payment-success') || url.includes('/payment-failure')) {
      const isSuccess = url.includes('/payment-success');
      
      setShowPaymentWebView(false);
      setPaymentUrl('');
      setPaymentFormData(null);
      
      if (isSuccess) {
        Alert.alert(
          'Payment Successful!',
          'Your hours have been added to your account. You can now enjoy uninterrupted access!',
          [
            {
              text: 'OK',
              onPress: () => router.back() 
            }
          ]
        );
      } else {
        Alert.alert(
          'Payment Failed',
          'Your payment could not be processed. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const PlanCard = ({ plan }: { plan: PlanData }) => {
    const isSelected = selectedPlan === plan.id;
    
    return (
      <TouchableOpacity
        className={`rounded-lg p-6 mb-6 ${
          isSelected 
            ? 'bg-[#FF9966]' 
            : 'bg-white border border-gray-200'
        }`}
        onPress={() => setSelectedPlan(plan.id)}
      >
        <View className="flex-row justify-between items-start mb-6">
          <Text className={`text-xl font-semibold ${
            isSelected ? 'text-white' : 'text-gray-800'
          }`}>
            {plan.duration}
          </Text>
          
          <Text className={`text-xl font-bold ${
            isSelected ? 'text-white' : 'text-gray-800'
          }`}>
            ₹{plan.price}
          </Text>
        </View>
        
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-base ${
            isSelected ? 'text-white opacity-90' : 'text-gray-600'
          }`}>
            Hours:
          </Text>
          <Text className={`text-base font-medium ${
            isSelected ? 'text-white' : 'text-gray-800'
          }`}>
            {plan.credits}h
          </Text>
        </View>
        
        <View className="flex-row justify-between items-center mb-4">
          <Text className={`text-base ${
            isSelected ? 'text-white opacity-90' : 'text-gray-600'
          }`}>
            Usage:
          </Text>
          <Text className={`text-base font-medium ${
            isSelected ? 'text-white' : 'text-gray-800'
          }`}>
            {plan.description}
          </Text>
        </View>
        
        <View className="flex-row justify-end items-center">
          <Text className={`text-base font-medium ${
            isSelected ? 'text-white' : 'text-gray-700'
          }`}>
            You Save: ₹{plan.savings}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (showPaymentWebView && paymentFormData) {
    return (
      <SafeAreaView className="flex-1 bg-white" style={{
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
      }}>
        <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={handleBack} className="p-1">
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Complete Payment</Text>
          <View className="w-8" />
        </View>

        <WebView
          source={{ html: generatePaymentForm(paymentFormData) }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#FF9966" />
              <Text className="mt-4 text-gray-600">Loading payment gateway...</Text>
            </View>
          )}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" style={{
      paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
    }}>
      <View className="flex-row justify-between items-center px-4 py-3 bg-white">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Subscription Plans</Text>
        <View className="w-8" />
      </View>

      <View className="h-px bg-gray-200" />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Choose Plan
        </Text>

        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}

        <TouchableOpacity 
          className={`rounded-lg py-5 items-center mt-12 ${
            loading ? 'bg-gray-400' : 'bg-[#FF9966]'
          }`}
          onPress={handleConfirmPlan}
          disabled={loading}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-xl font-semibold ml-3">
                Processing...
              </Text>
            </View>
          ) : (
            <Text className="text-white text-xl font-semibold">
              Confirm Plan
            </Text>
          )}
        </TouchableOpacity>

        <View className="h-12" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionPlansScreen;