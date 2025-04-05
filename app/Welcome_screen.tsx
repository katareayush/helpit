import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

const Welcome_screen = () => {
  const router = useRouter();

  const handleCreateAccount = () => {
    router.push('/SignupScreenC');
  };

  const handleLogin = () => {
    router.push('/signInC');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Main content container with curved bottom */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('../assets/images/CR(CUST)MAID.png')} // Update path to single ../
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      
      {/* Text content */}
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>
          <Text style={styles.titleDark}>Best </Text>
          <Text style={styles.titleLight}>Helping Hands</Text>
        </Text>
        <Text style={styles.titleDark}>for You!</Text>
        
        <Text style={styles.subtitleText}>
          We make sure excellent services through our expert worker.
        </Text>
      </View>
      
      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.createAccountButton} 
          activeOpacity={0.8}
          onPress={handleCreateAccount}
        >
          <Text style={styles.createAccountButtonText}>Create an account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginButton} 
          activeOpacity={0.8}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    height: '55%',
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  titleDark: {
    color: '#333333',
    fontSize: 28,
    fontWeight: 'bold',
  },
  titleLight: {
    color: '#FDA172', // Orange color from the design
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitleText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    flex: 1,
    justifyContent: 'flex-start',
  },
  createAccountButton: {
    backgroundColor: '#FDA172', // Orange button
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  createAccountButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#FDA172',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FDA172',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Welcome_screen;