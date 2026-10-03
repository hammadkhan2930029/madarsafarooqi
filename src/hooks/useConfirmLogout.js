import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../localization/i18n';

export const useConfirmLogout = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();
  return useCallback(
    () =>
      Alert.alert(t('dialogs.logoutTitle'), t('dialogs.logoutMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.logout'), style: 'destructive', onPress: logout },
      ]),
    [logout, t],
  );
};
