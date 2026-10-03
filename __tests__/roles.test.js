import { normalizeRole } from '../src/Utils/roles';

describe('role normalization', () => {
  test('accepts the backend Super Admin enum', () => {
    expect(normalizeRole('SUPER_ADMIN')).toBe('SUPER_ADMIN');
  });

  test('accepts the backend Teacher enum', () => {
    expect(normalizeRole('TEACHER')).toBe('TEACHER');
  });

  test.each([undefined, null, '', 'unknown', 'company_admin', 'employee'])(
    'rejects invalid role %s',
    role => expect(normalizeRole(role)).toBeNull(),
  );
});
