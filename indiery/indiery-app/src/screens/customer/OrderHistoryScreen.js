import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { orderApi } from '../../api/order.api';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import Pill from '../../components/common/Pill';

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await orderApi.getMyOrders();
      if (response.success) {
        setOrders(response.orders || []);
      }
    } catch (error) {
      console.log('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'delivered':
        return <Pill label="Delivered" variant="success" size="small" />;
      case 'cancelled':
        return <Pill label="Cancelled" variant="error" size="small" />;
      case 'in-transit':
        return <Pill label="In Transit" variant="primary" size="small" />;
      case 'pending':
        return <Pill label="Pending" variant="warning" size="small" />;
      default:
        return <Pill label={status} variant="gray" size="small" />;
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('Tracking', { orderId: item._id })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>#{item.orderId}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        {getStatusPill(item.status)}
      </View>
      
      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={styles.routeDotPrimary} />
          <Text style={styles.routeAddress} numberOfLines={1}>{item.pickup?.address}</Text>
        </View>
        <View style={styles.routePoint}>
          <View style={styles.routeDotSecondary} />
          <Text style={styles.routeAddress} numberOfLines={1}>{item.drop?.address}</Text>
        </View>
      </View>
      
      <View style={styles.orderFooter}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleIcon}>🛵</Text>
          <Text style={styles.vehicleType}>{item.vehicleType}</Text>
        </View>
        <Text style={styles.orderPrice}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const FilterTab = ({ label, value }) => (
    <TouchableOpacity 
      style={[styles.filterTab, filter === value && styles.filterTabActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterBtnIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterTab label="All" value="all" />
        <FilterTab label="Delivered" value="delivered" />
        <FilterTab label="In Transit" value="in-transit" />
        <FilterTab label="Cancelled" value="cancelled" />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' 
                ? 'Start by placing your first order!' 
                : `No ${filter} orders yet`}
            </Text>
          </View>
        }
        ListFooterComponent={<View style={styles.bottomPadding} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnIcon: {
    fontSize: 16,
  },

  // Filter
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  filterTabActive: {
    backgroundColor: colors.primaryLight,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.primary,
  },

  // List
  list: {
    padding: spacing.lg,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Route
  routeContainer: {
    marginBottom: spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  routeDotPrimary: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  routeDotSecondary: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.warning,
    marginRight: spacing.sm,
  },
  routeAddress: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },

  // Footer
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  vehicleType: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  bottomPadding: {
    height: spacing.xxl,
  },
});

export default OrderHistoryScreen;