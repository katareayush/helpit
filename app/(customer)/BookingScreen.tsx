import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar as RNStatusBar,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { ArrowLeft, MapPin, Calendar, Clock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import * as Location from 'expo-location';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import CustomTabBar from '../../components/CustomTabBar';
import { AuthContext } from '../_layout';

// API Config
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_BASE_URL;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define types
interface UserLocation {
  latitude: number;
  longitude: number;
}

interface BookingDetails {
  location: string;
  locationCoordinates: UserLocation;
  date: string;
  time: string;
  duration: number;
}

interface BookingData {
  serviceId: string;
  details: BookingDetails;
  userLocation: UserLocation;
  duration: number;
  estimatedDistance?: number;
}

interface Service {
  _id: string;
  name: string;
  baseCharge: number;
  unitType: 'KM' | 'HOUR';
  commissionPercentage: number;
  serviceImage?: string;
  isActive: boolean;
  description?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string;
  setAuthState: (isAuthenticated: boolean, userRole: string) => void;
}

interface ServiceProvider {
  _id: string;
  name: string;
  currentLocation: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  isAvailable: boolean;
}

interface BookingResponse {
  success: boolean;
  message?: string;
  booking?: {
    _id: string;
    status: string;
    estimatedFare: number;
  };
  bookingId?: string;
  data?: {
    _id?: string;
    bookingId?: string;
  };
}

const BookingScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isAuthenticated } = useContext(AuthContext as React.Context<AuthContextType>);

  // Basic states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serviceLocation, setServiceLocation] = useState<string>('');
  const [locationCoordinates, setLocationCoordinates] = useState<UserLocation | null>(null);
  const [duration, setDuration] = useState<string>('1');
  const [formattedServiceName, setFormattedServiceName] = useState<string>('Service');

  // Time and date states
  const [date, setDate] = useState<Date>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const [time, setTime] = useState<string>('');
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  // Service info
  const [service, setService] = useState<Service | null>(null);

  // Socket and booking states
  const socketRef = useRef<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [assignedProvider, setAssignedProvider] = useState<ServiceProvider | null>(null);

  // Enhanced UI feedback states
  const [declineCount, setDeclineCount] = useState<number>(0);
  const [searchingMessage, setSearchingMessage] = useState<string>('Searching for service providers...');

  // Get the serviceId from URL params
  const serviceId = params.serviceId as string;

  // Function to format service name (remove underscores and capitalize)
  const formatServiceName = (name: string): string => {
    if (!name) return 'Service';
    const withSpaces = name.replace(/_/g, ' ');
    return withSpaces.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Format date when it changes
  useEffect(() => {
    const formattedDateStr = date.toISOString().split('T')[0];
    setFormattedDate(formattedDateStr);
  }, [date]);

  // Get user's current location
  useEffect(() => {
    const getUserLocation = async (): Promise<void> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Location permission is required');
          return;
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
      }
    };
    getUserLocation();
  }, []);

  // Set up socket connection
  useEffect(() => {
    let socket: Socket | null = null;
    let isMounted = true;

    const setupSocket = async (): Promise<void> => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token || !isMounted) return;

        // Close existing socket if any
        if (socketRef.current) {
          socketRef.current.disconnect();
        }

        // Create new socket connection
        socket = io(SOCKET_URL, {
          query: { token },
          transports: ['websocket', 'polling']
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('Socket connected:', socket?.id);
          if (isMounted) {
            setSocketConnected(true);
            socket?.emit('userConnect');
          }
        });

        // Listen for booking created confirmation
        socket.on('booking_created', (data: { bookingId?: string, bookingDetails?: any, booking?: { _id: string } }) => {
          console.log('Booking created:', data);
          if (isMounted) {
            let bookingId;
            if (data.bookingId) {
              bookingId = data.bookingId;
            } else if (data.booking && data.booking._id) {
              bookingId = data.booking._id;
            }
            
            if (bookingId) {
              setCurrentBookingId(bookingId);
              setBookingStatus('PENDING');
              setIsLoading(false);
              setDeclineCount(0); // Reset decline count
              setSearchingMessage('Searching for service providers...');
              Alert.alert(
                'Success',
                'Booking created successfully! Waiting for service provider to accept.'
              );
            } else {
              console.warn('Socket booking_created event but no ID:', data);
              setBookingStatus('PENDING');
              setIsLoading(false);
              Alert.alert(
                'Success',
                'Booking created successfully! Waiting for service provider to accept.'
              );
            }
          }
        });

        // Listen for booking acceptance
        socket.on('booking_accepted', (data: {
          bookingId?: string,
          booking?: { _id: string },
          serviceProvider?: ServiceProvider,
          provider?: ServiceProvider,
          bookingDetails?: any
        }) => {
          console.log('Booking accepted:', data);
          
          const bookingId = data.bookingId || (data.booking && data.booking._id);
          const provider = data.serviceProvider || data.provider;
          
          if (bookingId === currentBookingId && provider && isMounted) {
            setBookingStatus('ACCEPTED');
            setAssignedProvider(provider);

            Alert.alert(
              'Booking Accepted',
              `${provider.name} has accepted your booking request and will arrive shortly.`,
              [
                { text: 'View Details', onPress: () => router.push('/MyBookingScreen') },
                { text: 'OK' }
              ]
            );
          }
        });

        // Listen for booking completion
        socket.on('booking_completed', (data: { bookingId: string, finalFare: number }) => {
          console.log('Booking completed:', data);
          if (data.bookingId === currentBookingId && isMounted) {
            setBookingStatus('COMPLETED');
            Alert.alert(
              'Service Completed',
              `Your service has been completed. Final fare: ₹${data.finalFare.toFixed(2)}`,
              [
                { text: 'OK', onPress: () => router.push('/MyBookingScreen') }
              ]
            );
          }
        });

        // Listen for booking cancellation by service provider
        socket.on('booking_cancel_by_service_provider', (data: {
          bookingId: string,
          message: string
        }) => {
          console.log('Booking cancelled by service provider:', data);
          if (data.bookingId === currentBookingId && isMounted) {
            setBookingStatus('CANCELLED');
            setAssignedProvider(null);
            Alert.alert(
              'Booking Cancelled',
              'The service provider has cancelled your booking. Would you like to try again?',
              [
                { text: 'Try Again', onPress: () => resetBookingState() },
                { text: 'Go to Home', onPress: () => router.push('/HomeScreen') }
              ]
            );
          }
        });

        // Listen for decline service (individual provider declining - matches your backend)
        socket.on('decline_service', (data: { bookingId: string, message: string }) => {
          console.log('Service declined by a provider:', data);
          if (data.bookingId === currentBookingId && isMounted) {
            setDeclineCount(prev => {
              const newCount = prev + 1;
              
              // Update searching message based on decline count
              if (newCount === 1) {
                setSearchingMessage('A provider declined. Looking for other providers...');
              } else if (newCount === 2) {
                setSearchingMessage('Multiple providers declined. Expanding search...');
              } else if (newCount >= 3) {
                setSearchingMessage('Still searching for available providers...');
              }
              
              return newCount;
            });

            // Don't show alert for every decline, just update the message
            console.log(`Provider declined booking ${data.bookingId}. Total declines: ${declineCount + 1}`);
          }
        });

        // Listen for hour-based booking decline (complete rejection - matches your backend)
        socket.on('decline_hours_service', (data: { bookingId: string, message: string }) => {
          console.log('Hour-based service declined completely:', data);
          if (data.bookingId === currentBookingId && isMounted) {
            setBookingStatus('DECLINE');
            setAssignedProvider(null);

            Alert.alert(
              'Booking Declined',
              'The service provider has declined your booking. Would you like to try again?',
              [
                { text: 'Try Again', onPress: () => resetBookingState() },
                { text: 'Go to Home', onPress: () => router.push('/HomeScreen') }
              ]
            );
          }
        });

        // Listen for booking cancelled by user confirmation
        socket.on('booking_cancelled', (data: { bookingId: string, cancelledBy: string }) => {
          console.log('Booking cancelled confirmation:', data);
          if (data.bookingId === currentBookingId && isMounted) {
            setBookingStatus('CANCELLED');
            setAssignedProvider(null);
            setIsLoading(false);
          }
        });

        socket.on('error', (error) => {
          console.error('Socket error:', error);
          if (isMounted) {
            setSocketConnected(false);
            if (error.message) {
              Alert.alert('Connection Error', error.message);
            }
          }
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
          if (isMounted) {
            setSocketConnected(false);
          }
        });
      } catch (error) {
        console.error('Socket setup error:', error);
        if (isMounted) {
          setSocketConnected(false);
        }
      }
    };

    if (isAuthenticated) {
      setupSocket();
    }

    return () => {
      isMounted = false;
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, currentBookingId]);

  // Reset booking state for new attempt
  const resetBookingState = () => {
    setCurrentBookingId(null);
    setBookingStatus(null);
    setAssignedProvider(null);
    setDeclineCount(0);
    setSearchingMessage('Searching for service providers...');
  };

  // Fetch service details
  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails(serviceId);
    }
  }, [serviceId]);

  const fetchServiceDetails = async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/services`);

      if (response.data?.success) {
        const services: Service[] = response.data.data || [];
        const selectedService = services.find(s => s._id === id);

        if (selectedService) {
          setService(selectedService);
          setFormattedServiceName(formatServiceName(selectedService.name));
        } else {
          Alert.alert('Error', 'Service not found');
          setService({
            _id: id,
            name: "Service",
            baseCharge: 0,
            unitType: 'HOUR',
            commissionPercentage: 0,
            isActive: true
          });
        }
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      Alert.alert('Error', 'Failed to fetch service details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date): void => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      const timeStr = `${hours}:${minutesStr}`;
      setTime(timeStr);
    }
  };

  const handleUseCurrentLocation = async (): Promise<void> => {
    try {
      const storedLocation = await AsyncStorage.getItem('@helpIt:location');
      const storedLocationString = await AsyncStorage.getItem('@helpIt:locationString');

      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);
        setLocationCoordinates({
          latitude: parsedLocation.latitude,
          longitude: parsedLocation.longitude
        });

        if (storedLocationString) {
          setServiceLocation(storedLocationString);
          return;
        }
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      Alert.alert('Loading', 'Getting your current location...');

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setLocationCoordinates({ latitude, longitude });

      await AsyncStorage.setItem('@helpIt:location', JSON.stringify({
        latitude,
        longitude
      }));

      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude
        });

        if (addressResponse && addressResponse[0]) {
          const address = addressResponse[0];
          const formattedAddress = [
            address.name,
            address.street,
            address.city,
            address.region,
            address.postalCode,
            address.country
          ].filter(Boolean).join(', ');

          setServiceLocation(formattedAddress);
          await AsyncStorage.setItem('@helpIt:locationString', formattedAddress);
        } else {
          setServiceLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
      } catch (error) {
        setServiceLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not determine your location');
    }
  };

  const validateDuration = (value: string): boolean => {
    const durationNum = parseInt(value);
    return !isNaN(durationNum) && durationNum > 0 && durationNum <= 24;
  };

  const handleProceedToConfirm = async (): Promise<void> => {
    if (!serviceLocation) {
      Alert.alert('Error', 'Please enter a service location');
      return;
    }

    if (!locationCoordinates) {
      Alert.alert('Error', 'Please use "Use My Current Location" to set coordinates');
      return;
    }

    if (!time) {
      Alert.alert('Error', 'Please select a time for the service');
      return;
    }

    if (!validateDuration(duration)) {
      Alert.alert('Error', 'Please enter a valid duration (1-24 hours)');
      return;
    }

    if (!service) {
      Alert.alert('Error', 'Service details not loaded');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        Alert.alert('Error', 'Authentication failed');
        router.push('/(auth)/SignInScreen');
        setIsLoading(false);
        return;
      }

      // Get estimated distance for KM-based services
      let estimatedDistance: number | undefined = undefined;
      if (service.unitType === 'KM') {
        try {
          const distanceResponse = await axios.post(
            `${API_URL}/estimate-distance`,
            { coordinates: locationCoordinates },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (distanceResponse.data?.success) {
            estimatedDistance = distanceResponse.data.distance || 5;
          }
        } catch (error) {
          console.error('Error estimating distance:', error);
          estimatedDistance = 5;
        }
      }

      // Prepare booking data
      const bookingData: BookingData = {
        serviceId: service._id,
        details: {
          location: serviceLocation,
          locationCoordinates: locationCoordinates,
          date: formattedDate,
          time: time,
          duration: parseInt(duration || '1')
        },
        userLocation: locationCoordinates,
        duration: parseInt(duration || '1'),
        estimatedDistance: estimatedDistance,
        ...(service.unitType === 'HOUR' && {
          serviceDate: formattedDate,
          startTime: time,
          totalNoofHours: parseInt(duration || '1')
        })
      };

      // Choose API endpoint based on service type
      const bookingEndpoint = service.unitType === 'HOUR'
        ? `${API_URL}/booking/hour-based/book`
        : `${API_URL}/booking/book`;

      console.log('Creating booking with data:', bookingData);
      console.log('Using endpoint:', bookingEndpoint);

      // Make booking API request
      const response = await axios.post<BookingResponse>(
        bookingEndpoint,
        bookingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Booking response:', response.data);

      if (response.data && response.data.success) {
        let bookingId;
        
        if (response.data.booking && response.data.booking._id) {
          bookingId = response.data.booking._id;
        } else if (response.data.bookingId) {
          bookingId = response.data.bookingId;
        } else if (response.data.data && response.data.data._id) {
          bookingId = response.data.data._id;
        } else if (response.data.data && response.data.data.bookingId) {
          bookingId = response.data.data.bookingId;
        }
        
        if (bookingId) {
          setCurrentBookingId(bookingId);
          setBookingStatus('PENDING');
          
          Alert.alert(
            'Booking Created', 
            service.unitType === 'HOUR' 
              ? 'Your booking has been sent to service providers. Please wait for their response.'
              : 'Searching for service providers near you...',
            [{ text: 'OK' }]
          );
        } else {
          console.warn('Booking created successfully but no booking ID found in response:', response.data);
          setBookingStatus('PENDING');
          Alert.alert(
            'Booking Created', 
            'Your booking has been created successfully. You can check your bookings in the My Bookings screen.',
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error('Booking creation failed');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      let errorMsg = 'Failed to create booking';
      if (error.response) {
        errorMsg = error.response.data?.message || error.response.data?.error || 'Server error occurred';
        console.log('Server error response:', error.response.data);
      } else if (error.request) {
        errorMsg = 'Network error. Please check your internet connection.';
      } else {
        errorMsg = error.message || 'An unexpected error occurred';
      }
      
      Alert.alert('Error', errorMsg);
      setIsLoading(false);
    }
  };

  // Cancel the current booking
  const handleCancelBooking = async (): Promise<void> => {
    if (!currentBookingId) return;

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        Alert.alert('Error', 'Authentication failed');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/booking/cancel/user`,
        { bookingId: currentBookingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.success) {
        setBookingStatus('CANCELLED');
        setAssignedProvider(null);
        Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
        resetBookingState();
      } else {
        throw new Error('Booking cancellation failed');
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      const errorMsg = error.response?.data?.message || 'Failed to cancel booking';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Render booking status view with enhanced UI feedback
  const renderBookingStatusView = () => {
    if (!currentBookingId || !bookingStatus) return null;

    return (
      <View className="mt-5">
        <View className="bg-white rounded-lg border border-gray-200 p-4">
          <Text className="text-lg font-bold text-center text-gray-800 mb-2">
            Booking Status
          </Text>

          <View className="flex-row justify-center mb-3">
            <View className={`px-3 py-1 rounded-full ${
              bookingStatus === 'PENDING' ? 'bg-amber-100' :
              bookingStatus === 'ACCEPTED' ? 'bg-blue-100' :
              bookingStatus === 'COMPLETED' ? 'bg-green-100' :
              bookingStatus === 'DECLINE' ? 'bg-red-100' :
              'bg-red-100'
            }`}>
              <Text className={`font-medium ${
                bookingStatus === 'PENDING' ? 'text-amber-700' :
                bookingStatus === 'ACCEPTED' ? 'text-blue-700' :
                bookingStatus === 'COMPLETED' ? 'text-green-700' :
                bookingStatus === 'DECLINE' ? 'text-red-700' :
                'text-red-700'
              }`}>
                {bookingStatus}
              </Text>
            </View>
          </View>

          {bookingStatus === 'PENDING' && (
            <>
              <Text className="text-center text-gray-600 mb-2">
                {searchingMessage}
              </Text>
              
              {declineCount > 0 && (
                <Text className="text-center text-sm text-amber-600 mb-3">
                  {declineCount} provider{declineCount > 1 ? 's' : ''} declined
                </Text>
              )}
              
              <View className="flex-row items-center justify-center mb-3">
                <ActivityIndicator size="small" color="#F59E0B" />
                <Text className="ml-2 text-gray-500 text-sm">Looking for providers...</Text>
              </View>
              
              <TouchableOpacity
                className="bg-red-100 rounded-lg py-3 items-center mt-2"
                onPress={handleCancelBooking}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Text className="text-red-600 font-medium">Cancel Booking</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {bookingStatus === 'ACCEPTED' && assignedProvider && (
            <>
              <Text className="text-center text-gray-600 mb-2">
                Your booking has been accepted by:
              </Text>
              <Text className="text-center text-lg font-bold text-gray-800 mb-3">
                {assignedProvider.name}
              </Text>

              <TouchableOpacity
                className="bg-blue-500 rounded-lg py-3 items-center mt-2 mb-2"
                onPress={() => router.push('/MyBookingScreen')}
              >
                <Text className="text-white font-medium">View Booking Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-100 rounded-lg py-3 items-center"
                onPress={handleCancelBooking}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Text className="text-red-600 font-medium">Cancel Booking</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {bookingStatus === 'DECLINE' && (
            <>
              <Text className="text-center text-gray-600 mb-3">
                The service provider has declined your booking request.
              </Text>
              <TouchableOpacity
                className="bg-blue-500 rounded-lg py-3 items-center mt-2 mb-2"
                onPress={() => resetBookingState()}
              >
                <Text className="text-white font-medium">Try Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Socket connection status */}
        <View className="mt-3 flex-row items-center justify-center">
          <View className={`w-2 h-2 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <Text className={`text-xs ${socketConnected ? 'text-green-600' : 'text-red-600'}`}>
            {socketConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <SafeAreaView className="flex-1 bg-white" style={{
          paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
        }}>
          {/* Fixed header outside ScrollView */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-center flex-1">
              Book {formattedServiceName}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          
          {/* Improved ScrollView configuration */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ 
              paddingBottom: 120, // Extra padding for Tab Bar
              flexGrow: 1, 
            }}
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
            bounces={true}
          >
            <View className="p-5">
              {isLoading && !service ? (
                <View className="items-center justify-center py-10">
                  <ActivityIndicator size="large" color="#FF9800" />
                  <Text className="mt-3 text-gray-500">Loading service details...</Text>
                </View>
              ) : (
                <>
                  {/* Service Summary */}
                  <View className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-5">
                    <Text className="text-lg font-bold text-gray-900 text-center">
                      {formattedServiceName}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1 text-center">
                      {service?.description || 'Professional service'}
                    </Text>
                    {service?.baseCharge && (
                      <View className="mt-2 items-center">
                        <Text className="text-base text-amber-600">
                          ₹{service.baseCharge} per {service.unitType === 'HOUR' ? 'hour' : 'km'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Booking Status View - Show only if there's an active booking */}
                  {renderBookingStatusView()}

                  {/* Show booking form only if no active booking or booking is cancelled/declined */}
                  {(!currentBookingId || ['CANCELLED', 'DECLINE', 'COMPLETED'].includes(bookingStatus || '')) && (
                    <>
                      {/* Service Location */}
                      <View className="mb-5">
                        <View className="flex-row items-center mb-2">
                          <MapPin size={20} color="#4CAF50" />
                          <Text className="ml-2 text-base font-medium text-gray-800">Service Location</Text>
                        </View>
                        <TextInput
                          className="border border-gray-200 rounded-lg p-3 text-base bg-white"
                          placeholder="Enter Service Location"
                          value={serviceLocation}
                          onChangeText={setServiceLocation}
                          style={{ minHeight: 50 }}
                        />

                        {/* Use Current Location Button */}
                        <TouchableOpacity
                          className="mt-2 flex-row items-center justify-center py-3 px-4 bg-gray-100 rounded-lg"
                          onPress={handleUseCurrentLocation}
                        >
                          <Text className="text-gray-700 font-medium">Use My Current Location</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Date */}
                      <View className="mb-5">
                        <Text className="text-base font-medium text-gray-800 mb-2">Date</Text>
                        <TouchableOpacity
                          className="flex-row items-center border border-gray-200 rounded-lg p-3 bg-white"
                          style={{ minHeight: 50 }}
                          onPress={() => setShowDatePicker(true)}
                        >
                          <Calendar size={20} color="#888" />
                          <Text className="ml-2 text-base text-gray-800">{formattedDate}</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                          <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                          />
                        )}
                      </View>

                      {/* Time */}
                      <View className="mb-5">
                        <Text className="text-base font-medium text-gray-800 mb-2">Time</Text>
                        <TouchableOpacity
                          className="flex-row items-center border border-gray-200 rounded-lg p-3 bg-white"
                          style={{ minHeight: 50 }}
                          onPress={() => setShowTimePicker(true)}
                        >
                          <Clock size={20} color="#888" />
                          <Text className="ml-2 text-base text-gray-800">
                            {time || "Select a time"}
                          </Text>
                        </TouchableOpacity>

                        {showTimePicker && (
                          <DateTimePicker
                            value={new Date()}
                            mode="time"
                            is24Hour={false}
                            display="default"
                            onChange={handleTimeChange}
                          />
                        )}
                      </View>

                      <View className="mb-5">
                        <Text className="text-base font-medium text-gray-800 mb-2">Duration (hours)</Text>
                        <TextInput
                          className="border border-gray-200 rounded-lg p-3 text-base bg-white"
                          value={duration}
                          onChangeText={setDuration}
                          keyboardType="numeric"
                          style={{ minHeight: 50 }}
                          maxLength={2}
                        />
                        <Text className="text-xs text-gray-500 mt-1">Please enter between 1-24 hours</Text>
                      </View>

                      <TouchableOpacity
                        className={`bg-amber-500 rounded-lg py-4 items-center ${isLoading ? 'opacity-70' : ''}`}
                        onPress={handleProceedToConfirm}
                        disabled={isLoading}
                        style={{ minHeight: 56 }}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text className="text-white text-lg font-medium">Proceed to Confirm</Text>
                        )}
                      </TouchableOpacity>

                      <View className="flex-row items-center my-6">
                        <View className="flex-1 h-px bg-gray-300" />
                        <Text className="mx-4 text-sm text-gray-500">or</Text>
                        <View className="flex-1 h-px bg-gray-300" />
                      </View>

                      {/* Buy Credits Button */}
                      <TouchableOpacity
                        className="bg-black rounded-lg py-4 items-center"
                        onPress={() => {
                          router.push('/BuyCreditsScreen');
                        }}
                        style={{ minHeight: 56 }}
                      >
                        <Text className="text-white text-lg font-medium">Buy Credits</Text>
                      </TouchableOpacity>
                      
                      <View style={{ height: 30 }} />
                    </>
                  )}
                </>
              )}
            </View>
          </ScrollView>
          
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
};

export default BookingScreen;