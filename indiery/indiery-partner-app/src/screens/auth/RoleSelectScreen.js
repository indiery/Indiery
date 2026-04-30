import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getIdToken } from '../../services/firebase';

const RoleSelectScreen = ({ navigation }) => {
  const { profile, refreshProfile, completeRegistration } = useAuth();

  const selectRole = async (role) => {
    try {
      const firebaseToken = await getIdToken();
      if (!firebaseToken) {
        Alert.alert('Error', 'Please login again');
        return;
      }
      
      await completeRegistration(firebaseToken, { role });
      await refreshProfile();
      
      // Stay on driver dashboard after role selection
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'HomeTab' }],
      });
    } catch (error) {
      console.error('Role selection error:', error);
      Alert.alert('Error', 'Failed to select role. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join as Partner</Text>
      <Text style={styles.subtitle}>Choose how you want to partner with Indiery</Text>
      
      <TouchableOpacity
        style={[styles.roleCard, styles.driverCard]}
        onPress={() => selectRole('driver')}
      >
        <Text style={styles.roleIcon}>🚚</Text>
        <Text style={styles.roleTitle}>Driver</Text>
        <Text style={styles.roleDesc}>Deliver packages and goods</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.roleCard, styles.transporterCard]}
        onPress={() => selectRole('transporter')}
      >
        <Text style={styles.roleIcon}>🚛</Text>
        <Text style={styles.roleTitle}>Transporter</Text>
        <Text style={styles.roleDesc}>Fleet management & business deliveries</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  roleCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  driverCard: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#059669',
  },
  transporterCard: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default RoleSelectScreen;