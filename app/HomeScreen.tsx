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
import CustomTabBar from '../components/CustomTabBar';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const OFFER_ITEM_WIDTH = width * 0.8; // Fixed width for all cards
const OFFER_ITEM_HEIGHT = 150; // Fixed height for all cards

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState('Fetching location...');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (address.length > 0) {
        const { city, region } = address[0];
        setLocation(`${city}, ${region}`);
      } else {
        setLocation('Location not found');
      }
    })();
  }, []);

  const services = [
    {
      id: 1,
      name: 'Driver Service',
      description: 'Professional drivers for your needs',
      image: 'https://via.placeholder.com/100',
      screen: 'DriverServiceScreen'  // Matches the screen name in _layout.tsx
    },
    {
      id: 2,
      name: 'Home Cleaning',
      description: 'Professional home cleaning services',
      image: 'https://via.placeholder.com/100',
      screen: 'CleaningServiceListScreen'  // Matches the screen name in _layout.tsx
    },
    {
      id: 3,
      name: 'Helper',
      description: 'Professional assistance for tasks',
      image: 'https://via.placeholder.com/100',
      screen: 'HelperServiceScreen'  // Matches the screen name in _layout.tsx
    },
    {
      id: 4,
      name: 'Cook',
      description: 'Professional cooking services',
      image: 'https://via.placeholder.com/100',
      screen: 'HelperServiceScreen'  // Changed from Home to HelperService as placeholder
    },
  ];

  const specialOffers = [
    {
      id: 1,
      title: '50% Off Your First Booking',
      subtitle: 'Use code: NEW50',
      buttonText: 'Claim Now',
      bgColor: '#F3E5F5', // Equivalent to bg-purple-100
      buttonColor: '#3F51B5', // Equivalent to bg-blue-500
    },
    {
      id: 2,
      title: 'Hot Deals',
      subtitle: 'Check offers',
      bgColor: '#E8F5E9', // Equivalent to bg-green-100
    },
    {
      id: 3,
      title: '20% Off Cleaning',
      subtitle: 'Valid until April 20',
      buttonText: 'Claim',
      bgColor: '#FFF8E1', // Equivalent to bg-yellow-100
      buttonColor: '#FFB300', // Equivalent to bg-amber-500
    },
  ];

  const statusBarHeight = Constants.statusBarHeight;

  const renderOfferItem = ({ item }) => (
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

  // Handle service item click
  const router = useRouter();
  
  const handleServicePress = (service) => {
    router.push(service.screen);
  };

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
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Menu size={28} color="#333" />
            <Text style={{ fontWeight: 'bold', fontSize: 24, color: '#333' }}>
              Help<Text style={{ color: '#f97316' }}>It</Text>
            </Text>
            <Bell size={28} color="#333" />
          </View>

          {/* Welcome Card */}
          <View style={{ 
            marginHorizontal: 16, 
            marginTop: 16, 
            backgroundColor: '#fff3e0', 
            borderRadius: 8, 
            padding: 20 
          }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#333' }}>Hello, Aditya!</Text>
            <Text style={{ color: '#555', marginTop: 8 }}>
              What service do you need today?
            </Text>

            <TouchableOpacity style={{ 
              backgroundColor: 'white', 
              borderRadius: 6, 
              paddingHorizontal: 16, 
              paddingVertical: 12, 
              marginTop: 16, 
              alignItems: 'center' 
            }}>
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
            />
          </View>

          <ScrollView
            style={{ flex: 1, marginTop: 20 }}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Special Offers */}
            <View style={{ paddingHorizontal: 16 }}>
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <Text style={{ fontWeight: '600', fontSize: 18, color: '#333' }}>Special Offers</Text>
                <Text style={{ color: '#3b82f6', fontSize: 14 }}>View all</Text>
              </View>

              {/* Special Offers Carousel */}
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
            </View>

            {/* Services */}
            <View style={{ marginTop: 32, paddingHorizontal: 16 }}>
              <Text style={{ fontWeight: '600', fontSize: 18, color: '#333' }}>Services</Text>

              <View style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                justifyContent: 'space-between', 
                marginTop: 16
              }}>
                {services.map((service) => (
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

                <TouchableOpacity style={{ 
                  marginTop: 20, 
                  backgroundColor: '#fff3e0', 
                  borderRadius: 6, 
                  paddingHorizontal: 20, 
                  paddingVertical: 12 
                }}>
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
          <CustomTabBar activeRoute="Home" />
        </View>
      </SafeAreaView>
    </>
  );
}