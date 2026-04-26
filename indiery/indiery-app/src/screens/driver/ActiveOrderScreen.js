import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getActiveOrder, updateStatus, verifyDeliveryOtp, verifyPickupOtp } from '../../api/driver.api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';

const ActiveOrderScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpType, setOtpType] = useState('');

  const fetchActiveOrder = async () => {
    try {
      setLoading(true);
      const data = await getActiveOrder();
      setOrder(data);
    } catch (error) {
      console.log('Fetch active order error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrder();
  }, []);

  useEffect(() => {
    if (!socket || !order) return;

    socket.on('orderStatusChanged', (updatedOrder) => {
      setOrder(updatedOrder);
    });

    return () => {
      socket.off('orderStatusChanged');
    };
  }, [socket, order]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      await updateStatus(order._id, { status: newStatus });
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      fetchActiveOrder();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (otpType === 'pickup') {
        await verifyPickupOtp(order._id, otp);
        Alert.alert('Success', 'Pickup verified!');
      } else {
        await verifyDeliveryOtp(order._id, otp);
        Alert.alert('Success', 'Delivery verified!');
      }
      setOtpModalVisible(false);
      setOtp('');
      fetchActiveOrder();
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP');
    }
  };

  const showOtpModal = (type) => {
    setOtpType(type);
    setOtpModalVisible(true);
  };

  const getStatusStep = (status) => {
    const steps = {
      pending: 0,
      accepted: 1,
      arrived: 2,
      inTransit: 3,
      completed: 4
    };
    return steps[status] || 0;
  };

  const currentStep = order ? getStatusStep(order.status) : 0;

  const renderTimeline = () => {
    const steps = [
      { key: 'accepted', label: 'Accepted', icon: '✓' },
      { key: 'arrived', label: 'Arrived', icon: '🚗' },
      { key: 'inTransit', label: 'In Transit', icon: '📦' },
      { key: 'completed', label: 'Completed', icon: '🏁' }
    ];

    return (
      <View style={styles.timeline}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.timelineStep}>
            <View style={[styles.timelineDot, currentStep >= index + 1 && styles.timelineDotActive]}>
              <Text style={styles.timelineIcon}>{step.icon}</Text>
            </View>
            <Text style={[styles.timelineLabel, currentStep >= index + 1 && styles.timelineLabelActive]}>
              {step.label}
            </Text>
            {index < steps.length - 1 && (
              <View style={[styles.timelineLine, currentStep > index + 1 && styles.timelineLineActive]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderActionButton = () => {
    if (!order) return null;

    switch (order.status) {
      case 'accepted':
        return (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleUpdateStatus('arrived')}
          >
            <Text style={styles.actionButtonText}>Mark as Arrived</Text>
          </TouchableOpacity>
        );
      case 'arrived':
        return (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => showOtpModal('pickup')}
          >
            <Text style={styles.actionButtonText}>Verify Pickup OTP</Text>
          </TouchableOpacity>
        );
      case 'inTransit':
        return (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => showOtpModal('delivery')}
          >
            <Text style={styles.actionButtonText}>Verify Delivery OTP</Text>
          </TouchableOpacity>
        );
      case 'completed':
        return (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.actionButtonText}>Back to Home</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.noOrderContainer}>
        <Text style={styles.noOrderIcon}>📭</Text>
        <Text style={styles.noOrderText}>No active order</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.orderId}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      {renderTimeline()}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Customer Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{order.user?.name || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{order.user?.phone || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trip Details</Text>
        
        <View style={styles.locationRow}>
          <View style={styles.locationIcon}>
            <Text style={styles.iconText}>📍</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Pickup</Text>
            <Text style={styles.locationAddress}>{order.pickup?.address}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <View style={styles.locationIcon}>
            <Text style={styles.iconText}>🏁</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Drop</Text>
            <Text style={styles.locationAddress}>{order.dropoff?.address}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vehicle:</Text>
          <Text style={styles.infoValue}>{order.vehicle?.name || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Goods Type:</Text>
          <Text style={styles.infoValue}>{order.goodsType || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Distance:</Text>
          <Text style={styles.infoValue}>{order.distance?.toFixed(1)} km</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fare Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Base Fare:</Text>
          <Text style={styles.infoValue}>₹{order.baseFare}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Distance Fare:</Text>
          <Text style={styles.infoValue}>₹{order.distanceFare}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Goods Fare:</Text>
          <Text style={styles.infoValue}>₹{order.goodsFare}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total:</Text>
          <Text style={styles.totalFare}>₹{order.finalFare}</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        {renderActionButton()}
      </View>

      <Modal
        visible={otpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Enter {otpType === 'pickup' ? 'Pickup' : 'Delivery'} OTP
            </Text>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter 4-digit OTP"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setOtpModalVisible(false);
                  setOtp('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleVerifyOtp}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noOrderIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  noOrderText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  timelineDotActive: {
    backgroundColor: '#4CAF50',
  },
  timelineIcon: {
    fontSize: 18,
  },
  timelineLabel: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  timelineLine: {
    position: 'absolute',
    top: 20,
    left: '60%',
    width: '80%',
    height: 2,
    backgroundColor: '#ddd',
  },
  timelineLineActive: {
    backgroundColor: '#4CAF50',
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  locationIcon: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#999',
  },
  locationAddress: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  totalFare: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actionContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    width: '100%',
    textAlign: 'center',
    letterSpacing: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#2196F3',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#666',
  },
  modalButtonTextPrimary: {
    color: '#fff',
  },
});

export default ActiveOrderScreen;