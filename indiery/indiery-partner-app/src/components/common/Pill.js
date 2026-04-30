import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const Pill = ({
  label,
  variant = 'default', // default, purple, green, orange, red, blue, gray
  size = 'medium', // small, medium
  icon,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'purple':
        return { backgroundColor: '#EDE9FE', color: '#6D28D9' };
      case 'green':
        return { backgroundColor: '#D1FAE5', color: '#065F46' };
      case 'orange':
        return { backgroundColor: '#FEF3C7', color: '#92400E' };
      case 'red':
        return { backgroundColor: '#FEE2E2', color: '#991B1B' };
      case 'blue':
        return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
      case 'gray':
        return { backgroundColor: '#F3F4F6', color: '#374151' };
      default:
        return { backgroundColor: colors.primaryLight, color: colors.primary };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = size === 'small' 
    ? { paddingVertical: 3, paddingHorizontal: 8, fontSize: 9 }
    : { paddingVertical: 4, paddingHorizontal: 10, fontSize: 10 };

  return (
    <View style={[styles.container, { backgroundColor: variantStyles.backgroundColor }, sizeStyles]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.text, { color: variantStyles.color }, { fontSize: sizeStyles.fontSize }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 20,
  },
  text: {
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  icon: {
    fontSize: 10,
  },
});

export default Pill;