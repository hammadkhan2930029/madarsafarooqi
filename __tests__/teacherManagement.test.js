import {
  formatSalary,
  getTimingStartMinutes,
  getClassesForBranch,
  isLateAt,
  isValidTiming,
} from '../src/Utils/teachers';
import {
  validateAdminResetPassword,
  validateTeacherManagement,
} from '../src/Utils/validationSchemas';

describe('teacher management utilities', () => {
  const values = {
    name: 'Teacher One',
    loginId: 'teacher001',
    email: 'teacher@example.com',
    password: 'StrongPass8',
    contact: '+92 300 1234567',
    teacherType: 'teacher',
    branchId: 'branch_main',
    classId: 'class_one',
    timing: '08:00 AM-02:00 PM',
    baseSalary: '35000',
    ijaraTerms: 'Follow the assigned schedule.',
    ijaraTermsVersion: '1',
  };

  test('validates complete registration details', () => {
    expect(validateTeacherManagement(values, true)).toBe('');
    expect(
      validateTeacherManagement({ ...values, password: '' }, true),
    ).toContain('Password');
    expect(
      validateTeacherManagement({ ...values, loginId: 'bad id' }, true),
    ).toContain('loginId');
    expect(validateTeacherManagement({ ...values, email: '' }, true)).toBe('');
    expect(
      validateTeacherManagement({ ...values, baseSalary: '-1' }),
    ).toContain('salary');
    expect(
      validateTeacherManagement({ ...values, teacherType: 'SUPER_ADMIN' }),
    ).toBe('validation.teacherType');
  });

  test('validates 12-hour timing order', () => {
    expect(isValidTiming('08:00 AM-02:00 PM')).toBe(true);
    expect(isValidTiming('02:00 PM-08:00 AM')).toBe(false);
    expect(
      validateTeacherManagement({ ...values, timing: '02:00 PM-08:00 AM' }),
    ).toBe('validation.timing');
  });

  test('calculates lateness against the UTC timing start', () => {
    const start = getTimingStartMinutes('08:00 AM-02:00 PM');
    expect(start).toBe(480);
    expect(isLateAt(new Date('2026-08-01T08:00:00.000Z'), start)).toBe(false);
    expect(isLateAt(new Date('2026-08-01T08:01:00.000Z'), start)).toBe(true);
  });

  test('filters active classes by selected branch', () => {
    const classes = [
      { id: 'one', branch_id: 'a', status: 'active' },
      { id: 'two', branch_id: 'a', status: 'inactive' },
      { id: 'three', branch_id: 'b', status: 'active' },
    ];
    expect(getClassesForBranch(classes, 'a')).toEqual([classes[0]]);
  });

  test('formats numeric salary safely', () => {
    expect(formatSalary(35000)).not.toBe('--');
    expect(formatSalary('invalid')).toBe('--');
  });

  test('validates Super Admin reset password policy', () => {
    expect(validateAdminResetPassword('StrongPass8')).toBe('');
    expect(validateAdminResetPassword('weakpass')).toBe(
      'validation.passwordStrength',
    );
    expect(validateAdminResetPassword('Short1')).toBe(
      'validation.adminPasswordLength',
    );
  });
});
