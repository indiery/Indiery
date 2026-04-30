import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';

const EarningCard = ({ label, value, variant = 'default' }) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successLight, text: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: '#92400E' };
      case 'primary':
        return { bg: colors.role.driver.primaryLight, text: colors.role.driver.primary };
      default:
        return { bg: colors.role.driver.primaryLight, text: colors.role.driver.primary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <Text style={[styles.value, { color: text }]}>{value}</Text>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    opacity: 0.7,
  },
});

export default EarningCard;