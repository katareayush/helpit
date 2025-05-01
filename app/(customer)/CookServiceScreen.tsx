import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TextInput,
  ListRenderItem
} from 'react-native';
import { ArrowLeft, Clock, Star, Search } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';
import axios from 'axios';
import { API_BASE_URL } from '../../lib/api';
import * as Location from 'expo-location';

// Type definitions
interface ServiceProvider {
  _id: string;
  name?: string;
  profilePicture?: string;
  serviceId?: {
    _id: string;
    name: string;
    baseCharge: number;
    unitType: string;
  };
  rating?: number;
  reviews?: number;
}

interface LocationCoords {
  lat: number;
  long: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiResponse {
  data?: {
    serviceProviders: ServiceProvider[];
    pagination: PaginationData;
  };
}

export default function CookServiceScreen(): JSX.Element {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [cooks, setCooks] = useState<ServiceProvider[]>([]);
  const [filteredCooks, setFilteredCooks] = useState<ServiceProvider[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);

  // Get location permissions when component mounts
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        try {
          // Get the user's current position
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            lat: currentLocation.coords.latitude,
            long: currentLocation.coords.longitude
          });
        } catch (err) {
          console.error("Error getting location:", err);
          // Use default location (Mumbai) if we can't get user's location
          setLocation({
            lat: 19.0760,
            long: 72.8777
          });
        }
      } else {
        // Use default location if permission not granted
        setLocation({
          lat: 19.0760,
          long: 72.8777
        });
      }
    })();
  }, []);

  // Fetch cooks when location is available
  useEffect(() => {
    if (location) {
      fetchCooks(true);
    }
  }, [location]);

  // Handle search query changes with debounce
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (location) {
        fetchCooks(true);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const fetchCooks = async (isNewSearch = false): Promise<void> => {
    if (isNewSearch) {
      setPage(1);
      setHasMore(true);
    }
    
    if (!hasMore && !isNewSearch) return;
    if (!location) return;

    try {
      setLoading(isNewSearch ? true : loading);
      setRefreshing(isNewSearch);
      
      // Prepare API parameters - similar to HelperServiceScreen
      const params: {
        lat: number;
        long: number;
        limit: number;
        page: number;
        search?: string;
      } = {
        lat: location.lat,
        long: location.long,
        limit: 10,
        page: isNewSearch ? 1 : page
      };
      
      // Add search query if provided
      if (searchQuery.trim() !== '') {
        params.search = searchQuery.trim();
      }
      
      // Call the service-providers search endpoint
      const response = await axios.get(`${API_BASE_URL}/service-provider/search`, { params });
      
      if (response.data?.data) {
        const responseData = response.data.data;
        const { serviceProviders, pagination } = responseData || { serviceProviders: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } };
        
        if (serviceProviders && Array.isArray(serviceProviders)) {
          if (isNewSearch) {
            setCooks(serviceProviders);
            setFilteredCooks(serviceProviders);
          } else {
            // Append new results for pagination
            setCooks(prev => [...prev, ...serviceProviders]);
            setFilteredCooks(prev => [...prev, ...serviceProviders]);
          }
          
          // Update pagination state
          setHasMore(pagination ? page < pagination.pages : false);
          setPage(prev => isNewSearch ? 2 : prev + 1);
        } else {
          if (isNewSearch) {
            setCooks([]);
            setFilteredCooks([]);
          }
          setHasMore(false);
        }
      } else {
        if (isNewSearch) {
          setCooks([]);
          setFilteredCooks([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching cooks:', err);
      setError('Failed to load cooks. Please try again later.');
      if (isNewSearch) {
        setCooks([]);
        setFilteredCooks([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSelectCook = (cook: ServiceProvider): void => {
    router.push({
      pathname: 'CookServiceBooking',
      params: { cookId: cook._id }
    });
  };

  const handleRefresh = (): void => {
    fetchCooks(true);
  };

  const handleLoadMore = (): void => {
    if (!loading && hasMore) {
      fetchCooks();
    }
  };

  const renderCookItem: ListRenderItem<ServiceProvider> = ({ item }) => {
    // Calculate price per hour from the service baseCharge
    const pricePerHour = item.serviceId?.baseCharge || 149;
    
    // Create display name if not available
    const displayName = item.name || 'Professional Cook';
    
    // Rating value
    const rating = item.rating || 4.5;
    
    return (
      <TouchableOpacity
        className="bg-white rounded-xl mb-4 p-4 flex-row shadow-sm"
        onPress={() => handleSelectCook(item)}
      >
        <Image 
          source={{ 
            uri: item.profilePicture || 'https://via.placeholder.com/100?text=Cook' 
          }} 
          className="w-20 h-20 rounded-full" 
        />
        <View className="flex-1 ml-4">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-lg font-bold text-gray-900">{displayName}</Text>
              <View className="flex-row items-center">
                <Clock size={14} color="#666" />
                <Text className="text-sm text-gray-600 ml-1">2+ years experience</Text>
              </View>
            </View>
            <View className="flex-row items-center bg-amber-50 rounded-full px-2 py-1">
              <Star size={16} color="#FFB900" fill="#FFB900" />
              <Text className="text-sm font-bold text-amber-600 ml-1">{rating}</Text>
            </View>
          </View>
          
          <View className="mt-2">
            <Text className="text-sm text-gray-500 mb-1">Specializations:</Text>
            <View className="flex-row flex-wrap">
              <View className="bg-blue-50 px-3 py-1 rounded-full mr-2 mb-1">
                <Text className="text-xs text-blue-600 font-medium">North Indian</Text>
              </View>
              <View className="bg-blue-50 px-3 py-1 rounded-full mr-2 mb-1">
                <Text className="text-xs text-blue-600 font-medium">South Indian</Text>
              </View>
            </View>
          </View>
          
          <View className="mt-3 flex-row items-center bg-amber-50 rounded-md px-3 py-1 self-start">
            <Text className="text-xs text-gray-600 mr-1">Starting from</Text>
            <Text className="text-base font-bold text-amber-600">₹{pricePerHour}/hour</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = (): JSX.Element | null => {
    if (!loading || refreshing) return null;
    return (
      <View className="py-4 flex items-center justify-center">
        <ActivityIndicator size="small" color="#FF9800" />
      </View>
    );
  };

  const renderEmptyComponent = (): JSX.Element | null => {
    if (loading && !refreshing) return null;
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-base text-gray-600 text-center">
          {searchQuery 
            ? 'No cooks match your search criteria.' 
            : 'No cooks available in your area at the moment.'}
        </Text>
      </View>
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-center flex-1 text-gray-900">Hire a Cook</Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 bg-gray-50">
          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-lg mx-4 mt-4 px-4 py-3 border border-gray-200">
            <Search size={20} color="#888" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search for cooks"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          {/* Location Permission Warning */}
          {locationPermission !== 'granted' && (
            <View className="mx-4 mt-4 p-3 bg-yellow-100 rounded-lg">
              <Text className="text-sm text-yellow-800">
                Location access denied. Showing cooks for Mumbai area. Grant location permission for more accurate results.
              </Text>
            </View>
          )}
          
          {/* Service Type Header - keeping this from the original design */}
          <View className="bg-white py-4 px-5 flex-row items-center mt-4">
            <View className="w-1 h-5 bg-amber-500 mr-2 rounded" />
            <Text className="text-lg font-bold text-gray-900">Professional Cooks Near You</Text>
          </View>
          
          {/* Main Content */}
          {error ? (
            <View className="flex-1 justify-center items-center p-5">
              <Text className="text-base text-red-500 text-center mb-5">{error}</Text>
              <TouchableOpacity 
                className="bg-amber-500 px-5 py-2 rounded-lg" 
                onPress={handleRefresh}
              >
                <Text className="text-white font-bold">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredCooks}
              renderItem={renderCookItem}
              keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
              contentContainerStyle={{ padding: 16, flexGrow: 1 }}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmptyComponent}
            />
          )}
        </View>
        <CustomTabBar activeRoute="Home" />
      </SafeAreaView>
    </>
  );
}