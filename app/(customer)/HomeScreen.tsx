import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import {
  Search,
  MapPin,
  Bell,
  Calendar,
  Menu,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import CustomTabBar from '../../components/CustomTabBar';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const OFFER_ITEM_WIDTH = width * 0.8; // Fixed width for all cards
const OFFER_ITEM_HEIGHT = 150; // Fixed height for all cards

// API base URL - update with your actual base URL
const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

// Type definitions
interface ApiService {
  _id: string;
  name: string;
  baseCharge: number;
  unitType: string;
  commissionPercentage: number;
  serviceImage?: string;
  isActive: boolean;
  description?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
  isDriver: boolean;
}

interface Offer {
  id: number;
  title: string;
  subtitle: string;
  buttonText?: string;
  bgColor: string;
  buttonColor?: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  gender: string;
  profilePicture?: string;
  isBlocked: boolean;
  isVerified: boolean;
  currentLocation?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  isNotificationOn: boolean;
  role: string;
}

export default function HomeScreen(): JSX.Element {
  const [location, setLocation] = useState<string>('Fetching location...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const router = useRouter();

  // Format service name (remove underscores and capitalize)
  const formatServiceName = (name: string): string => {
    if (!name) return 'Service';

    // Replace underscores with spaces
    const withSpaces = name.replace(/_/g, ' ');

    // Capitalize each word
    return withSpaces.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // const specialOffers: Offer[] = [
  //   {
  //     id: 1,
  //     title: '50% Off Your First Booking',
  //     subtitle: 'Use code: NEW50',
  //     buttonText: 'Claim Now',
  //     bgColor: '#F3E5F5',
  //     buttonColor: '#3F51B5',
  //   },
  //   {
  //     id: 2,
  //     title: 'Hot Deals',
  //     subtitle: 'Check offers',
  //     bgColor: '#E8F5E9',
  //   },
  //   {
  //     id: 3,
  //     title: '20% Off Cleaning',
  //     subtitle: 'Valid until April 20',
  //     buttonText: 'Claim',
  //     bgColor: '#FFF8E1',
  //     buttonColor: '#FFB300',
  //   },
  // ];

  // Fetch services from API
  const fetchServices = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const servicesResponse = await axios.get(`${apiUrl}/services`);
      
      if (servicesResponse.data?.success) {
        const apiServices: ApiService[] = servicesResponse.data.data || [];
        
        const availableServiceIds = new Set();
        
        const token = await AsyncStorage.getItem('accessToken');
        
        if (token) {
          let userLat, userLong;
          
          const storedLocation = await AsyncStorage.getItem('@helpIt:location');
          if (storedLocation) {
            const parsedLocation = JSON.parse(storedLocation);
            userLat = parsedLocation.latitude;
            userLong = parsedLocation.longitude;
          } else if (location && !location.includes('Fetching')) {
            const currentLocation = await Location.getCurrentPositionAsync({});
            userLat = currentLocation.coords.latitude;
            userLong = currentLocation.coords.longitude;
          }
          
          if (userLat && userLong) {
            const providersResponse = await axios.get(
              `${apiUrl}/service-provider/search`, 
              { 
                params: { lat: userLat, long: userLong, limit: 50 },
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            
            if (providersResponse.data?.success && 
                providersResponse.data.data?.serviceProviders) {
              const providers = providersResponse.data.data.serviceProviders;
              
              providers.forEach(provider => {
                if (provider.serviceIds && Array.isArray(provider.serviceIds)) {
                  provider.serviceIds.forEach(service => {
                    if (service && service._id) {
                      availableServiceIds.add(service._id);
                    }
                  });
                }
              });
            }
          }
        }
        
        const mappedServices: Service[] = apiServices
          .filter(service => availableServiceIds.has(service._id))
          .map((service: ApiService) => {
            const isDriverService = service.name.toLowerCase().includes('driver') || 
                                    service.name.toLowerCase().includes('driving');
            
            return {
              id: service._id,
              name: formatServiceName(service.name),
              description: service.description || `Professional ${service.name.toLowerCase()} services`,
              image: service.serviceImage || 'https://via.placeholder.com/100',
              isDriver: isDriverService
            };
          });
        
        setAllServices(mappedServices);
        setFilteredServices(mappedServices);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      
      // No fallback, just show empty state
      setAllServices([]);
      setFilteredServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
    fetchServices();
  }, []);

  // Get location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({});
        const address = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        // Save location to AsyncStorage for other screens to use
        const locationData = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        };
        await AsyncStorage.setItem('@helpIt:location', JSON.stringify(locationData));

        if (address.length > 0) {
          const { city, region } = address[0];
          const locationString = `${city || ''}, ${region || ''}`;
          setLocation(locationString);

          await AsyncStorage.setItem('@helpIt:locationString', locationString);
        } else {
          setLocation('Location not found');
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Could not fetch location');
      }
    })();
  }, []);

  const fetchUserData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Get the stored token
      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        // If no token, redirect to login
        router.replace('/signInC');
        return;
      }

      // Set up request with token
      const response = await axios.get(`${apiUrl}/user/self-identification`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        setUserData(response.data.data);
      } else {
        Alert.alert('Error', 'Failed to fetch user data');
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);

      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        Alert.alert('Session Expired', 'Please login again');
        await AsyncStorage.removeItem('accessToken');
        router.replace('/(auth)/signInC');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to fetch profile data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search functionality
  const handleSearch = (text: string): void => {
    setSearchQuery(text);

    if (text.trim() === '') {
      setFilteredServices(allServices);
      return;
    }

    const filtered = allServices.filter(service =>
      service.name.toLowerCase().includes(text.toLowerCase()) ||
      service.description.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredServices(filtered);
  };

  const statusBarHeight = Constants.statusBarHeight;

  const renderOfferItem = ({ item }: { item: Offer }): JSX.Element => (
    <View
      style={{
        width: OFFER_ITEM_WIDTH,
        height: OFFER_ITEM_HEIGHT,
        backgroundColor: item.bgColor,
        borderRadius: 8,
        padding: 16,
        marginRight: 16,
      }}
    >
      <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#333' }}>{item.title}</Text>
      <Text style={{ color: '#555', fontSize: 14, marginTop: 8 }}>{item.subtitle}</Text>

      {item.buttonText && (
        <TouchableOpacity
          style={{
            backgroundColor: item.buttonColor,
            borderRadius: 6,
            marginTop: 12,
            paddingVertical: 8,
            paddingHorizontal: 16,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>{item.buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const handleServicePress = (service: Service): void => {
    if (service.isDriver) {
      router.push('DriverServiceScreen');
    } else {
      router.push({
        pathname: 'ServiceProviderScreen',
        params: { serviceId: service.id, serviceName: service.name }
      });
    }
  };

  const handleBookService = (): void => {
    // Navigate to the first service in the list
    if (allServices.length > 0) {
      handleServicePress(allServices[0]);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading your information...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <View style={{
          flex: 1,
          backgroundColor: '#f9fafb',
          paddingTop: Platform.OS === 'ios' ? 0 : statusBarHeight
        }}>
          {/* Header */}
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexDirection: 'row',
            justifyContent: 'center', // Center horizontally
            alignItems: 'center' // Center vertically
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 24, color: '#333', alignItems: 'center' }}>
              Help<Text style={{ color: '#f97316' }}>It</Text>
            </Text>
          </View>

          {/* Welcome Card */}
          <View style={{
            marginHorizontal: 16,
            marginTop: 16,
            backgroundColor: '#fff3e0',
            borderRadius: 8,
            padding: 20
          }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#333' }}>
              Hello, {userData?.name?.split(' ')[0] || 'User'}!
            </Text>
            <Text style={{ color: '#555', marginTop: 8 }}>
              What service do you need today?
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                borderRadius: 6,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginTop: 16,
                alignItems: 'center'
              }}
              onPress={handleBookService}
            >
              <Text style={{ fontWeight: '500', color: '#333' }}>
                Book a Service
              </Text>
            </TouchableOpacity>
          </View>

          {/* Location bar */}
          <View style={{
            marginHorizontal: 16,
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={{ color: '#666', fontSize: 14 }}>Current Location: </Text>
            <Text style={{ color: '#333', fontWeight: '500', fontSize: 14 }}>
              {errorMsg || location}
            </Text>
            <MapPin size={16} color="#555" style={{ marginLeft: 4 }} />
          </View>

          {/* Search bar */}
          <View style={{
            marginHorizontal: 16,
            marginTop: 12,
            backgroundColor: '#f1f1f1',
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12
          }}>
            <Search size={20} color="#777" />
            <TextInput
              placeholder="Search for services"
              style={{ flex: 1, marginLeft: 8, color: '#333' }}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

          <ScrollView
            style={{ flex: 1, marginTop: 20 }}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Special Offers 
             <View style={{ paddingHorizontal: 16 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text style={{ fontWeight: '600', fontSize: 18, color: '#333' }}>Special Offers</Text>
                <Text style={{ color: '#3b82f6', fontSize: 14 }}>View all</Text>
              </View>

               Special Offers Carousel 
              <View style={{ marginTop: 16 }}>
                <FlatList
                  data={specialOffers}
                  renderItem={renderOfferItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 16 }}
                  snapToInterval={OFFER_ITEM_WIDTH + 16}
                  decelerationRate="fast"
                />
              </View>
            </View> */}

            {/* Services */}
            <View style={{ marginTop: 32, paddingHorizontal: 16 }}>
              <Text style={{ fontWeight: '600', fontSize: 18, color: '#333' }}>Services</Text>

              {filteredServices.length > 0 ? (
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  marginTop: 16
                }}>
                  {filteredServices.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={{
                        width: '48%',
                        backgroundColor: 'white',
                        borderRadius: 8,
                        marginBottom: 20,
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                      onPress={() => handleServicePress(service)}
                    >
                      <Image
                        source={{ uri: service.image }}
                        style={{ width: '100%', height: 128 }}
                        resizeMode="cover"
                      />
                      <View style={{ padding: 12 }}>
                        <Text style={{ fontWeight: '500', color: '#333' }}>
                          {service.name}
                        </Text>
                        <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                          {service.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 24,
                  padding: 20,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8
                }}>
                  <Text style={{ color: '#666', textAlign: 'center' }}>
                    No Services Found at your Location.
                  </Text>

                </View>
              )}
            </View>

            {/* Recent Bookings */}
            <View style={{ marginTop: 24, paddingHorizontal: 16, paddingBottom: 80 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text style={{ fontWeight: '600', fontSize: 18, color: '#333' }}>Recent Bookings</Text>
                <Text style={{ color: '#3b82f6', fontSize: 14 }}>View history</Text>
              </View>

              <View style={{
                marginTop: 16,
                alignItems: 'center',
                paddingVertical: 40,
                borderWidth: 1,
                borderColor: '#e5e5e5',
                borderRadius: 8
              }}>
                <Calendar size={40} color="#999" />
                <Text style={{ marginTop: 12, color: '#666' }}>No recent bookings found</Text>

                <TouchableOpacity
                  style={{
                    marginTop: 20,
                    backgroundColor: '#fff3e0',
                    borderRadius: 6,
                    paddingHorizontal: 20,
                    paddingVertical: 12
                  }}
                  onPress={handleBookService}
                >
                  <Text style={{ fontWeight: '500', color: '#333' }}>
                    Book Your First Service
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Bottom Navigation */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <CustomTabBar activeRoute="HomeScreen" />
        </View>
      </SafeAreaView>
    </>
  );
}