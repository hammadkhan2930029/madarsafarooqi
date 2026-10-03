import {
  getDefaultIjaraTerms,
  IJARA_TERMS_EN,
  IJARA_TERMS_UR,
  IJARA_TERMS_VERSION,
} from '../src/Config/ijaraTerms';

describe('Ijara terms template', () => {
  test('provides all 19 conditions in both languages', () => {
    expect(IJARA_TERMS_UR).toHaveLength(19);
    expect(IJARA_TERMS_EN).toHaveLength(19);
    expect(getDefaultIjaraTerms('ur').split('\n')).toHaveLength(19);
    expect(getDefaultIjaraTerms('en').split('\n')).toHaveLength(19);
  });

  test('uses a stable version for acceptance auditing', () => {
    expect(IJARA_TERMS_VERSION).toBe('2026-09-11');
  });
});
