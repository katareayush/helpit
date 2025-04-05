import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

const LoginAsScreen = () => {
  const router = useRouter();

  const handleCustomerSelection = () => {
    router.push('/Welcome_screen');
  };

  const handleProviderSelection = () => {
    router.push('/provider-login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.headerText}>Login As A</Text>
        <Text style={styles.subHeaderText}>Choose what your position is</Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleCustomerSelection}
          >
            <View style={styles.circleBackground}>
              <Image 
                source={require('../assets/images/man.png')} 
                style={styles.optionImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.optionText}>CUSTOMER</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleProviderSelection}
          >
            <View style={styles.circleBackground}>
              <Image 
                source={require('../assets/images/girl.png')} 
                style={styles.optionImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.optionText}>Service Provider</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subHeaderText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 60,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 500,
  },
  optionButton: {
    alignItems: 'center',
    width: 150,
  },
  circleBackground: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFE8D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  optionImage: {
    width: '80%',
    height: '80%',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginAsScreen;