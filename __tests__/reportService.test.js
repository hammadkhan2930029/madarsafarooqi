import apiClient from '../src/api/client';
import {
  createTeacherReport,
  exportReportsCsv,
  getTeacherReports,
  updateReportContent,
} from '../src/Services/reportService';
jest.mock('../src/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));
const report = {
  id: '1',
  teacherId: '2',
  branchId: '3',
  classId: '4',
  reportType: 'DAILY',
  reportDate: '2026-08-10',
  periodStart: '2026-08-10',
  periodEnd: '2026-08-10',
  contentJson: { summary: 'Completed today lessons' },
  submittedAt: '2026-08-10T08:00:00Z',
  editableUntil: '2026-08-10T08:30:00Z',
};
describe('report REST integration', () => {
  beforeEach(() => jest.clearAllMocks());
  test('creates report without client teacher or assignment identity', async () => {
    apiClient.post.mockResolvedValue({ data: { data: report } });
    await createTeacherReport(
      {},
      'daily',
      '2026-08-10',
      'Completed today lessons',
    );
    expect(apiClient.post).toHaveBeenCalledWith('/reports', {
      reportType: 'DAILY',
      reportDate: '2026-08-10',
      periodStart: '2026-08-10',
      periodEnd: '2026-08-10',
      contentJson: { summary: 'Completed today lessons' },
    });
  });
  test('uses teacher list pagination and role-specific edit endpoints', async () => {
    apiClient.get.mockResolvedValue({
      data: { data: [report], meta: { page: 1, totalPages: 1, total: 1 } },
    });
    expect((await getTeacherReports()).items[0].report_type).toBe('daily');
    apiClient.patch.mockResolvedValue({ data: { data: report } });
    await updateReportContent('1', 'Updated teaching report', true);
    expect(apiClient.patch).toHaveBeenCalledWith('/admin/reports/1', {
      contentJson: { summary: 'Updated teaching report' },
    });
  });
  test('requests server-generated Urdu CSV', async () => {
    apiClient.get.mockResolvedValue({ data: '\uFEFFاستاد' });
    expect(await exportReportsCsv({}, 'ur')).toBe('\uFEFFاستاد');
    expect(apiClient.get).toHaveBeenCalledWith('/admin/reports/export/csv', {
      params: { language: 'ur' },
      responseType: 'text',
    });
  });
});
