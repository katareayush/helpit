import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ArrowLeft, MapPin, Calendar, Clock, Star } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function CleaningServiceBookingScreen() {
  const router = useRouter();
  const [serviceLocation, setServiceLocation] = useState('');
  const [date, setDate] = useState('04/02/2025');
  const [time, setTime] = useState('-- : -- --');
  const [duration, setDuration] = useState('1');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Get selected cleaner from route params or use default
  const cleaner = {
    id: 2,
    name: 'Maria',
    rating: 4.9,
    reviews: 205,
  };

  // Dummy pricing data
  const pricePerHour = 150;
  const estimatedPrice = 249;

  const handleProceedToConfirm = () => {
    // Implement booking confirmation logic here
    alert('Booking confirmed successfully!');
    router.push('Home');
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <ScrollView>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Book Home Cleaning Service</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            {/* Service Summary */}
            <View style={styles.serviceSummaryContainer}>
              <Text style={styles.serviceTitle}>Home Cleaning</Text>
              <Text style={styles.serviceDescription}>Professional home cleaning services</Text>
              <Text style={styles.servicePrice}>₹{pricePerHour} per hour</Text>
            </View>

            {/* Service Location */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <MapPin size={20} color="#4CAF50" />
                <Text style={styles.inputLabel}>Service Location</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter Service Location"
                value={serviceLocation}
                onChangeText={setServiceLocation}
              />
            </View>

            {/* Date and Time */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.dateTimePicker}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                >
                  <Calendar size={20} color="#888" />
                  <Text style={styles.dateTimeValue}>{date}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Time</Text>
                <TouchableOpacity
                  style={styles.dateTimePicker}
                  onPress={() => setShowTimePicker(!showTimePicker)}
                >
                  <Clock size={20} color="#888" />
                  <Text style={styles.dateTimeValue}>{time}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Duration */}
            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Duration (hours)</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />
            </View>

            {/* Service Provider */}
            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Select Service Provider</Text>
              <View style={styles.serviceProviderContainer}>
                <View style={styles.providerAvatar}>
                  <Text style={styles.avatarText}>{cleaner.name.charAt(0)}</Text>
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{cleaner.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color="#FFB900" fill="#FFB900" />
                    <Text style={styles.rating}>{cleaner.rating} ({cleaner.reviews})</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Price Estimate */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Estimated Price:</Text>
              <Text style={styles.priceValue}>₹{estimatedPrice}</Text>
            </View>

            {/* Proceed Button */}
            <TouchableOpacity 
              style={styles.proceedButton} 
              onPress={handleProceedToConfirm}
            >
              <Text style={styles.proceedButtonText}>Proceed to Confirm</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <CustomTabBar activeRoute="Home" />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  serviceSummaryContainer: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFB74D',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  servicePrice: {
    fontSize: 16,
    color: '#FF9800',
    marginTop: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#000',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimePicker: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  dateTimeValue: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  serviceProviderContainer: {
    borderWidth: 1,
    borderColor: '#FFB74D',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold',
  },
  providerInfo: {
    marginLeft: 15,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  rating: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB74D',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  proceedButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});