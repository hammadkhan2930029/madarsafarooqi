import { getActorDisplayName, getUserDisplayName } from '../src/Utils/displayName';

const translations = {
  en: { 'common.superAdminName': 'Mufti Tanveer Hussain', 'common.unknown': 'Unknown' },
  ur: { 'common.superAdminName': 'مفتی تنویر حسین', 'common.unknown': 'نامعلوم' },
};
const translator = language => key => translations[language][key] || key;

test('Super Admin identity is localized without changing the RBAC role', () => {
  const user = { role: 'SUPER_ADMIN', name: 'Stored Name' };
  expect(getUserDisplayName(user, translator('en'))).toBe('Mufti Tanveer Hussain');
  expect(getUserDisplayName(user, translator('ur'))).toBe('مفتی تنویر حسین');
  expect(user.role).toBe('SUPER_ADMIN');
});

test('non-admin user-entered names remain unchanged', () => {
  expect(getUserDisplayName({ role: 'TEACHER', name: 'Hammad' }, translator('ur'))).toBe('Hammad');
  expect(getActorDisplayName({ loginId: 'admin', name: 'Admin' }, translator('en'))).toBe('Mufti Tanveer Hussain');
});
