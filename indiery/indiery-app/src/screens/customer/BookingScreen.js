import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import orderApi from '../../api/order.api';
import pricingApi from '../../api/pricing.api';
import { useAuth } from '../../context/AuthContext';

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

const BookingScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [deliveryType, setDeliveryType] = useState('intracity'); // 'intracity' or 'intercity'
  const [pickup, setPickup] = useState({ address: '', lat: null, lng: null });
  const [drop, setDrop] = useState({ address: '', lat: null, lng: null });
  const [vehicleType, setVehicleType] = useState(null);
  const [goodsType, setGoodsType] = useState('');
  const [weight, setWeight] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [showGoodsWarning, setShowGoodsWarning] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [deliveryType]);

  const fetchVehicles = async () => {
    try {
      const response = await pricingApi.getVehicles(deliveryType);
      setVehicles(response.data?.vehicles || []);
    } catch (error) {
      console.log('Fetch vehicles error:', error);
    }
  };

  const checkGoodsType = (text) => {
    setGoodsType(text);
    // Check if goods type matches any non-deliverable item
    const isNonDeliverable = NON_DELIVERABLE_GOODS.some(item => 
      text.toLowerCase().includes(item.toLowerCase())
    );
    setShowGoodsWarning(isNonDeliverable);
  };

  const getEstimate = async () => {
    if (!pickup.lat || !drop.lat || !vehicleType || !weight) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Check for non-deliverable goods
    const isNonDeliverable = NON_DELIVERABLE_GOODS.some(item => 
      goodsType.toLowerCase().includes(item.toLowerCase())
    );
    if (isNonDeliverable) {
      Alert.alert('Cannot Deliver', 'This type of goods is not allowed for delivery.');
      return;
    }

    setLoading(true);
    try {
      const response = await pricingApi.getEstimate(
        pickup,
        drop,
        vehicleType,
        deliveryType,
        goodsType,
        parseFloat(weight)
      );
      setEstimate(response.data.estimate);
      setStep(3);
    } catch (error) {
      Alert.alert('Error', 'Failed to get estimate');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const response = await orderApi.createOrder({
        pickup,
        drop,
        vehicleType,
        deliveryType,
        goodsType,
        weight: parseFloat(weight),
      });
      Alert.alert('Success', 'Order created!', [
        { text: 'OK', onPress: () => navigation.replace('Tracking', { orderId: response.data._id }) }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create order');
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

      <TouchableOpacity
        style={[styles.button, (!pickup.address || !drop.address) && styles.buttonDisabled]}
        onPress={() => setStep(2)}
        disabled={!pickup.address || !drop.address}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Vehicle & Goods</Text>
      
      <Text style={styles.label}>Vehicle Type</Text>
      <View style={styles.vehicleGrid}>
        {vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.code}
            style={[
              styles.vehicleCard,
              vehicleType === vehicle.code && styles.vehicleCardSelected,
            ]}
            onPress={() => setVehicleType(vehicle.code)}
          >
            <Text style={styles.vehicleIcon}>
              {vehicle.code === 'bike' ? '🏍️' : '🚚'}
            </Text>
            <Text style={styles.vehicleName}>{vehicle.label}</Text>
            <Text style={styles.vehicleCapacity}>Up to {vehicle.weightLimitKg}kg</Text>
            {vehicle.perKm && (
              <Text style={styles.vehiclePrice}>
                {vehicle.basePrice > 0 ? `₹${vehicle.basePrice} + ₹${vehicle.perKm}/km` : `₹${vehicle.perKm}/km`}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

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

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={getEstimate}
        disabled={loading || !vehicleType || !weight}
      >
        <Text style={styles.buttonText}>{loading ? 'Calculating...' : 'Get Estimate'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Price Estimate</Text>
      
      <View style={styles.estimateCard}>
        <View style={styles.estimateRow}>
          <Text>Base Price</Text>
          <Text>₹{estimate?.basePrice || 0}</Text>
        </View>
        <View style={styles.estimateRow}>
          <Text>Distance ({estimate?.distanceKm?.toFixed(1)}km @ ₹{estimate?.perKm}/km)</Text>
          <Text>₹{estimate?.distancePrice || 0}</Text>
        </View>
        {estimate?.discount > 0 && (
          <View style={styles.estimateRow}>
            <Text style={styles.discountText}>Coupon Discount</Text>
            <Text style={styles.discountText}>-₹{estimate?.discount || 0}</Text>
          </View>
        )}
        {estimate?.coinDiscount > 0 && (
          <View style={styles.estimateRow}>
            <Text style={styles.discountText}>Coins Used</Text>
            <Text style={styles.discountText}>-₹{estimate?.coinDiscount || 0}</Text>
          </View>
        )}
        <View style={styles.estimateRow}>
          <Text>GST (18%)</Text>
          <Text>₹{estimate?.gst || 0}</Text>
        </View>
        <View style={[styles.estimateRow, styles.estimateSubtotal]}>
          <Text>Subtotal</Text>
          <Text>₹{estimate?.subtotal || 0}</Text>
        </View>
        <View style={[styles.estimateRow, styles.estimateTotal]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{estimate?.total || 0}</Text>
        </View>
      </View>

      {/* Commission breakdown (for transparency) */}
      <View style={styles.commissionCard}>
        <Text style={styles.commissionTitle}>Price Breakdown</Text>
        <View style={styles.commissionRow}>
          <Text>Driver Commission (80%)</Text>
          <Text>₹{estimate?.driverCommission || 0}</Text>
        </View>
        <View style={styles.commissionRow}>
          <Text>Indiery Commission (15%)</Text>
          <Text>₹{estimate?.indieryCommission || 0}</Text>
        </View>
        <View style={styles.commissionRow}>
          <Text>Reserve (5%)</Text>
          <Text>₹{estimate?.reserveAmount || 0}</Text>
        </View>
        <Text style={styles.commissionNote}>
          * 5% reserve goes to driver as reward if delivery is on time
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => setStep(2)}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={createOrder}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Book Now'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progress}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={[styles.progressDot, step >= s && styles.progressDotActive]} />
        ))}
      </View>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  deliveryTypeRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  deliveryTypeBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  deliveryTypeActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  deliveryTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deliveryTypeTextActive: {
    color: '#4CAF50',
  },
  deliveryTypeDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  vehicleCard: {
    width: '47%',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 10,
    marginHorizontal: '1%',
    alignItems: 'center',
  },
  vehicleCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  vehicleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  vehicleCapacity: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  vehiclePrice: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  warningText: {
    color: '#856404',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  infoMore: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonSecondary: {
    backgroundColor: '#666',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  estimateCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  estimateSubtotal: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 8,
  },
  estimateTotal: {
    borderTopWidth: 2,
    borderTopColor: '#4CAF50',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  discountText: {
    color: '#4CAF50',
  },
  commissionCard: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  commissionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1565C0',
  },
  commissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    fontSize: 12,
    color: '#666',
  },
  commissionNote: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default BookingScreen;