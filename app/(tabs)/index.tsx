import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Image, Dimensions, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Define the type for navigation
type NavigationProps = NavigationProp<ParamListBase>;

const OnboardingScreen = () => {
  // Properly type the navigation object
  const navigation = useNavigation<NavigationProps>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const slides = [
    {
      id: '1',
      title: 'Maids',
      description: 'Expert Home Maids at your day to day services',
      subdescription: 'Book trusted domestic helpers for cleaning, housekeeping, and daily chores with ease. Get professional and verified service providers for a stress-free home.',
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

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const handleNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate('login-selection');
    }
  };

  const getButtonText = () => {
    return currentIndex === slides.length - 1 ? "Go" : "→";
  };

  // Calculate progress based on current slide
  const progress = (currentIndex + 1) / slides.length;

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
            {/* Top section with title and image */}
            <View style={styles.topSection}>
              <Text style={styles.title}>{item.title}</Text>
              <Image source={item.image} style={styles.image} />
            </View>
            
            {/* White card section */}
            <View style={styles.card}>
              <View style={styles.contentContainer}>
                {/* Pagination dots */}
                <View style={styles.pagination}>
                  {slides.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot, 
                        { backgroundColor: currentIndex === index ? '#3498db' : '#e0e0e0' }
                      ]}
                    />
                  ))}
                </View>

                {/* Description texts */}
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.subdescription}>{item.subdescription}</Text>

                {/* Button with circular progress */}
                <View style={styles.buttonContainer}>
                  <View style={styles.buttonOuterCircle}>
                    <CircularProgress progress={progress} />
                    <TouchableOpacity 
                      onPress={handleNextSlide} 
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>{getButtonText()}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

// SVG Circular progress component with adjusted start position to 12 o'clock
const CircularProgress = ({ progress }: { progress: number }) => {
  const size = 70;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressArc = circumference - (progress * circumference);
  
  return (
    <View style={styles.progressArc}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#FFBB84"
          fill="transparent"
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progressArc}
          strokeLinecap="round"
          transform={`rotate(-90, ${size/2}, ${size/2})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFBB84', // Peach-orange background as in image
  },
  slide: {
    width,
    height,
    alignItems: 'center',
  },
  topSection: {
    height: height * 0.6, // 60% of screen height for orange section
    width: width,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    color: '#fff',
    marginTop: 30,
    alignSelf: 'flex-start',
    paddingLeft: 24,
  },
  image: {
    width: width * 0.8,
    height: height * 0.55,
    resizeMode: 'contain',
    marginTop: 20,
  },
  card: {
    width: width,
    height: height * 0.4, // Takes 40% of screen height
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    paddingTop: 20,
  },
  contentContainer: {
    width: '90%',
    alignItems: 'center',
    paddingTop: 10,
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
    marginHorizontal: 5,
  },
  description: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  subdescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  buttonOuterCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressArc: {
    position: 'absolute',
    width: 70,
    height: 70,
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
    fontSize: 20,
    fontWeight: '600',
  }
});

export default OnboardingScreen;