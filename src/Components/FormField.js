import React from 'react';
import { StyleSheet, View } from 'react-native';

import AppText from './AppText';
import { useTranslation } from '../localization/i18n';

const FormField = ({ children, error, label }) => {
  const { isRTL } = useTranslation();
  return (
    <View
      style={[
        styles.container,
        { alignItems: isRTL ? 'flex-end' : 'flex-start' },
      ]}
    >
      {label ? (
        <AppText direction={isRTL ? 'rtl' : 'ltr'} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View style={styles.control}>{children}</View>
      {error ? (
        <AppText direction={isRTL ? 'rtl' : 'ltr'} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', marginBottom: 14 },
  control: { alignSelf: 'stretch' },
  label: { color: '#263244', fontSize: 13, fontWeight: '700', marginBottom: 7 },
  error: { color: '#d93025', fontSize: 12, marginTop: 5 },
});

export default FormField;
