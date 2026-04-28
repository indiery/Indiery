import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

const PriceBreakdown = ({ estimate, showDetails = true }) => {
  // Use estimate from backend if available, otherwise use defaults
  const {
    basePrice = 0,
    distanceKm = 0,
    perKm = 10,
    subtotal = 0,
    gst = 0,
    total = 0,
    coinDiscount = 0,
  } = estimate || {};

  return (
    <View style={styles.container}>
      {showDetails && (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>Base Fare</Text>
            <Text style={styles.value}>₹{basePrice}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Distance ({distanceKm}km × ₹{perKm})</Text>
            <Text style={styles.value}>₹{distanceKm * perKm}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>₹{subtotal}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>GST (18%)</Text>
            <Text style={styles.value}>₹{gst}</Text>
          </View>
          {coinDiscount > 0 && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.success }]}>Indiery Coins (-{coinDiscount})</Text>
              <Text style={[styles.value, { color: colors.success }]}>-₹{coinDiscount}</Text>
            </View>
          )}
          <View style={styles.divider} />
        </>
      )}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{total}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    color: colors.primary,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(109, 40, 217, 0.2)',
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
});

export default PriceBreakdown;