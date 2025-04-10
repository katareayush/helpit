import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Search,
  MapPin,
  Bell,
  Calendar,
  Menu,
} from 'lucide-react-native'; // Use lucide-react-native in React Native
import CustomTabBar from '@/components/CustomTabBar';

export default function HomeScreen() {
  const services = [
    {
      id: 1,
      name: 'Driver Service',
      description: 'Professional drivers for your needs',
      image: 'https://via.placeholder.com/80', // Changed to full URL for compatibility
    },
    {
      id: 2,
      name: 'Home Cleaning',
      description: 'Professional home cleaning services',
      image: 'https://via.placeholder.com/80',
    },
    {
      id: 3,
      name: 'Helper',
      description: 'Professional assistance for tasks',
      image: 'https://via.placeholder.com/80',
    },
    {
      id: 4,
      name: 'Cook',
      description: 'Professional cooking services',
      image: 'https://via.placeholder.com/80',
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-3 px-4 flex-row justify-between items-center">
        <Menu size={24} color="#333" />
        <Text className="font-bold text-lg">Help24</Text>
        <Bell size={24} color="#333" />
      </View>

      {/* Welcome Card */}
      <View className="mx-4 mt-4 bg-orange-100 rounded-lg p-4">
        <Text className="text-xl font-semibold">Hello, Aditya!</Text>
        <Text className="text-gray-700 mt-1">
          What service do you need today?
        </Text>

        <TouchableOpacity className="bg-white rounded-md px-4 py-2 mt-3 flex-row items-center justify-center">
          <Text className="text-center font-medium text-gray-800">
            Book a Service
          </Text>
        </TouchableOpacity>
      </View>

      {/* Location bar */}
      <View className="mx-4 mt-4 flex-row items-center">
        <Text className="text-gray-600 text-sm">Current Location: </Text>
        <Text className="text-gray-800 font-medium text-sm">
          HSR Sec 4, Anala Agra
        </Text>
        <MapPin size={14} className="ml-1" color="#555" />
      </View>

      {/* Search bar */}
      <View className="mx-4 mt-2 bg-gray-100 rounded-lg flex-row items-center px-3 py-2">
        <Search size={18} color="#777" />
        <TextInput
          placeholder="Search for services"
          className="flex-1 ml-2 text-gray-800"
        />
      </View>

      <ScrollView
        className="flex-1 mt-4"
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* Special Offers */}
        <View className="px-4">
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-lg">Special Offers</Text>
            <Text className="text-blue-500 text-sm">View all</Text>
          </View>

          <View className="flex-row mt-3 space-x-3">
            <View className="bg-purple-100 rounded-lg p-3 flex-1">
              <Text className="font-bold text-lg">
                50% Off Your First Booking
              </Text>
              <Text className="text-gray-700 text-sm mt-1">
                Use code: NEW50
              </Text>

              <TouchableOpacity className="bg-blue-500 rounded-md mt-2 py-1 px-3 self-start">
                <Text className="text-white text-xs font-medium">
                  Claim Now
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-green-100 rounded-lg p-3 flex-1">
              <Text className="font-bold text-lg">Hot Deals</Text>
              <Text className="text-gray-700 text-sm mt-1">Check offers</Text>
            </View>
          </View>
        </View>

        {/* Services */}
        <View className="mt-6 px-4">
          <Text className="font-semibold text-lg">Services</Text>

          <View className="flex-row flex-wrap justify-between mt-3">
            {services.map((service) => (
              <View
                key={service.id}
                className="w-[48%] bg-white rounded-lg mb-4 overflow-hidden shadow-sm"
              >
                <Image
                  source={{ uri: service.image }}
                  className="w-full h-24"
                />
                <View className="p-2">
                  <Text className="font-medium text-gray-800">
                    {service.name}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {service.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Bookings */}
        <View className="mt-4 px-4 pb-20">
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-lg">Recent Bookings</Text>
            <Text className="text-blue-500 text-sm">View history</Text>
          </View>

          <View className="mt-3 items-center py-8 border border-gray-200 rounded-lg">
            <Calendar size={32} color="#999" />
            <Text className="mt-2 text-gray-500">No recent bookings found</Text>

            <TouchableOpacity className="mt-4 bg-orange-100 rounded-md px-4 py-2">
              <Text className="font-medium text-gray-800">
                Book Your First Service
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <CustomTabBar />
    </View>
  );
}
