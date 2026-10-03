export const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];
const money = value =>
  /^\d{1,10}(\.\d{1,2})?$/.test(String(value || '')) &&
  Number(value) <= 9999999999.99;
export const validatePayrollSettings = values => {
  if (
    !['FIXED', 'PERCENTAGE_OF_DAILY_RATE'].includes(
      String(values.absentDeductionType).toUpperCase(),
    ) ||
    !['FIXED', 'PERCENTAGE_OF_DAILY_RATE'].includes(
      String(values.lateDeductionType).toUpperCase(),
    ) ||
    !['CALENDAR_DAYS', 'WEEKDAYS'].includes(
      String(values.workingDaysMode).toUpperCase(),
    )
  )
    return 'validation.payrollIdentifier';
  if (
    !money(values.absentDeductionValue) ||
    !money(values.lateDeductionValue) ||
    !money(values.minimumSalaryAllowed)
  )
    return 'validation.payrollMoney';
  if (
    !/^\d+$/.test(String(values.lateCountRule)) ||
    Number(values.lateCountRule) < 1 ||
    Number(values.lateCountRule) > 365
  )
    return 'validation.lateCountRule';
  if (
    !/^\d+$/.test(String(values.lateGraceMinutes)) ||
    Number(values.lateGraceMinutes) < 0 ||
    Number(values.lateGraceMinutes) > 180
  )
    return 'validation.lateGraceMinutes';
  if (!String(values.timezone || '').trim()) return 'validation.timezone';
  return '';
};
export const validateSalaryPeriod = (month, year) => {
  if (!/^([1-9]|1[0-2])$/.test(String(month))) return 'validation.salaryMonth';
  if (!/^\d{4}$/.test(String(year)) || Number(year) < 2000)
    return 'validation.salaryYear';
  return '';
};
export const formatMoney = value => {
  const string = String(value ?? '');
  return /^-?\d+(\.\d{1,2})?$/.test(string)
    ? Number(string).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '--';
};
