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

const ServiceProviderPrivacyPolicyScreen = () => {
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
        <Text className="text-lg font-semibold">Privacy Policy</Text>
        <View className="w-6" />
      </View>

      <ScrollView 
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Privacy Policy for Service Providers
        </Text>

        <Text className="text-sm text-gray-600 mb-6">
          Effective Date: {formatDate()}
        </Text>

        {/* Overview Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Overview
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            This Privacy Policy governs the manner in which AASTHARSH HELP IT HOME EASE SERVICES PRIVATE 
            LIMITED ("we", "our", "us") collects, uses, maintains, and discloses information collected 
            from Service Providers (referred to as "you", "your") using our platform "The Help It".
          </Text>
        </View>

        {/* Information We Collect Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Information We Collect
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Name, address, mobile number
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • ID proof (Aadhar/Voter ID)
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Emergency contact details
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Photograph and background verification details
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Work history, service category, and availability
            </Text>
          </View>
        </View>

        {/* Purpose of Data Collection Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Purpose of Data Collection
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • To verify your identity and ensure safety for users
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • To connect you with nearby clients for services
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • For legal and compliance purposes
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • To improve our platform and services
            </Text>
          </View>
        </View>

        {/* Data Sharing Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Data Sharing
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            Your details will be shared with users only upon confirmed bookings. We do not sell or 
            rent your data to any third parties.
          </Text>
        </View>

        {/* Consent Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Consent
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-3">
            By registering on The Help It, you consent to:
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Your data being collected, stored, and processed
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Background checks and verification
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Location tracking while on-duty
            </Text>
          </View>
        </View>

        {/* Safety Responsibility Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Safety Responsibility
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            You are individually responsible for your own safety and for treating customers and their 
            premises with respect. The Help It is not liable for any injury, theft, damage, or legal 
            issues resulting from your actions.
          </Text>
        </View>

        {/* Data Security Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Data Security
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            We take reasonable precautions to safeguard your information. This includes technical 
            measures like encryption (SSL/TLS) for data in transit and secure storage practices to 
            protect against unauthorized access. However, no method is 100% secure, and we cannot 
            guarantee absolute security. We encourage you to use strong passwords and secure your device.
          </Text>
        </View>

        {/* User Rights Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            User Rights
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-3">
            Under Indian law (IT Act and the forthcoming DPDP Act 2023), you have rights regarding 
            your personal data. These include:
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Access and Update
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              You can request a copy of the personal information we hold about you and correct any inaccuracies.
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Deletion
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              You can ask us to delete your personal information when it is no longer needed for the 
              purposes it was collected, or if you withdraw consent. (Some information may be retained 
              as required by law.)
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Consent Withdrawal
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              You may withdraw consent for data processing where consent is the lawful basis, and we 
              will stop processing and delete data as required.
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Grievances
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              You may contact us to exercise these rights or with any privacy concerns.
            </Text>
          </View>

          <Text className="text-sm text-gray-700 leading-6">
            To exercise these rights, email us at privacy@thehelpit.com. We will respond as promptly 
            as possible, and in compliance with applicable laws.
          </Text>
        </View>

        {/* Contact Us Section */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Contact Us
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">
            For questions about this policy or our privacy practices, please contact:
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

export default ServiceProviderPrivacyPolicyScreen;