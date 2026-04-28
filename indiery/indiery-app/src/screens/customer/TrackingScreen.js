import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { orderApi } from '../../api/order.api';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import Button from '../../components/common/Button';
import ProgressStep from '../../components/customer/ProgressStep';

const TRACKING_STEPS = [
  { step: 1, title: 'Order Placed', time: '---', icon: '📝' },
  { step: 2, title: 'Driver Assigned', time: '---', icon: '👤' },
  { step: 3, title: 'Picked Up', time: '---', icon: '📦' },
  { step: 4, title: 'In Transit', time: '---', icon: '🚚' },
  { step: 5, title: 'Delivered', time: '---', icon: '✅' },
];

const TrackingScreen = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      if (orderId) {
        const response = await orderApi.getOrder(orderId);
        if (response.success) {
          setOrder(response.order);
        }
      }
    } catch (error) {
      console.log('Fetch order error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrder();
    setRefreshing(false);
  };

  const cancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await orderApi.cancelOrder(orderId, 'Customer requested cancellation');
              fetchOrder();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  // Calculate current step based on order status
  const getCurrentStep = () => {
    if (!order) return 1;
    const statusSteps = {
      'pending': 1,
      'driver_assigned': 2,
      'driver_arriving': 2,
      'arrived_pickup': 3,
      'picked_up': 3,
      'in_transit': 4,
      'arrived_drop': 4,
      'delivered': 5,
      'cancelled': 0,
    };
    return statusSteps[order.status] || 1;
  };

  const currentStep = getCurrentStep();

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Order not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerOrderId}>#{order?.orderId || 'IND-1041'}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>In Transit</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.helpBtn}>
          <Text style={styles.helpIcon}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapText}>Live Map View</Text>
          <Text style={styles.mapSubtext}>Driver is on the way</Text>
        </View>
        
        {/* ETA Card */}
        <View style={styles.etaCard}>
          <View style={styles.etaContent}>
            <Text style={styles.etaLabel}>Estimated Arrival</Text>
            <Text style={styles.etaTime}>12:30 PM</Text>
            <Text style={styles.etaDistance}>2.5 km away</Text>
          </View>
          <View style={styles.etaDivider} />
          <View style={styles.etaContent}>
            <Text style={styles.etaLabel}>Driver</Text>
            <Text style={styles.etaDriver}>{order?.driver?.name || 'Rajesh K.'}</Text>
            <Text style={styles.etaVehicle}>{order?.driver?.vehicle || 'UP 32 AB 1234'}</Text>
          </View>
        </View>
      </View>

      {/* Route Card */}
      <View style={styles.routeCard}>
        <View style={styles.routePoint}>
          <View style={styles.routeDotPrimary} />
          <View style={styles.routeContent}>
            <Text style={styles.routeLabel}>PICKUP</Text>
            <Text style={styles.routeAddress}>{order?.pickup?.address || 'Hazratganj, Lucknow'}</Text>
          </View>
          <Text style={styles.routeTime}>10:45 AM</Text>
        </View>
        
        <View style={styles.routeLine} />
        
        <View style={styles.routePoint}>
          <View style={styles.routeDotSecondary} />
          <View style={styles.routeContent}>
            <Text style={styles.routeLabel}>DROP</Text>
            <Text style={styles.routeAddress}>{order?.drop?.address || 'Gomti Nagar, Lucknow'}</Text>
          </View>
          <Text style={styles.routeTime}>---</Text>
        </View>
      </View>

      {/* Tracking Progress */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.trackingSection}>
          <Text style={styles.sectionTitle}>Delivery Progress</Text>
          
          <View style={styles.progressSteps}>
            {TRACKING_STEPS.map((item, index) => (
              <View key={item.step} style={styles.progressItem}>
                <View style={[
                  styles.progressCircle,
                  item.step < currentStep && styles.progressDone,
                  item.step === currentStep && styles.progressActive,
                ]}>
                  <Text style={styles.progressIcon}>{item.icon}</Text>
                </View>
                <View style={styles.progressContent}>
                  <Text style={[
                    styles.progressTitle,
                    item.step <= currentStep && styles.progressTitleActive,
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.progressTime}>{item.time}</Text>
                </View>
                {index < TRACKING_STEPS.length - 1 && (
                  <View style={[
                    styles.progressLineVertical,
                    item.step < currentStep && styles.progressLineDone,
                  ]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Vehicle</Text>
            <Text style={styles.detailValue}>{order?.vehicleType || 'Bike'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Goods</Text>
            <Text style={styles.detailValue}>{order?.goodsType || 'Documents'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight</Text>
            <Text style={styles.detailValue}>{order?.weight || '2kg'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={[styles.detailValue, styles.detailPrice]}>{order?.price || '₹89'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="📞 Call Driver"
            variant="primary"
            onPress={() => {}}
            style={styles.callButton}
          />
          <Button
            title="💬 Chat"
            variant="secondary"
            onPress={() => {}}
            style={styles.chatButton}
          />
        </View>

        {order?.status !== 'delivered' && order?.status !== 'cancelled' && (
          <TouchableOpacity style={styles.cancelButton} onPress={cancelOrder}>
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerOrderId: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  statusPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.lg,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  helpBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIcon: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },

  // Map
  mapContainer: {
    height: 200,
    backgroundColor: colors.primaryLight,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E0F0',
  },
  mapIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  mapText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  mapSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  etaCard: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    padding: spacing.md,
    ...shadows.lg,
  },
  etaContent: {
    flex: 1,
    alignItems: 'center',
  },
  etaDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  etaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  etaTime: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  etaDistance: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  etaDriver: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  etaVehicle: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Route Card
  routeCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDotPrimary: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    marginTop: 2,
    marginRight: spacing.md,
  },
  routeDotSecondary: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.warning,
    marginTop: 2,
    marginRight: spacing.md,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  routeTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 5,
    marginVertical: spacing.sm,
  },

  // Tracking Section
  trackingSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  progressSteps: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    zIndex: 1,
  },
  progressDone: {
    backgroundColor: colors.successLight,
  },
  progressActive: {
    backgroundColor: colors.primary,
  },
  progressIcon: {
    fontSize: 16,
  },
  progressContent: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  progressTitleActive: {
    color: colors.textPrimary,
  },
  progressTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressLineVertical: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 40,
    backgroundColor: colors.border,
  },
  progressLineDone: {
    backgroundColor: colors.success,
  },

  // Details Section
  detailsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  detailPrice: {
    color: colors.primary,
    fontWeight: '800',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  callButton: {
    flex: 1,
  },
  chatButton: {
    flex: 1,
  },

  // Cancel Button
  cancelButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
    padding: spacing.md,
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default TrackingScreen;