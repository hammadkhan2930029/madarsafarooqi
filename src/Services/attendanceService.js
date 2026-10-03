import apiClient from '../api/client';

const statusToLegacy = status =>
  status === 'PRESENT'
    ? 'complete'
    : status === 'ON_LEAVE'
    ? 'on_leave'
    : 'incomplete';
const mapAttendance = record =>
  record
    ? {
        ...record,
        employeeId: record.teacherId,
        employeeName: record.teacher?.name || '',
        branch_id: record.branchId,
        class_id: record.classId,
        branchName: record.branch?.name,
        className: record.class?.name,
        timing: record.timingSnapshot,
        is_late: record.isLate,
        status: statusToLegacy(record.status),
        attendance_date: record.attendanceDate,
      }
    : null;

export const getTodayAttendance = async () =>
  mapAttendance((await apiClient.get('/attendance/today')).data.data);
export const getCheckInAvailability = async () =>
  (await apiClient.get('/attendance/check-in-availability')).data.data;
export const checkIn = async () =>
  mapAttendance((await apiClient.post('/attendance/check-in', {})).data.data);
export const checkOut = async () =>
  mapAttendance((await apiClient.post('/attendance/check-out', {})).data.data);

export const getMyAttendance = async ({
  dateFrom,
  dateTo,
  status,
  isLate,
  page = 1,
  limit = 50,
} = {}) => {
  const response = await apiClient.get('/attendance/me', {
    params: {
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      ...(status && status !== 'all' ? { status } : {}),
      ...(isLate !== undefined && isLate !== 'all' ? { isLate } : {}),
      page,
      limit,
    },
  });
  return {
    items: response.data.data.map(mapAttendance),
    pagination: response.data.meta,
  };
};

export const getAdminAttendance = async ({
  dateFrom,
  dateTo,
  teacherId = 'all',
  branchId = 'all',
  classId = 'all',
  status = 'all',
  isLate = 'all',
  page = 1,
  limit = 50,
} = {}) => {
  const response = await apiClient.get('/admin/attendance', {
    params: {
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      ...(teacherId !== 'all' ? { teacherId } : {}),
      ...(branchId !== 'all' ? { branchId } : {}),
      ...(classId !== 'all' ? { classId } : {}),
      ...(status !== 'all' ? { status } : {}),
      ...(isLate !== 'all' ? { isLate } : {}),
      page,
      limit,
    },
  });
  return {
    items: response.data.data.map(mapAttendance),
    pagination: response.data.meta,
  };
};

export const correctAttendance = async (attendanceId, values) => {
  const response = await apiClient.patch(`/admin/attendance/${attendanceId}`, {
    checkInAt: values.checkInAt || null,
    checkOutAt: values.checkOutAt || null,
    status: values.status,
    isLate: values.status === 'ON_LEAVE' ? null : values.isLate,
    reason: values.reason.trim(),
  });
  return mapAttendance(response.data.data);
};

export { mapAttendance };
