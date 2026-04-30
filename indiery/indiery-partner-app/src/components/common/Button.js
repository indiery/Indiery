import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: colors.secondary, textColor: colors.white };
      case 'outline':
        return { backgroundColor: 'transparent', textColor: colors.primary, borderColor: colors.primary, borderWidth: 1.5 };
      case 'ghost':
        return { backgroundColor: 'transparent', textColor: colors.primary };
      default:
        return { backgroundColor: colors.primary, textColor: colors.white };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: 12 };
      case 'large':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, fontSize: 16 };
      default:
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, fontSize: 14 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: variantStyles.backgroundColor },
        variantStyles.borderWidth && { borderWidth: variantStyles.borderWidth, borderColor: variantStyles.borderColor },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} size="small" />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text
            style={[
              styles.text,
              { color: variantStyles.textColor, fontSize: sizeStyles.fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  icon: {
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;