import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Vibration,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBooking } from '../components/BookingContext';

interface BookingPopupProps {
  onAccept: (bookingId: string) => Promise<void>;
  onDecline: (bookingId: string) => Promise<void>;
}

const { width } = Dimensions.get('window');

const BookingPopup: React.FC<BookingPopupProps> = ({ onAccept, onDecline }) => {
  const { incomingBooking, clearIncomingBooking } = useBooking();
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (incomingBooking) {
      // Reset animation values
      slideAnim.setValue(-300);
      opacityAnim.setValue(0);
      
      // Vibrate device to alert user
      Vibration.vibrate([300, 100, 300, 100, 300]);
      
      // Play entrance animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [incomingBooking, slideAnim, opacityAnim]);

  const handleAccept = async () => {
    if (incomingBooking) {
      try {
        await onAccept(incomingBooking._id);
        dismiss();
      } catch (error) {
        console.error('Error accepting booking from popup:', error);
      }
    }
  };

  const handleDecline = async () => {
    if (incomingBooking) {
      try {
        await onDecline(incomingBooking._id);
        dismiss();
      } catch (error) {
        console.error('Error declining booking from popup:', error);
      }
    }
  };

  const dismiss = () => {
    // Play exit animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      clearIncomingBooking();
    });
  };

  if (!incomingBooking) return null;

  // Format price to display with appropriate currency
  const formattedPrice = `₹${incomingBooking.estimatedFare.toFixed(2)}`;

  return (
    <Modal
      visible={!!incomingBooking}
      transparent
      animationType="none"
      onRequestClose={dismiss}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.popup,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Header with service type */}
          <View style={styles.header}>
            <View style={styles.serviceIconContainer}>
              <Ionicons name="car" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.serviceTitle}>New Booking Request</Text>
            <TouchableOpacity style={styles.closeButton} onPress={dismiss}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Booking details */}
          <View style={styles.content}>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                {incomingBooking.userId?.name || 'Customer'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="briefcase-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                {incomingBooking.serviceId?.name || 'Service'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                {incomingBooking.details || 'No details provided'}
              </Text>
            </View>

            <View style={styles.fareContainer}>
              <Text style={styles.fareLabel}>Estimated Fare</Text>
              <Text style={styles.fareAmount}>{formattedPrice}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  popup: {
    backgroundColor: '#FFFFFF',
    width: width - 32,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    backgroundColor: '#FFBB84',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  fareContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFBB84',
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  declineButton: {
    flex: 1,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFBB84',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BookingPopup;