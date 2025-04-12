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
import { ArrowLeft, MapPin, User, Car } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import CustomTabBar from '../components/CustomTabBar';

export default function DriverServiceScreen() {
  const router = useRouter();
  const [pickupAddress, setPickupAddress] = useState('');
  const [destination, setDestination] = useState('');
  const [passengers, setPassengers] = useState('1 person');
  const [vehicleType, setVehicleType] = useState('Sedan (up to 4 people)');
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

  // Dummy data for distance and fare
  const estimatedDistance = "14.1 KM";
  const estimatedFare = "₹249";

  const handleBookDriver = () => {
    // Implement booking logic here
    alert('Driver booked successfully!');
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
            <Text style={styles.headerTitle}>Book a Driver</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.content}>
            {/* Pickup Location */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <MapPin size={20} color="#4CAF50" />
                <Text style={styles.inputLabel}>Pickup Location</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your pickup address"
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
            </View>

            {/* Destination */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <MapPin size={20} color="#F44336" />
                <Text style={styles.inputLabel}>Destination</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your destination"
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            {/* Passengers */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <User size={20} color="#000" />
                <Text style={styles.inputLabel}>Passengers</Text>
              </View>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowPassengerDropdown(!showPassengerDropdown)}
              >
                <Text>{passengers}</Text>
                <Text style={styles.dropdownArrow}>∨</Text>
              </TouchableOpacity>
            </View>

            {/* Vehicle Type */}
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <Car size={20} color="#000" />
                <Text style={styles.inputLabel}>Vehicle Type</Text>
              </View>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowVehicleDropdown(!showVehicleDropdown)}
              >
                <Text>{vehicleType}</Text>
                <Text style={styles.dropdownArrow}>∨</Text>
              </TouchableOpacity>
            </View>

            {/* Fare Estimate */}
            <View style={styles.estimateContainer}>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateLabel}>Estimated Distance:</Text>
                <Text style={styles.estimateValue}>{estimatedDistance}</Text>
              </View>
              <View style={styles.estimateRow}>
                <Text style={styles.estimateFare}>Estimated Fare:</Text>
                <Text style={styles.fareAmount}>₹{estimatedFare}</Text>
              </View>
            </View>

            {/* Book Driver Button */}
            <TouchableOpacity style={styles.bookButton} onPress={handleBookDriver}>
              <Text style={styles.bookButtonText}>Book Driver</Text>
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
  },
  content: {
    padding: 20,
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
  dropdown: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#888',
  },
  estimateContainer: {
    borderWidth: 1,
    borderColor: '#FFB74D',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#FFF8E1',
    marginBottom: 25,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  estimateLabel: {
    fontSize: 14,
    color: '#616161',
  },
  estimateValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  estimateFare: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  fareAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  bookButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});