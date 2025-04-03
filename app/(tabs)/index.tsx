import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFBB84', // Changed to peach-orange
  },
  slide: {
    width,
    height,
    alignItems: 'center',
  },
  card: {
    width: width - 1, // Increased width to make the white box wider
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 80, // Adjust as needed to bring the card down from the very top
  },
  imageContainer: {
    backgroundColor: '#FFBB84',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 40,
    fontWeight: '500',
    color: '#fff',
    alignSelf: 'flex-start',
    paddingLeft: 30,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 460,
    resizeMode: 'contain',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  description: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  subdescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#FFBB84',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
  },
});

const slides = [
  {
    id: '1',
    title: 'Maids',
    description: 'Expert Home Maids at your day to day services',
    subdescription: 'Master web development, SEO, and social media marketing with our digital marketing courses. Gain skills that help you succeed in the online world!',
    image: require('../../assets/images/maid.png'),
  },
  {
    id: '2',
    title: 'Drivers',
    description: 'Reliable Cab Drivers at Your Fingertips',
    subdescription: 'Book trusted domestic helpers for cleaning, housekeeping, and daily chores with ease. Get professional and verified service providers for a stress-free home.',
    image: require('../../assets/images/driver.png'),
  },
  {
    id: '3',
    title: 'Home Cleaning',
    description: 'Professional Home Cleaning Service',
    subdescription: 'Book trusted domestic helpers for cleaning, housekeeping, and daily chores with ease. Get professional and verified service providers for a stress-free home.',
    image: require('../../assets/images/homeclean.png'),
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation<{ navigate: (screen: string) => void }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  };

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const handleNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Navigate to the next screen (e.g., Home) if it's the last slide
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFBB84" />
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* Card Container */}
            <View style={styles.card}>
              {/* Image Container */}
              <View style={styles.imageContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Image source={item.image} style={styles.image} />
              </View>

              {/* Content Container */}
              <View style={styles.contentContainer}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                  {slides.map((_, index) => (
                    <View
                      key={index}
                      style={[styles.dot, { backgroundColor: currentIndex === index ? '#3498db' : '#e0e0e0' }]}
                    />
                  ))}
                </View>

                {/* Description */}
                <Text style={styles.description}>{item.description}</Text>

                {/* Subdescription */}
                <Text style={styles.subdescription}>{item.subdescription}</Text>

                {/* Button */}
                <TouchableOpacity onPress={handleNextSlide} style={styles.button}>
                  <Text style={styles.buttonText}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default OnboardingScreen;