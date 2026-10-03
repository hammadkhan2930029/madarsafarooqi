import {
  canTeacherEditReport,
  getReportId,
  getReportPeriod,
  getReportDates,
  getEditMinutesRemaining,
  reportsToCsv,
  validateReportContent,
  validateReportPeriod,
} from '../src/Utils/reports';
import { reportStrings } from '../src/Strings/reportStrings';

describe('teacher report utilities', () => {
  test('builds deterministic daily, weekly and monthly periods', () => {
    const date = new Date('2026-08-01T12:00:00.000Z');
    expect(getReportPeriod('daily', date)).toBe('2026-08-01');
    expect(getReportPeriod('weekly', date)).toMatch(/^2026-W\d{2}$/);
    expect(getReportPeriod('monthly', date)).toBe('2026-08');
    expect(getReportId('teacher1', 'daily', '2026-08-01')).toBe(
      'teacher1_daily_2026-08-01',
    );
  });

  test('maps visible periods to backend calendar boundaries', () => {
    expect(getReportDates('daily', '2026-08-10')).toEqual({
      reportDate: '2026-08-10',
      periodStart: '2026-08-10',
      periodEnd: '2026-08-10',
    });
    expect(getReportDates('weekly', '2026-W33')).toEqual({
      reportDate: '2026-08-16',
      periodStart: '2026-08-10',
      periodEnd: '2026-08-16',
    });
    expect(getReportDates('monthly', '2026-02')).toEqual({
      reportDate: '2026-02-28',
      periodStart: '2026-02-01',
      periodEnd: '2026-02-28',
    });
  });

  test('enforces content and report period formats', () => {
    expect(validateReportContent('Complete teaching report')).toBe('');
    expect(validateReportContent('short')).toBe('validation.reportLength');
    expect(validateReportPeriod('weekly', '2026-W31')).toBe('');
    expect(validateReportPeriod('weekly', '2026-08')).not.toBe('');
  });

  test('checks the teacher edit deadline', () => {
    const report = {
      editable_until: { toDate: () => new Date('2026-08-01T10:30:00Z') },
    };
    expect(canTeacherEditReport(report, new Date('2026-08-01T10:29:59Z'))).toBe(
      true,
    );
    expect(canTeacherEditReport(report, new Date('2026-08-01T10:30:00Z'))).toBe(
      false,
    );
  });

  test('shows rounded edit time remaining from backend deadline', () => {
    expect(
      getEditMinutesRemaining(
        { editable_until: '2026-08-01T10:30:00Z' },
        new Date('2026-08-01T10:20:01Z'),
      ),
    ).toBe(10);
  });

  test('exports CSV with Urdu headings', () => {
    const csv = reportsToCsv(
      [
        {
          teacher_id: 't1',
          report_type: 'daily',
          report_period: '2026-08-01',
          content: { summary: 'سبق مکمل' },
          status: 'submitted',
        },
      ],
      reportStrings.csv,
    );
    expect(csv).toContain(reportStrings.csv.teacher);
    expect(csv).toContain('سبق مکمل');
  });
});
