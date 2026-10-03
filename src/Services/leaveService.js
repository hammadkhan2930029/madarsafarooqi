import apiClient from '../api/client';
const mapLeave = value =>
  value
    ? {
        ...value,
        teacher_id: value.teacherId,
        branch_id: value.branchId,
        class_id: value.classId,
        start_date: value.startDate,
        end_date: value.endDate,
        status: value.status.toLowerCase(),
        reviewed_by: value.reviewedById,
        reviewed_at: value.reviewedAt,
        created_at: value.createdAt,
        updated_at: value.updatedAt,
        teacherName: value.teacher?.name,
        branchName: value.branch?.name,
        className: value.class?.name,
        reviewedBy: value.reviewedBy,
      }
    : null;
const mapList = response => ({
  items: response.data.data.map(mapLeave),
  pagination: response.data.meta,
});
export const getTeacherLeaveRequests = async ({
  status = 'all',
  dateFrom,
  dateTo,
  page = 1,
  limit = 20,
} = {}) =>
  mapList(
    await apiClient.get('/leave-requests/me', {
      params: {
        ...(status !== 'all' ? { status: status.toUpperCase() } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        page,
        limit,
      },
    }),
  );
export const getSuperAdminLeaveRequests = async ({
  teacherId = 'all',
  branchId = 'all',
  classId = 'all',
  status = 'all',
  dateFrom,
  dateTo,
  page = 1,
  limit = 20,
} = {}) =>
  mapList(
    await apiClient.get('/admin/leave-requests', {
      params: {
        ...(teacherId !== 'all' ? { teacherId } : {}),
        ...(branchId !== 'all' ? { branchId } : {}),
        ...(classId !== 'all' ? { classId } : {}),
        ...(status !== 'all' ? { status: status.toUpperCase() } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        page,
        limit,
      },
    }),
  );
export const createLeaveRequest = async (_user, values) =>
  mapLeave(
    (
      await apiClient.post('/leave-requests', {
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason.trim(),
      })
    ).data.data,
  );
export const getLeaveRequestDetails = async id =>
  mapLeave((await apiClient.get(`/leave-requests/${id}`)).data.data);
export const reviewLeaveRequest = async (requestId, status) =>
  mapLeave(
    (
      await apiClient.patch(
        `/admin/leave-requests/${requestId}/${
          status === 'approved' ? 'approve' : 'reject'
        }`,
        {},
      )
    ).data.data,
  );
