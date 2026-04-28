import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { driverApi } from '../../api/driver.api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import colors from '../../theme/colors';
import OnlineToggle from '../../components/driver/OnlineToggle';
import EarningCard from '../../components/driver/EarningCard';
import Pill from '../../components/common/Pill';

const DriverHomeScreen = ({ navigation }) => {
  const { user, profile } = useAuth();
  const socketHook = useSocket();
  const socket = socketHook?.socket || null;
  const [isOnline, setIsOnline] = useState(profile?.isOnline || false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyOrders, setNearbyOrders] = useState([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  const [rating, setRating] = useState(0);

  const driverColor = colors.role.driver.primary;
  const driverLight = colors.role.driver.primaryLight;

  const fetchData = async () => {
    try {
      const [activeRes, ordersRes, earningsRes, profileRes] = await Promise.all([
        driverApi.getActiveOrder(),
        driverApi.getOrders({ limit: 5 }),
        driverApi.getEarnings(),
        driverApi.getProfile()
      ]);
      if (activeRes.success) setActiveOrder(activeRes.order);
      if (ordersRes.success) setRecentOrders(ordersRes.orders || []);
      if (earningsRes.success) {
        setTodayEarnings(earningsRes.todayEarnings || 0);
        setTotalTrips(earningsRes.totalTrips || 0);
      }
      if (profileRes.success) {
        setRating(profileRes.driver?.rating || 0);
      }
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
      setNearbyOrders(prev => [order, ...prev]);
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
      setNearbyOrders(prev => prev.filter(o => o._id !== order._id));
    });

    return () => {
      socket.off('newOrderRequest');
      socket.off('orderAccepted');
    };
  }, [socket]);

  const handleAcceptOrder = async (orderId) => {
    try {
      Alert.alert('Success', 'Order accepted! Navigate to pickup');
      navigation.navigate('ActiveOrder');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order');
    }
  };

  const handleDeclineOrder = (orderId) => {
    setNearbyOrders(prev => prev.filter(o => o.id !== orderId));
    Alert.alert('Declined', 'Order declined');
  };

  const handleToggleOnline = async () => {
    try {
      setIsOnline(!isOnline);
      Alert.alert(isOnline ? 'Offline' : 'Online', isOnline ? 'You are now offline' : 'You are now online!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <View style={[styles.heroHdr, { backgroundColor: driverColor }]}>
        <View style={styles.heroHdrRow}>
          <View>
            <Text style={styles.greeting}>Driver Dashboard</Text>
            <Text style={styles.name}>{profile?.name || 'Driver'}</Text>
          </View>
          {profile?.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'D'}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Online Toggle */}
        <View style={styles.toggleContainer}>
          <OnlineToggle isOnline={isOnline} onToggle={handleToggleOnline} />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <EarningCard label="Today's Earn" value={`₹${todayEarnings}`} variant="success" />
          <EarningCard label="Orders" value={String(totalTrips)} variant="primary" />
          <EarningCard label="Rating" value={`${rating}⭐`} variant="warning" />
        </View>

        {/* New Orders Nearby */}
        <View style={styles.sectionHeader}>
          <Text style={styles.secTitle}>New Orders Nearby</Text>
          <Pill label="3 new" variant="purple" />
        </View>

        {nearbyOrders.map((order) => (
          <View key={order.id} style={styles.orderCardWrapper}>
            <View style={styles.orderCard}>
              <View style={styles.ocTop}>
                <Text style={styles.ocId}>{order.orderId}</Text>
                <Text style={[styles.price, { color: driverColor }]}>₹{order.estimatedFare}</Text>
              </View>
              <View style={styles.routeCol}>
                <View style={[styles.rdot, styles.rdotTop, { backgroundColor: driverColor }]} />
                <View style={{ paddingLeft: 4, marginBottom: 14 }}>
                  <Text style={styles.rtext}>{order.pickup?.address}</Text>
                </View>
                <View style={[styles.rdot, styles.rdotBot, { backgroundColor: colors.success }]} />
                <View style={{ paddingLeft: 4 }}>
                  <Text style={styles.rtext}>{order.dropoff?.address}</Text>
                </View>
              </View>
              <View style={styles.ocBot}>
                <Pill label={order.distance} variant="green" />
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    style={[styles.btn, styles.declineBtn]}
                    onPress={() => handleDeclineOrder(order.id)}
                  >
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.acceptBtn, { backgroundColor: driverColor }]}
                    onPress={() => handleAcceptOrder(order.id)}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroHdr: {
    padding: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroHdrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginTop: -14,
    backgroundColor: '#fff',
  },
  toggleContainer: {
    paddingVertical: 10,
    paddingBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  secTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  orderCardWrapper: {
    paddingHorizontal: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 14,
    marginBottom: 12,
  },
  ocTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ocId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
  },
  routeCol: {
    flexDirection: 'column',
    position: 'relative',
    paddingLeft: 18,
    marginBottom: 10,
  },
  rdot: {
    position: 'absolute',
    left: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  rdotTop: {
    top: 3,
  },
  rdotBot: {
    bottom: 3,
  },
  rtext: {
    fontSize: 13,
    fontWeight: '600',
  },
  ocBot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  btn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  declineBtn: {
    backgroundColor: '#FEE2E2',
  },
  acceptBtn: {},
  declineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  acceptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});

export default DriverHomeScreen;