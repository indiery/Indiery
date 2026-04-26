import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TRAINING_MODULES = [
  {
    id: 1,
    title: 'Getting Started',
    icon: '🚀',
    content: `Welcome to Indiery! Here's how to start earning:

1. Complete your profile with valid documents
2. Go online to start receiving orders
3. Accept nearby delivery requests
4. Pick up and deliver packages safely
5. Get paid directly to your wallet

Tips:
• Keep your phone charged
• Maintain a professional attitude
• Follow traffic rules always`,
  },
  {
    id: 2,
    title: 'Pickup & Delivery',
    icon: '📦',
    content: `Picking Up:
• Reach pickup location on time
• Verify the package details
• Check package condition
• Ask for OTP from sender
• Take photo of package

Delivering:
• Handle package with care
• Navigate to drop location
• Verify recipient identity
• Get OTP/confirmation
• Take delivery photo (POD)

Important: Always verify OTP before handing over the package!`,
  },
  {
    id: 3,
    title: 'Safety Guidelines',
    icon: '🛡️',
    content: `Your Safety Matters:

🚗 Vehicle Safety
• Check vehicle before starting
• Follow traffic rules
• Don't use phone while driving
• Wear helmet (two-wheelers)

📦 Package Safety
• Don't accept suspicious items
• Report illegal contents immediately
• Keep packages secure
• Don't open sealed packages

🆘 Emergency
• In case of accident, call 100
• Report emergencies to support
• Keep emergency contacts handy`,
  },
  {
    id: 4,
    title: 'Earnings & Commission',
    icon: '💰',
    content: `How You Earn:

💵 Fare Structure:
• 80% of fare goes to you
• 15% goes to Indiery platform
• 5% reserved as performance bonus

📈 Maximize Earnings:
• Accept orders in your area
• Maintain high rating (4.5+)
• Complete orders on time
• Get bonus for on-time delivery
• Zero cancellation rate

💳 Payouts:
• Instant wallet transfer
• Daily/weekly payout options
• Track earnings in app`,
  },
  {
    id: 5,
    title: 'Customer Service',
    icon: '👤',
    content: `Best Practices:

📞 Communication:
• Be polite and professional
• Call customers when needed
• Update on delivery status
• Handle complaints calmly

🤝 Problem Solving:
• Package damaged? Report immediately
• Can't find location? Use maps
• Customer unavailable? Wait 5-10 min
• Address wrong? Contact support

⭐ Ratings:
• Good service = 5 stars
• Communication matters
• Keep customers informed
• Professional behavior = more orders`,
  },
  {
    id: 6,
    title: 'App Features',
    icon: '📱',
    content: `Key Features:

🗺️ Navigation
• Built-in GPS tracking
• Real-time location sharing
• Best route suggestions

📊 Dashboard
• Today's earnings
• Weekly/monthly stats
• Order history
• Performance score

💳 Wallet
• Instant payouts
• Transaction history
• Add/withdraw money
• View commission details

🔔 Notifications
• New order alerts
• Status updates
• Promotional offers`,
  },
];

