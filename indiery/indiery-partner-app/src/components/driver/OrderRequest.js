import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../theme/colors';
import Pill from '../common/Pill';

const OrderRequest = ({ order, onAccept, onDecline }) => {
  const driverColor = colors.role.driver.primary;
  const driverLight = colors.role.driver.primaryLight;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.orderId}>{order.orderId || '#IND-XXXX'}</Text>
        <Text style={[styles.price, { color: driverColor }]}>
          ₹{order.estimatedFare || '0'}
        </Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeDotTop} />
        <View style={styles.routeContent}>
          <Text style={styles.routeText} numberOfLines={1}>
            {order.pickup?.address || 'Pickup Location'}
          </Text>
        </View>
        <View style={styles.routePad} />
        <View style={[styles.routeDotBot, { backgroundColor: colors.success }]} />
        <View style={styles.routeContent}>
          <Text style={styles.routeText} numberOfLines={1}>
            {order.dropoff?.address || 'Drop-off Location'}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Pill label={order.distance || '0km'} variant="green" />
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.btn, styles.declineBtn]}
            onPress={onDecline}
          >
            <Text style={styles.declineText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.acceptBtn, { backgroundColor: driverColor }]}
            onPress={onAccept}
          >
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 14,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
  },
  routeContainer: {
    flexDirection: 'column',
    position: 'relative',
    paddingLeft: 18,
    marginBottom: 10,
  },
  routeDotTop: {
    position: 'absolute',
    left: 0,
    top: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.role.driver.primary,
    borderWidth: 2,
    borderColor: colors.role.driver.primaryLight,
  },
  routeDotBot: {
    position: 'absolute',
    left: 0,
    bottom: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.successLight,
  },
  routeContent: {
    paddingLeft: 4,
  },
  routeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  routePad: {
    height: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  declineBtn: {
    backgroundColor: '#FEE2E2',
  },
  acceptBtn: {},
  declineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  acceptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});

export default OrderRequest;