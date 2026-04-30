import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import orderApi from '../../api/order.api';
import Pill from '../../components/common/Pill';
import colors from '../../theme/colors';

const DriverOrdersScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const driverColor = colors.role.driver.primary;

  const fetchOrders = async () => {
    try {
      const result = await orderApi.getAvailableOrders();
      if (result.success) {
        setOrders(result.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = selectedFilter === 'all' 
    ? orders 
    : orders.filter(o => o.goodsType?.toLowerCase() === selectedFilter);

  const filters = ['all', 'documents', 'electronics', 'food', 'medicines'];

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const result = await orderApi.acceptOrder(orderId);
      if (result.success) {
        Alert.alert('Success', 'Order accepted!', [
          { text: 'OK', onPress: () => navigation.navigate('ActiveOrder', { orderId }) }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Accept order error:', error);
      Alert.alert('Error', 'Failed to accept order. Please try again.');
    }
  };

  const renderOrderCard = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.ocTop}>
        <Text style={styles.ocId}>{item.orderId}</Text>
        <View style={[styles.priceTag, { backgroundColor: driverColor }]}>
          <Text style={styles.priceText}>₹{item.pricing?.total || item.estimatedFare}</Text>
        </View>
      </View>

      <View style={styles.routeCol}>
        <View style={[styles.rdot, { backgroundColor: driverColor }]} />
        <View style={{ paddingLeft: 8, marginBottom: 12 }}>
          <Text style={styles.rLabel}>Pickup</Text>
          <Text style={styles.rAddr}>{item.pickup?.address || item.pickup}</Text>
        </View>
        <View style={[styles.rdot, { backgroundColor: colors.success }]} />
        <View style={{ paddingLeft: 8 }}>
          <Text style={styles.rLabel}>Drop</Text>
          <Text style={styles.rAddr}>{item.drop?.address || item.drop}</Text>
        </View>
      </View>

      <View style={styles.ocMid}>
        <Pill label={`${item.distanceKm || 0}km`} variant="green" />
        <Pill label={`${item.estimatedDurationMin || 0} min`} variant="blue" />
        <Pill label={item.goodsType || 'Other'} variant="purple" />
        <Pill label={`${item.weight || 0}kg`} variant="orange" />
      </View>

      <TouchableOpacity 
        style={[styles.acceptBtn, { backgroundColor: driverColor }]}
        onPress={() => handleAcceptOrder(item.orderId)}
      >
        <Text style={styles.acceptBtnText}>Accept Order</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: driverColor }]}>
        <Text style={styles.headerTitle}>Available Orders</Text>
        <Text style={styles.headerSub}>{filteredOrders.length} orders nearby</Text>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, selectedFilter === filter && { backgroundColor: driverColor }]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterText, selectedFilter === filter && { color: '#fff' }]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No orders available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: 40, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  filterScroll: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8 },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  listContent: { padding: 16 },
  orderCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 12 },
  ocTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ocId: { fontSize: 13, fontWeight: '800', color: '#374151' },
  priceTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priceText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  routeCol: { position: 'relative', paddingLeft: 20, marginBottom: 12 },
  rdot: { position: 'absolute', left: 0, width: 10, height: 10, borderRadius: 5 },
  rLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 2 },
  rAddr: { fontSize: 13, fontWeight: '600', color: '#374151' },
  ocMid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  acceptBtn: { borderRadius: 12, padding: 14, alignItems: 'center' },
  acceptBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});

export default DriverOrdersScreen;