import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { driverApi } from '../../api/driver.api';
import { orderApi } from '../../api/order.api';
import Pill from '../../components/common/Pill';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import colors from '../../theme/colors';

const ActiveOrderScreen = ({ navigation }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpType, setOtpType] = useState('');
  const [podModalVisible, setPodModalVisible] = useState(false);

  const driverColor = colors.role.driver.primary;

  const fetchActiveOrder = async () => {
    try {
      setLoading(true);
      const response = await driverApi.getActiveOrder();
      if (response.success && response.order) {
        setOrder(response.order);
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.log('Fetch active order error:', error);
      setOrder(null);
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
      await orderApi.updateStatus(order.orderId, newStatus);
      setOrder({ ...order, status: newStatus });
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (otpType === 'pickup') {
        await verifyPickupOtp(order._id, otp);
        Alert.alert('Success', 'Pickup verified!');
        setOrder({ ...order, status: 'inTransit' });
      } else {
        await verifyDeliveryOtp(order._id, otp);
        Alert.alert('Success', 'Delivery verified!');
        setOrder({ ...order, status: 'completed' });
      }
      setOtpModalVisible(false);
      setOtp('');
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
    return steps[status] || 1;
  };

  const currentStep = order ? getStatusStep(order.status) : 1;

  const steps = [
    { key: 'accepted', label: 'Accept' },
    { key: 'arrived', label: 'Arrived' },
    { key: 'inTransit', label: 'Navigate' },
    { key: 'completed', label: 'Delivered' }
  ];

  const renderTimeline = () => (
    <View style={styles.timeline}>
      {steps.map((step, index) => (
        <View key={step.key} style={styles.timelineStep}>
          <View style={[styles.timelineDot, currentStep >= index + 1 && { backgroundColor: driverColor }]}>
            <Text style={[styles.timelineNum, currentStep >= index + 1 && { color: '#fff' }]}>{index + 1}</Text>
          </View>
          <Text style={[styles.timelineLabel, currentStep >= index + 1 && { color: driverColor, fontWeight: '700' }]}>
            {step.label}
          </Text>
          {index < steps.length - 1 && (
            <View style={[styles.timelineLine, currentStep > index + 1 && { backgroundColor: driverColor }]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderActionButton = () => {
    if (!order) return null;

    switch (order.status) {
      case 'accepted':
        return (
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateStatus('arrived')}>
              <Text style={[styles.actionBtnText, { color: driverColor }]}>Arrived at Pickup</Text>
            </TouchableOpacity>
          </View>
        );
      case 'arrived':
        return (
          <View style={styles.actionBtns}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: driverColor }]} onPress={() => showOtpModal('pickup')}>
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>Verify OTP & Pickup</Text>
            </TouchableOpacity>
          </View>
        );
      case 'inTransit':
        return (
          <View style={styles.actionBtns}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: driverColor }]} onPress={() => showOtpModal('delivery')}>
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>Verify OTP & Deliver</Text>
            </TouchableOpacity>
          </View>
        );
      case 'completed':
        return (
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()}>
              <Text style={[styles.actionBtnText, { color: driverColor }]}>Back to Home</Text>
            </TouchableOpacity>
          </View>
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

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>🗺️ Live Map</Text>
          <Text style={styles.mapSubtext}>Route from pickup to delivery</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.orderId}>#{order?.orderId}</Text>
              <Pill label={order?.status} variant="green" />
            </View>
            <View style={styles.fareBox}>
              <Text style={styles.fareLabel}>Earnings</Text>
              <Text style={[styles.fareValue, { color: driverColor }]}>₹{order?.estimatedFare}</Text>
            </View>
          </View>

          {/* Timeline */}
          {renderTimeline()}

          {/* Route */}
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={[styles.rdot, { backgroundColor: driverColor }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeAddr}>{order?.pickup?.address}</Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.rdot, { backgroundColor: colors.success }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Drop</Text>
                <Text style={styles.routeAddr}>{order?.dropoff?.address}</Text>
              </View>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Customer Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👤 {order?.user?.name}</Text>
              <Text style={styles.infoLabel}>📞 {order?.user?.phone}</Text>
            </View>
          </View>

          {/* POD Button */}
          <TouchableOpacity style={styles.podBtn} onPress={() => setPodModalVisible(true)}>
            <Text style={styles.podBtnText}>📷 Upload POD Photo</Text>
          </TouchableOpacity>

          {/* Actions */}
          {renderActionButton()}
        </ScrollView>
      </View>

      {/* OTP Modal */}
      <Modal visible={otpModalVisible} transparent animationType="slide" onRequestClose={() => setOtpModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter {otpType === 'pickup' ? 'Pickup' : 'Delivery'} OTP</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter 4-digit OTP"
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={setOtp}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => { setOtpModalVisible(false); setOtp(''); }}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: driverColor }]} onPress={handleVerifyOtp}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* POD Modal */}
      <Modal visible={podModalVisible} transparent animationType="slide" onRequestClose={() => setPodModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Proof of Delivery</Text>
            <View style={styles.podPlaceholder}>
              <Text style={styles.podPlaceholderText}>📷</Text>
              <Text style={styles.podPlaceholderSub}>Tap to capture photo</Text>
            </View>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary, { backgroundColor: driverColor, marginTop: 16 }]} onPress={() => { setPodModalVisible(false); Alert.alert('Success', 'POD photo uploaded!'); }}>
              <Text style={[styles.modalBtnText, { color: '#fff' }]}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapContainer: { height: 220, backgroundColor: '#E5E7EB' },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapText: { fontSize: 28, marginBottom: 4 },
  mapSubtext: { fontSize: 12, color: '#6B7280' },
  bottomSheet: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, marginTop: -20, paddingTop: 16, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderId: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  fareBox: { alignItems: 'flex-end' },
  fareLabel: { fontSize: 11, color: '#6B7280' },
  fareValue: { fontSize: 18, fontWeight: '800' },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 8 },
  timelineStep: { alignItems: 'center', flex: 1, position: 'relative' },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 4, zIndex: 1 },
  timelineNum: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  timelineLabel: { fontSize: 10, color: '#9CA3AF' },
  timelineLine: { position: 'absolute', top: 14, left: '50%', right: '-50%', height: 2, backgroundColor: '#E5E7EB', zIndex: 0 },
  routeCard: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  rdot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  routeInfo: { flex: 1 },
  routeLabel: { fontSize: 10, color: '#6B7280', marginBottom: 2 },
  routeAddr: { fontSize: 13, fontWeight: '600' },
  routeLine: { width: 2, height: 20, backgroundColor: '#E5E7EB', marginLeft: 4, marginVertical: 6 },
  infoCard: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 12 },
  infoTitle: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: 12, color: '#6B7280' },
  podBtn: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16 },
  podBtnText: { fontSize: 13, fontWeight: '700', color: '#D97706' },
  actionBtns: { marginBottom: 20 },
  actionBtn: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, alignItems: 'center' },
  actionBtnText: { fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 320 },
  modalTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  otpInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 14, fontSize: 18, textAlign: 'center', letterSpacing: 8, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#F3F4F6' },
  modalBtnPrimary: {},
  modalBtnText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  podPlaceholder: { height: 180, backgroundColor: '#F3F4F6', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  podPlaceholderText: { fontSize: 48, marginBottom: 8 },
  podPlaceholderSub: { fontSize: 12, color: '#6B7280' },
});

export default ActiveOrderScreen;