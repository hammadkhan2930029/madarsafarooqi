import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import AppText from './AppText';
import colors from '../theme/colors';
import { useTranslation } from '../localization/i18n';

const LoadingOverlay = ({ visible }) => {
  const { t } = useTranslation();
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View pointerEvents="auto" style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator color={colors.emerald} size="large" />
          <AppText style={styles.text}>{t('common.loading')}</AppText>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(20,32,51,0.2)',
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    minWidth: 130,
    padding: 20,
  },
  text: { color: '#4f5d73', fontWeight: '700', marginTop: 10 },
});
export default LoadingOverlay;
