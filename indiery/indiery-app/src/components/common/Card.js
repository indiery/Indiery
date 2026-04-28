import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

const Card = ({
  children,
  style,
  variant = 'default', // default, elevated, outlined
  padding = true,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          ...shadows.md,
          backgroundColor: colors.white,
        };
      case 'outlined':
        return {
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.white,
          ...shadows.sm,
        };
    }
  };

  return (
    <View
      style={[
        styles.container,
        getVariantStyles(),
        padding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  padding: {
    padding: spacing.lg,
  },
});

export default Card;