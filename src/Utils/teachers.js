export const getClassesForBranch = (classes, branchId, activeOnly = true) =>
  classes.filter(
    item =>
      item.branch_id === branchId && (!activeOnly || item.status === 'active'),
  );

export const isValidTiming = timing => {
  const match = String(timing || '')
    .trim()
    .toUpperCase()
    .match(
      /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)\s*-\s*(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/,
    );
  if (!match) {
    return false;
  }
  const toMinutes = (hour, minute, meridiem) =>
    ((Number(hour) % 12) + (meridiem === 'PM' ? 12 : 0)) * 60 + Number(minute);
  return (
    toMinutes(match[4], match[5], match[6]) >
    toMinutes(match[1], match[2], match[3])
  );
};

export const getTimingStartMinutes = timing => {
  if (!isValidTiming(timing)) {
    return null;
  }
  const match = String(timing)
    .trim()
    .toUpperCase()
    .match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)/);
  return (
    ((Number(match[1]) % 12) + (match[3] === 'PM' ? 12 : 0)) * 60 +
    Number(match[2])
  );
};

export const getUtcMinutes = date =>
  date.getUTCHours() * 60 + date.getUTCMinutes();

export const isLateAt = (date, timingStartMinutes) =>
  getUtcMinutes(date) > timingStartMinutes;

export const formatSalary = value => {
  const salary = Number(value);
  return Number.isFinite(salary) ? salary.toLocaleString() : '--';
};
