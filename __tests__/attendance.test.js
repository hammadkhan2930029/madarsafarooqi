import {
  attendanceToCsv,
  filterAttendance,
  filterAttendanceByRange,
  formatAttendanceDate,
  formatDuration,
  getWorkedMinutes,
  summarizeAttendance,
  validateAttendanceCorrection,
} from '../src/Utils/attendance';

describe('attendance utilities', () => {
  const records = [
    {
      day: 20613,
      employeeName: 'Ali',
      status: 'complete',
      checkInAt: '2026-06-09T08:00:00Z',
      checkOutAt: '2026-06-09T16:30:00Z',
    },
    {
      day: 20614,
      employeeName: 'Sara',
      status: 'incomplete',
      checkInAt: '2026-06-10T08:00:00Z',
      checkOutAt: null,
    },
  ];

  test('calculates worked minutes only for complete timestamps', () => {
    expect(getWorkedMinutes(records[0])).toBe(510);
    expect(getWorkedMinutes(records[1])).toBe(0);
  });

  test('formats worked duration', () => {
    expect(formatDuration(510)).toBe('8h 30m');
    expect(formatDuration(0)).toBe('--');
  });

  test('derives the UTC date from the secured day number', () => {
    expect(formatAttendanceDate(20613)).toBe('2026-06-09');
    expect(formatAttendanceDate()).toBe('--');
  });

  test('filters records by completion state', () => {
    expect(filterAttendance(records, 'complete')).toHaveLength(1);
    expect(filterAttendance(records, 'pending')).toHaveLength(1);
    expect(filterAttendance(records, 'all')).toHaveLength(2);
  });

  test('builds attendance summary', () => {
    expect(summarizeAttendance(records)).toEqual({
      total: 2,
      complete: 1,
      pending: 1,
      minutes: 510,
    });
  });

  test('filters date ranges and exports CSV', () => {
    expect(filterAttendanceByRange(records, 'today', 20614)).toHaveLength(1);
    expect(filterAttendanceByRange(records, '7days', 20614)).toHaveLength(2);

    const csv = attendanceToCsv(records, {
      date: 'Date',
      teacher: 'Teacher',
      branch: 'Branch',
      class: 'Class',
      timing: 'Timing',
      checkIn: 'Check In',
      checkOut: 'Check Out',
      late: 'Late',
      status: 'Status',
      worked: 'Worked',
      onTime: 'On Time',
      unknown: 'Unknown',
    });
    expect(csv).toContain(
      '"Date","Teacher","Branch","Class","Timing","Check In","Check Out","Late","Status","Worked"',
    );
    expect(csv).toContain('"Ali"');
    expect(csv).toContain('"8h 30m"');
    expect(csv).toContain('"Unknown"');
  });

  test('validates correction status and timestamp combinations', () => {
    const base = {
      checkInAt: '2026-08-10T03:00:00.000Z',
      checkOutAt: '2026-08-10T10:00:00.000Z',
      status: 'PRESENT',
      isLate: false,
      reason: 'Corrected against register',
    };
    expect(validateAttendanceCorrection(base)).toBeNull();
    expect(validateAttendanceCorrection({ ...base, reason: ' ' })).toBe(
      'validation.correctionReason',
    );
    expect(
      validateAttendanceCorrection({
        ...base,
        checkOutAt: '2026-08-10T02:00:00.000Z',
      }),
    ).toBe('validation.checkOutOrder');
    expect(
      validateAttendanceCorrection({ ...base, status: 'INCOMPLETE' }),
    ).toBe('validation.incompleteAttendance');
    expect(
      validateAttendanceCorrection({
        ...base,
        status: 'ON_LEAVE',
        checkInAt: '',
        checkOutAt: '',
        isLate: null,
      }),
    ).toBeNull();
  });
});
