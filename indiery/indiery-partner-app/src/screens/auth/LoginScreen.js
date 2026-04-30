import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { signInWithApple, signInWithGoogle } from '../../services/firebase';

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      const response = await login(idToken);
      
      // For partner app, we expect driver role
      // If no role, they need to complete registration
      if (response.needsRoleSelection) {
        navigation.replace('RoleSelect');
      }
      // Otherwise, stay on driver dashboard
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithApple();
      const idToken = await result.user.getIdToken();
      const response = await login(idToken);
      
      if (response.needsRoleSelection) {
        navigation.replace('RoleSelect');
      }
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🚚</Text>
        <Text style={styles.title}>Indiery Partner</Text>
        <Text style={styles.subtitle}>Drive with Indiery</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonIcon}>G</Text>
          <Text style={styles.buttonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.appleButton]}
          onPress={handleAppleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonIcon}>🍎</Text>
          <Text style={styles.buttonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  buttonIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  terms: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default LoginScreen;