import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Feather } from '@expo/vector-icons';
import axios from 'axios';

// Replace with your actual API base URL
const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL ;

interface FormData {
  name: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  gender: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  countryCode?: string;
  phoneNumber?: string;
  gender?: string;
  password?: string;
  confirmPassword?: string;
}

const SignupScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    countryCode: '+91', // Default value for India
    phoneNumber: '',
    gender: 'male', // Default value must be lowercase
    password: '',
    confirmPassword: ''
  });
  
  // UI state
  const [showCountryModal, setShowCountryModal] = useState<boolean>(false);
  const [showGenderModal, setShowGenderModal] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Country code options
  const countryCodes = [
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
  
  // Gender options - must have exact values that backend expects
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  // Handle input changes
  const handleChange = (field: keyof FormData, value: string): void => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined
      });
    }
  };

  // Validate form
  // Update the gender validation in validateForm() method
const validateForm = (): boolean => {
  let newErrors: FormErrors = {};
  
  // Name validation
  if (!formData.name.trim()) {
    newErrors.name = 'Name is required';
  }
  
  // Email validation
  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Email is invalid';
  }
  
  // Country code validation
  if (!formData.countryCode) {
    newErrors.countryCode = 'Country code is required';
  }
  
  // Phone validation - should be 10 digits without country code
  if (!formData.phoneNumber.trim()) {
    newErrors.phoneNumber = 'Phone number is required';
  } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/[^0-9]/g, ''))) {
    newErrors.phoneNumber = 'Phone number must be 10 digits';
  }
  
  // Gender validation - must match backend expectations (MALE, FEMALE, OTHER)
  if (!formData.gender) {
    newErrors.gender = 'Gender is required';
  } else if (!['male', 'female', 'other'].includes(formData.gender.toLowerCase())) {
    // Still validate using lowercase in the frontend for consistency
    newErrors.gender = 'Gender must be male, female, or other';
  }
  
  // Password validation
  if (!formData.password) {
    newErrors.password = 'Password is required';
  } else if (formData.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
  }
  
  // Confirm password validation
  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // Handle signup
  const handleSignup = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API - ensuring gender is properly formatted
      const apiData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: `${formData.countryCode}${formData.phoneNumber.replace(/[^0-9]/g, '')}`,
        gender: formData.gender.toUpperCase().trim(),
        password: formData.password
      };
      
      // Direct API call to your backend
      const response = await axios.post(`${apiUrl}/auth/register`, apiData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Handle success
      Alert.alert(
        "Signup Successful",
        "Please check your email for verification instructions.",
        [{ text: "OK", onPress: () => router.push('/signInC') }]
      );
    } catch (error: any) {
      // Handle error
      let errorMessage = 'Registration failed. Please try again.';
      
      // Get more specific error message if available
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert("Error", errorMessage);
      console.error('Signup error:', error.response?.data || error.message || error);
    } finally {
      setLoading(false);
    }
  };

  // Country code modal
  const renderCountryCodeModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCountryModal}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={countryCodes}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    handleChange('countryCode', item.code);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.countryCode}>{item.code}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };
  
  // Gender modal - similar approach to country code for consistency
  const renderGenderModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showGenderModal}
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={{...styles.modalContent, maxHeight: '40%'}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={genderOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.genderItem}
                  onPress={() => {
                    handleChange('gender', item.value);
                    setShowGenderModal(false);
                  }}
                >
                  <Text style={styles.genderItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <AntDesign name="arrowleft" size={24} color="#333" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Sign Up</Text>
          
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Full Name"
            placeholderTextColor="#666"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          
          <View style={styles.phoneContainer}>
            <TouchableOpacity
              style={[styles.countryCodePicker, errors.countryCode && styles.inputError]}
              onPress={() => setShowCountryModal(true)}
            >
              <Text style={styles.countryCodeText}>{formData.countryCode}</Text>
              <AntDesign name="down" size={12} color="#666" />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.phoneInput, errors.phoneNumber && styles.inputError]}
              placeholder="Phone Number"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange('phoneNumber', text.replace(/[^0-9]/g, ''))}
              maxLength={10}
            />
          </View>
          {(errors.countryCode || errors.phoneNumber) && (
            <Text style={styles.errorText}>
              {errors.countryCode || errors.phoneNumber}
            </Text>
          )}
          
          <Text style={styles.sectionLabel}>Gender</Text>
          <TouchableOpacity
            style={[styles.genderSelector, errors.gender && styles.inputError]}
            onPress={() => setShowGenderModal(true)}
          >
            <Text style={styles.genderSelectorText}>
              {formData.gender ? genderOptions.find(g => g.value === formData.gender)?.label : 'Select Gender'}
            </Text>
            <AntDesign name="down" size={12} color="#666" />
          </TouchableOpacity>
          {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.password && styles.inputError]}
              placeholder="Password"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
            />
            <TouchableOpacity 
              style={styles.passwordVisibilityButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
              placeholder="Confirm Password"
              placeholderTextColor="#666"
              secureTextEntry={!showConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
            />
            <TouchableOpacity 
              style={styles.passwordVisibilityButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          <TouchableOpacity 
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => router.back()}
          >
            <Text style={styles.loginLinkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {renderGenderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: '#333',
    marginBottom: 30,
    textAlign: 'left',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 5,
  },
  // Phone input styles
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  countryCodePicker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    width: 80,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  // Gender selection styles
  genderSelector: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genderSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  genderItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  genderItemText: {
    fontSize: 16,
    color: '#333',
  },
  // Password input styles
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  passwordVisibilityButton: {
    padding: 15,
  },
  signupButton: {
    backgroundColor: '#FDA172',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 15,
  },
  loginLinkText: {
    color: '#FDA172',
    textAlign: 'center',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  countryItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countryCode: {
    width: 60,
    fontSize: 16,
    fontWeight: '500',
  },
  countryName: {
    fontSize: 16,
    color: '#333',
  },
});

export default SignupScreen;