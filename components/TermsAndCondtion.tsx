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

const TermsAndCondition = () => {
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
        <Text className="text-lg font-semibold">Terms & Conditions</Text>
        <View className="w-6" />
      </View>

      <ScrollView 
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Terms and Conditions
        </Text>

        <Text className="text-sm text-gray-600 mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </Text>

        {/* Introduction Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Introduction
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            These Terms and Conditions govern your use of The Help It mobile app and services. 
            By downloading, installing, or using our app, you agree to comply with these terms.
          </Text>
        </View>

        {/* Service Description Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Service Description
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            The Help It is an aggregator platform that connects users with independent household 
            service providers (e.g. cleaners, cooks, babysitters) in Delhi and Gurugram. We 
            facilitate booking and communication but do not provide services directly. Service 
            providers are independent contractors, not our employees or agents. We do not supervise 
            or control their actions beyond verification steps (ID check and background check).
          </Text>
        </View>

        {/* Provider Verification Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Provider Verification
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            We require all providers on our platform to undergo identity verification (Aadhaar or 
            Voter ID) and a police background check. These measures help ensure providers are at 
            least 18 years old and have no known criminal record, enhancing your trust in using the 
            service. However, such checks do not guarantee that incidents will never occur.
          </Text>
        </View>

        {/* Booking and Payments Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Booking and Payments
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            You can book services through the app. Some services may require advance payment or 
            in-app purchases; these transactions are processed securely. All payments to providers 
            are between you and the provider, except any platform fees paid to us. Refund or 
            cancellation policies are specified in the app. If in-app purchases are offered, 
            Google Play or Apple App Store payment terms also apply.
          </Text>
        </View>

        {/* User Responsibilities Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            User Responsibilities
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-3">
            You agree to:
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Use the app only for lawful purposes and in accordance with these terms.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Provide accurate, up-to-date personal information during registration.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Be at least 18 years old.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Exercise reasonable caution and supervision when interacting with providers. 
              (For example, if minors are present or tasks involve safety-sensitive activities, 
              you must take appropriate precautions.)
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • Treat providers respectfully. Do not harass, discriminate against, or engage 
              in abusive behavior toward providers.
            </Text>
          </View>
        </View>

        {/* Safety and Conduct Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Safety and Conduct
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            While we take steps to verify providers, ultimately your personal safety is also your 
            responsibility. For instance, if you have security concerns, you may insist on checking 
            the provider's ID or having a third party present. Use common sense in scheduling and 
            during service delivery. We strongly recommend supervising any service involving children, 
            elderly, or valuable property.
          </Text>
        </View>

        {/* Disclaimers of Liability Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Disclaimers of Liability
          </Text>
          <Text className="text-sm text-gray-700 leading-6 mb-3">
            To the fullest extent allowed by law, The Help It (AASTHARSH HELP IT HOME EASE SERVICES 
            PVT LTD) is not liable for any direct or indirect damages arising from your use of the 
            app or interactions with providers. Specifically:
          </Text>
          
          <View className="ml-4 mb-4">
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • We do not guarantee the quality, safety, or legality of any service.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • We do not control providers' actions or the content they may communicate.
            </Text>
            <Text className="text-sm text-gray-700 leading-6 mb-2">
              • You acknowledge that providers are independent and any dispute or claim arising 
              from a booked service (e.g. injury, theft, property damage, poor performance) is 
              solely between you and the provider.
            </Text>
          </View>

          <Text className="text-sm text-gray-700 leading-6">
            In case of any issue (e.g. misconduct by a provider), you should take appropriate action 
            such as filing a police report or seeking civil remedies. Our sole responsibility, if 
            applicable, is to assist in communication or possibly issue a refund of platform fees 
            in accordance with our policies.
          </Text>
        </View>

        {/* Indemnity Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Indemnity
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            You agree to indemnify and hold The Help It and its affiliates harmless from any claims, 
            losses, liabilities, and expenses (including legal fees) arising from your use of the app, 
            your violation of these terms, or your dealings with providers. This includes any claims 
            by third parties (e.g. a provider or other user) related to your actions.
          </Text>
        </View>

        {/* User Content and Feedback Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            User Content and Feedback
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            If you submit comments or feedback via the app, you grant us a non-exclusive license to 
            use them. Do not post or send us any illegal, infringing, or offensive content via reviews 
            or messages.
          </Text>
        </View>

        {/* Termination Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Termination
          </Text>
          <Text className="text-sm text-gray-700 leading-6">
            We reserve the right to suspend or terminate your account at our discretion if you violate 
            these terms or behave in a way that is fraudulent or harmful to others. Upon termination, 
            your right to use the app stops immediately.
          </Text>
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

export default TermsAndCondition;