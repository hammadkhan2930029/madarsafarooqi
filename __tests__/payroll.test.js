import {
  formatMoney,
  MONTH_KEYS,
  validatePayrollSettings,
  validateSalaryPeriod,
} from '../src/Utils/payroll';
const settings = {
  absentDeductionType: 'FIXED',
  absentDeductionValue: '100.10',
  lateDeductionType: 'FIXED',
  lateDeductionValue: '25.05',
  workingDaysMode: 'CALENDAR_DAYS',
  lateCountRule: '3',
  lateGraceMinutes: '5',
  minimumSalaryAllowed: '1000.00',
  timezone: 'Asia/Karachi',
  allowNegativeSalary: false,
};
describe('payroll utilities', () => {
  test('provides twelve stable month translation keys', () =>
    expect(MONTH_KEYS).toHaveLength(12));
  test('validates settings without performing deduction calculations', () => {
    expect(validatePayrollSettings(settings)).toBe('');
    expect(
      validatePayrollSettings({ ...settings, absentDeductionValue: '0.001' }),
    ).toBe('validation.payrollMoney');
    expect(validatePayrollSettings({ ...settings, lateCountRule: '0' })).toBe(
      'validation.lateCountRule',
    );
  });
  test('validates salary period', () => {
    expect(validateSalaryPeriod('8', '2026')).toBe('');
    expect(validateSalaryPeriod('13', '2026')).toBe('validation.salaryMonth');
  });
  test('formats numeric values without translating them', () => {
    expect(formatMoney('35000.00')).toContain('35');
    expect(formatMoney('invalid')).toBe('--');
  });
});
