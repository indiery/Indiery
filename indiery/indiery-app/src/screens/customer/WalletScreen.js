import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import walletApi from '../../api/wallet.api';

const WalletScreen = ({ navigation }) => {
  const [balance, setBalance] = useState(0);
  const [creditCoins, setCreditCoins] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchWallet = async () => {
    try {
      const response = await walletApi.getWallet();
      setBalance(response.data.balance || 0);
      setCreditCoins(response.data.creditCoins || 0);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.log('Fetch wallet error:', error);
      // Use demo data if API not available
      setBalance(0);
      setCreditCoins(0);
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWallet();
    setRefreshing(false);
  };

  const addMoney = () => {
    Alert.alert(
      'Add Money',
      'Enter amount to add to wallet',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '₹100', onPress: () => handleAddMoney(100) },
        { text: '₹500', onPress: () => handleAddMoney(500) },
        { text: '₹1000', onPress: () => handleAddMoney(1000) },
      ]
    );
  };

  const handleAddMoney = async (amount) => {
    setLoading(true);
    try {
      const response = await walletApi.addMoney(amount);
      setBalance(response.data.newBalance);
      Alert.alert('Success', `₹${amount} added to wallet!`);
      fetchWallet();
    } catch (error) {
      Alert.alert('Error', 'Failed to add money. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
      case 'refund':
        return '💰';
      case 'debit':
      case 'order_payment':
        return '📤';
      case 'coin_used':
        return '🪙';
      case 'coin_earned':
        return '🎁';
      default:
        return '💳';
    }
  };

  const getTransactionLabel = (type) => {
    switch (type) {
      case 'credit':
        return 'Wallet Load';
      case 'refund':
        return 'Refund';
      case 'debit':
        return 'Wallet Debit';
      case 'order_payment':
        return 'Order Payment';
      case 'coin_used':
        return 'Coins Used';
      case 'coin_earned':
        return 'Coins Earned';
      default:
        return type;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
        
        <View style={styles.coinSection}>
          <Text style={styles.coinLabel}>Credit Coins</Text>
          <Text style={styles.coinAmount}>🪙 {creditCoins}</Text>
          <Text style={styles.coinValue}>(Worth ₹{creditCoins})</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.addButton, loading && styles.addButtonDisabled]} 
        onPress={addMoney}
        disabled={loading}
      >
        <Text style={styles.addButtonText}>
          {loading ? 'Processing...' : '+ Add Money'}
        </Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Coming Soon', 'Auto-recharge feature coming soon!')}>
          <Text style={styles.quickActionIcon}>🔄</Text>
          <Text style={styles.quickActionText}>Auto-recharge</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Coming Soon', 'Send money feature coming soon!')}>
          <Text style={styles.quickActionIcon}>📤</Text>
          <Text style={styles.quickActionText}>Send Money</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Coming Soon', 'Transactions history coming soon!')}>
          <Text style={styles.quickActionIcon}>📊</Text>
          <Text style={styles.quickActionText}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Add money to your wallet to get started</Text>
          </View>
        ) : (
          transactions.map((txn, index) => (
            <View key={index} style={styles.transactionItem}>
              <View style={styles.txnIcon}>
                <Text>{getTransactionIcon(txn.type)}</Text>
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnType}>{getTransactionLabel(txn.type)}</Text>
                <Text style={styles.txnDate}>
                  {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'Today'}
                </Text>
              </View>
              <Text style={[styles.txnAmount, txn.amount > 0 ? styles.txnAmountPositive : styles.txnAmountNegative]}>
                {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount || 0)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 How Credit Coins Work</Text>
        <Text style={styles.infoText}>
          {'\u2022'} Credit coins are earned from refunds{'\n'}
          {'\u2022'} 1 coin = ₹1 discount{'\n'}
          {'\u2022'} Can be used on checkout{'\n'}
          {'\u2022'} Never expire - use anytime{'\n'}
          {'\u2022'} Earn 10 coins for every referral
        </Text>
      </View>

      <View style={styles.usageCard}>
        <Text style={styles.usageTitle}>Use Coins on Checkout</Text>
        <Text style={styles.usageText}>
          During booking, you can apply your credit coins to get instant discount on your order!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceCard: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  coinSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  coinLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  coinAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginTop: 5,
  },
  coinValue: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    width: '30%',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  transactionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txnInfo: {
    flex: 1,
  },
  txnType: {
    fontSize: 14,
    fontWeight: '500',
  },
  txnDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  txnAmountPositive: {
    color: '#4CAF50',
  },
  txnAmountNegative: {
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: '#e8f5e9',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E7D32',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  usageCard: {
    backgroundColor: '#FFF3E0',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  usageText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});

export default WalletScreen;