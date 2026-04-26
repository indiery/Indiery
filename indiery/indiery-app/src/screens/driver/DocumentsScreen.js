import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const DocumentsScreen = ({ navigation }) => {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState({
    license: profile?.documents?.license || null,
    licenseBack: profile?.documents?.licenseBack || null,
    rc: profile?.documents?.rc || null,
    insurance: profile?.documents?.insurance || null,
    permit: profile?.documents?.permit || null,
    aadhar: profile?.documents?.aadhar || null
  });
  const [uploading, setUploading] = useState(null);

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
        // TODO: Upload to server and update profile
        // const formData = new FormData();
        // formData.append('document', {
        //   uri: result.assets[0].uri,
        //   type: 'image/jpeg',
        //   name: `${docType}.jpg`
        // });
        // await updateProfile({ documents: { [docType]: result.assets[0].uri } });
        
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
        // TODO: Upload to server
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

  const renderDocument = (docType, label, required = false) => (
    <View style={styles.documentItem}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentLabel}>{label}</Text>
        {required && <Text style={styles.required}>*Required</Text>}
      </View>
      
      <TouchableOpacity 
        style={styles.documentUpload}
        onPress={() => showUploadOptions(docType)}
        disabled={uploading === docType}
      >
        {documents[docType] ? (
          <Image 
            source={{ uri: documents[docType] }} 
            style={styles.documentImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Text style={styles.uploadIcon}>📄</Text>
            <Text style={styles.uploadText}>
              {uploading === docType ? 'Uploading...' : 'Tap to upload'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const isAllDocumentsUploaded = () => {
    return documents.license && documents.rc && documents.insurance;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Documents</Text>
        <Text style={styles.headerSubtitle}>
          Upload your documents to start accepting orders
        </Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Verification Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>License</Text>
          <Text style={[styles.statusValue, documents.license ? styles.statusVerified : styles.statusPending]}>
            {documents.license ? '✓ Uploaded' : '⏳ Pending'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>RC Book</Text>
          <Text style={[styles.statusValue, documents.rc ? styles.statusVerified : styles.statusPending]}>
            {documents.rc ? '✓ Uploaded' : '⏳ Pending'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Insurance</Text>
          <Text style={[styles.statusValue, documents.insurance ? styles.statusVerified : styles.statusPending]}>
            {documents.insurance ? '✓ Uploaded' : '⏳ Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.documentsSection}>
        {renderDocument('license', 'Driving License', true)}
        {renderDocument('licenseBack', 'Driving License (Back)', false)}
        {renderDocument('rc', 'Vehicle RC Book', true)}
        {renderDocument('insurance', 'Vehicle Insurance', true)}
        {renderDocument('permit', 'Permit', false)}
        {renderDocument('aadhar', 'Aadhar Card', false)}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Document Guidelines</Text>
        <Text style={styles.infoText}>
          • Documents should be clear and readable{'\n'}
          • Upload original documents{'\n'}
          • File size should be under 5MB{'\n'}
          • Supported formats: JPG, PNG{'\n'}
          • All required documents must be uploaded{'\n'}
          • Verification takes 24-48 hours
        </Text>
      </View>

      {isAllDocumentsUploaded() && (
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={() => Alert.alert('Submitted', 'Documents submitted for verification')}
        >
          <Text style={styles.submitButtonText}>Submit for Verification</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusVerified: {
    color: '#4CAF50',
  },
  statusPending: {
    color: '#FF9800',
  },
  documentsSection: {
    padding: 20,
    paddingTop: 0,
  },
  documentItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  required: {
    fontSize: 12,
    color: '#f44336',
  },
  documentUpload: {
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 14,
    color: '#999',
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DocumentsScreen;