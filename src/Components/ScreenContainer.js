import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from '../localization/i18n';

const ScreenContainer = ({ children, style }) => {
  const { isRTL } = useTranslation();
  return (
    <View style={[styles.container, isRTL ? styles.rtl : styles.ltr, style]}>
      {children}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  ltr: { direction: 'ltr' },
  rtl: { direction: 'rtl' },
});
export default ScreenContainer;
