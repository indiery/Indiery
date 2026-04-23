import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import api from '../config/api';

const STATUS_STEPS = ['created', 'accepted', 'pickup', 'in_transit', 'delivered'];
const STATUS_LABELS = {
  created: 'Order Placed',
  accepted: 'Driver Accepted',
  pickup: 'Driver at Pickup',
  in_transit: 'On the Way',
  delivered: 'Delivered ✅',
};

export default function LiveTrackingScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const wsRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // poll every 10s as backup
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (order?.driver_id) connectWS(order.driver_id);
    return () => wsRef.current?.close();
  }, [order?.driver_id]);

  async function fetchOrder() {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
      if (res.data.status === 'delivered') {
        wsRef.current?.close();
        setTimeout(() => navigation.replace('OrderHistory'), 3000);
      }
    } catch {}
  }

  function connectWS(driverId) {
    const ws = new WebSocket('ws://localhost:4000/ws');
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'customer:subscribe', driverId, customerId: 'me' }));
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'location:update') {
        setDriverLocation({ latitude: msg.lat, longitude: msg.lng });
      }
    };
    ws.onerror = () => {};
  }

  const currentStep = STATUS_STEPS.indexOf(order?.status || 'created');

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: driverLocation?.latitude || 26.85,
          longitude: driverLocation?.longitude || 80.94,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {driverLocation && (
          <Marker coordinate={driverLocation} title="Driver" description="Your driver">
            <Text style={{ fontSize: 28 }}>🚗</Text>
          </Marker>
        )}
      </MapView>

      {/* Status Card */}
      <View style={styles.card}>
        <Text style={styles.statusLabel}>{STATUS_LABELS[order?.status] || 'Finding driver...'}</Text>

        {/* Progress steps */}
        <View style={styles.steps}>
          {STATUS_STEPS.slice(0, 5).map((step, i) => (
            <View key={step} style={styles.stepItem}>
              <View style={[styles.stepDot, i <= currentStep && styles.stepDotActive]} />
              {i < 4 && <View style={[styles.stepLine, i < currentStep && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        <View style={styles.etaRow}>
          <Text style={styles.etaLabel}>⏱ ETA</Text>
          <Text style={styles.etaValue}>~20 min</Text>
        </View>

        {order?.status === 'delivered' && (
          <TouchableOpacity style={styles.rateBtn} onPress={() => navigation.navigate('RateDelivery', { orderId })}>
            <Text style={styles.rateBtnText}>⭐ Rate your delivery</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  card: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10,
  },
  statusLabel: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 16, textAlign: 'center' },
  steps: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#ddd' },
  stepDotActive: { backgroundColor: '#e63946' },
  stepLine: { width: 40, height: 3, backgroundColor: '#ddd' },
  stepLineActive: { backgroundColor: '#e63946' },
  etaRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#f9f9f9', borderRadius: 10 },
  etaLabel: { color: '#888', fontSize: 14 },
  etaValue: { fontWeight: '700', color: '#1a1a2e' },
  rateBtn: { backgroundColor: '#f4a261', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 12 },
  rateBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
