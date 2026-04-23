import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';

const FLOW = [
  { status: 'accepted', label: 'Heading to Pickup', nextStatus: 'pickup', nextLabel: '📍 Arrived at Pickup', podStage: null },
  { status: 'pickup', label: 'At Pickup — Take Photo', nextStatus: 'in_transit', nextLabel: '🚗 Start Delivery', podStage: 'pickup' },
  { status: 'in_transit', label: 'In Transit — Take Drop Photo', nextStatus: 'delivered', nextLabel: '✅ Mark Delivered', podStage: 'drop' },
];

export default function ActiveOrderScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchOrder(); }, []);

  async function fetchOrder() {
    const res = await api.get(`/orders/${orderId}`);
    setOrder(res.data);
  }

  async function takePhoto() {
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setPhoto(result.assets[0]);
  }

  const step = FLOW.find((f) => f.status === order?.status);

  async function advance() {
    if (!step) return;
    if (step.podStage && !photo) return Alert.alert('Required', 'Please take a photo first');

    try {
      setUploading(true);

      // Upload POD photo if required
      if (step.podStage && photo) {
        const fd = new FormData();
        fd.append('photo', { uri: photo.uri, type: 'image/jpeg', name: 'pod.jpg' });
        await api.post(`/pod/${orderId}/${step.podStage}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setPhoto(null);
      }

      // Transition state
      await api.patch(`/orders/${orderId}/status`, { status: step.nextStatus });
      await fetchOrder();

      if (step.nextStatus === 'delivered') {
        Alert.alert('Delivered! 🎉', 'Great job! Earnings credited to your wallet.', [
          { text: 'OK', onPress: () => navigation.replace('DriverHome') },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setUploading(false);
    }
  }

  if (!order) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#e63946" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{step?.label || 'Order Complete'}</Text>

      {/* Order info */}
      <View style={styles.card}>
        <Row label="Order" value={`#${order.id.slice(-8).toUpperCase()}`} />
        <Row label="📍 Pickup" value={order.pickup_address} />
        <Row label="🏁 Drop" value={order.drop_address} />
        <Row label="💰 Earnings" value={`₹${(order.final_amount * 0.85).toFixed(2)}`} />
      </View>

      {/* Navigation hint */}
      <TouchableOpacity style={styles.navBtn}>
        <Text style={styles.navBtnText}>🗺️ Open Navigation</Text>
      </TouchableOpacity>

      {/* POD Camera */}
      {step?.podStage && (
        <View style={styles.podSection}>
          <Text style={styles.podTitle}>
            📷 {step.podStage === 'pickup' ? 'Pickup Photo' : 'Delivery Photo'} (Required)
          </Text>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
          ) : (
            <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
              <Text style={styles.cameraBtnText}>📸 Take Photo</Text>
            </TouchableOpacity>
          )}
          {photo && (
            <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhoto(null)}>
              <Text style={styles.retakeBtnText}>🔄 Retake</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.advanceBtn} onPress={advance} disabled={uploading}>
        {uploading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.advanceBtnText}>{step?.nextLabel || 'Done'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  heading: { fontSize: 20, fontWeight: '700', color: '#1a1a2e', marginBottom: 16 },
  card: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowLabel: { color: '#888', fontSize: 13, flex: 1 },
  rowValue: { color: '#1a1a2e', fontWeight: '600', fontSize: 13, flex: 2, textAlign: 'right' },
  navBtn: { borderWidth: 1.5, borderColor: '#457b9d', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16 },
  navBtnText: { color: '#457b9d', fontWeight: '700', fontSize: 15 },
  podSection: { marginBottom: 16 },
  podTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 10 },
  cameraBtn: { borderWidth: 2, borderColor: '#e63946', borderStyle: 'dashed', borderRadius: 12, padding: 30, alignItems: 'center' },
  cameraBtnText: { color: '#e63946', fontWeight: '700', fontSize: 16 },
  photoPreview: { width: '100%', height: 200, borderRadius: 12, resizeMode: 'cover' },
  retakeBtn: { marginTop: 8, alignItems: 'center' },
  retakeBtnText: { color: '#457b9d', fontWeight: '600' },
  advanceBtn: { backgroundColor: '#2a9d8f', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 40 },
  advanceBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
