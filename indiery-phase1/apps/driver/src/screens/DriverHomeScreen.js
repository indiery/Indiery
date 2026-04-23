import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Switch, FlatList, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import api from '../config/api';

export default function DriverHomeScreen({ navigation }) {
  const [isOnline, setIsOnline] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef(null);
  const locationInterval = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (isOnline) {
      startLocationUpdates();
    } else {
      stopLocationUpdates();
    }
    return () => stopLocationUpdates();
  }, [isOnline]);

  async function toggleOnline() {
    try {
      const res = await api.patch('/drivers/me/toggle');
      setIsOnline(res.data.is_online);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await api.get('/drivers/me/orders');
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  }

  async function startLocationUpdates() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Location required to go online');

    locationInterval.current = setInterval(async () => {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      await api.post('/tracking/update', {
        driverId: 'me',
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    }, 5000); // every 5 seconds
  }

  function stopLocationUpdates() {
    if (locationInterval.current) clearInterval(locationInterval.current);
  }

  async function acceptOrder(orderId) {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: 'accepted' });
      navigation.navigate('ActiveOrder', { orderId });
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  return (
    <View style={styles.container}>
      {/* Online toggle */}
      <View style={styles.toggleCard}>
        <View>
          <Text style={styles.toggleTitle}>{isOnline ? '🟢 You are Online' : '⚫ You are Offline'}</Text>
          <Text style={styles.toggleSub}>{isOnline ? 'Accepting orders' : 'Slide to go online'}</Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={toggleOnline}
          trackColor={{ false: '#ddd', true: '#2a9d8f' }}
          thumbColor={isOnline ? '#fff' : '#aaa'}
        />
      </View>

      {/* Order Feed */}
      <Text style={styles.feedTitle}>📋 Order Feed</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#e63946" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          refreshing={loading}
          onRefresh={fetchOrders}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{item.id.slice(-8).toUpperCase()}</Text>
                <Text style={styles.orderFare}>₹{item.final_amount}</Text>
              </View>
              <Text style={styles.addr}>📍 {item.pickup_address}</Text>
              <Text style={styles.addr}>🏁 {item.drop_address}</Text>
              <Text style={styles.dist}>📏 {item.distance_km} km · {item.vehicle_type}</Text>
              {item.status === 'created' && (
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptOrder(item.id)}>
                    <Text style={styles.acceptText}>✅ Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn}>
                    <Text style={styles.rejectText}>✕ Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
              {item.status !== 'created' && (
                <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('ActiveOrder', { orderId: item.id })}>
                  <Text style={styles.continueBtnText}>▶ Continue Order</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {isOnline ? 'Waiting for orders...' : 'Go online to see orders'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  toggleCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f9f9f9', borderRadius: 14, padding: 16, marginBottom: 20,
  },
  toggleTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  toggleSub: { fontSize: 12, color: '#888', marginTop: 2 },
  feedTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  orderCard: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { color: '#457b9d', fontWeight: '700', fontSize: 13 },
  orderFare: { color: '#e63946', fontWeight: '800', fontSize: 16 },
  addr: { fontSize: 13, color: '#555', marginBottom: 2 },
  dist: { fontSize: 12, color: '#888', marginTop: 4, marginBottom: 10 },
  btnRow: { flexDirection: 'row', gap: 10 },
  acceptBtn: { flex: 1, backgroundColor: '#2a9d8f', borderRadius: 10, padding: 12, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '700' },
  rejectBtn: { flex: 1, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, alignItems: 'center' },
  rejectText: { color: '#e63946', fontWeight: '700' },
  continueBtn: { backgroundColor: '#457b9d', borderRadius: 10, padding: 12, alignItems: 'center' },
  continueBtnText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
});
