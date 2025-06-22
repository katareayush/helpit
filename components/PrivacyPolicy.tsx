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

const PrivacyPolicy = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
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
          Privacy Policy
        </Text>

        <Text className="text-sm text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </Text>

        {/* Overview Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Overview
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            The Help It ("we" or "us") is an online platform that connects users ("you") with independent 
            household service providers in Delhi and Gurugram. This Privacy Policy explains how we collect, 
            use, disclose, and protect your personal data, and your rights under Indian law. By using our 
            app or services, you consent to the collection and use of information as described below.
          </Text>
        </View>

        {/* Data We Collect Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Data We Collect
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-3">
            We collect the following categories of personal information:
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Contact and Identity
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              Name, mobile phone number, email address. These are provided when you register and are 
              used to identify and contact you (e.g. confirming bookings).
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Government IDs and Verification
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              Aadhaar or Voter ID details and proof of age/nationality (for service providers only). 
              We collect just enough to verify the provider's age (18+) and citizenship. We do not 
              store full ID numbers beyond verification.
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Background Check Status
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              Verification of police background checks for providers. We record only the result 
              (e.g "verified").
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Location Data
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              Timely GPS location data (with your permission) to help find nearby providers and 
              coordinate services. Your location is processed in real-time for matching and delivery 
              of services and is not stored longer than necessary for that purpose.
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Usage and Device Data
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              App usage data and device identifiers (for troubleshooting and improving our service). 
              We do not use third-party analytics or advertising SDKs.
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • In-App Purchases
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              Records of in-app transactions and payment receipts to manage orders and billing. 
              For example, we log purchase history to verify service bookings and may retain 
              transaction records as required by law (e.g. Companies Act mandates keeping 
              financial records for several years).
            </Text>
          </View>
        </View>

        {/* How We Use Your Data Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            How We Use Your Data
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-3">
            We use the information collected for these purposes:
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Service Delivery
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              To connect you with providers, enable scheduling of services, make calls, and confirm 
              bookings. For instance, your phone number may be shared directly with a chosen provider 
              only to facilitate your call to them.
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Identity Verification
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              To ensure users and providers are 18+ and eligible. We verify providers' ID and 
              background for safety.
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Communications
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              To send you transaction alerts, service updates, and administrative messages 
              (not marketing).
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Legal Compliance
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              To comply with Indian laws (e.g. IT Act, companies act) and regulatory requirements. 
              For example, we retain certain logs or transaction records to satisfy legal record 
              keeping obligations.
            </Text>

            <Text className="text-sm font-medium text-gray-800 mb-2">
              • Improvement and Security
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-3 ml-4">
              To protect our users and systems, and to improve our app features and user experience.
            </Text>
          </View>

          <Text className="text-sm text-gray-700 leading-6">
            All personal data is processed lawfully and only for the purposes collected. By creating 
            an account, you give consent for these uses. We rely on your consent and on legitimate 
            business needs (service fulfillment, legal compliance) as legal grounds for processing. 
            We do not use your data for any unauthorized or unrelated purpose.
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

export default PrivacyPolicy;