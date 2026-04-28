import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { walletApi } from '../../api/wallet.api';
import { colors } from '../../theme/colors';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import Button from '../../components/common/Button';

const WalletScreen = ({ navigation }) => {
  const [balance, setBalance] = useState(0);
  const [creditCoins, setCreditCoins] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      const response = await walletApi.getWallet();
      if (response.success) {
        setBalance(response.walletBalance || 0);
        setCreditCoins(response.creditCoins || 0);
        setTransactions(response.transactions || []);
      }
    } catch (error) {
      console.log('Fetch wallet error:', error);
    } finally {
      setLoading(false);
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
      'Select amount to add to wallet',
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
    } catch (_error) {
      // Demo mode - just update locally
      setBalance(prev => prev + amount);
      Alert.alert('Success', `₹${amount} added to wallet! (Demo)`);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return '💳';
      case 'refund':
        return '↩️';
      case 'order_payment':
        return '📦';
      case 'coin_used':
        return '🪙';
      case 'coin_earned':
        return '🎁';
      default:
        return '💰';
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity style={styles.historyBtn}>
          <Text style={styles.historyBtnText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>₹{balance}</Text>
          </View>
          
          <View style={styles.coinSection}>
            <View style={styles.coinInfo}>
              <Text style={styles.coinIcon}>🪙</Text>
              <View>
                <Text style={styles.coinLabel}>Credit Coins</Text>
                <Text style={styles.coinValue}>Worth ₹{creditCoins}</Text>
              </View>
            </View>
            <Text style={styles.coinAmount}>{creditCoins}</Text>
          </View>
        </View>

        {/* Add Money Button */}
        <View style={styles.addMoneySection}>
          <Button
            title="+ Add Money"
            variant="primary"
            onPress={addMoney}
            loading={loading}
            style={styles.addMoneyBtn}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Coming Soon', 'Auto-recharge feature coming soon!')}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>🔄</Text>
            </View>
            <Text style={styles.quickActionText}>Auto-recharge</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Coming Soon', 'Send money feature coming soon!')}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>📤</Text>
            </View>
            <Text style={styles.quickActionText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={() => Alert.alert('Coming Soon', 'Transactions history coming soon!')}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>📊</Text>
            </View>
            <Text style={styles.quickActionText}>Report</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Add money to your wallet to get started</Text>
            </View>
          ) : (
            <View style={styles.transactionList}>
              {transactions.map((txn, index) => (
                <View key={txn._id || index} style={styles.transactionItem}>
                  <View style={styles.txnIcon}>
                    <Text style={styles.txnIconText}>{getTransactionIcon(txn.type)}</Text>
                  </View>
                  <View style={styles.txnInfo}>
                    <Text style={styles.txnDescription}>{txn.description}</Text>
                    <Text style={styles.txnDate}>{formatDate(txn.createdAt)}</Text>
                  </View>
                  <Text style={[
                    styles.txnAmount,
                    txn.amount > 0 ? styles.txnAmountPositive : styles.txnAmountNegative
                  ]}>
                    {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How Credit Coins Work</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Credit coins are earned from refunds</Text>
            <Text style={styles.infoItem}>• 1 coin = ₹1 discount</Text>
            <Text style={styles.infoItem}>• Can be used on checkout</Text>
            <Text style={styles.infoItem}>• Never expire - use anytime</Text>
            <Text style={styles.infoItem}>• Earn 10 coins for every referral</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  historyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.lg,
  },
  historyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  balanceHeader: {
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
  },
  coinSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  coinLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  coinValue: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  coinAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.warning,
  },

  // Add Money
  addMoneySection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  addMoneyBtn: {
    backgroundColor: colors.primary,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionIconText: {
    fontSize: 20,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Transactions
  transactionsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  transactionList: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  txnIconText: {
    fontSize: 18,
  },
  txnInfo: {
    flex: 1,
  },
  txnDescription: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  txnDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txnAmountPositive: {
    color: colors.success,
  },
  txnAmountNegative: {
    color: colors.textPrimary,
  },

  // Empty State
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // Info Card
  infoCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoList: {
    gap: spacing.sm,
  },
  infoItem: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  bottomPadding: {
    height: spacing.xxl,
  },
});

export default WalletScreen;