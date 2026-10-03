import { isValidTiming } from './teachers';

export const validateEmail = email => /\S+@\S+\.\S+/.test(String(email).trim());

export const validateLogin = ({ loginId, email, password }) => {
  if (!String(loginId ?? email ?? '').trim()) {
    return 'validation.loginIdRequired';
  }

  if (!password || password.length < 6) {
    return 'validation.passwordLength';
  }

  return '';
};

export const validateSuperAdminSignup = ({
  companyName,
  name,
  email,
  password,
}) => {
  if (!companyName || companyName.trim().length < 2) {
    return 'validation.companyName';
  }

  if (!name || name.trim().length < 2) {
    return 'validation.nameLength';
  }

  if (!validateEmail(email)) {
    return 'validation.invalidEmail';
  }

  if (!password || password.length < 6) {
    return 'validation.passwordLength';
  }

  return '';
};

export const validateTeacher = ({ name, email, password }) => {
  if (!name || name.trim().length < 2) {
    return 'validation.nameLength';
  }

  if (!validateEmail(email)) {
    return 'validation.invalidEmail';
  }

  if (!password || password.length < 6) {
    return 'validation.passwordLength';
  }

  return '';
};

export const validateName = name => {
  if (!name || name.trim().length < 2) {
    return 'validation.nameLength';
  }
  return '';
};

export const validatePassword = password => {
  if (!password || password.length < 6) {
    return 'validation.passwordLength';
  }
  return '';
};

export const normalizeBranchCode = code =>
  String(code || '')
    .trim()
    .toUpperCase();

export const validateBranch = ({ name, code, address, contact }) => {
  if (!name || name.trim().length < 2) {
    return 'validation.nameLength';
  }

  const normalizedCode = normalizeBranchCode(code);
  if (!/^[A-Z0-9_-]{2,20}$/.test(normalizedCode)) {
    return 'validation.branchCode';
  }

  if (!address || address.trim().length < 5) {
    return 'validation.branchAddress';
  }

  const normalizedContact = String(contact || '').trim();
  if (normalizedContact && !/^\+?[0-9][0-9 -]{6,18}$/.test(normalizedContact)) {
    return 'validation.contact';
  }

  return '';
};

export const validateClass = ({ name, branchId }) => {
  const normalizedName = String(name || '').trim();
  if (normalizedName.length < 2 || normalizedName.length > 80) {
    return 'validation.className';
  }
  if (!branchId) {
    return 'validation.branchRequired';
  }
  return '';
};

export const validateTeacherManagement = (values, requirePassword = false) => {
  if (!values.name || values.name.trim().length < 2) {
    return 'validation.nameLength';
  }
  if (!/^[A-Za-z0-9._-]{2,100}$/.test(String(values.loginId || '').trim())) {
    return 'validation.loginIdFormat';
  }
  if (values.email && !validateEmail(values.email)) {
    return 'validation.invalidEmail';
  }
  if (requirePassword) {
    const passwordError = validateAdminResetPassword(values.password);
    if (passwordError) return passwordError;
  }
  const contact = String(values.contact || '').trim();
  if (!/^\+?[0-9][0-9 -]{6,18}$/.test(contact)) {
    return 'validation.contact';
  }
  if (!['teacher', 'supervisor', 'muawin', 'khadim'].includes(values.teacherType)) {
    return 'validation.teacherType';
  }
  if (
    values.teacherType === 'supervisor' &&
    !(values.supervisorBranchIds || []).length
  ) {
    return 'validation.supervisorBranchRequired';
  }
  if (!values.branchId) {
    return 'validation.branchRequired';
  }
  if (['teacher', 'supervisor'].includes(values.teacherType) && !values.classId) {
    return 'validation.classRequired';
  }
  if (!isValidTiming(values.timing)) return 'validation.timing';
  if (!['monthly', 'weekly'].includes(values.ijaraFrequency || 'monthly')) return 'validation.ijaraFrequency';
  if (values.ijaraFrequency === 'weekly' && !(values.workingDays || []).length) return 'validation.workingDaysRequired';
  const salaryText = String(values.ijaraFrequency === 'weekly' ? values.weeklyIjaraAmount : values.baseSalary ?? '').trim();
  const salary = Number(salaryText);
  if (
    !/^\d+(\.\d{1,2})?$/.test(salaryText) ||
    !Number.isFinite(salary) ||
    salary < 0 ||
    salary > 9999999999.99
  ) {
    return values.ijaraFrequency === 'weekly' ? 'validation.weeklyIjaraAmount' : 'validation.salary';
  }
  const allowanceText = String(values.monthlyAllowance ?? '0').trim();
  if (!/^\d+(\.\d{1,2})?$/.test(allowanceText) || Number(allowanceText) < 0) return 'validation.allowance';
  for (const field of ['attendanceAllowance', 'conveyanceAllowance', 'medicalAllowance']) {
    const value = String(values[field] ?? '0').trim();
    if (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) < 0 || Number(value) > 9999999999.99) return 'validation.allowance';
  }
  if (!String(values.ijaraTerms || '').split(/\r?\n/).some(value => value.trim())) return 'validation.ijaraConditionsRequired';
  if (!String(values.ijaraTermsVersion || '').trim()) return 'validation.ijaraTermsVersionRequired';
  return '';
};

export const validateAdminResetPassword = password => {
  if (!password || password.length < 8) {
    return 'validation.adminPasswordLength';
  }
  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return 'validation.passwordStrength';
  }
  if (password.length > 128) {
    return 'validation.passwordMaximum';
  }
  return '';
};

export const validateStudent = values => {
  const admissionNumber = String(values.admissionNo || '')
    .trim()
    .toUpperCase();
  if (!/^[A-Z0-9/_-]{2,30}$/.test(admissionNumber.replace(/\s+/g, ''))) {
    return 'validation.admissionNo';
  }
  if (!values.name || values.name.trim().length < 2) {
    return 'validation.nameLength';
  }
  if (!values.fatherName || values.fatherName.trim().length < 2) {
    return 'validation.fatherName';
  }
  const contact = String(values.contact || '').trim();
  if (contact && !/^\+?[0-9][0-9 -]{6,18}$/.test(contact)) {
    return 'validation.contact';
  }
  if (!values.branchId) {
    return 'validation.branchRequired';
  }
  if (!values.classId) {
    return 'validation.classRequired';
  }
  return '';
};
