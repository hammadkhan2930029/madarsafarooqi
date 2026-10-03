export const normalizeRole = role => {
  if (role === 'SUPER_ADMIN') {
    return 'SUPER_ADMIN';
  }
  if (role === 'TEACHER') {
    return 'TEACHER';
  }
  return null;
};
