import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import AppText from '../../Components/AppText';
import AnimatedEntrance from '../../Components/AnimatedEntrance';
import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import LanguageSelector from '../../Components/LanguageSelector';
import KeyboardAwareScrollView from '../../Components/KeyboardAwareScrollView';
import { useTranslation } from '../../localization/i18n';
import { useAuth } from '../../context/AuthContext';
import { translateApiError } from '../../api/errors';
import { validateLogin } from '../../Utils/validationSchemas';

const loginValues = { loginId: '', password: '' };
const navbarLogo = require('../../Assets/logos/navbarlogo.png');
const LoginScreen = () => {
  const scrollRef = useRef(null);
  const { t } = useTranslation();
  const { login } = useAuth();
  const [values, setValues] = useState(loginValues);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateValue = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const revealPassword = () => {
    // Android resizes after the keyboard opens, so scroll after that resize.
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 280);
  };

  const handleSubmit = async () => {
    const validationError = validateLogin(values);

    if (validationError) {
      setError(t(validationError));
      return;
    }

    setLoading(true);
    try {
      await login(values.loginId, values.password);
    } catch (err) {
      Alert.alert(t('auth.loginFailed'), translateApiError(t, err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      style={styles.container}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedEntrance style={styles.header}>
          <View style={styles.logoShell}>
            <Image
              resizeMode="contain"
              source={navbarLogo}
              style={styles.logo}
            />
          </View>
          <AppText align="center" style={styles.title}>
            {t('auth.loginTitle')}
          </AppText>
          <AppText align="center" style={styles.subtitle}>
            {t('auth.loginSubtitle')}
          </AppText>
          <LanguageSelector />
        </AnimatedEntrance>

        <AnimatedEntrance delay={160} style={styles.form}>
          <CustomInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            label={t('auth.loginId')}
            onChangeText={text => updateValue('loginId', text)}
            placeholder={t('auth.loginIdPlaceholder')}
            value={values.loginId}
          />
          <CustomInput
            autoCapitalize="none"
            label={t('common.password')}
            onChangeText={text => updateValue('password', text)}
            onFocus={revealPassword}
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry
            value={values.password}
          />
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <CustomButton
            title={t('auth.login')}
            loading={loading}
            onPress={handleSubmit}
          />
          <AppText align="center" style={styles.helpText}>
            {t('auth.forgotHelp')}
          </AppText>
        </AnimatedEntrance>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 72,
    paddingTop: 34,
  },
  header: {
    alignItems: 'center',
    marginBottom: 34,
  },
  logo: {
    height: 88,
    width: 88,
  },
  logoShell: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 58,
    elevation: 6,
    height: 110,
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0b5f2b',
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    width: 110,
  },
  title: {
    color: '#142033',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#687386',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#edf1f6',
    borderRadius: 18,
    borderWidth: 1,
    elevation: 2,
    padding: 18,
    shadowColor: '#142033',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    width: '100%',
  },
  error: {
    alignSelf: 'stretch',
    color: '#d93025',
    marginBottom: 4,
  },
  helpText: {
    color: '#4f5d73',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default LoginScreen;
