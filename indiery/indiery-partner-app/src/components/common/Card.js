import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';

const Card = ({ children, style, variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return shadows.medium;
      case 'outlined':
        return { borderWidth: 1, borderColor: colors.border };
      default:
        return shadows.small;
    }
  };

  return (
    <View style={[styles.card, getVariantStyles(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
});

export default Card;