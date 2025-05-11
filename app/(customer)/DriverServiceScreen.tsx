import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { ArrowLeft, MapPin, User, Car } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';
import { API_BASE_URL } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export default function DriverServiceScreen() {
  const router = useRouter();
  const [pickupAddress, setPickupAddress] = useState('');
  const [destination, setDestination] = useState('');
  const [passengers, setPassengers] = useState('1 person');
  const [vehicleType, setVehicleType] = useState('Sedan (up to 4 people)');
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [estimatedDistance, setEstimatedDistance] = useState('0 KM');
  const [estimatedFare, setEstimatedFare] = useState('₹0');
  const [serviceId, setServiceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);

  const passengerOptions = ['1 person', '2 people', '3 people', '4 people'];
  const vehicleOptions = [
    'Sedan (up to 4 people)',
    'SUV (up to 6 people)',
    'Luxury (up to 4 people)',
  ];

  // Ask for location permission when component mounts
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please enable location services to use this feature.'
        );
      } else {
        // If permission granted, get current location for pickup
        getMyCurrentLocation();
      }
    })();
  }, []);

  // Fetch the service ID dynamically
  useEffect(() => {
    const fetchServiceId = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          Alert.alert('Authentication Required', 'Please log in.');
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/services`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();

        if (response.ok && result.data) {
          const driverService = result.data.find(
            (service) => service.name.toLowerCase() === 'driver' || service.unitType === 'KM'
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
        console.error('Service fetch error:', error);
        Alert.alert('Error', error.message || 'An error occurred while fetching services.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceId();
  }, []);

  // Get user's current location for pickup
  const getMyCurrentLocation = async () => {
    try {
      setIsLoading(true);

      // First try to get cached location from AsyncStorage
      const storedLocation = await AsyncStorage.getItem('@helpIt:location');
      const storedLocationString = await AsyncStorage.getItem('@helpIt:locationString');

      if (storedLocation && storedLocationString) {
        const parsedLocation = JSON.parse(storedLocation);
        setPickupCoordinates({
          latitude: parsedLocation.latitude,
          longitude: parsedLocation.longitude
        });
        setPickupAddress(storedLocationString);
        setIsLoading(false);
        return;
      }

      // If no cached location, proceed with permission check and retrieval
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Set pickup coordinates
      setPickupCoordinates({ latitude, longitude });

      // Save to AsyncStorage for future use
      await AsyncStorage.setItem('@helpIt:location', JSON.stringify({
        latitude,
        longitude
      }));

      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude
        });

        if (addresses && addresses[0]) {
          const address = addresses[0];
          const formattedAddress = [
            address.name,
            address.street,
            address.city,
            address.region,
            address.postalCode
          ].filter(Boolean).join(', ');

          setPickupAddress(formattedAddress);

          await AsyncStorage.setItem('@helpIt:locationString', formattedAddress);
        } else {
          setPickupAddress(`Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`);
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setPickupAddress(`Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setIsLoading(false);
    }
  };

  // Geocode the destination address to get coordinates
  const geocodeDestination = async () => {
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination address');
      return false;
    }

    try {
      setIsLoading(true);
      const locations = await Location.geocodeAsync(destination);

      if (locations && locations.length > 0) {
        const { latitude, longitude } = locations[0];
        setDestinationCoordinates({ latitude, longitude });
        return true;
      } else {
        Alert.alert('Error', 'Could not find coordinates for the destination');
        return false;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to geocode the destination address');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate distance between pickup and destination
  const calculateDistance = async () => {
    if (!pickupAddress) {
      Alert.alert('Error', 'Please set your pickup location');
      return;
    }

    if (!destination) {
      Alert.alert('Error', 'Please enter your destination');
      return;
    }

    // If destination coordinates are not set, try to geocode the destination
    if (!destinationCoordinates) {
      const success = await geocodeDestination();
      if (!success) return;
    }

    // If pickup coordinates are not set, try to get current location
    if (!pickupCoordinates) {
      await getMyCurrentLocation();
      if (!pickupCoordinates) {
        Alert.alert('Error', 'Could not determine your pickup location');
        return;
      }
    }

    try {
      setIsLoading(true);

      // Get token for authenticated request
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in.');
        router.push('/auth/login');
        return;
      }

      // Calculate distance using estimate-distance endpoint
      const response = await fetch(`${API_BASE_URL}/estimate-distance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pickup_location: pickupCoordinates,
          drop_location: destinationCoordinates,
        }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        const distance = result.data.estimatedDistance || 0;
        setEstimatedDistance(`${distance} KM`);
        
        // After getting distance, calculate the fare
        const fareResponse = await fetch(`${API_BASE_URL}/calculate-fare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            serviceId: serviceId,
            distance: distance,
            vehicleType: vehicleType
          }),
        });
        
        const fareResult = await fareResponse.json();
        
        if (fareResponse.ok && fareResult.data) {
          setEstimatedFare(`₹${fareResult.data.fare}`);
        } else {
          // Fallback to client-side calculation if API endpoint doesn't exist yet
          calculateFareLocally(distance);
        }
      } else {
        throw new Error(result.message || 'Could not calculate distance');
      }
    } catch (error) {
      console.error('Distance/fare calculation error:', error);
      
      // If the server-side fare calculation fails, fall back to client-side
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        const distance = parseFloat(estimatedDistance.replace(' KM', ''));
        if (!isNaN(distance)) {
          calculateFareLocally(distance);
        } else {
          Alert.alert('Error', 'Failed to calculate fare. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Failed to calculate distance and fare.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback local fare calculation (until server endpoint is implemented)
  const calculateFareLocally = (distance) => {
    try {
      // Vehicle type multipliers
      let multiplier = 1;
      if (vehicleType.includes('SUV')) {
        multiplier = 1.5; // 50% higher for SUV
      } else if (vehicleType.includes('Luxury')) {
        multiplier = 2.0; // 100% higher for luxury vehicles
      }

      // Base rate (you should get this from your service config)
      const baseRate = 50; // ₹50 per km

      // Calculate fare
      let fare = distance * baseRate * multiplier;

      // Minimum fare
      const minimumFare = 100;
      fare = Math.max(fare, minimumFare);

      // Round to nearest integer
      fare = Math.round(fare);

      // Update state
      setEstimatedFare(`₹${fare}`);
    } catch (error) {
      console.error('Local fare calculation error:', error);
      Alert.alert('Error', 'Failed to calculate fare.');
    }
  };

  const handleBookDriver = async () => {
    if (!serviceId) {
      Alert.alert('Error', 'Service ID is not available.');
      return;
    }

    if (!pickupAddress) {
      Alert.alert('Error', 'Please enter a pickup address.');
      return;
    }

    if (!destination) {
      Alert.alert('Error', 'Please enter a destination.');
      return;
    }

    if (estimatedDistance === '0 KM') {
      Alert.alert('Error', 'Please calculate the fare first.');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in.');
        router.push('/auth/login');
        return;
      }

      // Extract numeric fare
      const numericFare = parseFloat(estimatedFare.replace('₹', ''));
      const numericDistance = parseFloat(estimatedDistance.replace(' KM', ''));

      // Use the correct API endpoint from the route definition
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
          userLocation: pickupCoordinates,
          estimatedDistance: numericDistance,
          duration: 30, // Default duration in minutes
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert(
          'Success',
          'Driver booking request submitted! Waiting for a driver to accept.',
          [
            {
              text: 'View Bookings',
              onPress: () => router.push('/booking/user')
            },
            {
              text: 'OK',
              onPress: () => router.push('/Home')
            }
          ]
        );
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.message || 'An error occurred while booking the driver');
    } finally {
      setIsLoading(false);
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
          <ScrollView>
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
                <TouchableOpacity
                  className="mt-2 flex-row items-center bg-gray-100 p-2 rounded-lg"
                  onPress={getMyCurrentLocation}
                >
                  <MapPin size={16} color="#4CAF50" />
                  <Text className="ml-2 text-sm text-gray-600">
                    Use my current location
                  </Text>
                </TouchableOpacity>
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
                  <View className="border border-gray-200 rounded-lg mt-1 bg-white">
                    {passengerOptions.map((item) => (
                      <TouchableOpacity
                        key={item}
                        className="p-3 border-b border-gray-200"
                        onPress={() => {
                          setPassengers(item);
                          setShowPassengerDropdown(false);
                        }}
                      >
                        <Text>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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
                  <View className="border border-gray-200 rounded-lg mt-1 bg-white">
                    {vehicleOptions.map((item) => (
                      <TouchableOpacity
                        key={item}
                        className="p-3 border-b border-gray-200"
                        onPress={() => {
                          setVehicleType(item);
                          setShowVehicleDropdown(false);
                          // Recalculate fare if distance is already calculated
                          if (estimatedDistance !== '0 KM') {
                            const distance = parseFloat(estimatedDistance.replace(' KM', ''));
                            if (!isNaN(distance)) {
                              calculateFareLocally(distance);
                            }
                          }
                        }}
                      >
                        <Text>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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
                  onPress={calculateDistance}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white text-base font-medium">
                      Calculate Fare
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Book Driver Button */}
              <TouchableOpacity
                className={`bg-orange-500 rounded-lg p-4 items-center ${isLoading || estimatedDistance === '0 KM' ? 'opacity-70' : ''}`}
                onPress={handleBookDriver}
                disabled={isLoading || estimatedDistance === '0 KM'}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white text-lg font-medium">
                    Book Driver
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <CustomTabBar activeRoute="Home" />
      </SafeAreaView>
    </>
  );
}