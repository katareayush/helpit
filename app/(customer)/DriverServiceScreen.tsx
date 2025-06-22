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
  ScrollView,
  Dimensions,
  StatusBar as RNStatusBar
} from 'react-native';
import { ArrowLeft, MapPin, User, Car } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';
import { API_BASE_URL } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import axios from 'axios';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define types
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Backend expects coordinates in specific format for estimate-distance endpoint
interface LocationWithCoordinates {
  latitude: number;
  longitude: number;
}

interface Service {
  _id: string;
  name: string;
  baseCharge: number;
  unitType: string;
  commissionPercentage: number;
  isActive: boolean;
  description?: string;
  serviceImage?: string;
}

interface EstimateDistanceRequest {
  pickup_location: LocationWithCoordinates;
  drop_location: LocationWithCoordinates;
}

interface CalculateFareRequest {
  serviceId: string;
  distance: number;
  vehicleType: string;
}

interface BookingDetails {
  pickupAddress: string;
  destination: string;
  passengers: string;
  vehicleType: string;
}

interface BookingRequest {
  serviceId: string;
  details: BookingDetails;
  userLocation: Coordinates;
  estimatedDistance: number;
  duration: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isServiceLoading, setIsServiceLoading] = useState<boolean>(true);
  const [pickupCoordinates, setPickupCoordinates] = useState<Coordinates | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<Coordinates | null>(null);

  const passengerOptions: string[] = ['1 person', '2 people', '3 people', '4 people'];
  const vehicleOptions: string[] = [
    'Sedan (up to 4 people)',
    'SUV (up to 6 people)',
    'Luxury (up to 4 people)',
  ];

  // Responsive values
  const isSmallScreen = screenWidth < 375;
  const horizontalPadding = isSmallScreen ? 16 : 20;
  const fontSize = isSmallScreen ? 14 : 16;
  const buttonPadding = isSmallScreen ? 12 : 16;

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
        setIsServiceLoading(true);
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          Alert.alert('Authentication Required', 'Please log in.');
          router.push('/(auth)/signInC');
          return;
        }

        const response = await axios.get<ApiResponse<Service[]>>(`${API_BASE_URL}/services`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.success) {
          const driverService = response.data.data?.find(
            (service) => service.name.toLowerCase() === 'driver' || service.unitType === 'KM'
          );
          
          if (driverService) {
            setServiceId(driverService._id);
          } else {
            Alert.alert('Error', 'Driver service not found.');
          }
        } else {
          Alert.alert('Error', response.data?.message || 'Failed to fetch services.');
        }
      } catch (error: any) {
        console.error('Service fetch error:', error);
        Alert.alert('Error', error.response?.data?.message || 'An error occurred while fetching services.');
      } finally {
        setIsServiceLoading(false);
      }
    };

    fetchServiceId();
  }, []);

  // Get user's current location for pickup
  const getMyCurrentLocation = async (): Promise<void> => {
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
      Alert.alert('Error', 'Could not determine your location');
    } finally {
      setIsLoading(false);
    }
  };

  // Geocode the destination address to get coordinates
  const geocodeDestination = async (): Promise<boolean> => {
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

  // Calculate distance between pickup and destination and then calculate fare using backend API
  const calculateDistance = async (): Promise<void> => {
    // Check if service is still loading
    if (isServiceLoading) {
      Alert.alert('Please wait', 'Loading service information...');
      return;
    }

    if (!serviceId) {
      Alert.alert('Error', 'Service not available. Please try refreshing the page.');
      return;
    }

    if (!pickupAddress) {
      Alert.alert('Error', 'Please set your pickup location');
      return;
    }

    if (!destination) {
      Alert.alert('Error', 'Please enter your destination');
      return;
    }

    try {
      setIsLoading(true);

      // Get token for authenticated request
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in.');
        router.push('/(auth)/signInC');
        return;
      }

      // IMPORTANT FIX: Always geocode destination on calculate
      // This ensures we have fresh coordinates every time
      const success = await geocodeDestination();
      if (!success) {
        return; // geocodeDestination already shows an error alert
      }

      // Make sure we have pickup coordinates
      if (!pickupCoordinates) {
        await getMyCurrentLocation();
        if (!pickupCoordinates) {
          Alert.alert('Error', 'Could not determine your pickup location');
          return;
        }
      }

      // Now that we've ensured both coordinates are available, proceed with calculation
      const requestData: EstimateDistanceRequest = {
        pickup_location: {
          latitude: pickupCoordinates.latitude,
          longitude: pickupCoordinates.longitude
        },
        drop_location: {
          latitude: destinationCoordinates.latitude,
          longitude: destinationCoordinates.longitude
        }
      };
      
      interface DistanceResponse {
        estimatedDistance: number;
        unit: string;
        pickupLocation: LocationWithCoordinates;
        dropLocation: LocationWithCoordinates;
      }

      const response = await axios.post<ApiResponse<DistanceResponse>>(
        `${API_BASE_URL}/estimate-distance`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success && response.data.data) {
        const distance = response.data.data.estimatedDistance || 0;
        setEstimatedDistance(`${distance} KM`);
        
        // After getting distance, calculate the fare using backend API
        try {
          interface FareResponse {
            fare: number;
            baseCharge: number;
            distance: number;
            vehicleType: string;
          }

          const fareRequestData: CalculateFareRequest = {
            serviceId: serviceId,
            distance: distance,
            vehicleType: vehicleType
          };

          const fareResponse = await axios.post<ApiResponse<FareResponse>>(
            `${API_BASE_URL}/calculate-fare`,
            fareRequestData,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (fareResponse.data && fareResponse.data.success && fareResponse.data.data) {
            setEstimatedFare(`₹${Math.round(fareResponse.data.data.fare)}`);
          } else {
            throw new Error(fareResponse.data?.message || 'Could not calculate fare');
          }
        } catch (fareError: any) {
          console.error('Fare calculation error:', fareError);
          Alert.alert('Error', fareError.response?.data?.message || 'Failed to calculate fare');
        }
      } else {
        throw new Error(response.data?.message || 'Could not calculate distance');
      }
    } catch (error: any) {
      console.error('Distance calculation error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to calculate distance');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle vehicle type change and recalculate fare if distance is already calculated
  const handleVehicleTypeChange = async (newVehicleType: string) => {
    setVehicleType(newVehicleType);
    setShowVehicleDropdown(false);
    
    // If we already have distance calculated and service is available, recalculate fare with new vehicle type
    if (estimatedDistance !== '0 KM' && serviceId) {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;

        const numericDistance = parseFloat(estimatedDistance.replace(' KM', ''));
        
        const fareRequestData: CalculateFareRequest = {
          serviceId: serviceId,
          distance: numericDistance,
          vehicleType: newVehicleType
        };

        const fareResponse = await axios.post<ApiResponse<{
          fare: number;
          baseCharge: number;
          distance: number;
          vehicleType: string;
        }>>(
          `${API_BASE_URL}/calculate-fare`,
          fareRequestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (fareResponse.data && fareResponse.data.success && fareResponse.data.data) {
          setEstimatedFare(`₹${Math.round(fareResponse.data.data.fare)}`);
        }
      } catch (error) {
        console.error('Fare recalculation error:', error);
      }
    }
  };

  const handleBookDriver = async (): Promise<void> => {
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
        router.push('/(auth)/signInC');
        return;
      }

      // Extract numeric distance
      const numericDistance = parseFloat(estimatedDistance.replace(' KM', ''));

      // Prepare request data - this matches the API expected format
      const bookingData: BookingRequest = {
        serviceId,
        details: {
          pickupAddress,
          destination,
          passengers,
          vehicleType,
        },
        userLocation: pickupCoordinates!,
        estimatedDistance: numericDistance,
        duration: 30, // Default duration in minutes
      };

      // Use axios to make the booking API request
      interface BookingResponse {
        bookingId: string;
        booking: {
          _id: string;
          status: string;
          estimatedFare: number;
        };
      }

      const response = await axios.post<ApiResponse<BookingResponse>>(
        `${API_BASE_URL}/booking/book`,
        bookingData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success) {
        Alert.alert(
          'Success',
          'Driver booking request submitted! Waiting for a driver to accept.',
          [
            {
              text: 'View Bookings',
              onPress: () => router.push('/(customer)/MyBookingScreen')
            },
            {
              text: 'OK',
              onPress: () => router.push('/')
            }
          ]
        );
      } else {
        throw new Error(response.data?.message || 'Booking failed');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert('Error', error.response?.data?.message || error.message || 'An error occurred while booking the driver');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-white" style={{
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
      }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          className="flex-1"
        >
          <ScrollView 
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-gray-200" 
                  style={{ paddingHorizontal: horizontalPadding, paddingVertical: buttonPadding }}>
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft size={24} color="#000" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-black">
                Book a Driver
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={{ padding: horizontalPadding }}>
              {/* Pickup Location */}
              <View style={{ marginBottom: horizontalPadding }}>
                <View className="flex-row items-center mb-2">
                  <MapPin size={20} color="#4CAF50" />
                  <Text className="ml-2 font-medium text-black" style={{ fontSize }}>
                    Pickup Location
                  </Text>
                </View>
                <TextInput
                  className="border border-gray-300 rounded-lg text-base"
                  style={{ 
                    padding: buttonPadding, 
                    fontSize,
                    minHeight: 48
                  }}
                  placeholder="Enter your pickup address"
                  value={pickupAddress}
                  onChangeText={setPickupAddress}
                  multiline={false}
                />
                <TouchableOpacity
                  className="mt-2 flex-row items-center bg-gray-100 rounded-lg"
                  style={{ padding: buttonPadding / 2 }}
                  onPress={getMyCurrentLocation}
                >
                  <MapPin size={16} color="#4CAF50" />
                  <Text className="ml-2 text-sm text-gray-600">
                    Use my current location
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Destination */}
              <View style={{ marginBottom: horizontalPadding }}>
                <View className="flex-row items-center mb-2">
                  <MapPin size={20} color="#F44336" />
                  <Text className="ml-2 font-medium text-black" style={{ fontSize }}>
                    Destination
                  </Text>
                </View>
                <TextInput
                  className="border border-gray-300 rounded-lg text-base"
                  style={{ 
                    padding: buttonPadding, 
                    fontSize,
                    minHeight: 48
                  }}
                  placeholder="Enter your destination"
                  value={destination}
                  onChangeText={setDestination}
                  multiline={false}
                />
              </View>

              {/* Passengers */}
              <View style={{ marginBottom: horizontalPadding }}>
                <View className="flex-row items-center mb-2">
                  <User size={20} color="#000" />
                  <Text className="ml-2 font-medium text-black" style={{ fontSize }}>
                    Passengers
                  </Text>
                </View>
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg flex-row justify-between items-center"
                  style={{ 
                    padding: buttonPadding, 
                    minHeight: 48
                  }}
                  onPress={() =>
                    setShowPassengerDropdown(!showPassengerDropdown)
                  }
                >
                  <Text style={{ fontSize }}>{passengers}</Text>
                  <Text className="text-gray-500">∨</Text>
                </TouchableOpacity>
                {showPassengerDropdown && (
                  <View className="border border-gray-200 rounded-lg mt-1 bg-white" style={{ 
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84
                  }}>
                    {passengerOptions.map((item) => (
                      <TouchableOpacity
                        key={item}
                        className="border-b border-gray-200"
                        style={{ padding: buttonPadding }}
                        onPress={() => {
                          setPassengers(item);
                          setShowPassengerDropdown(false);
                        }}
                      >
                        <Text style={{ fontSize }}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Vehicle Type */}
              <View style={{ marginBottom: horizontalPadding }}>
                <View className="flex-row items-center mb-2">
                  <Car size={20} color="#000" />
                  <Text className="ml-2 font-medium text-black" style={{ fontSize }}>
                    Vehicle Type
                  </Text>
                </View>
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg flex-row justify-between items-center"
                  style={{ 
                    padding: buttonPadding, 
                    minHeight: 48
                  }}
                  onPress={() =>
                    setShowVehicleDropdown(!showVehicleDropdown)
                  }
                >
                  <Text style={{ fontSize, flex: 1 }} numberOfLines={1}>{vehicleType}</Text>
                  <Text className="text-gray-500">∨</Text>
                </TouchableOpacity>
                {showVehicleDropdown && (
                  <View className="border border-gray-200 rounded-lg mt-1 bg-white" style={{ 
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84
                  }}>
                    {vehicleOptions.map((item) => (
                      <TouchableOpacity
                        key={item}
                        className="border-b border-gray-200"
                        style={{ padding: buttonPadding }}
                        onPress={() => handleVehicleTypeChange(item)}
                      >
                        <Text style={{ fontSize }}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Fare Estimate */}
              <View className="border border-yellow-400 rounded-lg bg-yellow-50" 
                   style={{ padding: buttonPadding, marginBottom: horizontalPadding * 1.5 }}>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm text-gray-600">
                    Estimated Distance:
                  </Text>
                  <Text className="font-medium text-black" style={{ fontSize }}>
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
                  className={`mt-3 bg-green-500 rounded-lg items-center ${isServiceLoading || isLoading ? 'opacity-70' : ''}`}
                  style={{ 
                    padding: buttonPadding,
                    minHeight: 48
                  }}
                  onPress={calculateDistance}
                  disabled={isServiceLoading || isLoading}
                >
                  {isLoading || isServiceLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-medium" style={{ fontSize }}>
                      {isServiceLoading ? 'Loading Service...' : 'Calculate Fare'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Book Driver Button */}
              <TouchableOpacity
                className={`bg-orange-500 rounded-lg items-center ${isLoading || estimatedDistance === '0 KM' || isServiceLoading ? 'opacity-70' : ''}`}
                style={{ 
                  padding: buttonPadding,
                  minHeight: 52
                }}
                onPress={handleBookDriver}
                disabled={isLoading || estimatedDistance === '0 KM' || isServiceLoading}
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