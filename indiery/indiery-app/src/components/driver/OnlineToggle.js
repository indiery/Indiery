import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../theme/colors';

const OnlineToggle = ({ isOnline, onToggle }) => {
  const driverColor = colors.role.driver.primary;
  const driverLight = colors.role.driver.primaryLight;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggle,
          {
            borderColor: isOnline ? driverColor : '#E5E7EB',
            backgroundColor: isOnline ? driverLight : '#F9FAFB',
          },
        ]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.toggleText,
            { color: isOnline ? driverColor : '#9CA3AF' },
          ]}
        >
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.hint}>
        {isOnline ? 'Receiving orders now' : 'Tap to go online'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  toggle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
});

export default OnlineToggle;