const DriverTrainingScreen = ({ navigation }) => {
  const [expandedModule, setExpandedModule] = useState(null);
  const [completedModules, setCompletedModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(0);

  const toggleModule = (id) => {
    setExpandedModule(expandedModule === id ? null : id);
  };

  const markComplete = (id) => {
    if (!completedModules.includes(id)) {
      setCompletedModules([...completedModules, id]);
    }
    setExpandedModule(null);
  };

  const nextModule = () => {
    if (currentModule < TRAINING_MODULES.length - 1) {
      setCurrentModule(currentModule + 1);
      setExpandedModule(TRAINING_MODULES[currentModule + 1].id);
    } else {
      Alert.alert(
        '🎉 Training Complete!',
        'Congratulations! You have completed all training modules. You are ready to start delivering!',
        [{ text: 'Great!', onPress: () => navigation.goBack() }]
      );
    }
  };

  const progress = (completedModules.length / TRAINING_MODULES.length) * 100;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Training</Text>
        <Text style={styles.headerSubtitle}>Learn how to deliver with Indiery</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedModules.length}/{TRAINING_MODULES.length} Completed
          </Text>
        </View>
      </View>

      {/* Quick Start */}
      <View style={styles.quickStart}>
        <Text style={styles.sectionTitle}>Quick Start Guide</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Complete your profile</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Go online</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Accept orders</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>Deliver & earn</Text>
          </View>
        </View>
      </View>

      {/* Training Modules */}
      <View style={styles.modulesSection}>
        <Text style={styles.sectionTitle}>Training Modules</Text>
        
        {TRAINING_MODULES.map((module, index) => (
          <View key={module.id} style={styles.moduleCard}>
            <TouchableOpacity 
              style={styles.moduleHeader}
              onPress={() => toggleModule(module.id)}
            >
              <View style={styles.moduleIcon}>
                <Text>{module.icon}</Text>
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleSubtitle}>
                  Module {index + 1} of {TRAINING_MODULES.length}
                </Text>
              </View>
              {completedModules.includes(module.id) ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={styles.expandIcon}>
                  {expandedModule === module.id ? '▲' : '▼'}
                </Text>
              )}
            </TouchableOpacity>
            
            {expandedModule === module.id && (
              <View style={styles.moduleContent}>
                <Text style={styles.moduleText}>{module.content}</Text>
                <TouchableOpacity 
                  style={styles.completeButton}
                  onPress={() => markComplete(module.id)}
                >
                  <Text style={styles.completeButtonText}>Mark as Complete ✓</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Video Tutorial */}
      <View style={styles.videoSection}>
        <Text style={styles.sectionTitle}>Video Tutorials</Text>
        <TouchableOpacity 
          style={styles.videoCard}
          onPress={() => Alert.alert('Coming Soon', 'Video tutorials will be available soon!')}
        >
          <Text style={styles.videoIcon}>🎥</Text>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>How to Use the App</Text>
            <Text style={styles.videoDuration}>2:30 min</Text>
          </View>
          <Text style={styles.playButton}>▶</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.videoCard}
          onPress={() => Alert.alert('Coming Soon', 'Video tutorials will be available soon!')}
        >
          <Text style={styles.videoIcon}>🎥</Text>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>Delivery Best Practices</Text>
            <Text style={styles.videoDuration}>5:00 min</Text>
          </View>
          <Text style={styles.playButton}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Help & Support */}
      <View style={styles.helpSection}>
        <Text style={styles.sectionTitle}>Need Help?</Text>
        <View style={styles.helpButtons}>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => Linking.openURL('tel:18001234567')}
          >
            <Text style={styles.helpIcon}>📞</Text>
            <Text style={styles.helpText}>Call Support</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => Alert.alert('Chat', 'Chat support coming soon!')}
          >
            <Text style={styles.helpIcon}>💬</Text>
            <Text style={styles.helpText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => Alert.alert('FAQ', 'FAQ section coming soon!')}
          >
            <Text style={styles.helpIcon}>❓</Text>
            <Text style={styles.helpText}>FAQ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Continue Button */}
      {currentModule < TRAINING_MODULES.length && (
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={nextModule}
        >
          <Text style={styles.continueButtonText}>
            Continue to Next Module →
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By completing training, you agree to follow Indiery's terms and conditions.
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
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  progressContainer: {
    marginTop: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  quickStart: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  modulesSection: {
    padding: 20,
  },
  moduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  moduleIcon: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  moduleSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  expandIcon: {
    fontSize: 14,
    color: '#999',
  },
  moduleContent: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  moduleText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  videoSection: {
    padding: 20,
    paddingTop: 0,
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  videoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  videoDuration: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  playButton: {
    fontSize: 20,
    color: '#4CAF50',
  },
  helpSection: {
    padding: 20,
    paddingTop: 0,
  },
  helpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  helpButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    width: '30%',
  },
  helpIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
  },
  continueButton: {
    backgroundColor: '#2196F3',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
});

export default DriverTrainingScreen;