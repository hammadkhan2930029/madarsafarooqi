import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Text from '../../Components/AppText';
import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import KeyboardAwareScrollView from '../../Components/KeyboardAwareScrollView';
import Header from '../../Components/Header';
import LanguageSelector from '../../Components/LanguageSelector';
import { useAuth } from '../../context/AuthContext';
import { useConfirmLogout } from '../../hooks/useConfirmLogout';
import { useTranslation } from '../../localization/i18n';
import { translateApiError } from '../../api/errors';
import { validatePassword } from '../../Utils/validationSchemas';

const SettingsScreen = ({ onBack }) => {
  const { t } = useTranslation();
  const { changePassword } = useAuth();
  const confirmLogout = useConfirmLogout();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submitPassword = async () => {
    const validationError =
      validatePassword(currentPassword) || validatePassword(newPassword);
    if (validationError)
      return Alert.alert(t('auth.passwordChangeFailed'), t(validationError));
    if (currentPassword === newPassword)
      return Alert.alert(
        t('auth.passwordChangeFailed'),
        t('auth.passwordDifferent'),
      );
    if (newPassword !== confirmPassword)
      return Alert.alert(
        t('auth.passwordChangeFailed'),
        t('validation.passwordMismatch'),
      );
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert(t('auth.passwordChanged'), t('auth.passwordChangedMessage'));
    } catch (error) {
      Alert.alert(t('auth.passwordChangeFailed'), translateApiError(t, error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={t('settings.title')} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <Text style={styles.heading}>{t('settings.language')}</Text>
          <Text style={styles.help}>{t('settings.languageHelp')}</Text>
          <LanguageSelector />
        </View>
        <View style={styles.panel}>
          <Text style={styles.heading}>{t('auth.changePassword')}</Text>
          <CustomInput
            autoCapitalize="none"
            label={t('common.currentPassword')}
            onChangeText={setCurrentPassword}
            secureTextEntry
            value={currentPassword}
          />
          <CustomInput
            autoCapitalize="none"
            label={t('common.newPassword')}
            onChangeText={setNewPassword}
            placeholder={t('auth.minimumPassword')}
            secureTextEntry
            value={newPassword}
          />
          <CustomInput
            autoCapitalize="none"
            label={t('common.confirmPassword')}
            onChangeText={setConfirmPassword}
            secureTextEntry
            value={confirmPassword}
          />
          <CustomButton
            loading={loading}
            onPress={submitPassword}
            title={t('auth.changePassword')}
          />
        </View>
        <View style={styles.panel}>
          <Text style={styles.heading}>{t('settings.appInformation')}</Text>
          <Text style={styles.appName}>{t('common.appName')}</Text>
          <Text style={styles.help}>{t('settings.appDescription')}</Text>
          <Text style={styles.help}>
            {t('settings.version', { version: '0.0.1' })}
          </Text>
        </View>
        <CustomButton
          onPress={confirmLogout}
          title={t('common.logout')}
          variant="secondary"
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  appName: {
    color: '#142033',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  container: { backgroundColor: '#fff', flex: 1 },
  content: { padding: 20, paddingBottom: 96 },
  heading: {
    color: '#142033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  help: { color: '#687386', lineHeight: 20, marginBottom: 8 },
  panel: {
    backgroundColor: '#f8fafc',
    borderColor: '#dfe7f0',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
  },
});
export default SettingsScreen;
