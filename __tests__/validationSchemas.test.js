import {
  validateSuperAdminSignup,
  validateTeacher,
  validateLogin,
  validateName,
  validatePassword,
} from '../src/Utils/validationSchemas';

describe('validation schemas', () => {
  test('accepts valid login and rejects invalid email', () => {
    expect(validateLogin({ loginId: 'teacher001', password: 'secret1' })).toBe(
      '',
    );
    expect(validateLogin({ loginId: '', password: 'secret1' })).toBe(
      'validation.loginIdRequired',
    );
  });

  test('validates Super Admin signup fields', () => {
    expect(
      validateSuperAdminSignup({
        companyName: 'Acme',
        name: 'Super Admin',
        email: 'superadmin@acme.com',
        password: 'secret1',
      }),
    ).toBe('');
    expect(
      validateSuperAdminSignup({
        companyName: '',
        name: 'Super Admin',
        email: 'superadmin@acme.com',
        password: 'secret1',
      }),
    ).toBe('validation.companyName');
  });

  test('validates teacher and account updates', () => {
    expect(
      validateTeacher({
        name: 'Teacher',
        email: 'teacher@acme.com',
        password: 'secret1',
      }),
    ).toBe('');
    expect(validateName('A')).not.toBe('');
    expect(validatePassword('12345')).not.toBe('');
  });
});
