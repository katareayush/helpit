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
  ListRenderItem,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { ArrowLeft, Star, MoreVertical, Search } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';
import axios from 'axios';
import { API_BASE_URL } from '../../lib/api';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';


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

// Additional interface for raw API response
interface RawServiceProvider {
  _id: string;
  name?: string;
  profilePicture?: string;
  serviceIds?: Array<{
    _id: string;
    name: string;
    baseCharge: number;
    unitType: string;
  }>;
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
    serviceProviders: RawServiceProvider[];
    pagination: PaginationData;
  };
}

export default function ServiceProviderScreen(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get serviceId and serviceName from params
  const serviceId = params.serviceId as string;
  const initialServiceName = params.serviceName as string || 'Service';

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState<string>(formatServiceName(initialServiceName));

  // Format service name (remove underscores and capitalize)
  function formatServiceName(name: string): string {
    if (!name) return 'Service';

    // Replace underscores with spaces
    const withSpaces = name.replace(/_/g, ' ');

    // Capitalize each word
    return withSpaces.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Get location permissions when component mounts
  useEffect(() => {
    (async () => {
      try {
        const storedLocation = await AsyncStorage.getItem('@helpIt:location');

        if (storedLocation) {
          const parsedLocation = JSON.parse(storedLocation);
          setLocation({
            lat: parsedLocation.latitude,
            long: parsedLocation.longitude
          });
          setLocationPermission('granted');
          return;
        }
      } catch (error) {
        console.error("Error retrieving stored location:", error);
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status === 'granted') {
        try {
          const currentLocation = await Location.getCurrentPositionAsync({});
          const locationData = {
            lat: currentLocation.coords.latitude,
            long: currentLocation.coords.longitude
          };
          setLocation(locationData);

          // Save to AsyncStorage for future use
          await AsyncStorage.setItem('@helpIt:location', JSON.stringify({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude
          }));
        } catch (err) {
          console.error("Error getting location:", err);
          setLocation({
            lat: 19.0760,
            long: 72.8777
          });
        }
      } else {
        setLocation({
          lat: 19.0760,
          long: 72.8777
        });
      }
    })();
  }, []);

  // Fetch providers when location is available
  useEffect(() => {
    if (location) {
      fetchProviders(true);
    }
  }, [location, serviceId]);

  // Handle search query changes with debounce
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (location) {
        fetchProviders(true);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const fetchProviders = async (isNewSearch = false): Promise<void> => {
    if (isNewSearch) {
      setPage(1);
      setHasMore(true);
    }

    if (!hasMore && !isNewSearch) return;
    if (!location) return;

    try {
      setLoading(isNewSearch ? true : loading);
      setRefreshing(isNewSearch);

      // Prepare API parameters
      const params: {
        lat: number;
        long: number;
        limit: number;
        page: number;
        search?: string;
        serviceId?: string;
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

      // Add serviceId if provided
      if (serviceId) {
        params.serviceId = serviceId;
      }

      // Call the service-providers search endpoint
      const response = await axios.get(`${API_BASE_URL}/service-provider/search`, { params });

      if (response.data?.data) {
        const responseData = response.data.data;
        const { serviceProviders, pagination } = responseData || { serviceProviders: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } };

        if (serviceProviders && Array.isArray(serviceProviders)) {
          // Transform the data to match our expected interface
          const transformedProviders: ServiceProvider[] = serviceProviders.map(provider => {
            // Create a transformed provider that matches our interface
            const transformedProvider: ServiceProvider = {
              _id: provider._id,
              name: provider.name,
              profilePicture: provider.profilePicture,
              rating: provider.rating,
              reviews: provider.reviews
            };

            // Handle the serviceId property:
            // If provider has serviceIds array (from API), use the first service or match with requested serviceId
            if (Array.isArray(provider.serviceIds) && provider.serviceIds.length > 0) {
              // If we have a specific serviceId, try to find it in the provider's serviceIds
              if (serviceId) {
                const matchedService = provider.serviceIds.find((s: { _id: string; name: string; baseCharge: number; unitType: string }) => s._id === serviceId);
                if (matchedService) {
                  transformedProvider.serviceId = {
                    _id: matchedService._id,
                    name: matchedService.name,
                    baseCharge: matchedService.baseCharge,
                    unitType: matchedService.unitType
                  };

                  // Update service name from the first provider's matched service
                  if (isNewSearch && !serviceName && matchedService.name) {
                    setServiceName(formatServiceName(matchedService.name));
                  }
                } else {
                  // If no match, use the first service
                  transformedProvider.serviceId = {
                    _id: provider.serviceIds[0]._id,
                    name: provider.serviceIds[0].name,
                    baseCharge: provider.serviceIds[0].baseCharge,
                    unitType: provider.serviceIds[0].unitType
                  };
                }
              } else {
                // No specific serviceId requested, just use the first one
                transformedProvider.serviceId = {
                  _id: provider.serviceIds[0]._id,
                  name: provider.serviceIds[0].name,
                  baseCharge: provider.serviceIds[0].baseCharge,
                  unitType: provider.serviceIds[0].unitType
                };
              }
            }
            // If provider already has a serviceId property, use it directly
            else if (provider.serviceId) {
              transformedProvider.serviceId = provider.serviceId;

              // Update service name if not already set
              if (isNewSearch && !serviceName && provider.serviceId.name) {
                setServiceName(formatServiceName(provider.serviceId.name));
              }
            }

            return transformedProvider;
          });

          if (isNewSearch) {
            setProviders(transformedProviders);
            setFilteredProviders(transformedProviders);
          } else {
            // Append new results for pagination
            setProviders(prev => [...prev, ...transformedProviders]);
            setFilteredProviders(prev => [...prev, ...transformedProviders]);
          }

          // Update pagination state
          setHasMore(pagination ? page < pagination.pages : false);
          setPage(prev => isNewSearch ? 2 : prev + 1);
        } else {
          if (isNewSearch) {
            setProviders([]);
            setFilteredProviders([]);
          }
          setHasMore(false);
        }
      } else {
        if (isNewSearch) {
          setProviders([]);
          setFilteredProviders([]);
        }
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching service providers:', err);
      setError('Failed to load service providers. Please try again later.');
      if (isNewSearch) {
        setProviders([]);
        setFilteredProviders([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSelectProvider = (provider: ServiceProvider): void => {
    // Make sure we have a valid serviceId before navigating
    if (!provider.serviceId || !provider.serviceId._id) {
      console.error('No service ID available for this provider');
      return;
    }

    router.push({
      pathname: 'BookingScreen',
      params: {
        serviceProviderId: provider._id,
        serviceId: provider.serviceId._id
      }
    });
  };

  const handleRefresh = (): void => {
    fetchProviders(true);
  };

  const handleLoadMore = (): void => {
    if (!loading && hasMore) {
      fetchProviders();
    }
  };

  const renderProviderItem: ListRenderItem<ServiceProvider> = ({ item }) => {
    // Get the price from the service baseCharge
    const price = item.serviceId?.baseCharge || 149;
    const unitType = item.serviceId?.unitType || 'HOUR';

    // Create display name if not available
    const displayName = item.name || `Professional ${serviceName} Provider`;

    // Calculate rating
    const rating = item.rating || 4.8;
    const reviews = item.reviews || 87;

    return (
      <TouchableOpacity
        className="bg-white rounded-lg mb-4 p-3 flex-row items-center"
        onPress={() => handleSelectProvider(item)}
      >
        <Image
          source={{
            uri: item.profilePicture || 'https://via.placeholder.com/100?text=Provider'
          }}
          className="w-20 h-20 rounded-lg"
        />
        <View className="flex-1 ml-4">
          <View className="flex-row items-center mb-1">
            <Star size={16} color="#FFB900" fill="#FFB900" />
            <Text className="text-sm text-gray-500 ml-1">{rating} ({reviews})</Text>
          </View>
          <Text className="text-base font-bold text-gray-900 mb-1">{displayName}</Text>
          <Text className="text-xs text-gray-500">Starts From</Text>
          <View className="bg-amber-100 rounded px-2 py-1 self-start mt-1">
            <Text className="text-sm font-medium">
              ₹{price}/- per {unitType.toLowerCase() === 'hour' ? 'hour' : 'km'}
            </Text>
          </View>
        </View>
        <TouchableOpacity className="p-1">
          <MoreVertical size={20} color="#888" />
        </TouchableOpacity>
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
            ? `No ${serviceName.toLowerCase()} providers match your search criteria.`
            : `No ${serviceName.toLowerCase()} providers available in your area at the moment.`}
        </Text>
      </View>
    );
  };

  // Get the appropriate search placeholder text
  const getSearchPlaceholder = (): string => {
    return `Search for ${serviceName.toLowerCase()} providers`;
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 bg-white" style={{
          paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0
        }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-center flex-1">
            {`Select ${serviceName} Provider`}
          </Text>
          <View className="w-6" />
        </View>

        <View className="flex-1 bg-gray-50">
          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-lg mx-4 mt-4 px-4 py-3 border border-gray-200">
            <Search size={20} color="#888" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Location Permission Warning */}
          {locationPermission !== 'granted' && (
            <View className="mx-4 mt-4 p-3 bg-yellow-100 rounded-lg">
              <Text className="text-sm text-yellow-800">
                Location access denied. Showing providers for Mumbai area. Grant location permission for more accurate results.
              </Text>
            </View>
          )}

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
              data={filteredProviders}
              renderItem={renderProviderItem}
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