import { env } from '../Config/env';

export const toDate = value => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
};

export const toIsoString = value => {
  const date = toDate(value);
  return date ? date.toISOString() : '';
};

export const validateAttendanceCorrection = values => {
  const reason = values.reason?.trim() || '';
  if (!reason || reason.length > 500) return 'validation.correctionReason';

  const checkIn = values.checkInAt ? toDate(values.checkInAt) : null;
  const checkOut = values.checkOutAt ? toDate(values.checkOutAt) : null;
  if (values.checkInAt && !checkIn) return 'validation.checkInIso';
  if (values.checkOutAt && !checkOut) return 'validation.checkOutIso';
  if (checkIn && checkOut && checkOut < checkIn)
    return 'validation.checkOutOrder';

  if (
    values.status === 'PRESENT' &&
    (!checkIn || !checkOut || typeof values.isLate !== 'boolean')
  ) {
    return 'validation.presentAttendance';
  }
  if (
    values.status === 'INCOMPLETE' &&
    (!checkIn || checkOut || typeof values.isLate !== 'boolean')
  ) {
    return 'validation.incompleteAttendance';
  }
  if (
    values.status === 'ON_LEAVE' &&
    (checkIn || checkOut || values.isLate !== null)
  ) {
    return 'validation.onLeaveAttendance';
  }
  return null;
};

export const formatTime = value => {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: env.APP_TIMEZONE,
      }).format(date)
    : '--';
};

export const formatAttendanceDate = day => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(day || ''))) return day;
  if (!Number.isInteger(day)) {
    return '--';
  }

  return new Date(day * 86400000).toISOString().slice(0, 10);
};

export const getInstitutionDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: env.APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(date)
    .filter(part => part.type !== 'literal');
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

export const getDateRange = range => {
  if (range === 'all') return {};
  const today = getInstitutionDate();
  if (range === 'today') return { dateFrom: today, dateTo: today };
  const days = range === '7days' ? 6 : 29;
  const start = new Date(`${today}T00:00:00.000Z`);
  start.setUTCDate(start.getUTCDate() - days);
  return { dateFrom: start.toISOString().slice(0, 10), dateTo: today };
};

export const getWorkedMinutes = record => {
  const checkIn = toDate(record?.checkInAt);
  const checkOut = toDate(record?.checkOutAt);
  if (!checkIn || !checkOut) {
    return 0;
  }

  return Math.max(
    0,
    Math.round((checkOut.getTime() - checkIn.getTime()) / 60000),
  );
};

export const formatDuration = minutes => {
  if (!minutes) {
    return '--';
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
};

export const filterAttendance = (records, filter) => {
  if (filter === 'complete') {
    return records.filter(item => item.status === 'complete');
  }
  if (filter === 'pending') {
    return records.filter(item => item.status !== 'complete');
  }
  return records;
};

export const filterAttendanceByRange = (records, range, currentDay) => {
  if (range === 'today') {
    return records.filter(item => item.day === currentDay);
  }
  if (range === '7days') {
    return records.filter(item => item.day >= currentDay - 6);
  }
  if (range === '30days') {
    return records.filter(item => item.day >= currentDay - 29);
  }
  return records;
};

export const summarizeAttendance = records =>
  records.reduce(
    (summary, record) => {
      summary.total += 1;
      summary.minutes += getWorkedMinutes(record);
      if (record.status === 'complete') {
        summary.complete += 1;
      } else {
        summary.pending += 1;
      }
      return summary;
    },
    { total: 0, complete: 0, pending: 0, minutes: 0 },
  );

const csvValue = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const attendanceToCsv = (records, labels) => {
  const rows = records.map(record =>
    [
      formatAttendanceDate(record.day),
      record.employeeName,
      record.branchName || '--',
      record.className || '--',
      record.timing || '--',
      formatTime(record.checkInAt),
      formatTime(record.checkOutAt),
      record.is_late === true
        ? `${labels.late} (${record.lateMinutes || 0})`
        : record.is_late === false
        ? labels.onTime
        : labels.unknown,
      record.status,
      formatDuration(getWorkedMinutes(record)),
    ]
      .map(csvValue)
      .join(','),
  );

  return [
    [
      labels.date,
      labels.teacher,
      labels.branch,
      labels.class,
      labels.timing,
      labels.checkIn,
      labels.checkOut,
      labels.late,
      labels.status,
      labels.worked,
    ]
      .map(csvValue)
      .join(','),
    ...rows,
  ].join('\n');
};
