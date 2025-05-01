import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ArrowLeft, MapPin, User, Car } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';
import { API_BASE_URL } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DriverServiceScreen() {
  const router = useRouter();
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [passengers, setPassengers] = useState<string>('1 person');
  const [vehicleType, setVehicleType] = useState<string>('Sedan (up to 4 people)');
  const [showPassengerDropdown, setShowPassengerDropdown] = useState<boolean>(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState<boolean>(false);
  const [estimatedDistance, setEstimatedDistance] = useState<string>('0 KM');
  const [estimatedFare, setEstimatedFare] = useState<string>('₹0');
  const [serviceId, setServiceId] = useState<string | null>(null);

  const passengerOptions = ['1 person', '2 people', '3 people', '4 people'];
  const vehicleOptions = [
    'Sedan (up to 4 people)',
    'SUV (up to 6 people)',
    'Luxury (up to 4 people)',
  ];

  // Fetch the service ID dynamically
  useEffect(() => {
    const fetchServiceId = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/services`);
        const result = await response.json();

        if (response.ok && result.data) {
          const driverService = result.data.find(
            (service: { name: string }) => service.name.toLowerCase() === 'driver'
          );
          if (driverService) {
            setServiceId(driverService._id);
          } else {
            Alert.alert('Error', 'Driver service not found.');
          }
        } else {
          Alert.alert('Error', result.message || 'Failed to fetch services.');
        }
      } catch (error) {
        Alert.alert('Error', error.message || 'An error occurred while fetching services.');
      }
    };

    fetchServiceId();
  }, []);

  const calculateFare = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/booking/calculate-fare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distance: parseFloat(estimatedDistance.replace(' KM', '')),
          vehicleType,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setEstimatedFare(`₹${result.fare}`);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleBookDriver = async () => {
    if (!serviceId) {
      Alert.alert('Error', 'Service ID is not available.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/booking/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId,
          details: {
            pickupAddress,
            destination,
            passengers,
            vehicleType,
          },
          estimatedDistance: parseFloat(estimatedDistance.replace(' KM', '')),
          duration: 30, // Replace with actual duration if available
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Driver booked successfully!');
        router.push('/Home');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          className="flex-1"
        >
          <FlatList
            data={[]}
            ListHeaderComponent={
              <>
                {/* Header */}
                <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
                  <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#000" />
                  </TouchableOpacity>
                  <Text className="text-lg font-bold text-black">
                    Book a Driver
                  </Text>
                  <View style={{ width: 24 }} />
                </View>

                <View className="p-5">
                  {/* Pickup Location */}
                  <View className="mb-5">
                    <View className="flex-row items-center mb-2">
                      <MapPin size={20} color="#4CAF50" />
                      <Text className="ml-2 text-base font-medium text-black">
                        Pickup Location
                      </Text>
                    </View>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-3 text-base"
                      placeholder="Enter your pickup address"
                      value={pickupAddress}
                      onChangeText={setPickupAddress}
                    />
                  </View>

                  {/* Destination */}
                  <View className="mb-5">
                    <View className="flex-row items-center mb-2">
                      <MapPin size={20} color="#F44336" />
                      <Text className="ml-2 text-base font-medium text-black">
                        Destination
                      </Text>
                    </View>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-3 text-base"
                      placeholder="Enter your destination"
                      value={destination}
                      onChangeText={setDestination}
                    />
                  </View>

                  {/* Passengers */}
                  <View className="mb-5">
                    <View className="flex-row items-center mb-2">
                      <User size={20} color="#000" />
                      <Text className="ml-2 text-base font-medium text-black">
                        Passengers
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
                      onPress={() =>
                        setShowPassengerDropdown(!showPassengerDropdown)
                      }
                    >
                      <Text>{passengers}</Text>
                      <Text className="text-gray-500">∨</Text>
                    </TouchableOpacity>
                    {showPassengerDropdown && (
                      <FlatList
                        data={passengerOptions}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            className="p-3 border-b border-gray-200"
                            onPress={() => {
                              setPassengers(item);
                              setShowPassengerDropdown(false);
                            }}
                          >
                            <Text>{item}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    )}
                  </View>

                  {/* Vehicle Type */}
                  <View className="mb-5">
                    <View className="flex-row items-center mb-2">
                      <Car size={20} color="#000" />
                      <Text className="ml-2 text-base font-medium text-black">
                        Vehicle Type
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
                      onPress={() =>
                        setShowVehicleDropdown(!showVehicleDropdown)
                      }
                    >
                      <Text>{vehicleType}</Text>
                      <Text className="text-gray-500">∨</Text>
                    </TouchableOpacity>
                    {showVehicleDropdown && (
                      <FlatList
                        data={vehicleOptions}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            className="p-3 border-b border-gray-200"
                            onPress={() => {
                              setVehicleType(item);
                              setShowVehicleDropdown(false);
                            }}
                          >
                            <Text>{item}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    )}
                  </View>

                  {/* Fare Estimate */}
                  <View className="border border-yellow-400 rounded-lg p-4 bg-yellow-50 mb-6">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm text-gray-600">
                        Estimated Distance:
                      </Text>
                      <Text className="text-base font-medium text-black">
                        {estimatedDistance}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-lg font-bold text-black">
                        Estimated Fare:
                      </Text>
                      <Text className="text-xl font-bold text-orange-500">
                        {estimatedFare}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="mt-3 bg-green-500 rounded-lg p-3 items-center"
                      onPress={calculateFare}
                    >
                      <Text className="text-white text-base font-medium">
                        Calculate Fare
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Book Driver Button */}
                  <TouchableOpacity
                    className="bg-orange-500 rounded-lg p-4 items-center"
                    onPress={handleBookDriver}
                  >
                    <Text className="text-white text-lg font-medium">
                      Book Driver
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            }
          />
        </KeyboardAvoidingView>
        <CustomTabBar activeRoute="Home" />
      </SafeAreaView>
    </>
  );
}