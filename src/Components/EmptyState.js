import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from '../localization/i18n';
import AppText from './AppText';

const EmptyState = ({ message }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <AppText align="center" style={styles.text}>
        {message || t('emptyStates.noData')}
      </AppText>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { padding: 20 },
  text: { color: '#687386' },
});
export default EmptyState;
