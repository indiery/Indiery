import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { auth, signInWithApple, signInWithGoogle, signInWithPhoneNumber } from '../../services/firebase';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const { login } = useAuth();

  const sendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // Format phone number (add +91 for India)
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      // React Native Firebase handles phone auth automatically (no recaptcha needed)
      const confirmation = await signInWithPhoneNumber(formattedPhone);
      
      // Navigate to OTP screen with confirmation and whatsapp preference
      navigation.navigate('OTP', { confirmation, phone: formattedPhone, whatsappOptIn });
    } catch (error) {
      console.error('OTP Error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      // Get ID token and send to backend
      const idToken = await result.user.getIdToken();
      const response = await login(idToken, { whatsappOptIn });
      
      // Check if user needs to select role
      if (response.needsRoleSelection) {
        navigation.replace('RoleSelect');
      }
      // Otherwise, AppNavigator will automatically navigate based on profile.role
      // No manual navigation needed - the useEffect in AuthContext will update profile
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
      const response = await login(idToken, { whatsappOptIn });
      
      // Check if user needs to select role
      if (response.needsRoleSelection) {
        navigation.replace('RoleSelect');
      }
      // Otherwise, AppNavigator will automatically navigate based on profile.role
    } catch (error) {
      console.error('Apple Sign-In Error:', error);
      Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Indiery</Text>
      <Text style={styles.subtitle}>Login to continue</Text>
      
      {/* Recaptcha container - required for phone auth */}
      <View id="recaptcha-container" style={{ position: 'absolute', opacity: 0 }} />
      
      {/* Social Login Buttons */}
      <TouchableOpacity
        style={[styles.socialButton, styles.googleButton]}
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        <Text style={styles.socialIcon}>G</Text>
        <Text style={styles.socialButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.socialButton, styles.appleButton]}
        onPress={handleAppleSignIn}
        disabled={loading}
      >
        <Text style={styles.socialIcon}>🍎</Text>
        <Text style={styles.socialButtonText}>Continue with Apple</Text>
      </TouchableOpacity>
      
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>
      
      {/* Phone Login */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={10}
        placeholderTextColor="#999"
      />
      
      <Button
        title={loading ? 'Sending...' : 'Send OTP'}
        onPress={sendOTP}
        disabled={loading}
      />

      {/* WhatsApp Opt-in */}
      <TouchableOpacity
        style={styles.whatsappContainer}
        onPress={() => setWhatsappOptIn(!whatsappOptIn)}
      >
        <View style={[styles.checkbox, whatsappOptIn && styles.checkboxChecked]}>
          {whatsappOptIn && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.whatsappText}>
          Get updates on WhatsApp (promotions, offers)
        </Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 10,
    fontWeight: 'bold',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#999',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  whatsappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  whatsappText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
});

export default LoginScreen;