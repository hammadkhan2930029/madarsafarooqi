import {
  filterLeaveRequests,
  isValidUtcDate,
  validateLeaveRequest,
} from '../src/Utils/leaves';

describe('leave request utilities', () => {
  test('validates UTC dates and logical ranges', () => {
    expect(isValidUtcDate('2026-08-01')).toBe(true);
    expect(isValidUtcDate('2026-02-30')).toBe(false);
    expect(
      validateLeaveRequest({
        startDate: '2026-08-01',
        endDate: '2026-08-03',
        reason: 'Family event',
      }),
    ).toBe('');
    expect(
      validateLeaveRequest({
        startDate: '2026-08-03',
        endDate: '2026-08-01',
        reason: 'Family event',
      }),
    ).toBe('validation.dateOrder');
  });

  test('requires a meaningful reason', () => {
    expect(
      validateLeaveRequest({
        startDate: '2026-08-01',
        endDate: '2026-08-01',
        reason: '',
      }),
    ).toBe('validation.leaveReason');
  });

  test('filters by status, teacher, branch and overlapping date', () => {
    const requests = [
      {
        status: 'pending',
        teacher_id: 't1',
        branch_id: 'b1',
        start_date: '2026-08-01',
        end_date: '2026-08-03',
      },
      {
        status: 'approved',
        teacher_id: 't2',
        branch_id: 'b2',
        start_date: '2026-08-04',
        end_date: '2026-08-04',
      },
    ];
    expect(
      filterLeaveRequests(requests, {
        status: 'pending',
        teacher: 't1',
        branch: 'b1',
        date: '2026-08-02',
      }),
    ).toEqual([requests[0]]);
    expect(
      filterLeaveRequests(requests, {
        status: 'all',
        teacher: 'all',
        branch: 'all',
        date: '2026-08-05',
      }),
    ).toEqual([]);
  });
});
