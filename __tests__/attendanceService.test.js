import apiClient from '../src/api/client';
import {
  checkIn,
  checkOut,
  correctAttendance,
  getAdminAttendance,
  getMyAttendance,
  getTodayAttendance,
} from '../src/Services/attendanceService';
import { getDateRange, getInstitutionDate } from '../src/Utils/attendance';

jest.mock('../src/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

const record = {
  id: '1',
  teacherId: '2',
  attendanceDate: '2026-08-10',
  branchId: '3',
  classId: '4',
  timingSnapshot: '08:00-14:00',
  checkInAt: '2026-08-10T03:01:00.000Z',
  checkOutAt: null,
  isLate: true,
  status: 'INCOMPLETE',
  teacher: { id: '2', name: 'Teacher One' },
  branch: { id: '3', name: 'Main' },
  class: { id: '4', name: 'One' },
};

describe('attendance REST integration', () => {
  beforeEach(() => jest.clearAllMocks());

  test('check-in and check-out send empty bodies without client identity or timestamps', async () => {
    apiClient.post.mockResolvedValue({ data: { data: record } });
    await checkIn();
    await checkOut();
    expect(apiClient.post).toHaveBeenNthCalledWith(
      1,
      '/attendance/check-in',
      {},
    );
    expect(apiClient.post).toHaveBeenNthCalledWith(
      2,
      '/attendance/check-out',
      {},
    );
  });

  test('maps backend today and history records to the preserved UI shape', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { data: record } });
    const today = await getTodayAttendance();
    expect(today).toMatchObject({
      employeeId: '2',
      employeeName: 'Teacher One',
      attendance_date: '2026-08-10',
      status: 'incomplete',
      is_late: true,
    });
    apiClient.get.mockResolvedValueOnce({
      data: {
        data: [{ ...record, status: 'PRESENT' }],
        meta: { page: 1, totalPages: 1, total: 1 },
      },
    });
    const history = await getMyAttendance({ page: 1, limit: 50 });
    expect(history.items[0].status).toBe('complete');
  });

  test('sends all Super Admin filters and pagination to the backend', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: [], meta: { page: 2, totalPages: 3, total: 101 } },
    });
    await getAdminAttendance({
      dateFrom: '2026-08-01',
      dateTo: '2026-08-10',
      teacherId: '2',
      branchId: '3',
      classId: '4',
      status: 'PRESENT',
      isLate: false,
      page: 2,
      limit: 50,
    });
    expect(apiClient.get).toHaveBeenCalledWith('/admin/attendance', {
      params: {
        dateFrom: '2026-08-01',
        dateTo: '2026-08-10',
        teacherId: '2',
        branchId: '3',
        classId: '4',
        status: 'PRESENT',
        isLate: false,
        page: 2,
        limit: 50,
      },
    });
  });

  test('sends only correction fields to the protected admin endpoint', async () => {
    apiClient.patch.mockResolvedValue({
      data: { data: { ...record, status: 'PRESENT' } },
    });
    await correctAttendance('1', {
      checkInAt: record.checkInAt,
      checkOutAt: '2026-08-10T10:00:00.000Z',
      status: 'PRESENT',
      isLate: false,
      reason: ' Fixed time ',
    });
    expect(apiClient.patch).toHaveBeenCalledWith('/admin/attendance/1', {
      checkInAt: record.checkInAt,
      checkOutAt: '2026-08-10T10:00:00.000Z',
      status: 'PRESENT',
      isLate: false,
      reason: 'Fixed time',
    });
  });

  test('builds institution-date ranges without device-local date arithmetic', () => {
    expect(getInstitutionDate(new Date('2026-08-09T20:30:00.000Z'))).toBe(
      '2026-08-10',
    );
    expect(getDateRange('all')).toEqual({});
  });
});
