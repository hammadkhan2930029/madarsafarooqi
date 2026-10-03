import apiClient from '../api/client';
import { getReportDates } from '../Utils/reports';

const mapReport = report => ({
  ...report,
  teacher_id: report.teacherId,
  branch_id: report.branchId,
  class_id: report.classId,
  report_type: report.reportType.toLowerCase(),
  report_period:
    report.reportType === 'DAILY'
      ? report.reportDate
      : `${report.periodStart} — ${report.periodEnd}`,
  content: report.contentJson,
  submitted_at: report.submittedAt,
  editable_until: report.editableUntil,
  status: String(report.status || 'SUBMITTED').toLowerCase(),
  originalReportDate: report.originalReportDate || report.reportDate,
  originalCreator: report.originalCreator || report.teacher,
  lastEditedBy: report.lastEditedBy,
  lastEditedAt: report.lastEditedAt,
  editHistoryCount: report.editHistoryCount || 0,
  teacherName: report.teacher?.name,
  teacherType: report.teacher?.teacherType,
  branchName: report.branch?.name,
  className: report.class?.name,
});
const list = response => ({
  items: response.data.data.map(mapReport),
  pagination: response.data.meta,
});

export const getTeacherReports = async ({
  reportType,
  dateFrom,
  dateTo,
  page = 1,
  limit = 20,
} = {}) =>
  list(
    await apiClient.get('/reports/me', {
      params: {
        ...(reportType && reportType !== 'all'
          ? { reportType: reportType.toUpperCase() }
          : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        page,
        limit,
      },
    }),
  );
export const getSuperAdminReports = async ({
  search,
  teacherId = 'all',
  branchId = 'all',
  classId = 'all',
  reportType = 'all',
  role = 'all',
  status = 'all',
  week,
  dateFrom,
  dateTo,
  page = 1,
  limit = 20,
} = {}) =>
  list(
    await apiClient.get('/admin/reports', {
      params: {
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(teacherId !== 'all' ? { teacherId } : {}),
        ...(branchId !== 'all' ? { branchId } : {}),
        ...(classId !== 'all' ? { classId } : {}),
        ...(reportType !== 'all'
          ? { reportType: reportType.toUpperCase() }
          : {}),
        ...(role !== 'all' ? { role: role.toUpperCase() } : {}),
        ...(status !== 'all' ? { status: status.toUpperCase() } : {}),
        ...(week ? { week } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        page,
        limit,
      },
    }),
  );
export const createTeacherReport = async (_user, type, period, content) => {
  const dates = getReportDates(type, period);
  const contentJson =
    typeof content === 'string' ? { summary: content.trim() } : content;
  return mapReport(
    (
      await apiClient.post('/reports', {
        reportType: type.toUpperCase(),
        ...dates,
        contentJson,
      })
    ).data.data,
  );
};
export const updateReportContent = async (
  reportId,
  content,
  isAdmin = false,
) => {
  const contentJson =
    typeof content === 'string' ? { summary: content.trim() } : content;
  return mapReport(
    (
      await apiClient.patch(`${isAdmin ? '/admin' : ''}/reports/${reportId}`, {
        contentJson,
      })
    ).data.data,
  );
};
export const getReportDetails = async (id, isAdmin = false) =>
  mapReport(
    (await apiClient.get(`${isAdmin ? '/admin' : ''}/reports/${id}`)).data.data,
  );
export const getReportEditHistory = async id =>
  (await apiClient.get(`/admin/reports/${id}/edit-history`)).data.data;
export const exportReportsCsv = async (filters, language) =>
  (
    await apiClient.get('/admin/reports/export/csv', {
      params: { ...filters, language },
      responseType: 'text',
    })
  ).data;
