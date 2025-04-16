import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { ArrowLeft, Search, Star, Clock, Calendar } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function HelperServiceScreen() {
  const router = useRouter();
  const [serviceType, setServiceType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for helper services
  const serviceCategories = [
    'All',
    'Elderly Care',
    'Child Care',
    'Cleaning',
    'Moving',
    'Errands',
  ];

  // Sample data for helpers
  const helpers = [
    {
      id: 1,
      name: 'Rahul Singh',
      image: 'https://via.placeholder.com/100',
      rating: 4.8,
      reviews: 92,
      experience: '3 years',
      pricePerHour: 149,
      availability: 'Available today',
    },
    {
      id: 2,
      name: 'Priya Sharma',
      image: 'https://via.placeholder.com/100',
      rating: 4.7,
      reviews: 78,
      experience: '5 years',
      pricePerHour: 179,
      availability: 'Available tomorrow',
    },
    {
      id: 3,
      name: 'Ajay Kumar',
      image: 'https://via.placeholder.com/100',
      rating: 4.5,
      reviews: 56,
      experience: '2 years',
      pricePerHour: 129,
      availability: 'Available today',
    },
    {
      id: 4,
      name: 'Meera Patel',
      image: 'https://via.placeholder.com/100',
      rating: 4.9,
      reviews: 124,
      experience: '7 years',
      pricePerHour: 199,
      availability: 'Available in 2 days',
    },
  ];

  const handleSelectHelper = (helper) => {
    alert(`You selected ${helper.name}`);
    router.push('Home');
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        serviceType === item && styles.activeCategoryButton,
      ]}
      onPress={() => setServiceType(item)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          serviceType === item && styles.activeCategoryButtonText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderHelperItem = ({ item }) => (
    <TouchableOpacity
      style={styles.helperCard}
      onPress={() => handleSelectHelper(item)}
    >
      <Image source={{ uri: item.image }} style={styles.helperImage} />
      <View style={styles.helperInfo}>
        <Text style={styles.helperName}>{item.name}</Text>
        
        <View style={styles.ratingContainer}>
          <Star size={14} color="#FFB900" fill="#FFB900" />
          <Text style={styles.rating}>{item.rating} ({item.reviews} reviews)</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={14} color="#666" />
          <Text style={styles.detailText}>{item.experience} experience</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Calendar size={14} color="#666" />
          <Text style={styles.detailText}>{item.availability}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{item.pricePerHour}/hour</Text>
        </View>
      </View>
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
          <Text style={styles.headerTitle}>Helper Services</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for helpers"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <FlatList
              horizontal
              data={serviceCategories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {/* Helper List */}
          <FlatList
            data={helpers}
            renderItem={renderHelperItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.helpersList}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 10,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
  },
  activeCategoryButton: {
    backgroundColor: '#FF9800',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#555',
  },
  activeCategoryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  helpersList: {
    padding: 15,
    paddingTop: 5,
  },
  helperCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  helperImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  helperInfo: {
    flex: 1,
    marginLeft: 15,
  },
  helperName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  priceContainer: {
    marginTop: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  price: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
});