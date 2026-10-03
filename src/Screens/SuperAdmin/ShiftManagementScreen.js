import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppText from '../../Components/AppText';
import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import KeyboardAwareScrollView from '../../Components/KeyboardAwareScrollView';
import PremiumDataCard, { CARD_ICONS } from '../../Components/PremiumDataCard';
import { useTranslation } from '../../localization/i18n';
import {
  createShift,
  getShifts,
  updateShift,
  updateShiftStatus,
} from '../../Services/shiftService';
import { translateApiError } from '../../api/errors';
import { showToast } from '../../Utils/uiFeedback';
import colors from '../../theme/colors';

const empty = { name: '', startTime: '', endTime: '' };
const timeAsDate = value => {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const date = new Date();
  if (!match) return date;
  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  date.setHours(hour, Number(match[2]), 0, 0);
  return date;
};
const formatTime = date => {
  const hours = date.getHours();
  return `${String(hours % 12 || 12).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
};
const TimeField = ({ label, onPress, value }) => (
  <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.timeField}>
    <AppText style={styles.timeLabel}>{label}</AppText>
    <AppText direction="ltr" style={[styles.timeValue, !value && styles.timePlaceholder]}>{value || '-- : -- AM'}</AppText>
  </TouchableOpacity>
);
const ShiftManagementScreen = ({ onBack }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pickerField, setPickerField] = useState(null);
  const load = useCallback(async () => {
    try {
      setItems(await getShifts());
    } catch (error) {
      showToast(t('errors.loadFailed'), translateApiError(t, error), 'error');
    }
  }, [t]);
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);
  const save = async () => {
    if (!form.name.trim() || !form.startTime.trim() || !form.endTime.trim())
      return showToast(
        t('errors.saveFailed'),
        t('validation.required'),
        'error',
      );
    setSaving(true);
    try {
      if (editing) await updateShift(editing.id, form);
      else await createShift(form);
      showToast(
        t('dialogs.success'),
        t(editing ? 'shifts.updated' : 'shifts.created'),
        'success',
      );
      setEditing(null);
      setForm(empty);
      await load();
    } catch (error) {
      showToast(t('errors.saveFailed'), translateApiError(t, error), 'error');
    } finally {
      setSaving(false);
    }
  };
  const edit = item => {
    setEditing(item);
    setForm({
      name: item.name,
      startTime: item.startTime,
      endTime: item.endTime,
    });
  };
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
    >
      <TouchableOpacity onPress={onBack}>
        <AppText style={styles.back}>{t('common.back')}</AppText>
      </TouchableOpacity>
      <AppText style={styles.title}>{t('shifts.title')}</AppText>
      <View style={styles.form}>
        <AppText style={styles.heading}>
          {t(editing ? 'shifts.edit' : 'shifts.add')}
        </AppText>
        <CustomInput
          label={t('shifts.name')}
          value={form.name}
          onChangeText={name => setForm(previous => ({ ...previous, name }))}
        />
        <TimeField
          label={t('shifts.startTime')}
          value={form.startTime}
          onPress={() => setPickerField('startTime')}
        />
        <TimeField
          label={t('shifts.endTime')}
          value={form.endTime}
          onPress={() => setPickerField('endTime')}
        />
        {pickerField ? <DateTimePicker
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={false}
          mode="time"
          onChange={(event, date) => {
            if (Platform.OS === 'android') setPickerField(null);
            if (event.type === 'set' && date) setForm(previous => ({ ...previous, [pickerField]: formatTime(date) }));
          }}
          value={timeAsDate(form[pickerField])}
        /> : null}
        <CustomButton
          loading={saving}
          onPress={save}
          title={t(editing ? 'common.save' : 'shifts.create')}
        />
        {editing ? (
          <CustomButton
            variant="secondary"
            onPress={() => {
              setEditing(null);
              setForm(empty);
            }}
            title={t('common.cancel')}
          />
        ) : null}
      </View>
      <AppText style={styles.heading}>{t('shifts.list')}</AppText>
    {loading ? (
      <ActivityIndicator color={colors.emerald} />
    ) : items.length ? (
      items.map(item => (
          <PremiumDataCard
            key={item.id}
            actions={[
              {
                key: 'edit',
                icon: CARD_ICONS.edit,
                label: t('common.edit'),
                onPress: () => edit(item),
              },
              {
                key: 'status',
                icon:
                  item.status === 'active'
                    ? CARD_ICONS.deactivate
                    : CARD_ICONS.activate,
                label: t(
                  item.status === 'active'
                    ? 'common.deactivate'
                    : 'common.activate',
                ),
                tone: item.status === 'active' ? 'danger' : 'success',
                onPress: async () => {
                  try {
                    await updateShiftStatus(
                      item.id,
                      item.status === 'active' ? 'inactive' : 'active',
                    );
                    await load();
                  } catch (error) {
                    showToast(
                      t('errors.saveFailed'),
                      translateApiError(t, error),
                      'error',
                    );
                  }
                },
              },
            ]}
          >
            <AppText style={styles.cardTitle}>{item.name}</AppText>
            <AppText direction="ltr" style={styles.cardTime}>
              {item.startTime} - {item.endTime}
            </AppText>
            <AppText style={styles.cardStatus}>
              {t(`status.${item.status}`)}
            </AppText>
          </PremiumDataCard>
      ))
    ) : (
      <AppText style={styles.empty}>{t('shifts.empty')}</AppText>
    )}
    </KeyboardAwareScrollView>
  );
};
const styles = StyleSheet.create({
  back: { color: colors.emerald, fontWeight: '800', marginBottom: 8 },
  cardStatus: { color: colors.emerald, fontWeight: '800', marginTop: 8 },
  cardTime: { color: colors.muted, marginTop: 5 },
  cardTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 96 },
  empty: { color: colors.muted, textAlign: 'center' },
  form: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    padding: 18,
  },
  heading: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
  },
  timeField: { backgroundColor: colors.emeraldSoft, borderColor: colors.border, borderRadius: 12, borderWidth: 1, marginBottom: 12, minHeight: 66, padding: 12 },
  timeLabel: { color: colors.emeraldDark, fontSize: 12, fontWeight: '800', marginBottom: 6 },
  timeValue: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  timePlaceholder: { color: colors.muted },
});
export default ShiftManagementScreen;
