import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import orderApi from '../../api/order.api';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveOrders = async () => {
    try {
      // Get recent orders - in real app, filter by status
      const response = await orderApi.getOrder('recent');
      setActiveOrders(response.data || []);
    } catch (error) {
      console.log('Fetch orders error:', error);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveOrders();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {profile?.name || 'User'}! 👋</Text>
        <Text style={styles.subtitle}>Where would you like to send something?</Text>
      </View>

      <TouchableOpacity
        style={styles.newOrderCard}
        onPress={() => navigation.navigate('Booking')}
      >
        <Text style={styles.newOrderIcon}>📦</Text>
        <View style={styles.newOrderContent}>
          <Text style={styles.newOrderTitle}>Send a Package</Text>
          <Text style={styles.newOrderDesc}>Quick & reliable delivery</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Orders</Text>
        {activeOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No active orders</Text>
          </View>
        ) : (
          activeOrders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('Tracking', { orderId: order._id })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{order.orderId}</Text>
                <Text style={styles.orderStatus}>{order.status}</Text>
              </View>
              <Text style={styles.orderRoute}>
                {order.pickup?.address} → {order.drop?.address}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionText}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#4CAF50',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  newOrderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  newOrderIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  newOrderContent: {
    flex: 1,
  },
  newOrderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  newOrderDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  arrow: {
    fontSize: 24,
    color: '#4CAF50',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  orderCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  orderStatus: {
    color: '#666',
    fontSize: 12,
  },
  orderRoute: {
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
});

export default HomeScreen;