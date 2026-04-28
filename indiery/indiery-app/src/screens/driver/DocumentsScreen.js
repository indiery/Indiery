import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import themeColors from '../../theme/colors';
import Pill from '../../components/common/Pill';

const DocumentsScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState({
    selfie: null,
    panCard: null,
    drivingLicence: null,
    rcCertificate: null,
    insurance: null,
  });
  const [uploading, setUploading] = useState(null);

  const driverColor = themeColors.role.driver.primary;

  const pickImage = async (docType) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload documents.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploading(docType);
        setDocuments(prev => ({ ...prev, [docType]: result.assets[0].uri }));
        setUploading(null);
        Alert.alert('Success', `${docType} uploaded successfully`);
      }
    } catch (_error) {
      setUploading(null);
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  const takePhoto = async (docType) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploading(docType);
        setDocuments(prev => ({ ...prev, [docType]: result.assets[0].uri }));
        setUploading(null);
        Alert.alert('Success', `${docType} uploaded successfully`);
      }
    } catch (_error) {
      setUploading(null);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const showUploadOptions = (docType) => {
    Alert.alert(
      'Upload Document',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => takePhoto(docType) },
        { text: 'Choose from Gallery', onPress: () => pickImage(docType) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const docList = [
    { key: 'selfie', label: 'Selfie', icon: '🤳', required: true },
    { key: 'panCard', label: 'PAN Card', icon: '🪪', required: true },
    { key: 'drivingLicence', label: 'Driving Licence', icon: '🚗', required: true },
    { key: 'rcCertificate', label: 'RC Certificate', icon: '📋', required: true },
    { key: 'insurance', label: 'Insurance', icon: '🛡️', required: true },
  ];

  const uploadedCount = Object.values(documents).filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: driverColor }]}>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <Text style={styles.headerSub}>Complete your profile verification</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Verification Status</Text>
            <Pill label={`${uploadedCount}/${docList.length} Uploaded`} variant={uploadedCount === docList.length ? 'green' : 'orange'} />
          </View>
          <View style={styles.statusBar}>
            <View style={[styles.statusProgress, { width: `${(uploadedCount / docList.length) * 100}%`, backgroundColor: driverColor }]} />
          </View>
          <Text style={styles.statusText}>
            {uploadedCount === docList.length ? '✅ All documents uploaded! Verification in progress.' : '📝 Please upload all required documents'}
          </Text>
        </View>

        {/* Document Upload Boxes */}
        <Text style={styles.sectionTitle}>Upload Documents</Text>
        
        {docList.map((doc) => (
          <View key={doc.key} style={styles.docBox}>
            <View style={styles.docHeader}>
              <Text style={styles.docIcon}>{doc.icon}</Text>
              <View style={styles.docInfo}>
                <Text style={styles.docLabel}>{doc.label}</Text>
                {doc.required && <Text style={styles.docRequired}>Required</Text>}
              </View>
              {documents[doc.key] ? (
                <Pill label="Uploaded" variant="green" />
              ) : (
                <Pill label="Pending" variant="gray" />
              )}
            </View>
            <TouchableOpacity 
              style={[styles.uploadBox, documents[doc.key] && styles.uploadBoxFilled]}
              onPress={() => showUploadOptions(doc.key)}
              disabled={uploading === doc.key}
            >
              {documents[doc.key] ? (
                <Image 
                  source={{ uri: documents[doc.key] }} 
                  style={styles.uploadedImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>
                    {uploading === doc.key ? 'Uploading...' : 'Tap to upload'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📌 Important Notes</Text>
          <Text style={styles.infoText}>
            • Documents should be clear and readable{'\n'}
            • File size must be less than 5MB{'\n'}
            • Supported formats: JPG, PNG{'\n'}
            • Verification takes 24-48 hours{'\n'}
            • You can start accepting orders after verification
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: driverColor }]}
          onPress={() => Alert.alert('Submitted', 'Documents submitted for verification!')}
        >
          <Text style={styles.submitBtnText}>Submit for Verification</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: 40, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  content: { flex: 1, borderTopLeftRadius: 22, borderTopRightRadius: 22, marginTop: -14, backgroundColor: '#fff', paddingTop: 16, paddingHorizontal: 16 },
  statusCard: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 20 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusTitle: { fontSize: 14, fontWeight: '700' },
  statusBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginBottom: 10, overflow: 'hidden' },
  statusProgress: { height: '100%', borderRadius: 3 },
  statusText: { fontSize: 12, color: '#6B7280' },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
  docBox: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 12 },
  docHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  docIcon: { fontSize: 24, marginRight: 10 },
  docInfo: { flex: 1 },
  docLabel: { fontSize: 14, fontWeight: '700', color: '#374151' },
  docRequired: { fontSize: 10, color: '#DC2626', marginTop: 2 },
  uploadBox: { height: 100, backgroundColor: '#fff', borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', overflow: 'hidden' },
  uploadBoxFilled: { borderColor: '#10B981', borderStyle: 'solid' },
  uploadPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  uploadIcon: { fontSize: 28, marginBottom: 4 },
  uploadText: { fontSize: 12, color: '#9CA3AF' },
  uploadedImg: { flex: 1 },
  infoCard: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 14, marginBottom: 20 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#D97706', marginBottom: 8 },
  infoText: { fontSize: 11, color: '#92400E', lineHeight: 18 },
  submitBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 30 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

export default DocumentsScreen;