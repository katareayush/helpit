import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ServiceProviderTermsConditionsScreen = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{
      paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
    }}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Terms & Conditions</Text>
        <View className="w-6" />
      </View>

      <ScrollView 
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Terms and Conditions for Service Providers
        </Text>

        <Text className="text-sm text-gray-600 mb-6">
          Effective Date: {formatDate()}
        </Text>

        {/* Role of the Platform Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Role of the Platform
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • The Help It is an aggregator and not your employer.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • You provide services as an independent contractor.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • You are solely responsible for the quality, safety, and legality of your services.
            </Text>
          </View>
        </View>

        {/* Verification Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Verification
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • You must provide valid identity documents.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • You must pass a background check.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • False or misleading information will lead to termination.
            </Text>
          </View>
        </View>

        {/* Code of Conduct Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Code of Conduct
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-3">
            You agree to:
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Respect customer privacy and safety
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Not engage in theft, abuse, or any illegal activity
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Follow hygiene and behavior protocols
            </Text>
          </View>
        </View>

        {/* Safety & Liability Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Safety & Liability
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • You are responsible for your own safety while working.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • You are expected to act in a manner that ensures the safety of the customer and their property.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • The Help It is not liable for any injury, accident, harm, or damage caused by or to you during your service.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • If found guilty of any crime, you will be held accountable as an individual before the law.
            </Text>
          </View>
        </View>

        {/* Payments & Fees Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Payments & Fees
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Your payment is based on confirmed hours or services.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • The platform charges a commission from your earnings.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • All payments are processed through the app.
            </Text>
          </View>
        </View>

        {/* Termination Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Termination
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • We may terminate your access for breaches or customer complaints.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • You may discontinue after settling dues.
            </Text>
          </View>
        </View>

        {/* Governing Law Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Governing Law
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            These Terms are governed by the laws of India. Any legal disputes will be subject to 
            the jurisdiction of courts in Delhi.
          </Text>
        </View>

        {/* Changes to Terms Section */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Changes to Terms
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            We may modify these Terms occasionally (for example, to reflect changes in law or services). 
            We will notify users via email or app notice. Continued use of the service after changes 
            means you accept the new Terms.
          </Text>
        </View>

        {/* Contact Information */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Contact Us
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">
            For questions about these terms, please contact:
          </Text>
          <Text className="text-sm font-medium text-gray-800">
            AASTHARSH HELP IT HOME EASE SERVICES PVT LTD
          </Text>
          <Text className="text-sm text-gray-700">
            Email: privacy@thehelpit.com
          </Text>
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceProviderTermsConditionsScreen;