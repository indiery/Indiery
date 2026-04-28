import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, success, danger
  size = 'medium', // small, medium, large
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.white },
        };
      case 'secondary':
        return {
          container: { backgroundColor: colors.primaryLight },
          text: { color: colors.primary },
        };
      case 'outline':
        return {
          container: { 
            backgroundColor: colors.background, 
            borderWidth: 1.5, 
            borderColor: colors.border 
          },
          text: { color: colors.textSecondary },
        };
      case 'success':
        return {
          container: { backgroundColor: colors.success },
          text: { color: colors.white },
        };
      case 'danger':
        return {
          container: { backgroundColor: colors.error },
          text: { color: colors.white },
        };
      case 'warning':
        return {
          container: { backgroundColor: colors.warningLight },
          text: { color: '#92400E' },
        };
      default:
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.white },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { paddingVertical: 8, paddingHorizontal: 12 },
          text: { fontSize: 12 },
        };
      case 'large':
        return {
          container: { paddingVertical: 16, paddingHorizontal: 24 },
          text: { fontSize: 16 },
        };
      default:
        return {
          container: { paddingVertical: 12, paddingHorizontal: 16 },
          text: { fontSize: 14 },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Text style={[styles.icon, { marginRight: 6 }]}>{icon}</Text>
          )}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Text style={[styles.icon, { marginLeft: 6 }]}>{icon}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
  icon: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;