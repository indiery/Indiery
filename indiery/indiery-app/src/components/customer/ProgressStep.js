import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const ProgressStep = ({ title, subtitle, status, isLast = false }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'done':
        return {
          dot: { backgroundColor: colors.success },
          icon: '✓',
          title: { color: colors.textPrimary },
        };
      case 'active':
        return {
          dot: { backgroundColor: colors.primary },
          icon: '▶',
          title: { color: colors.textPrimary },
        };
      case 'pending':
      default:
        return {
          dot: { backgroundColor: '#F3F4F6' },
          icon: '○',
          title: { color: colors.textMuted },
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <View style={styles.container}>
      <View style={styles.dotContainer}>
        <View style={[styles.dot, statusStyles.dot]}>
          <Text style={styles.icon}>{statusStyles.icon}</Text>
        </View>
        {!isLast && <View style={[styles.line, status === 'done' && styles.lineDone]} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, statusStyles.title]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  dotContainer: {
    alignItems: 'center',
    width: 30,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '800',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  lineDone: {
    backgroundColor: colors.success,
  },
  content: {
    flex: 1,
    paddingTop: 5,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default ProgressStep;