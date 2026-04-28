import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

const VehicleSelector = ({ selectedVehicle, onSelect }) => {
  const vehicles = [
    { id: 'bike', code: 'bike', icon: '🛵', name: 'Bike', capacity: 'Up to 20kg', price: '₹40 base' },
    { id: 'mini500', code: 'mini_truck_500', icon: '🚐', name: 'Mini 500kg', capacity: 'Up to 500kg', price: '₹200 base' },
    { id: 'mini750', code: 'mini_truck_750', icon: '🚚', name: 'Mini 750kg', capacity: 'Up to 750kg', price: '₹300 base' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Vehicle</Text>
      <View style={styles.vehicleRow}>
        {vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={[
              styles.vehicleChip,
              selectedVehicle?.id === vehicle.id && styles.selectedChip,
            ]}
            onPress={() => onSelect(vehicle)}
            activeOpacity={0.7}
          >
            <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
            <Text style={[
              styles.vehicleName,
              selectedVehicle?.id === vehicle.id && styles.selectedText,
            ]}>
              {vehicle.name}
            </Text>
            <Text style={styles.vehicleCapacity}>{vehicle.capacity}</Text>
            <Text style={[
              styles.vehiclePrice,
              selectedVehicle?.id === vehicle.id && styles.selectedPrice,
            ]}>
              {vehicle.price}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  vehicleChip: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  selectedChip: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  vehicleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  selectedText: {
    color: colors.primary,
  },
  vehicleCapacity: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  vehiclePrice: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    marginTop: 2,
  },
  selectedPrice: {
    color: colors.primary,
  },
});

export default VehicleSelector;