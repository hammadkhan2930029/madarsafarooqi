export const getApiErrorCode = error =>
  error?.response?.data?.error?.code ||
  (error?.response ? 'UNKNOWN_ERROR' : 'NETWORK_ERROR');

export const translateApiError = (t, error) => {
  const key = `apiErrors.${getApiErrorCode(error)}`;
  const translated = t(key);
  return translated === key ? t('errors.generic') : translated;
};

export const translatedErrorMessage = (t, error) => translateApiError(t, error);
