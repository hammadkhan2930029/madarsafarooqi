export const LEAVE_STATUSES = ['pending', 'approved', 'rejected'];

export const isValidUtcDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

export const validateLeaveRequest = values => {
  if (!isValidUtcDate(values.startDate)) return 'validation.startDate';
  if (!isValidUtcDate(values.endDate)) return 'validation.endDate';
  if (values.endDate < values.startDate) return 'validation.dateOrder';
  const reason = String(values.reason || '').trim();
  if (reason.length < 1 || reason.length > 1000)
    return 'validation.leaveReason';
  return '';
};

export const filterLeaveRequests = (requests, filters) =>
  requests
    .filter(item => filters.status === 'all' || item.status === filters.status)
    .filter(
      item => filters.teacher === 'all' || item.teacher_id === filters.teacher,
    )
    .filter(
      item => filters.branch === 'all' || item.branch_id === filters.branch,
    )
    .filter(
      item =>
        !filters.date ||
        (item.start_date <= filters.date && item.end_date >= filters.date),
    );
