import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@smarthazri/language';
export const SUPPORTED_LANGUAGES = ['en', 'ur'];

export const getDeviceLanguage = () => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'en';
  const language = locale.toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.includes(language) ? language : 'en';
};

export const loadLanguage = async () => {
  const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(saved) ? saved : null;
};

export const saveLanguage = language =>
  AsyncStorage.setItem(LANGUAGE_KEY, language);
