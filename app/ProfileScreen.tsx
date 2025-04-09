import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.header}>Profile</Text>
          <Text style={styles.edit}>Edit</Text>
        </View>

        {/* User Info */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={styles.username}>Demo User</Text>
          <Text style={styles.rating}>⭐ 4.5 Rating</Text>
        </View>

        {/* Total Earnings */}
        <View style={styles.earningsBox}>
          <Text style={styles.earningsTitle}>Total Earnings</Text>
          <Text style={styles.earningsAmount}>₹0.00</Text>
        </View>

        {/* Performance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance</Text>
          <Text>Completed Jobs: 0</Text>
          <Text>✅ On-time rate: 98%</Text>
          <Text>✔️ Acceptance rate: 95%</Text>
        </View>

        {/* Contact Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <View style={styles.inputRow}>
            <Ionicons name="call-outline" size={20} color="gray" />
            <Text style={styles.inputText}>9876543210</Text>
          </View>
          <View style={styles.inputRow}>
            <MaterialIcons name="email" size={20} color="gray" />
            <TextInput
              placeholder="Enter email address"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>
          <View style={styles.settingRow}>
            <Text>Availability Status</Text>
            <Switch
              value={isAvailable}
              onValueChange={() => setIsAvailable(!isAvailable)}
              trackColor={{ false: "#767577", true: "#f78b3f" }}
              thumbColor={isAvailable ? "#fff" : "#f4f3f4"}
            />
          </View>
          <View style={styles.settingRow}>
            <Text>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
              trackColor={{ false: "#767577", true: "#f78b3f" }}
              thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}

            />
          </View>
        </View>

        {/* Other Options */}
        <TouchableOpacity style={styles.linkRow}>
          <Text>Booking History</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow}>
          <Text>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home-outline" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person" size={24} color="#f78b3f" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: '500',
  },
  edit: {
    fontSize: 16,
    color: '#black',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    backgroundColor: '#f78b3f',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: '500',
    marginTop: 10,
  },
  rating: {
    color: 'gray',
    marginTop: 2,
  },
  earningsBox: {
    backgroundColor: '#6a11cb',
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
  },
  earningsTitle: {
    color: 'white',
    fontSize: 14,
  },
  earningsAmount: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
    
  },
  cardTitle: {
    fontWeight: '500',
    marginBottom: 10,
    fontSize: 15,
    
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  inputText: {
    marginLeft: 8,
    color: '#444',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  logoutBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: 'red',
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    height: 60,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
  },
});
