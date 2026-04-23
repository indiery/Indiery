import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import api from '../config/api';
import { useWalletStore } from '../store';

const VEHICLES = [
  { key: 'bike', label: '🏍️ Bike', sub: 'Up to 20 kg', base: 40, perKm: 10 },
  { key: 'mini_truck_500', label: '🚐 Mini Truck', sub: 'Up to 500 kg', base: 200, perKm: 20 },
  { key: 'mini_truck_750', label: '🚛 Mini Truck+', sub: 'Up to 750 kg', base: 300, perKm: 30 },
];

const GOODS = ['Electronics', 'Furniture', 'Groceries', 'Documents', 'Clothes', 'Other'];

export default function HomeScreen({ navigation }) {
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [vehicle, setVehicle] = useState('bike');
  const [goodsType, setGoodsType] = useState('Other');
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const { coinBalance } = useWalletStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setPickupCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        // Reverse geocode
        const geo = await Location.reverseGeocodeAsync(loc.coords);
        if (geo[0]) setPickupAddress(`${geo[0].street}, ${geo[0].district}, ${geo[0].city}`);
      }
    })();
  }, []);

  async function estimateFare() {
    if (!pickupAddress || !dropAddress) return Alert.alert('Enter both addresses');
    try {
      setLoading(true);
      // In production, use Google Distance Matrix to get distanceKm
      const distanceKm = 5; // placeholder
      const res = await api.get('/pricing/estimate', {
        params: { vehicleType: vehicle, distanceKm, coinsUsed: 0, couponDiscount: 0 },
      });
      setFare(res.data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleBook() {
    if (!fare) return Alert.alert('Estimate fare first');
    navigation.navigate('Checkout', {
      pickupAddress, dropAddress, pickupCoords,
      vehicle, goodsType, fare,
    });
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Book a Delivery</Text>
      <Text style={styles.coinBadge}>🪙 {coinBalance} Coins</Text>

      {/* Pickup */}
      <Text style={styles.label}>📍 Pickup</Text>
      <TouchableOpacity style={styles.addressBox} onPress={() => navigation.navigate('AddressPicker', { field: 'pickup' })}>
        <Text style={pickupAddress ? styles.addressText : styles.placeholder}>
          {pickupAddress || 'Enter pickup address'}
        </Text>
      </TouchableOpacity>

      {/* Drop */}
      <Text style={styles.label}>🏁 Drop</Text>
      <TouchableOpacity style={styles.addressBox} onPress={() => navigation.navigate('AddressPicker', { field: 'drop' })}>
        <Text style={dropAddress ? styles.addressText : styles.placeholder}>
          {dropAddress || 'Enter drop address'}
        </Text>
      </TouchableOpacity>

      {/* Vehicle */}
      <Text style={styles.label}>Vehicle Type</Text>
      <View style={styles.vehicleRow}>
        {VEHICLES.map((v) => (
          <TouchableOpacity
            key={v.key}
            style={[styles.vehicleCard, vehicle === v.key && styles.vehicleSelected]}
            onPress={() => { setVehicle(v.key); setFare(null); }}
          >
            <Text style={styles.vehicleLabel}>{v.label}</Text>
            <Text style={styles.vehicleSub}>{v.sub}</Text>
            <Text style={styles.vehiclePrice}>₹{v.base} base</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Goods */}
      <Text style={styles.label}>Goods Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.goodsRow}>
        {GOODS.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.goodsChip, goodsType === g && styles.goodsSelected]}
            onPress={() => setGoodsType(g)}
          >
            <Text style={goodsType === g ? styles.goodsTextSelected : styles.goodsText}>{g}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fare preview */}
      {fare && (
        <View style={styles.fareBox}>
          <Text style={styles.fareTitle}>💰 Fare Estimate</Text>
          <Text style={styles.fareLine}>Base: ₹{fare.baseFare} | Distance: ₹{fare.distanceCharge}</Text>
          <Text style={styles.fareLine}>GST (18%): ₹{fare.gstAmount}</Text>
          <Text style={styles.fareTotal}>Total: ₹{fare.finalAmount}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.estimateBtn} onPress={estimateFare} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Get Price</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.bookBtn, !fare && styles.btnDisabled]} onPress={handleBook}>
        <Text style={styles.btnText}>🚀 Book Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  heading: { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  coinBadge: { fontSize: 14, color: '#f4a261', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginTop: 16, marginBottom: 6 },
  addressBox: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, backgroundColor: '#f9f9f9' },
  addressText: { color: '#1a1a2e', fontSize: 14 },
  placeholder: { color: '#aaa', fontSize: 14 },
  vehicleRow: { flexDirection: 'row', gap: 8 },
  vehicleCard: { flex: 1, borderWidth: 1.5, borderColor: '#ddd', borderRadius: 12, padding: 10, alignItems: 'center' },
  vehicleSelected: { borderColor: '#e63946', backgroundColor: '#fff5f5' },
  vehicleLabel: { fontSize: 13, fontWeight: '700' },
  vehicleSub: { fontSize: 10, color: '#888', marginTop: 2 },
  vehiclePrice: { fontSize: 11, color: '#e63946', marginTop: 4 },
  goodsRow: { marginBottom: 8 },
  goodsChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8 },
  goodsSelected: { backgroundColor: '#e63946', borderColor: '#e63946' },
  goodsText: { fontSize: 13, color: '#333' },
  goodsTextSelected: { fontSize: 13, color: '#fff' },
  fareBox: { backgroundColor: '#f0f4ff', borderRadius: 12, padding: 14, marginTop: 16 },
  fareTitle: { fontWeight: '700', fontSize: 15, marginBottom: 6 },
  fareLine: { color: '#555', fontSize: 13, marginBottom: 2 },
  fareTotal: { fontSize: 17, fontWeight: '800', color: '#e63946', marginTop: 6 },
  estimateBtn: { backgroundColor: '#457b9d', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 16 },
  bookBtn: { backgroundColor: '#e63946', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
