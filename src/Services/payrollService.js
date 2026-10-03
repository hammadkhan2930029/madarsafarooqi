import apiClient from '../api/client';
export const getPayrollSettings = async () =>
  (await apiClient.get('/admin/payroll/settings')).data.data;
export const savePayrollSettings = async values =>
  (
    await apiClient.put('/admin/payroll/settings', {
      absentDeductionType: values.absentDeductionType.trim().toUpperCase(),
      absentDeductionValue: values.absentDeductionValue.trim(),
      lateDeductionType: values.lateDeductionType.trim().toUpperCase(),
      lateDeductionValue: values.lateDeductionValue.trim(),
      workingDaysMode: values.workingDaysMode.trim().toUpperCase(),
      lateCountRule: Number(values.lateCountRule),
      lateGraceMinutes: Number(values.lateGraceMinutes),
      minimumSalaryAllowed: values.minimumSalaryAllowed.trim(),
      timezone: values.timezone.trim(),
      allowNegativeSalary: Boolean(values.allowNegativeSalary),
    })
  ).data.data;
export const getSalaries = async ({
  month,
  year,
  teacherId = 'all',
  branchId = 'all',
  classId = 'all',
  page = 1,
  limit = 20,
}) => {
  const response = await apiClient.get('/admin/salaries', {
    params: {
      month: Number(month),
      year: Number(year),
      ...(teacherId !== 'all' ? { teacherId } : {}),
      ...(branchId !== 'all' ? { branchId } : {}),
      ...(classId !== 'all' ? { classId } : {}),
      page,
      limit,
    },
  });
  return { items: response.data.data, pagination: response.data.meta };
};
export const getSalaryDetails = async id =>
  (await apiClient.get(`/admin/salaries/${id}`)).data.data;
export const calculateSalaries = async (month, year) =>
  (
    await apiClient.post('/admin/salaries/calculate', {
      month: Number(month),
      year: Number(year),
    })
  ).data.data;
export const getMySalaries = async ({
  month,
  year,
  page = 1,
  limit = 20,
} = {}) => {
  const response = await apiClient.get('/salaries/me', {
    params: {
      ...(month ? { month: Number(month) } : {}),
      ...(year ? { year: Number(year) } : {}),
      page,
      limit,
    },
  });
  return { items: response.data.data, pagination: response.data.meta };
};
