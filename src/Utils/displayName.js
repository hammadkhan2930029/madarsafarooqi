export const getUserDisplayName = (user, t) => {
  if (user?.role === 'SUPER_ADMIN') return t('common.superAdminName');
  return user?.name || t('common.unknown');
};

export const getActorDisplayName = (actor, t) => {
  const role = actor?.role || (actor?.loginId === 'admin' ? 'SUPER_ADMIN' : null);
  return getUserDisplayName({ ...actor, role }, t);
};
