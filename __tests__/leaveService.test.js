import apiClient from '../src/api/client';
import {
  createLeaveRequest,
  getLeaveRequestDetails,
  getSuperAdminLeaveRequests,
  getTeacherLeaveRequests,
  reviewLeaveRequest,
} from '../src/Services/leaveService';
jest.mock('../src/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));
const leave = {
  id: '7',
  teacherId: '2',
  branchId: '3',
  classId: '4',
  startDate: '2026-08-12',
  endDate: '2026-08-14',
  reason: 'Family commitment',
  status: 'PENDING',
};
describe('leave request REST integration', () => {
  beforeEach(() => jest.clearAllMocks());
  test('submits no client identity or status', async () => {
    apiClient.post.mockResolvedValue({ data: { data: leave } });
    await createLeaveRequest(
      { uid: 'spoof' },
      {
        startDate: '2026-08-12',
        endDate: '2026-08-14',
        reason: ' Family commitment ',
      },
    );
    expect(apiClient.post).toHaveBeenCalledWith('/leave-requests', {
      startDate: '2026-08-12',
      endDate: '2026-08-14',
      reason: 'Family commitment',
    });
  });
  test('uses scoped list and detail endpoints with pagination', async () => {
    apiClient.get
      .mockResolvedValueOnce({
        data: { data: [leave], meta: { page: 1, totalPages: 1, total: 1 } },
      })
      .mockResolvedValueOnce({ data: { data: leave } });
    expect((await getTeacherLeaveRequests()).items[0].status).toBe('pending');
    expect((await getLeaveRequestDetails('7')).id).toBe('7');
    expect(apiClient.get).toHaveBeenLastCalledWith('/leave-requests/7');
  });
  test('maps admin filters and review action without reviewer identity', async () => {
    apiClient.get.mockResolvedValue({
      data: { data: [], meta: { page: 2, totalPages: 2, total: 21 } },
    });
    await getSuperAdminLeaveRequests({
      teacherId: '2',
      branchId: '3',
      status: 'approved',
      dateFrom: '2026-08-12',
      dateTo: '2026-08-14',
      page: 2,
    });
    expect(apiClient.get).toHaveBeenCalledWith('/admin/leave-requests', {
      params: {
        teacherId: '2',
        branchId: '3',
        status: 'APPROVED',
        dateFrom: '2026-08-12',
        dateTo: '2026-08-14',
        page: 2,
        limit: 20,
      },
    });
    apiClient.patch.mockResolvedValue({
      data: { data: { ...leave, status: 'APPROVED' } },
    });
    await reviewLeaveRequest('7', 'approved');
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/admin/leave-requests/7/approve',
      {},
    );
  });
});
