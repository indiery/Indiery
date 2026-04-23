import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import api from '../config/api';
import { useWalletStore, useOrderStore } from '../store';

export default function CheckoutScreen({ route, navigation }) {
  const { pickupAddress, dropAddress, pickupCoords, vehicle, goodsType, fare } = route.params;
  const [coupon, setCoupon] = useState('');
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [loading, setLoading] = useState(false);
  const { coinBalance } = useWalletStore();
  const { setActiveOrder } = useOrderStore();

  const finalAmount = Math.max(fare.finalAmount - coinsToUse, 0);

  async function placeOrder() {
    try {
      setLoading(true);

      // 1. Create order in backend
      const orderRes = await api.post('/orders', {
        vehicleType: vehicle,
        goodsType,
        pickupAddress,
        pickupLat: pickupCoords?.lat,
        pickupLng: pickupCoords?.lng,
        dropAddress,
        dropLat: 0, // set from address picker
        dropLng: 0,
        distanceKm: fare.distanceKm,
        coinsUsed: coinsToUse,
        couponDiscount: 0,
      });
      const order = orderRes.data.order;

      // 2. Create Razorpay payment
      const rpRes = await api.post('/payments/create', { orderId: order.id });
      const { razorpayOrderId, amount, keyId } = rpRes.data;

      // 3. Open Razorpay checkout
      const options = {
        description: 'Indiery Delivery',
        image: 'https://your-logo-url.png',
        currency: 'INR',
        key: keyId,
        amount,
        order_id: razorpayOrderId,
        name: 'Indiery',
        prefill: { contact: '', email: '' },
        theme: { color: '#e63946' },
      };

      const paymentData = await RazorpayCheckout.open(options);

      // 4. Verify payment
      await api.post('/payments/verify', {
        razorpayOrderId,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
        orderId: order.id,
      });

      // 5. Dispatch (find driver)
      await api.post(`/orders/${order.id}/dispatch`);

      setActiveOrder(order);
      navigation.replace('LiveTracking', { orderId: order.id });
    } catch (err) {
      Alert.alert('Payment failed', err.description || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Confirm Booking</Text>

      {/* Route Summary */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>📍 Pickup</Text>
        <Text style={styles.cardValue}>{pickupAddress}</Text>
        <Text style={[styles.cardLabel, { marginTop: 10 }]}>🏁 Drop</Text>
        <Text style={styles.cardValue}>{dropAddress}</Text>
      </View>

      {/* Map preview placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>🗺️ Route Map Preview</Text>
        <Text style={styles.mapSub}>({fare.distanceKm} km · approx 20 min)</Text>
      </View>

      {/* Coupon */}
      <Text style={styles.label}>🎟️ Coupon Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter coupon code"
        value={coupon}
        onChangeText={setCoupon}
        autoCapitalize="characters"
      />

      {/* Coins */}
      <View style={styles.coinsRow}>
        <Text style={styles.label}>🪙 Use Coins (Balance: {coinBalance})</Text>
        <TouchableOpacity onPress={() => setCoinsToUse(coinsToUse > 0 ? 0 : Math.min(coinBalance, fare.finalAmount))}>
          <Text style={styles.coinsToggle}>{coinsToUse > 0 ? 'Remove' : 'Apply All'}</Text>
        </TouchableOpacity>
      </View>

      {/* Fare Breakdown */}
      <View style={styles.fareCard}>
        <Row label="Base Fare" value={`₹${fare.baseFare}`} />
        <Row label="Distance Charge" value={`₹${fare.distanceCharge}`} />
        <Row label="GST (18%)" value={`₹${fare.gstAmount}`} />
        {coinsToUse > 0 && <Row label="Coins Discount" value={`-₹${coinsToUse}`} highlight />}
        <View style={styles.divider} />
        <Row label="Total" value={`₹${finalAmount.toFixed(2)}`} bold />
      </View>

      <TouchableOpacity style={styles.payBtn} onPress={placeOrder} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.payBtnText}>💳 Pay ₹{finalAmount.toFixed(2)}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value, bold, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold, highlight && styles.highlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#1a1a2e' },
  card: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardLabel: { fontSize: 12, color: '#888', fontWeight: '600' },
  cardValue: { fontSize: 14, color: '#1a1a2e', marginTop: 2 },
  mapPlaceholder: { height: 140, backgroundColor: '#e8f4f8', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  mapText: { fontSize: 15, color: '#457b9d', fontWeight: '600' },
  mapSub: { fontSize: 12, color: '#888', marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 12 },
  coinsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  coinsToggle: { color: '#e63946', fontWeight: '700', fontSize: 13 },
  fareCard: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rowLabel: { fontSize: 13, color: '#555' },
  rowValue: { fontSize: 13, color: '#333' },
  bold: { fontWeight: '800', fontSize: 15, color: '#1a1a2e' },
  highlight: { color: '#2a9d8f' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  payBtn: { backgroundColor: '#e63946', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
