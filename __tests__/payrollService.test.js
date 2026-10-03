import apiClient from '../src/api/client';
import {
  calculateSalaries,
  getPayrollSettings,
  getSalaries,
  getSalaryDetails,
  savePayrollSettings,
} from '../src/Services/payrollService';
jest.mock('../src/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn(), post: jest.fn() },
}));
const settings = {
  absentDeductionType: 'FIXED',
  absentDeductionValue: '100.10',
  lateDeductionType: 'FIXED',
  lateDeductionValue: '25.05',
  workingDaysMode: 'CALENDAR_DAYS',
  lateCountRule: 3,
  lateGraceMinutes: 5,
  minimumSalaryAllowed: '1000.00',
  timezone: 'Asia/Karachi',
  allowNegativeSalary: false,
};
describe('payroll REST integration', () => {
  beforeEach(() => jest.clearAllMocks());
  test('gets and saves complete settings without calculation fields', async () => {
    apiClient.get.mockResolvedValue({ data: { data: settings } });
    expect(await getPayrollSettings()).toEqual(settings);
    apiClient.put.mockResolvedValue({ data: { data: settings } });
    await savePayrollSettings({ ...settings, lateCountRule: '3' });
    expect(apiClient.put).toHaveBeenCalledWith(
      '/admin/payroll/settings',
      settings,
    );
  });
  test('salary list is fetched only when service is explicitly called with period and filters', async () => {
    expect(apiClient.get).not.toHaveBeenCalled();
    apiClient.get.mockResolvedValue({
      data: { data: [], meta: { page: 1, totalPages: 1, total: 0 } },
    });
    await getSalaries({
      month: '8',
      year: '2026',
      teacherId: '2',
      branchId: '3',
      classId: '4',
    });
    expect(apiClient.get).toHaveBeenCalledWith('/admin/salaries', {
      params: {
        month: 8,
        year: 2026,
        teacherId: '2',
        branchId: '3',
        classId: '4',
        page: 1,
        limit: 20,
      },
    });
  });
  test('loads one salary breakdown by id', async () => {
    apiClient.get.mockResolvedValue({ data: { data: { id: '9' } } });
    expect((await getSalaryDetails('9')).id).toBe('9');
    expect(apiClient.get).toHaveBeenCalledWith('/admin/salaries/9');
  });
  test('calculates a selected month through the protected admin API', async () => {
    apiClient.post.mockResolvedValue({ data: { data: { processed: 1 } } });
    expect((await calculateSalaries('7', '2026')).processed).toBe(1);
    expect(apiClient.post).toHaveBeenCalledWith('/admin/salaries/calculate', {
      month: 7,
      year: 2026,
    });
  });
});
