import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import authApi from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { getIdToken } from '../../services/firebase';

const RoleSelectScreen = ({ navigation }) => {
  const { profile, refreshProfile, user } = useAuth();

  const selectRole = async (role) => {
    try {
      // Get Firebase token
      const firebaseToken = await getIdToken();
      if (!firebaseToken) {
        Alert.alert('Error', 'Please login again');
        return;
      }
      
      // Update user role in backend
      await authApi.register(firebaseToken, { role });
      await refreshProfile();
      
      // Reset navigation to the appropriate navigator
      if (role === 'driver') {
        navigation.getParent().reset({
          index: 0,
          routes: [{ name: 'Driver' }],
        });
      } else {
        navigation.getParent().reset({
          index: 0,
          routes: [{ name: 'Customer' }],
        });
      }
    } catch (error) {
      console.error('Role selection error:', error);
      Alert.alert('Error', 'Failed to select role. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>
      <Text style={styles.subtitle}>Choose how you want to use Indiery</Text>
      
      <TouchableOpacity
        style={styles.roleCard}
        onPress={() => selectRole('individual')}
      >
        <Text style={styles.roleIcon}>📦</Text>
        <Text style={styles.roleTitle}>Customer</Text>
        <Text style={styles.roleDesc}>Send packages and goods</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.roleCard}
        onPress={() => selectRole('driver')}
      >
        <Text style={styles.roleIcon}>🚚</Text>
        <Text style={styles.roleTitle}>Driver</Text>
        <Text style={styles.roleDesc}>Deliver packages and earn</Text>
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
  roleIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roleDesc: {
    fontSize: 14,
    color: '#666',
  },
});

export default RoleSelectScreen;