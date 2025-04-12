import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
} from 'react-native';
import { ArrowLeft, MoreVertical, Star } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import CustomTabBar from '../components/CustomTabBar';

export default function CleaningServiceListScreen() {
  const router = useRouter();

  // Sample data for cleaning service providers
  const cleaners = [
    {
      id: 1,
      name: 'Nita Singh',
      image: 'https://via.placeholder.com/100',
      rating: 4.8,
      reviews: 87,
      pricePerHour: 149,
    },
    {
      id: 2,
      name: 'Maria',
      image: 'https://via.placeholder.com/100',
      rating: 4.5,
      reviews: 87,
      pricePerHour: 149,
    },
    {
      id: 3,
      name: 'Sophie Singh',
      image: 'https://via.placeholder.com/100',
      rating: 4.5,
      reviews: 87,
      pricePerHour: 149,
    },
    {
      id: 4,
      name: 'Anjali Sharma',
      image: 'https://via.placeholder.com/100',
      rating: 4.5,
      reviews: 87,
      pricePerHour: 149,
    },
  ];

  const handleSelectCleaner = (cleaner) => {
    router.push('CleaningServiceBooking');
  };

  const renderCleanerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.cleanerCard}
      onPress={() => handleSelectCleaner(item)}
    >
      <Image source={{ uri: item.image }} style={styles.cleanerImage} />
      <View style={styles.cleanerInfo}>
        <View style={styles.ratingContainer}>
          <Star size={16} color="#FFB900" fill="#FFB900" />
          <Text style={styles.rating}>{item.rating} ({item.reviews})</Text>
        </View>
        <Text style={styles.cleanerName}>{item.name}</Text>
        <Text style={styles.priceLabel}>Starts From</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{item.pricePerHour}/- per hour</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <MoreVertical size={20} color="#888" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Home Cleaning Agent</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Service Type Header */}
          <View style={styles.serviceTypeHeader}>
            <View style={styles.serviceTitleIndicator} />
            <Text style={styles.serviceTypeTitle}>Home Cleaning</Text>
          </View>

          {/* Cleaners List */}
          <FlatList
            data={cleaners}
            renderItem={renderCleanerItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </View>
        <CustomTabBar activeRoute="Home" />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  serviceTypeHeader: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceTitleIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#FFA000',
    marginRight: 10,
    borderRadius: 2,
  },
  serviceTypeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  listContainer: {
    padding: 15,
  },
  cleanerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cleanerImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cleanerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  rating: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  cleanerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  priceLabel: {
    fontSize: 14,
    color: '#888',
  },
  priceContainer: {
    backgroundColor: '#FFE0B2',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  price: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  moreButton: {
    padding: 5,
  },
});