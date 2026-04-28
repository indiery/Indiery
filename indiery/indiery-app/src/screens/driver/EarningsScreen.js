import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getEarnings } from '../../api/driver.api';
import colors from '../../theme/colors';
import Pill from '../../components/common/Pill';

const EarningsScreen = ({ navigation }) => {
  const [earnings, setEarnings] = useState({
    today: 842,
    week: 4820,
    month: 18560,
    total: 0
  });
  const [transactions, setTransactions] = useState([
    { _id: '1', orderId: 'IND-1042', amount: '156', status: 'Completed', createdAt: new Date() },
    { _id: '2', orderId: 'IND-1041', amount: '89', status: 'Completed', createdAt: new Date(Date.now() - 86400000) },
    { _id: '3', orderId: 'IND-1040', amount: '234', status: 'Completed', createdAt: new Date(Date.now() - 172800000) },
    { _id: '4', orderId: 'IND-1039', amount: '112', status: 'Completed', createdAt: new Date(Date.now() - 259200000) },
    { _id: '5', orderId: 'IND-1038', amount: '78', status: 'Completed', createdAt: new Date(Date.now() - 345600000) },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const driverColor = colors.role.driver.primary;

  // Weekly bar chart data
  const weeklyData = [
    { day: 'Mon', amount: 720 },
    { day: 'Tue', amount: 540 },
    { day: 'Wed', amount: 890 },
    { day: 'Thu', amount: 680 },
    { day: 'Fri', amount: 1020 },
    { day: 'Sat', amount: 580 },
    { day: 'Sun', amount: 390 },
  ];

  const fetchEarnings = async () => {
    try {
      const data = await getEarnings(selectedPeriod);
      setEarnings(data.summary);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.log('Fetch earnings error:', error);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [selectedPeriod]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  const getPeriodEarnings = () => {
    switch (selectedPeriod) {
      case 'today': return earnings.today;
      case 'week': return earnings.week;
      case 'month': return earnings.month;
      default: return earnings.week;
    }
  };

  const maxAmount = Math.max(...weeklyData.map(d => d.amount));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: driverColor }]}>
        <Text style={styles.headerTitle}>Earnings</Text>
        <Text style={styles.headerSub}>Track your income</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Main Earnings Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainLabel}>
            {selectedPeriod === 'today' ? "Today's" : selectedPeriod === 'week' ? 'This Week' : 'This Month'}
          </Text>
          <Text style={[styles.mainAmount, { color: driverColor }]}>₹{getPeriodEarnings().toLocaleString()}</Text>
          
          {/* Period Tabs */}
          <View style={styles.periodTabs}>
            {['today', 'week', 'month'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.periodTab, selectedPeriod === period && { backgroundColor: driverColor }]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[styles.periodTabText, selectedPeriod === period && { color: '#fff' }]}>
                  {period === 'today' ? 'Today' : period === 'week' ? 'Week' : 'Month'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekly Bar Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Overview</Text>
          <View style={styles.barChart}>
            {weeklyData.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <Text style={styles.barValue}>₹{item.amount}</Text>
                <View style={[styles.bar, { height: (item.amount / maxAmount) * 80, backgroundColor: index === 5 ? driverColor : '#E5E7EB' }]} />
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today</Text>
            <Text style={[styles.statValue, { color: driverColor }]}>₹{earnings.today}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={[styles.statValue, { color: driverColor }]}>₹{earnings.month.toLocaleString()}</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.transSection}>
          <Text style={styles.transTitle}>Recent Transactions</Text>
          
          {transactions.map((item) => (
            <View key={item._id} style={styles.transItem}>
              <View style={styles.transLeft}>
                <Text style={styles.transId}>#{item.orderId}</Text>
                <Text style={styles.transDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.transRight}>
                <Text style={[styles.transAmount, { color: driverColor }]}>+₹{item.amount}</Text>
                <Pill label={item.status} variant="green" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: 40, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  content: { flex: 1, borderTopLeftRadius: 22, borderTopRightRadius: 22, marginTop: -14, backgroundColor: '#fff', paddingTop: 16 },
  mainCard: { marginHorizontal: 16, backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  mainLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  mainAmount: { fontSize: 36, fontWeight: '800', marginVertical: 8 },
  periodTabs: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 10, padding: 4, marginTop: 8 },
  periodTab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
  periodTabText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  chartCard: { marginHorizontal: 16, backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginBottom: 16 },
  chartTitle: { fontSize: 14, fontWeight: '700', marginBottom: 16 },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  barContainer: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 8, color: '#6B7280', marginBottom: 4 },
  bar: { width: 24, borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, color: '#6B7280', marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14 },
  statLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800' },
  transSection: { paddingHorizontal: 16, paddingBottom: 20 },
  transTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  transItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  transLeft: {},
  transId: { fontSize: 13, fontWeight: '700', color: '#374151' },
  transDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  transRight: { alignItems: 'flex-end' },
  transAmount: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
});

export default EarningsScreen;