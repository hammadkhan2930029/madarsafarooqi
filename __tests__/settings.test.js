import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDeviceLanguage,
  loadLanguage,
  saveLanguage,
  SUPPORTED_LANGUAGES,
} from '../src/localization/languageStorage';
import {
  getRowDirection,
  getTextAlign,
  getWritingDirection,
  isRTL,
} from '../src/localization/direction';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('settings language persistence and direction', () => {
  beforeEach(() => jest.clearAllMocks());
  test('uses stable internal language values and storage without route translation', async () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'ur']);
    AsyncStorage.getItem.mockResolvedValue('ur');
    expect(await loadLanguage()).toBe('ur');
    await saveLanguage('en');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@smarthazri/language',
      'en',
    );
  });
  test('ignores an unsupported persisted language', async () => {
    AsyncStorage.getItem.mockResolvedValue('unsupported');
    expect(await loadLanguage()).toBeNull();
  });
  test('maps English to LTR and Urdu to RTL immediately in reusable helpers', () => {
    expect(isRTL('en')).toBe(false);
    expect(isRTL('ur')).toBe(true);
    expect(getRowDirection(false)).toBe('row');
    expect(getRowDirection(true)).toBe('row-reverse');
    expect(getTextAlign(true)).toBe('right');
    expect(getWritingDirection(true)).toBe('rtl');
  });
  test('device language always resolves to a supported value', () => {
    expect(SUPPORTED_LANGUAGES).toContain(getDeviceLanguage());
  });
});
