import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from '../localization/i18n';
import AppButton from './AppButton';
import AppText from './AppText';

const ErrorState = ({ message, onRetry }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <AppText align="center" style={styles.text}>
        {message || t('errors.generic')}
      </AppText>
      {onRetry ? (
        <AppButton
          onPress={onRetry}
          title={t('common.retry')}
          variant="secondary"
        />
      ) : null}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { padding: 20 },
  text: { color: '#b3261e' },
});
export default ErrorState;
