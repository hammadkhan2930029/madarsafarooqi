import React, { createContext, useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import AppButton from './AppButton';
import AppText from './AppText';
import LoadingOverlay from './LoadingOverlay';
import {
  registerActivityListener,
  registerConfirmationListener,
  registerToastListener,
  showToast,
} from '../Utils/uiFeedback';
import { useTranslation } from '../localization/i18n';
import colors from '../theme/colors';

export const ToastContext = createContext({ showToast });
const ToastProvider = ({ children }) => {
  const { isRTL, t } = useTranslation();
  const [toast, setToast] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [requests, setRequests] = useState(0);
  useEffect(() => registerActivityListener(setRequests), []);
  useEffect(() => registerToastListener(value => setToast(value)), []);
  useEffect(
    () => registerConfirmationListener(value => setConfirmation(value)),
    [],
  );
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  const value = useMemo(() => ({ showToast }), []);
  const runButton = button => {
    setConfirmation(null);
    button?.onPress?.();
  };
  const alignment = isRTL ? styles.alignRight : styles.alignLeft;
  return (
    <ToastContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {toast ? (
          <TouchableOpacity
            accessibilityRole="alert"
            onPress={() => setToast(null)}
            style={[styles.toast, styles[toast.type] || styles.info]}
          >
            <AppText style={[styles.title, alignment]}>{toast.title}</AppText>
            {toast.message ? (
              <AppText style={[styles.message, alignment]}>
                {toast.message}
              </AppText>
            ) : null}
          </TouchableOpacity>
        ) : null}
        <Modal
          animationType="fade"
          onRequestClose={() => setConfirmation(null)}
          transparent
          visible={Boolean(confirmation)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <AppText style={[styles.modalTitle, alignment]}>
                {confirmation?.title}
              </AppText>
              <AppText style={[styles.modalMessage, alignment]}>
                {confirmation?.message}
              </AppText>
              {confirmation?.buttons
                ?.filter(button => button.style !== 'cancel')
                .map((button, index) => (
                  <AppButton
                    key={`${button.text}-${index}`}
                    onPress={() => runButton(button)}
                    title={button.text || t('dialogs.confirm')}
                  />
                ))}
              {confirmation?.buttons
                ?.filter(button => button.style === 'cancel')
                .map((button, index) => (
                  <AppButton
                    key={`${button.text}-${index}`}
                    onPress={() => runButton(button)}
                    title={button.text || t('common.cancel')}
                    variant="secondary"
                  />
                ))}
            </View>
          </View>
        </Modal>
        <LoadingOverlay visible={requests > 0} />
      </View>
    </ToastContext.Provider>
  );
};
const styles = StyleSheet.create({
  root: { flex: 1 },
  toast: {
    borderLeftWidth: 5,
    borderRadius: 8,
    elevation: 8,
    left: 16,
    padding: 14,
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1000,
  },
  success: { backgroundColor: '#e9f7ee', borderLeftColor: '#137333' },
  error: { backgroundColor: '#fff0ef', borderLeftColor: '#b3261e' },
  info: {
    backgroundColor: colors.emeraldLight,
    borderLeftColor: colors.emerald,
  },
  title: { color: '#142033', fontWeight: '900' },
  message: { color: '#4f5d73', marginTop: 3 },
  alignLeft: { textAlign: 'left' },
  alignRight: { textAlign: 'right' },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(20,32,51,0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxWidth: 480,
    padding: 20,
    width: '100%',
  },
  modalTitle: { color: '#142033', fontSize: 18, fontWeight: '900' },
  modalMessage: {
    color: '#4f5d73',
    lineHeight: 22,
    marginBottom: 14,
    marginTop: 8,
  },
});
export default ToastProvider;
