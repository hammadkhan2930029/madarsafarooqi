export const isRTL = language => language === 'ur';
export const getTextAlign = rtl => (rtl ? 'right' : 'left');
export const getRowDirection = rtl => (rtl ? 'row-reverse' : 'row');
export const getWritingDirection = rtl => (rtl ? 'rtl' : 'ltr');
export const getDirectionalIcon = (icon, rtl) => {
  if (!rtl) return icon;
  return (
    {
      '\u2039': '\u203a',
      '\u203a': '\u2039',
      '\u2190': '\u2192',
      '\u2192': '\u2190',
    }[icon] || icon
  );
};
