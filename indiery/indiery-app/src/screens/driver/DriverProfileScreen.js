import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { driverApi } from '../../api/driver.api';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';
import Pill from '../../components/common/Pill';

const DriverProfileScreen = ({ navigation }) => {
  const { user, profile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    emergencyContact: profile?.emergencyContact || '',
    vehicleNumber: profile?.vehicleNumber || '',
    vehicleModel: profile?.vehicleModel || ''
  });
  const [driverStats, setDriverStats] = useState({ rating: 0, trips: 0, earnings: 0 });

  const driverColor = colors.role.driver.primary;

  useEffect(() => {
    const fetchDriverStats = async () => {
      try {
        const [profileRes, earningsRes] = await Promise.all([
          driverApi.getProfile(),
          driverApi.getEarnings()
        ]);
        if (profileRes.success) {
          setDriverStats({
            rating: profileRes.driver?.rating || 0,
            trips: profileRes.driver?.totalTrips || 0,
            earnings: earningsRes.success ? earningsRes.totalEarnings || 0 : 0
          });
        }
      } catch (error) {
        console.log('Fetch driver stats error:', error);
      }
    };
    fetchDriverStats();
  }, []);

  const handleSave = async () => {
    try {
      await driverApi.updateProfile(formData);
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' }
      ]
    );
  };

  const menuItems = [
    { icon: '👤', label: 'Edit Profile', onPress: () => setEditing(!editing) },
    { icon: '🎓', label: 'Training', onPress: () => Alert.alert('Training', 'Coming soon') },
    { icon: '🚗', label: 'My Vehicle', onPress: () => Alert.alert('Vehicle', 'Coming soon') },
    { icon: '📄', label: 'Documents', onPress: () => navigation.navigate('Documents') },
    { icon: '💰', label: 'Earnings', onPress: () => navigation.navigate('Earnings') },
    { icon: '🔔', label: 'Notifications', onPress: () => Alert.alert('Notifications', 'Coming soon') },
    { icon: '❓', label: 'Help & Support', onPress: () => Alert.alert('Support', 'Contact: support@indiery.com') },
    { icon: '📋', label: 'Terms & Conditions', onPress: () => Alert.alert('Terms', 'Coming soon') },
    { icon: '🔒', label: 'Privacy Policy', onPress: () => Alert.alert('Privacy', 'Coming soon') }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: driverColor }]}>
        <View style={styles.avatarContainer}>
          {profile?.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatar}>
              {profile?.name?.charAt(0)?.toUpperCase() || 'D'}
            </Text>
          )}
        </View>
        <Text style={styles.name}>{profile?.name || 'Driver Name'}</Text>
        <Text style={styles.phone}>+91 {profile?.phone || ''}</Text>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{driverStats.rating.toFixed(1)}⭐</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{driverStats.trips}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₹{driverStats.earnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
        </View>
      </View>

      {/* Edit Form */}
      {editing && (
        <View style={styles.editForm}>
          <Text style={styles.editTitle}>Edit Profile</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Emergency Contact</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContact}
              onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
              placeholder="Enter emergency contact"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Vehicle Number</Text>
            <TextInput
              style={styles.input}
              value={formData.vehicleNumber}
              onChangeText={(text) => setFormData({ ...formData, vehicleNumber: text })}
              placeholder="Enter vehicle number"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Vehicle Model</Text>
            <TextInput
              style={styles.input}
              value={formData.vehicleModel}
              onChangeText={(text) => setFormData({ ...formData, vehicleModel: text })}
              placeholder="Enter vehicle model"
            />
          </View>

          <View style={styles.editButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: driverColor }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu Section */}
      <ScrollView style={styles.menuSection} contentContainerStyle={styles.menuContent}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: driverColor }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: driverColor }]}>🚪 Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: 40, paddingBottom: 24, alignItems: 'center' },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatar: { fontSize: 32, fontWeight: '800', color: '#059669' },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  name: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 2 },
  phone: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, width: '100%' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  editForm: { backgroundColor: '#F9FAFB', margin: 16, borderRadius: 16, padding: 16 },
  editTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16, color: '#374151' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  editButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelButton: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', backgroundColor: '#E5E7EB' },
  cancelButtonText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  saveButton: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  menuSection: { flex: 1 },
  menuContent: { padding: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 10 },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  menuArrow: { fontSize: 20, color: '#9CA3AF' },
  logoutButton: { borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, marginTop: 10 },
  logoutText: { fontSize: 14, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 20, marginBottom: 30 },
});

export default DriverProfileScreen;