import React, { useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { useTranslation } from '../localization/i18n';
import colors from '../theme/colors';
import AppText from './AppText';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';

const ScalableSelector = ({
  disabled = false,
  label,
  multiple = false,
  onChange,
  options = [],
  placeholder,
  value,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = multiple ? (Array.isArray(value) ? value : []) : [value];
  const selectedOptions = options.filter(item => selected.includes(item.id));
  const displayValue = multiple
    ? selectedOptions
        .map(item => item.label)
        .slice(0, 2)
        .join(', ') +
      (selectedOptions.length > 2 ? ` (+${selectedOptions.length - 2})` : '')
    : selectedOptions[0]?.label;
  const visibleOptions = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return term
      ? options.filter(item => item.label.toLocaleLowerCase().includes(term))
      : options;
  }, [options, search]);

  const choose = id => {
    if (!multiple) {
      onChange(id);
      setOpen(false);
      setSearch('');
      return;
    }
    onChange(
      selected.includes(id)
        ? selected.filter(item => item !== id)
        : [...selected, id],
    );
  };

  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.field, disabled && styles.disabled]}
      >
        {label ? <AppText style={styles.label}>{label}</AppText> : null}
        <View style={styles.fieldRow}>
          <AppText
            numberOfLines={1}
            style={[styles.value, !displayValue && styles.placeholder]}
          >
            {displayValue || placeholder || t('common.selectOption')}
          </AppText>
          <AppText direction="ltr" style={styles.chevron}>
            {'\u2304'}
          </AppText>
        </View>
      </TouchableOpacity>
      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <AppText style={styles.title}>
              {label || t('common.selectOption')}
            </AppText>
            <CustomInput
              autoCapitalize="none"
              label={t('common.search')}
              onChangeText={setSearch}
              value={search}
            />
            <FlashList
              data={visibleOptions}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              keyExtractor={item => String(item.id)}
              ListEmptyComponent={
                <AppText style={styles.empty}>{t('common.noOption')}</AppText>
              }
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={styles.list}
              renderItem={({ item }) => {
                const active = selected.includes(item.id);
                return (
                  <TouchableOpacity
                    onPress={() => choose(item.id)}
                    style={[styles.option, active && styles.optionActive]}
                  >
                    <AppText
                      style={[
                        styles.optionText,
                        active && styles.optionTextActive,
                      ]}
                    >
                      {item.label}
                    </AppText>
                    {active ? (
                      <AppText direction="ltr" style={styles.check}>
                        {'\u2713'}
                      </AppText>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
            <CustomButton
              onPress={() => {
                setOpen(false);
                setSearch('');
              }}
              title={t('common.close')}
              variant="secondary"
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  check: { color: colors.emeraldDark, fontSize: 18, fontWeight: '900' },
  chevron: { color: colors.emeraldDark, fontSize: 18 },
  disabled: { opacity: 0.5 },
  empty: { color: colors.muted, padding: 20, textAlign: 'center' },
  field: {
    backgroundColor: colors.emeraldSoft,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 58,
    padding: 12,
  },
  fieldRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  label: {
    color: colors.emeraldDark,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 5,
  },
  list: { flex: 1 },
  modal: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: '78%',
    padding: 16,
    width: '92%',
  },
  option: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionActive: { backgroundColor: colors.emeraldLight },
  optionText: { color: colors.ink, flex: 1 },
  optionTextActive: { color: colors.emeraldDark, fontWeight: '900' },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(5,31,16,0.58)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  placeholder: { color: colors.muted },
  title: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 10,
  },
  value: { color: colors.ink, flex: 1, fontWeight: '700' },
});

export default ScalableSelector;
