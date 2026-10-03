import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useTranslation } from '../localization/i18n';
import AppButton from './AppButton';
import AppText from './AppText';

const ConfirmationModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <AppText style={styles.title}>{title}</AppText>
          <AppText style={styles.message}>{message}</AppText>
          <AppButton
            loading={loading}
            onPress={onConfirm}
            title={t('dialogs.confirm')}
          />
          <AppButton
            onPress={onCancel}
            title={t('common.cancel')}
            variant="secondary"
          />
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,35,0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxWidth: 480,
    padding: 20,
    width: '100%',
  },
  title: { color: '#142033', fontSize: 18, fontWeight: '900' },
  message: { color: '#4f5d73', marginTop: 10 },
});
export default ConfirmationModal;
