import React from 'react';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import AppNavigator from './src/Navigation/AppNavigator';
import { LocalizationProvider } from './src/localization/i18n';
import { AuthProvider } from './src/context/AuthContext';
import ToastProvider from './src/Components/ToastProvider';
import { routeAlert } from './src/Utils/uiFeedback';
import colors from './src/theme/colors';

Alert.alert = routeAlert;

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={colors.emeraldDeep}
        barStyle="light-content"
        translucent={false}
      />
      <LocalizationProvider fallback={<View style={styles.loading}><ActivityIndicator color={colors.emerald} size="large" /></View>}>
        <ToastProvider><AuthProvider><AppContent /></AuthProvider></ToastProvider>
      </LocalizationProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.container}>
      <AppNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: { alignItems: 'center', backgroundColor: '#fff', flex: 1, justifyContent: 'center' },
});

export default App;
