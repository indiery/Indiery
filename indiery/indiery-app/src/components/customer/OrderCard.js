import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';
import Pill from '../common/Pill';

const OrderCard = ({
  orderId,
  pickup,
  dropoff,
  status,
  price,
  date,
  vehicleType,
  onPress,
}) => {
  const getStatusVariant = () => {
    switch (status) {
      case 'delivered':
        return 'green';
      case 'in_transit':
      case 'in-transit':
        return 'blue';
      case 'cancelled':
        return 'red';
      case 'pending':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.top}>
        <Text style={styles.orderId}>{orderId}</Text>
        <Pill label={status.replace('_', ' ')} variant={getStatusVariant()} size="small" />
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <View style={styles.routeText}>
            <Text style={styles.routeMain}>{pickup}</Text>
            <Text style={styles.routeSub}>Pickup</Text>
          </View>
        </View>
        
        <View style={styles.routeLine} />
        
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <View style={styles.routeText}>
            <Text style={styles.routeMain}>{dropoff}</Text>
            <Text style={styles.routeSub}>Drop-off</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.tags}>
          <Pill label={vehicleType} variant="blue" size="small" />
          <Pill label={date} variant="gray" size="small" />
        </View>
        <Text style={styles.price}>{price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderId: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  routeContainer: {
    marginBottom: spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  routeText: {
    flex: 1,
  },
  routeMain: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  routeSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});

export default OrderCard;