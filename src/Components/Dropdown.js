import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from '../localization/i18n';
import AppText from './AppText';
import colors from '../theme/colors';

const Dropdown = ({ label, placeholder, value, onPress, disabled }) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.container, disabled && styles.disabled]}
    >
      {label ? <AppText style={styles.label}>{label}</AppText> : null}
      <AppText style={value ? styles.value : styles.placeholder}>
        {value || placeholder || t('common.select')}
      </AppText>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.emeraldSoft,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    minHeight: 48,
    padding: 12,
  },
  disabled: { opacity: 0.55 },
  label: {
    color: colors.emeraldDark,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },
  value: { color: colors.ink },
  placeholder: { color: '#7D8D83' },
});
export default Dropdown;
