import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import orderApi from '../../api/order.api';

const TrackingScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [podImage, setPodImage] = useState(null);
  const [uploadingPod, setUploadingPod] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await orderApi.getOrder(orderId);
      setOrder(response.data);
      // Set existing POD if available
      if (response.data.podImage) {
        setPodImage(response.data.podImage);
      }
    } catch (error) {
      console.log('Fetch order error:', error);
    }
  };

  const fetchTracking = async () => {
    try {
      const response = await orderApi.getOrderTracking(orderId);
      setTracking(response.data);
    } catch (error) {
      console.log('Fetch tracking error:', error);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchTracking();
  }, [orderId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchOrder(), fetchTracking()]);
    setRefreshing(false);
  };

  const cancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await orderApi.cancelOrder(orderId, 'Customer requested cancellation');
              fetchOrder();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  // POD Photo Capture
  const capturePOD = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to capture proof of delivery photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPodImage(result.assets[0].uri);
    }
  };

  const uploadPOD = async () => {
    if (!podImage) {
      Alert.alert('No Photo', 'Please capture a photo first.');
      return;
    }

    setUploadingPod(true);
    try {
      // Create form data with the image
      const formData = new FormData();
      formData.append('podImage', {
        uri: podImage,
        type: 'image/jpeg',
        name: 'pod.jpg',
      });

      await orderApi.uploadPOD(orderId, formData);
      Alert.alert('Success', 'Proof of delivery uploaded!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload proof of delivery');
    } finally {
      setUploadingPod(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = {
      pending: 0,
      driver_assigned: 1,
      driver_arriving: 2,
      arrived_pickup: 3,
      picked_up: 4,
      in_transit: 5,
      arrived_drop: 6,
      delivered: 7,
    };
    return steps[status] || 0;
  };

  const statusLabels = [
    'Order Placed',
    'Driver Assigned',
    'Driver Arriving',
    'Arrived at Pickup',
    'Picked Up',
    'In Transit',
    'Arrived at Drop',
    'Delivered',
  ];

  const currentStep = order ? getStatusStep(order.status) : 0;
  const canCapturePOD = order?.status === 'arrived_drop' || order?.status === 'delivered';

  if (!order) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.orderId}>#{order.orderId}</Text>
        <Text style={styles.status}>{order.status.replace(/_/g, ' ').toUpperCase()}</Text>
      </View>

      <View style={styles.routeCard}>
        <View style={styles.routePoint}>
          <View style={styles.routeDot} />
          <View style={styles.routeContent}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeAddress}>{order.pickup?.address}</Text>
          </View>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, styles.routeDotDrop]} />
          <View style={styles.routeContent}>
            <Text style={styles.routeLabel}>Drop</Text>
            <Text style={styles.routeAddress}>{order.drop?.address}</Text>
          </View>
        </View>
      </View>

      <View style={styles.timeline}>
        <Text style={styles.sectionTitle}>Tracking</Text>
        {statusLabels.map((label, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={[styles.timelineDot, index <= currentStep && styles.timelineDotActive]} />
            <Text style={[styles.timelineLabel, index <= currentStep && styles.timelineLabelActive]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {order.driver && (
        <View style={styles.driverCard}>
          <Text style={styles.sectionTitle}>Driver Details</Text>
          <Text style={styles.driverName}>{order.driver.name}</Text>
          <Text style={styles.driverPhone}>{order.driver.phone}</Text>
          {tracking?.driverLocation && (
            <Text style={styles.driverLocation}>
              Location: {tracking.driverLocation.lat.toFixed(4)}, {tracking.driverLocation.lng.toFixed(4)}
            </Text>
          )}
        </View>
      )}

      {/* POD Section */}
      <View style={styles.podSection}>
        <Text style={styles.sectionTitle}>Proof of Delivery (POD)</Text>
        
        {podImage ? (
          <View style={styles.podPreview}>
            <Image source={{ uri: podImage }} style={styles.podImage} />
            <Text style={styles.podUploaded}>✓ Photo captured</Text>
          </View>
        ) : (
          <Text style={styles.podPlaceholder}>
            {canCapturePOD ? 'Capture a photo of the delivered package' : 'POD will be available when driver arrives at drop location'}
          </Text>
        )}

        {canCapturePOD && (
          <View style={styles.podButtons}>
            <TouchableOpacity style={styles.podButton} onPress={capturePOD}>
              <Text style={styles.podButtonText}>📷 {podImage ? 'Retake Photo' : 'Capture Photo'}</Text>
            </TouchableOpacity>
            
            {podImage && (
              <TouchableOpacity 
                style={[styles.podButton, styles.podUploadButton]} 
                onPress={uploadPOD}
                disabled={uploadingPod}
              >
                <Text style={styles.podButtonText}>
                  {uploadingPod ? 'Uploading...' : '✓ Confirm POD'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <TouchableOpacity style={styles.cancelButton} onPress={cancelOrder}>
          <Text style={styles.cancelButtonText}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
  },
  orderId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  status: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  routeCard: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 20,
    borderRadius: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginTop: 4,
    marginRight: 15,
  },
  routeDotDrop: {
    backgroundColor: '#FF5722',
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: '#ddd',
    marginLeft: 5,
    marginBottom: 10,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  routeAddress: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeline: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ddd',
    marginRight: 15,
  },
  timelineDotActive: {
    backgroundColor: '#4CAF50',
  },
  timelineLabel: {
    fontSize: 14,
    color: '#999',
  },
  timelineLabelActive: {
    color: '#333',
    fontWeight: '600',
  },
  driverCard: {
    padding: 20,
    margin: 20,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  driverPhone: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  driverLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
  cancelButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  // POD Styles
  podSection: {
    padding: 20,
    margin: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  podPreview: {
    alignItems: 'center',
    marginBottom: 15,
  },
  podImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  podUploaded: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  podPlaceholder: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  podButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  podButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  podUploadButton: {
    backgroundColor: '#2196F3',
  },
  podButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default TrackingScreen;