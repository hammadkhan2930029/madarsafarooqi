import { env } from '../Config/env';

export const REPORT_TYPES = ['daily', 'weekly', 'monthly'];

const institutionDate = date => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: env.APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
};

export const getReportPeriod = (type, date = new Date()) => {
  const isoDate = institutionDate(date);
  if (type === 'daily') return isoDate;
  if (type === 'monthly') return isoDate.slice(0, 7);
  const [year, month, monthDay] = isoDate.split('-').map(Number);
  const day = new Date(Date.UTC(year, month - 1, monthDay));
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((day - yearStart) / 86400000 + 1) / 7);
  return `${day.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

export const getReportId = (teacherUid, type, period) =>
  `${teacherUid}_${type}_${period}`;

export const canTeacherEditReport = (report, now = new Date()) => {
  const deadline =
    report?.editable_until?.toDate?.() ||
    (report?.editable_until ? new Date(report.editable_until) : null);
  return Boolean(deadline && now < deadline);
};

export const getEditMinutesRemaining = (report, now = new Date()) =>
  Math.max(
    0,
    Math.ceil(
      (new Date(report?.editable_until).getTime() - now.getTime()) / 60000,
    ),
  );

export const getReportDates = (type, period) => {
  if (type === 'daily')
    return { reportDate: period, periodStart: period, periodEnd: period };
  if (type === 'monthly') {
    const [year, month] = period.split('-').map(Number);
    const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
    return { reportDate: end, periodStart: `${period}-01`, periodEnd: end };
  }
  const match = /^(\d{4})-W(\d{2})$/.exec(period);
  if (!match) return {};
  const year = Number(match[1]);
  const week = Number(match[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const monday = new Date(jan4);
  monday.setUTCDate(
    jan4.getUTCDate() - (jan4.getUTCDay() || 7) + 1 + (week - 1) * 7,
  );
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    reportDate: sunday.toISOString().slice(0, 10),
    periodStart: monday.toISOString().slice(0, 10),
    periodEnd: sunday.toISOString().slice(0, 10),
  };
};

export const validateReportContent = content => {
  const value = String(content || '').trim();
  if (value.length < 10 || value.length > 5000)
    return 'validation.reportLength';
  return '';
};

export const validateReportPeriod = (type, period) => {
  const value = String(period || '');
  let valid = false;
  if (type === 'daily' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`);
    valid =
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value;
  } else if (type === 'weekly') {
    valid = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(value);
  } else if (type === 'monthly') {
    valid = /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  }
  return valid ? '' : 'validation.period';
};

const csvValue = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const reportsToCsv = (reports, labels) => {
  const header = [
    labels.teacher,
    labels.branch,
    labels.className,
    labels.type,
    labels.period,
    labels.content,
    labels.submitted,
    labels.status,
  ].join(',');
  const rows = reports.map(report =>
    [
      report.teacherName || report.teacher_id,
      report.branchName || report.branch_id,
      report.className || report.class_id,
      report.report_type,
      report.report_period,
      report.content?.summary || '',
      report.submitted_at?.toDate?.()?.toISOString() || '',
      report.status,
    ]
      .map(csvValue)
      .join(','),
  );
  return [header, ...rows].join('\n');
};
