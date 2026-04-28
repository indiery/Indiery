import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import orderApi from '../../api/order.api';
import pricingApi from '../../api/pricing.api';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import Button from '../../components/common/Button';
import ProgressStep from '../../components/customer/ProgressStep';
import VehicleSelector from '../../components/customer/VehicleSelector';
import PriceBreakdown from '../../components/customer/PriceBreakdown';

const NON_DELIVERABLE_GOODS = [
  'Illegal items',
  'Alcohol & drugs',
  'Hazardous chemicals',
  'Explosives',
  'Live pets or humans',
  'Firearms & ammunition',
  'Cash & jewelry above ₹50,000',
  'Toxic substances',
];

// Mock vehicle data
const VEHICLES = [
  { code: 'bike', label: 'Bike', icon: '🏍️', capacity: 'Up to 20kg', price: '₹30/km' },
  { code: 'mini_500', label: 'Mini 500kg', icon: '🚛', capacity: 'Up to 500kg', price: '₹50/km' },
  { code: 'mini_750', label: 'Mini 750kg', icon: '🚛', capacity: 'Up to 750kg', price: '₹70/km' },
];

const BookingScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState('intracity');
  const [pickup, setPickup] = useState({ address: '', lat: null, lng: null });
  const [drop, setDrop] = useState({ address: '', lat: null, lng: null });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [goodsType, setGoodsType] = useState('');
  const [weight, setWeight] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showGoodsWarning, setShowGoodsWarning] = useState(false);

  const checkGoodsType = (text) => {
    setGoodsType(text);
    const isNonDeliverable = NON_DELIVERABLE_GOODS.some(item => 
      text.toLowerCase().includes(item.toLowerCase())
    );
    setShowGoodsWarning(isNonDeliverable);
  };

  const getEstimate = async () => {
    if (!pickup.address || !drop.address || !selectedVehicle || !weight) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const isNonDeliverable = NON_DELIVERABLE_GOODS.some(item => 
      goodsType.toLowerCase().includes(item.toLowerCase())
    );
    if (isNonDeliverable) {
      Alert.alert('Cannot Deliver', 'This type of goods is not allowed for delivery.');
      return;
    }

    setLoading(true);
    try {
      // Geocode addresses to get coordinates
      const [pickupGeo, dropGeo] = await Promise.all([
        pricingApi.geocode(pickup.address),
        pricingApi.geocode(drop.address),
      ]);

      if (!pickupGeo.success || !dropGeo.success) {
        throw new Error('Failed to geocode addresses');
      }

      // Get price estimate from backend
      const result = await pricingApi.getEstimate(
        { coordinates: pickupGeo.coordinates },
        { coordinates: dropGeo.coordinates },
        selectedVehicle.code,
        deliveryType,
        goodsType,
        parseFloat(weight)
      );

      if (result.success) {
        setEstimate(result.estimate);
        // Store coordinates for order creation
        setPickup({ ...pickup, lat: pickupGeo.coordinates[1], lng: pickupGeo.coordinates[0] });
        setDrop({ ...drop, lat: dropGeo.coordinates[1], lng: dropGeo.coordinates[0] });
        setStep(3);
      } else {
        throw new Error(result.message || 'Failed to get estimate');
      }
    } catch (error) {
      console.error('Estimate error:', error);
      Alert.alert('Error', error.message || 'Failed to get estimate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!pickup.lng || !drop.lng || !selectedVehicle) {
      Alert.alert('Error', 'Missing location data. Please get estimate first.');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        vehicleType: selectedVehicle.code,
        pickup: {
          address: pickup.address,
          coordinates: [pickup.lng, pickup.lat],
        },
        drop: {
          address: drop.address,
          coordinates: [drop.lng, drop.lat],
        },
        goodsType,
        weight: parseFloat(weight),
        paymentMethod: 'upi',
      };

      const result = await orderApi.createOrder(orderData);

      if (result.success) {
        Alert.alert('Success', 'Order created!', [
          { text: 'OK', onPress: () => navigation.replace('Tracking', { orderId: result.order.orderId }) }
        ]);
      } else {
        throw new Error(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Create order error:', error);
      Alert.alert('Error', error.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Where to send?</Text>
      
      {/* Delivery Type Selection */}
      <Text style={styles.label}>Delivery Type</Text>
      <View style={styles.deliveryTypeRow}>
        <TouchableOpacity
          style={[styles.deliveryTypeBtn, deliveryType === 'intracity' && styles.deliveryTypeActive]}
          onPress={() => setDeliveryType('intracity')}
        >
          <Text style={[styles.deliveryTypeText, deliveryType === 'intracity' && styles.deliveryTypeTextActive]}>
            🚗 Intracity
          </Text>
          <Text style={styles.deliveryTypeDesc}>Within same city</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deliveryTypeBtn, deliveryType === 'intercity' && styles.deliveryTypeActive]}
          onPress={() => setDeliveryType('intercity')}
        >
          <Text style={[styles.deliveryTypeText, deliveryType === 'intercity' && styles.deliveryTypeTextActive]}>
            🏍️ Intercity
          </Text>
          <Text style={styles.deliveryTypeDesc}>Between cities</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pickup Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter pickup address"
          value={pickup.address}
          onChangeText={(text) => setPickup({ ...pickup, address: text })}
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Drop Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter drop address"
          value={drop.address}
          onChangeText={(text) => setDrop({ ...drop, address: text })}
          multiline
        />
      </View>

      <Button
        title="Next"
        variant="primary"
        onPress={() => setStep(2)}
        disabled={!pickup.address || !drop.address}
        style={styles.nextButton}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Vehicle & Goods</Text>
      
      <Text style={styles.label}>Vehicle Type</Text>
      <VehicleSelector
        vehicles={VEHICLES}
        selected={selectedVehicle}
        onSelect={setSelectedVehicle}
      />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Goods Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Documents, Electronics, Glass"
          value={goodsType}
          onChangeText={checkGoodsType}
        />
        {showGoodsWarning && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ This item may not be deliverable</Text>
          </View>
        )}
      </View>

      {/* Non-deliverable goods info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Cannot Deliver:</Text>
        {NON_DELIVERABLE_GOODS.slice(0, 4).map((item, index) => (
          <Text key={index} style={styles.infoText}>• {item}</Text>
        ))}
        <Text style={styles.infoMore}>+ more</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter weight"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
      </View>

      <Button
        title={loading ? 'Calculating...' : 'Get Estimate'}
        variant="primary"
        onPress={getEstimate}
        disabled={loading || !selectedVehicle || !weight}
        style={styles.nextButton}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Price Estimate</Text>
      
      {estimate && (
        <PriceBreakdown estimate={estimate} />
      )}

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          variant="secondary"
          onPress={() => setStep(2)}
          style={styles.backButton}
        />
        <Button
          title={loading ? 'Creating...' : 'Book Now'}
          variant="primary"
          onPress={createOrder}
          disabled={loading}
          style={styles.bookButton}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Delivery</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <ProgressStep 
          step={1} 
          currentStep={step} 
          title="Vehicle" 
          icon="🚛"
        />
        <View style={styles.progressLine} />
        <ProgressStep 
          step={2} 
          currentStep={step} 
          title="Addresses" 
          icon="📍"
        />
        <View style={styles.progressLine} />
        <ProgressStep 
          step={3} 
          currentStep={step} 
          title="Payment" 
          icon="💳"
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  // Header
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  headerSpacer: {
    width: 36,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },

  // Step Container
  stepContainer: {
    padding: spacing.lg,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    color: colors.textPrimary,
  },
  deliveryTypeRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  deliveryTypeBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  deliveryTypeActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  deliveryTypeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  deliveryTypeTextActive: {
    color: colors.primary,
  },
  deliveryTypeDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  warningBox: {
    backgroundColor: colors.warningLight,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  warningText: {
    color: '#92400E',
    fontWeight: '600',
    fontSize: 12,
  },
  infoBox: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  infoText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  infoMore: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  nextButton: {
    marginTop: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  backButton: {
    flex: 1,
  },
  bookButton: {
    flex: 2,
  },
});

export default BookingScreen;