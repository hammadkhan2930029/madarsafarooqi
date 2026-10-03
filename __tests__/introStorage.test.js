import AsyncStorage from '@react-native-async-storage/async-storage';

import introSlides from '../src/Config/introSlides';
import {
  hasCompletedIntro,
  INTRO_ONBOARDING_KEY,
  markIntroCompleted,
} from '../src/storage/introStorage';

describe('first-launch intro', () => {
  beforeEach(() => jest.clearAllMocks());

  test('uses the three supplied images in a stable order', () => {
    expect(introSlides.map(item => item.id)).toEqual([
      'students',
      'studentSection',
      'leadership',
    ]);
  });

  test('is incomplete when storage has no completion marker', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    await expect(hasCompletedIntro()).resolves.toBe(false);
  });

  test('persists completion independently from logout tokens', async () => {
    await markIntroCompleted();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      INTRO_ONBOARDING_KEY,
      'true',
    );
  });
});
