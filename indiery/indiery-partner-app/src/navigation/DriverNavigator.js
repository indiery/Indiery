import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import ActiveOrderScreen from '../screens/driver/ActiveOrderScreen';
import DocumentsScreen from '../screens/driver/DocumentsScreen';
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import DriverOrdersScreen from '../screens/driver/DriverOrdersScreen';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';
import DriverTrainingScreen from '../screens/driver/DriverTrainingScreen';
import EarningsScreen from '../screens/driver/EarningsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const driverColor = '#059669';

const TabIcon = ({ icon, focused }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
  </View>
);

const DriverStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Home" component={DriverHomeScreen} />
    <Stack.Screen name="ActiveOrder" component={ActiveOrderScreen} />
    <Stack.Screen name="Earnings" component={EarningsScreen} />
    <Stack.Screen name="Documents" component={DocumentsScreen} />
    <Stack.Screen name="Profile" component={DriverProfileScreen} />
    <Stack.Screen name="Training" component={DriverTrainingScreen} />
    <Stack.Screen name="Orders" component={DriverOrdersScreen} />
  </Stack.Navigator>
);

const DriverNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: driverColor,
      tabBarInactiveTintColor: '#999',
      tabBarLabelStyle: styles.tabLabel,
    }}
  >
    <Tab.Screen
      name="HomeTab"
      component={DriverStack}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Orders"
      component={DriverOrdersScreen}
      options={{
        tabBarLabel: 'Orders',
        tabBarIcon: ({ focused }) => <TabIcon icon="📦" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Earnings"
      component={EarningsScreen}
      options={{
        tabBarLabel: 'Earnings',
        tabBarIcon: ({ focused }) => <TabIcon icon="💰" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Documents"
      component={DocumentsScreen}
      options={{
        tabBarLabel: 'Documents',
        tabBarIcon: ({ focused }) => <TabIcon icon="📄" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={DriverProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 5,
    paddingBottom: 5,
    height: 60,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
});

export default DriverNavigator;