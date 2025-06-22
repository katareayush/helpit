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
  Platform,
  ScrollView
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

  // Helper function to format booking details for popup
  const formatBookingDetailsForPopup = (booking: any): string => {
    const details = booking.details;
    const parts = [];
    
    // Handle hour-based booking details
    if (booking.serviceDate) {
      const serviceDate = new Date(booking.serviceDate).toLocaleDateString('en-US');
      parts.push(`Service Date: ${serviceDate}`);
    }
    
    if (booking.bookingHours) {
      if (booking.bookingHours.startTime) {
        const startTime = new Date(booking.bookingHours.startTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
        parts.push(`Start Time: ${startTime}`);
      }
      if (booking.bookingHours.totalNoofHours) {
        parts.push(`Duration: ${booking.bookingHours.totalNoofHours} hour(s)`);
      }
    }
    
    // Handle regular details (string or object)
    if (details) {
      if (typeof details === 'string') {
        parts.push(details);
      } else if (typeof details === 'object') {
        // Check for common properties
        if (details.location) parts.push(`Location: ${details.location}`);
        if (details.pickupAddress) parts.push(`Pickup: ${details.pickupAddress}`);
        if (details.destination) parts.push(`Destination: ${details.destination}`);
        if (details.passengers) parts.push(`Passengers: ${details.passengers}`);
        if (details.vehicleType) parts.push(`Vehicle: ${details.vehicleType}`);
        
        // If no specific properties found, try to stringify safely
        if (parts.length === 0) {
          try {
            const objectDetails = Object.entries(details)
              .map(([key, value]) => `${key}: ${value}`)
              .join(' | ');
            if (objectDetails) parts.push(objectDetails);
          } catch (e) {
            console.error('Error formatting booking details for popup:', e);
          }
        }
      }
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'No details provided';
  };

  // Determine service icon based on service name or type
  const getServiceIcon = () => {
    const serviceName = incomingBooking?.serviceId?.name?.toLowerCase() || '';
    if (serviceName.includes('driver') || serviceName.includes('ride') || serviceName.includes('taxi')) {
      return 'car';
    } else if (serviceName.includes('clean') || serviceName.includes('house')) {
      return 'home';
    } else if (serviceName.includes('repair') || serviceName.includes('fix')) {
      return 'construct';
    } else if (serviceName.includes('delivery') || serviceName.includes('food')) {
      return 'bicycle';
    }
    return 'briefcase';
  };

  if (!incomingBooking) return null;

  // Format price to display with appropriate currency
  const formattedPrice = `₹${incomingBooking.estimatedFare.toFixed(2)}`;
  const formattedDetails = formatBookingDetailsForPopup(incomingBooking);

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
              <Ionicons name={getServiceIcon()} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.serviceTitle}>New Booking Request</Text>
            <TouchableOpacity style={styles.closeButton} onPress={dismiss}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Booking details */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.detailText} numberOfLines={0}>
                {formattedDetails}
              </Text>
            </View>

            {/* Show booking ID for reference */}
            <View style={styles.detailRow}>
              <Ionicons name="finger-print-outline" size={18} color="#666" />
              <Text style={styles.detailText}>
                Booking #{incomingBooking._id.slice(-6)}
              </Text>
            </View>

            <View style={styles.fareContainer}>
              <Text style={styles.fareLabel}>Estimated Fare</Text>
              <Text style={styles.fareAmount}>{formattedPrice}</Text>
            </View>
          </ScrollView>

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
    maxHeight: '80%', // Prevent popup from taking full screen
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
    maxHeight: 300, // Limit height and allow scrolling
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed to flex-start to handle multiline text
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20, // Better line height for multiline text
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