import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Add this import

const SignInService = () => {
  const router = useRouter(); // Use expo-router instead of navigation prop
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState('Driver');

  const handleGetOTP = () => {
    console.log('Requesting OTP for:', phoneNumber);
    // OTP request logic would go here
  };

  const goBack = () => {
    router.back(); // Use router.back() instead of navigation.goBack()
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Help<Text style={styles.logoAccent}>it.</Text></Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.signInTitle}>Sign in</Text>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'Driver' && styles.activeTab
              ]}
              onPress={() => setActiveTab('Driver')}
            >
              <Text style={styles.tabText}>Driver</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === 'Other Providers' && styles.activeTab
              ]}
              onPress={() => setActiveTab('Other Providers')}
            >
              <Text style={styles.tabText}>Other Providers</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#A0A0A0"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity onPress={handleGetOTP} style={styles.otpButton}>
            <Text style={styles.otpButtonText}>Get OTP</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 50,
  },
  logoText: {
    fontSize: 35    ,
    fontWeight: '500',
  },
  logoAccent: {
    color: '#FF9966',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  signInTitle: {
    fontSize: 23,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    backgroundColor: '#FFCC99',
  },
  tabText: {
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  otpButton: {
    backgroundColor: '#FF9966',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  otpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignInService;