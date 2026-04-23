import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import api from '../config/api';

const STATUS_COLOR = {
  delivered: '#2a9d8f', cancelled: '#e63946', in_transit: '#457b9d',
  pickup: '#f4a261', accepted: '#f4a261', created: '#aaa',
};

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#e63946" />;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order History</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { order: item })}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>#{item.id.slice(-8).toUpperCase()}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] || '#aaa' }]}>
                <Text style={styles.badgeText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.address} numberOfLines={1}>📍 {item.pickup_address}</Text>
            <Text style={styles.address} numberOfLines={1}>🏁 {item.drop_address}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.fare}>₹{item.final_amount}</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('en-IN')}</Text>
            </View>
            {item.is_late && <Text style={styles.lateTag}>⚠️ Late — Coins refunded</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 16 },
  card: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 13, fontWeight: '700', color: '#457b9d' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  address: { fontSize: 13, color: '#555', marginBottom: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  fare: { fontSize: 15, fontWeight: '700', color: '#e63946' },
  date: { fontSize: 12, color: '#aaa' },
  lateTag: { marginTop: 6, fontSize: 12, color: '#f4a261' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
});
