import React, { useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import OrderCard from '../../components/customer/OrderCard';
import Button from '../../components/common/Button';
import { orderApi } from '../../api/order.api';

const HomeScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrders = async () => {
    try {
      const response = await orderApi.getMyOrders();
      if (response.success) {
        setActiveOrders(response.orders || []);
      }
    } catch (error) {
      console.log('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActiveOrders();
    setRefreshing(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Hero Header */}
      <View style={styles.heroHeader}>
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.userName}>{profile?.name || 'User'}</Text>
          </View>
          <View style={styles.heroRight}>
            <TouchableOpacity 
              style={styles.notificationBtn}
              onPress={() => {}}
            >
              <Text style={styles.notificationIcon}>🔔</Text>
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(profile?.name)}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Search Card */}
      <View style={styles.searchCard}>
        <Text style={styles.searchLabel}>WHERE TO?</Text>
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => navigation.navigate('Booking')}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search drop-off address...</Text>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          <Button
            title="Book Now"
            icon="📦"
            variant="secondary"
            onPress={() => navigation.navigate('Booking')}
            style={styles.actionBtn}
          />
          <Button
            title="Track"
            icon="📍"
            variant="success"
            onPress={() => navigation.navigate('Tracking')}
            style={styles.actionBtn}
          />
        </View>
      </View>

      {/* Stats Row */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.bodyPad}>
          <View style={styles.statsRow}>
            <View style={[styles.statMini, { backgroundColor: colors.primaryLight }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
                <Text style={styles.statIconText}>📦</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.primary }]}>{activeOrders.length}</Text>
              <Text style={[styles.statLabel, { color: colors.primary }]}>Total Orders</Text>
            </View>
            <View style={[styles.statMini, { backgroundColor: colors.successLight }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
                <Text style={styles.statIconText}>🚚</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.success }]}>{activeOrders.filter(o => ['pending', 'driver_assigned', 'driver_arriving', 'arrived_pickup', 'picked_up', 'in_transit', 'arrived_drop'].includes(o.status)).length}</Text>
              <Text style={[styles.statLabel, { color: colors.success }]}>Active Now</Text>
            </View>
            <View style={[styles.statMini, { backgroundColor: colors.warningLight }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
                <Text style={styles.statIconText}>C</Text>
              </View>
              <Text style={[styles.statValue, { color: '#92400E' }]}>{profile?.creditCoins || 0}</Text>
              <Text style={[styles.statLabel, { color: '#92400E' }]}>Coins</Text>
            </View>
          </View>

          {/* Recent Orders Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {activeOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No orders yet</Text>
              <Button
                title="Book Your First Delivery"
                variant="primary"
                onPress={() => navigation.navigate('Booking')}
                style={{ marginTop: 16 }}
              />
            </View>
          ) : (
            activeOrders.map((order) => (
              <OrderCard
                key={order._id}
                orderId={order.orderId}
                pickup={order.pickup?.address || order.pickup?.description || 'Pickup'}
                dropoff={order.drop?.address || order.drop?.description || 'Drop-off'}
                status={order.status}
                price={order.pricing?.total || order.pricing?.totalPayable || '₹0'}
                date={new Date(order.createdAt).toLocaleDateString()}
                vehicleType={order.vehicleType}
                onPress={() => navigation.navigate('Tracking', { orderId: order.orderId })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  // Hero Header
  heroHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.xxl,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginTop: 2,
  },
  heroRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 16,
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
    borderWidth: 2,
    borderColor: colors.primary,
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
    color: colors.white,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // Search Card
  searchCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  searchLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: colors.textLight,
  },
  arrowIcon: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
  },

  // Body
  bodyPad: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statMini: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statIconText: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    opacity: 0.7,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

export default HomeScreen;