import { NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useAuth } from '../context/AuthContext';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationIndependentTree>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Customer" component={CustomerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
};

export default AppNavigator;