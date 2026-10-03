import AsyncStorage from '@react-native-async-storage/async-storage';

export const INTRO_ONBOARDING_KEY = 'intro_onboarding_completed';

export const hasCompletedIntro = async () =>
  (await AsyncStorage.getItem(INTRO_ONBOARDING_KEY)) === 'true';

export const markIntroCompleted = () =>
  AsyncStorage.setItem(INTRO_ONBOARDING_KEY, 'true');
