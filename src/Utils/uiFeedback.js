let toastListener = null;
let activityListener = null;
let confirmationListener = null;
let activeRequests = 0;

export const registerToastListener = listener => {
  toastListener = listener;
  return () => {
    if (toastListener === listener) toastListener = null;
  };
};
export const registerActivityListener = listener => {
  activityListener = listener;
  listener(activeRequests);
  return () => {
    if (activityListener === listener) activityListener = null;
  };
};
export const registerConfirmationListener = listener => {
  confirmationListener = listener;
  return () => {
    if (confirmationListener === listener) confirmationListener = null;
  };
};
export const showToast = (title, message = '', type = 'info') =>
  toastListener?.({
    id: Date.now(),
    title: String(title || ''),
    message: String(message || ''),
    type,
  });
export const routeAlert = (title, message = '', buttons) => {
  if (Array.isArray(buttons) && buttons.length)
    return confirmationListener?.({
      title: String(title || ''),
      message: String(message || ''),
      buttons,
    });
  const value = `${title || ''} ${message || ''}`.toLowerCase();
  const type = /(failed|error|invalid|incorrect|could not|نہیں|غلط|ناکام)/.test(
    value,
  )
    ? 'error'
    : /(saved|success|complete|updated|submitted|محفوظ|مکمل|کامیاب)/.test(value)
    ? 'success'
    : 'info';
  return showToast(title, message, type);
};
export const beginRequest = config => {
  if (config) config.__activityEnded = false;
  activeRequests += 1;
  activityListener?.(activeRequests);
  return config;
};
export const endRequest = config => {
  if (config && !config.__activityEnded) {
    config.__activityEnded = true;
    activeRequests = Math.max(0, activeRequests - 1);
    activityListener?.(activeRequests);
  }
};
