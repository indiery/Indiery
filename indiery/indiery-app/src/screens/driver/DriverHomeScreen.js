import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { getActiveOrder, getOrders } from '../../api/driver.api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';

const DriverHomeScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const { socket } = useSocket();
  const [isOnline, setIsOnline] = useState(profile?.isOnline || false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyRequest, setNearbyRequest] = useState(null);

  const fetchData = async () => {
    try {
      const [active, orders] = await Promise.all([
        getActiveOrder(),
        getOrders({ limit: 5 })
      ]);
      setActiveOrder(active);
      setRecentOrders(orders || []);
    } catch (error) {
      console.log('Fetch data error:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('newOrderRequest', (order) => {
      setNearbyRequest(order);
      Alert.alert(
        'New Order Request!',
        `Pickup: ${order.pickup.address}\nDrop: ${order.dropoff.address}\nFare: ₹${order.estimatedFare}`,
        [
          { text: 'Accept', onPress: () => handleAcceptOrder(order._id) },
          { text: 'Decline', style: 'cancel' }
        ]
      );
    });

    socket.on('orderAccepted', (order) => {
      setActiveOrder(order);
      setNearbyRequest(null);
    });

    return () => {
      socket.off('newOrderRequest');
      socket.off('orderAccepted');
    };
  }, [socket]);

  const handleAcceptOrder = async (orderId) => {
    try {
      // TODO: Call accept order API
      Alert.alert('Success', 'Order accepted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order');
    }
  };

  const handleToggleOnline = async () => {
    try {
      // TODO: Call toggle online API
      setIsOnline(!isOnline);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      accepted: '#2196F3',
      arrived: '#9C27B0',
      inTransit: '#4CAF50',
      completed: '#4CAF50',
      cancelled: '#f44336'
    };
    return colors[status] || '#999';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile?.name || 'Driver'}! 👋</Text>
          <Text style={styles.subtitle}>
            {isOnline ? 'You are online' : 'You are offline'}
          </Text>
        </View>
        <View style={styles.onlineToggle}>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: '#767577', true: '#81c784' }}
            thumbColor={isOnline ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>

      {activeOrder ? (
        <TouchableOpacity 
          style={styles.activeOrderCard}
          onPress={() => navigation.navigate('ActiveOrder')}
        >
          <View style={styles.orderHeader}>
            <Text style={styles.orderTitle}>Active Order</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activeOrder.status) }]}>
              <Text style={styles.statusText}>{activeOrder.status}</Text>
            </View>
          </View>
          
          <View style={styles.orderRoute}>
            <View style={styles.routePoint}>
              <Text style={styles.routeIcon}>📍</Text>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {activeOrder.pickup?.address}
                </Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <Text style={styles.routeIcon}>🏁</Text>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Drop</Text>
                <Text style={styles.routeAddress} numberOfLines={1}>
                  {activeOrder.dropoff?.address}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.orderFooter}>
            <Text style={styles.earningsLabel}>Estimated Earnings</Text>
            <Text style={styles.earningsAmount}>₹{activeOrder.estimatedFare}</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.noActiveOrder}>
          <Text style={styles.noOrderIcon}>🚗</Text>
          <Text style={styles.noOrderText}>
            {isOnline ? 'Waiting for orders...' : 'Go online to receive orders'}
          </Text>
        </View>
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Earnings')}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionText}>Earnings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Documents')}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionText}>Documents</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentOrders}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentOrders.length === 0 ? (
          <View style={styles.emptyOrders}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        ) : (
          recentOrders.map((order) => (
            <TouchableOpacity 
              key={order._id} 
              style={styles.orderItem}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order._id })}
            >
              <View style={styles.orderItemHeader}>
                <Text style={styles.orderId}>#{order.orderId}</Text>
                <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.orderStatusText}>{order.status}</Text>
                </View>
              </View>
              <View style={styles.orderItemRoute}>
                <Text style={styles.routeText} numberOfLines={1}>
                  {order.pickup?.address} → {order.dropoff?.address}
                </Text>
              </View>
              <View style={styles.orderItemFooter}>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.orderFare}>₹{order.finalFare}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2196F3',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  onlineToggle: {
    padding: 10,
  },
  activeOrderCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  orderRoute: {
    marginBottom: 15,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#999',
  },
  routeAddress: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 9,
    marginVertical: 5,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#666',
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  noActiveOrder: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  noOrderIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  noOrderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  recentOrders: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#2196F3',
    fontSize: 14,
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  orderItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderStatus: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  orderStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  orderItemRoute: {
    marginBottom: 8,
  },
  routeText: {
    fontSize: 14,
    color: '#666',
  },
  orderItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderFare: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyOrders: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});

export default DriverHomeScreen;