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

const { width } = Dimensions.get('window');
const OFFER_ITEM_WIDTH = width * 0.8; // Fixed width for all cards
const OFFER_ITEM_HEIGHT = 150; // Fixed height for all cards

export default function HomeScreen() {
  const [location, setLocation] = useState<string>('Fetching location...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    },
    {
      id: 2,
      name: 'Home Cleaning',
      description: 'Professional home cleaning services',
      image: 'https://via.placeholder.com/100',
    },
    {
      id: 3,
      name: 'Helper',
      description: 'Professional assistance for tasks',
      image: 'https://via.placeholder.com/100',
    },
    {
      id: 4,
      name: 'Cook',
      description: 'Professional cooking services',
      image: 'https://via.placeholder.com/100',
    },
  ];

  const specialOffers = [
    {
      id: 1,
      title: '50% Off Your First Booking',
      subtitle: 'Use code: NEW50',
      buttonText: 'Claim Now',
      bgColor: 'bg-purple-100',
      buttonColor: 'bg-blue-500',
    },
    {
      id: 2,
      title: 'Hot Deals',
      subtitle: 'Check offers',
      bgColor: 'bg-green-100',
    },
    {
      id: 3,
      title: '20% Off Cleaning',
      subtitle: 'Valid until April 20',
      buttonText: 'Claim',
      bgColor: 'bg-yellow-100',
      buttonColor: 'bg-amber-500',
    },
  ];

  const statusBarHeight = Constants.statusBarHeight;

  const renderOfferItem = ({ item }: { item: typeof specialOffers[0] }) => (
    <View
      className={`rounded-lg p-4 mr-4`}
      style={{
        width: OFFER_ITEM_WIDTH,
        height: OFFER_ITEM_HEIGHT,
        backgroundColor: item.bgColor,
      }}
    >
      <Text className="font-bold text-lg text-gray-800">{item.title}</Text>
      <Text className="text-gray-700 text-sm mt-2">{item.subtitle}</Text>

      {item.buttonText && (
        <TouchableOpacity
          className="rounded-md mt-3 py-2 px-4 self-start"
          style={{ backgroundColor: item.buttonColor }}
        >
          <Text className="text-white text-xs font-medium">{item.buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className={`flex-1 bg-gray-50 ${Platform.OS === 'ios' ? '' : `pt-[${statusBarHeight}px]`}`}>
          {/* Header */}
          <View className="px-4 py-4 flex-row justify-between items-center">
            <Menu size={28} color="#333" />
            <Text className="font-bold text-2xl text-gray-800">
              Help<Text className="text-orange-500">It</Text>
            </Text>
            <Bell size={28} color="#333" />
          </View>

          {/* Welcome Card */}
          <View className="mx-4 mt-4 bg-orange-100 rounded-lg p-5">
            <Text className="text-xl font-semibold text-gray-800">Hello, Aditya!</Text>
            <Text className="text-gray-700 mt-2">
              What service do you need today?
            </Text>

            <TouchableOpacity className="bg-white rounded-md px-4 py-3 mt-4 flex-row items-center justify-center">
              <Text className="text-center font-medium text-gray-800">
                Book a Service
              </Text>
            </TouchableOpacity>
          </View>

          {/* Location bar */}
          <View className="mx-4 mt-5 flex-row items-center">
            <Text className="text-gray-600 text-sm">Current Location: </Text>
            <Text className="text-gray-800 font-medium text-sm">
              {errorMsg || location}
            </Text>
            <MapPin size={16} color="#555" />
          </View>

          {/* Search bar */}
          <View className="mx-4 mt-3 bg-gray-100 rounded-lg flex-row items-center px-4 py-3">
            <Search size={20} color="#777" />
            <TextInput
              placeholder="Search for services"
              className="flex-1 ml-2 text-gray-800"
            />
          </View>

          <ScrollView
            className="flex-1 mt-5"
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Special Offers */}
            <View className="px-4">
              <View className="flex-row justify-between items-center">
                <Text className="font-semibold text-lg text-gray-800">Special Offers</Text>
                <Text className="text-blue-500 text-sm">View all</Text>
              </View>

              {/* Special Offers Carousel */}
              <View className="mt-4">
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
            <View className="mt-8 px-4">
              <Text className="font-semibold text-lg text-gray-800">Services</Text>

              <View className="flex-row flex-wrap justify-between mt-4">
                {services.map((service) => (
                  <View
                    key={service.id}
                    className="w-[48%] bg-white rounded-lg mb-5 overflow-hidden shadow-sm"
                  >
                    <Image
                      source={{ uri: service.image }}
                      className="w-full h-32"
                      resizeMode="cover"
                    />
                    <View className="p-3">
                      <Text className="font-medium text-gray-800">
                        {service.name}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">
                        {service.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Bookings */}
            <View className="mt-6 px-4 pb-20">
              <View className="flex-row justify-between items-center">
                <Text className="font-semibold text-lg text-gray-800">Recent Bookings</Text>
                <Text className="text-blue-500 text-sm">View history</Text>
              </View>

              <View className="mt-4 items-center py-10 border border-gray-200 rounded-lg">
                <Calendar size={40} color="#999" />
                <Text className="mt-3 text-gray-500">No recent bookings found</Text>

                <TouchableOpacity className="mt-5 bg-orange-100 rounded-md px-5 py-3">
                  <Text className="font-medium text-gray-800">
                    Book Your First Service
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Bottom Navigation */}
        <View className="absolute bottom-0 left-0 right-0">
          <CustomTabBar activeRoute="Home" />
        </View>
      </SafeAreaView>
    </>
  );
}