import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import AuthNavigator from '../src/navigation/AuthNavigator';
import DriverNavigator from '../src/navigation/DriverNavigator';

function AppNavigator() {
  const { user, profile, loading, needsRoleSelection } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  // Not logged in - show auth screens
  if (!user) {
    return <AuthNavigator />;
  }

  // Logged in but needs role selection
  if (needsRoleSelection) {
    return <AuthNavigator />;
  }

  // Logged in with role - show driver navigator
  return <DriverNavigator />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}