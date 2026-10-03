import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import AppText from '../../Components/AppText';
import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import PremiumDataCard, { CARD_ICONS } from '../../Components/PremiumDataCard';
import ScalableSelector from '../../Components/ScalableSelector';
import { useTranslation } from '../../localization/i18n';
import { createHoliday, deactivateHoliday, listHolidays, updateHoliday, updateHolidayStatus } from '../../Services/holidayService';
import { translateApiError } from '../../api/errors';
import { routeAlert, showToast } from '../../Utils/uiFeedback';
import colors from '../../theme/colors';
import { getActorDisplayName } from '../../Utils/displayName';

const initialForm = { title: '', description: '', startDate: '', endDate: '', affectsAttendance: true };
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
const HolidayManagementScreen = ({ onBack }) => {
  const { language, t } = useTranslation();
  const listRef = useRef(null);
  const [items, setItems] = useState([]), [form, setForm] = useState(initialForm), [editing, setEditing] = useState(null);
  const [dateType, setDateType] = useState('single'), [search, setSearch] = useState(''), [status, setStatus] = useState('all');
  const [effect, setEffect] = useState('all'), [page, setPage] = useState(1), [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [refreshing, setRefreshing] = useState(false), [details, setDetails] = useState(null);
  const load = useCallback(async targetPage => {
    const result = await listHolidays({ search, status, affectsAttendance: effect, page: targetPage });
    setItems(result.items); setPagination(result.pagination); setPage(targetPage);
  }, [effect, search, status]);
  useEffect(() => { const timer = setTimeout(() => load(1).catch(error => showToast(t('errors.loadFailed'), translateApiError(t, error), 'error')).finally(() => setLoading(false)), 250); return () => clearTimeout(timer); }, [load, t]);
  const reset = () => { setEditing(null); setDateType('single'); setForm(initialForm); };
  const save = async () => {
    const endDate = dateType === 'single' ? form.startDate : form.endDate;
    if (!form.title.trim() || !validDate(form.startDate) || !validDate(endDate) || form.startDate > endDate) return showToast(t('errors.saveFailed'), t('holidays.invalidForm'), 'error');
    setSaving(true);
    try {
      const payload = { title: form.title.trim(), description: form.description.trim() || null, startDate: form.startDate, endDate, affectsAttendance: form.affectsAttendance };
      if (editing) await updateHoliday(editing.id, payload); else await createHoliday(payload);
      showToast(t('dialogs.success'), t(editing ? 'holidays.updated' : 'holidays.created'), 'success'); reset(); await load(1);
    } catch (error) { showToast(t('errors.saveFailed'), translateApiError(t, error), 'error'); } finally { setSaving(false); }
  };
  const editSafe = item => { setEditing(item); setDateType(item.startDate === item.endDate ? 'single' : 'range'); setForm({ title: item.title, description: item.description || '', startDate: item.startDate, endDate: item.endDate, affectsAttendance: item.affectsAttendance }); listRef.current?.scrollToOffset({ offset: 0, animated: true }); };
  const dayName = value => new Intl.DateTimeFormat(language === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
  const dateLabel = item => item.startDate === item.endDate ? item.startDate : `${item.startDate} — ${item.endDate}`;
  const header = <View>
    <TouchableOpacity onPress={onBack}><AppText style={styles.back}>{t('common.back')}</AppText></TouchableOpacity>
    <AppText style={styles.title}>{t('holidays.title')}</AppText>
    <View style={styles.form}><AppText style={styles.heading}>{t(editing ? 'holidays.edit' : 'holidays.add')}</AppText>
      <ScalableSelector label={t('holidays.dateType')} value={dateType} onChange={setDateType} options={[{ id: 'single', label: t('holidays.singleDate') }, { id: 'range', label: t('holidays.dateRange') }]} />
      <CustomInput contentDirection="ltr" label={t('holidays.startDate')} placeholder={t('holidays.datePlaceholder')} value={form.startDate} onChangeText={startDate => setForm(previous => ({ ...previous, startDate }))} />
      {dateType === 'range' ? <CustomInput contentDirection="ltr" label={t('holidays.endDate')} placeholder={t('holidays.datePlaceholder')} value={form.endDate} onChangeText={endDate => setForm(previous => ({ ...previous, endDate }))} /> : null}
      <CustomInput label={t('holidays.holidayTitle')} value={form.title} onChangeText={title => setForm(previous => ({ ...previous, title }))} />
      <CustomInput label={t('holidays.description')} multiline value={form.description} onChangeText={description => setForm(previous => ({ ...previous, description }))} />
      <ScalableSelector label={t('holidays.attendanceEffect')} value={form.affectsAttendance ? 'yes' : 'no'} onChange={value => setForm(previous => ({ ...previous, affectsAttendance: value === 'yes' }))} options={[{ id: 'yes', label: t('holidays.excludeAttendance') }, { id: 'no', label: t('holidays.informationOnly') }]} />
      <AppText style={styles.help}>{t('holidays.attendanceHelp')}</AppText><CustomButton loading={saving} onPress={save} title={t(editing ? 'common.save' : 'holidays.create')} />
      {editing ? <CustomButton variant="secondary" onPress={reset} title={t('common.cancel')} /> : null}
    </View>
    <AppText style={styles.heading}>{t('holidays.list')} · {pagination.total}</AppText>
    <CustomInput label={t('common.search')} value={search} onChangeText={setSearch} placeholder={t('holidays.searchPlaceholder')} />
    <ScalableSelector label={t('common.status')} value={status} onChange={setStatus} options={[{ id: 'all', label: t('common.all') }, { id: 'active', label: t('status.active') }, { id: 'inactive', label: t('status.inactive') }]} />
    <ScalableSelector label={t('holidays.attendanceEffect')} value={effect} onChange={setEffect} options={[{ id: 'all', label: t('common.all') }, { id: 'yes', label: t('holidays.excludeAttendance') }, { id: 'no', label: t('holidays.informationOnly') }]} />
  </View>;
  return <>
    <FlashList ref={listRef} data={items} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(1).catch(() => {}); setRefreshing(false); }} />} ListHeaderComponent={header}
      ListEmptyComponent={loading ? <ActivityIndicator color={colors.emerald} /> : <AppText style={styles.empty}>{t('holidays.empty')}</AppText>}
      keyExtractor={item => item.id} renderItem={({ item }) => <PremiumDataCard actions={[
        { key: 'view', icon: CARD_ICONS.view, label: t('common.view'), onPress: () => setDetails(item) },
        { key: 'edit', icon: CARD_ICONS.edit, label: t('common.edit'), onPress: () => editSafe(item) },
        { key: 'status', icon: item.status === 'active' ? CARD_ICONS.delete : CARD_ICONS.activate, label: t(item.status === 'active' ? 'common.deactivate' : 'common.activate'), tone: item.status === 'active' ? 'danger' : 'success', onPress: () => routeAlert(t('holidays.confirmTitle'), t('holidays.confirmMessage'), [{ text: t('common.cancel') }, { text: t('common.yes'), onPress: async () => { try { if (item.status === 'active') await deactivateHoliday(item.id); else await updateHolidayStatus(item.id, 'active'); await load(page); } catch (error) { showToast(t('errors.saveFailed'), translateApiError(t, error), 'error'); } } }]) },
      ]}><AppText style={styles.cardTitle}>{item.title}</AppText><AppText direction="ltr" style={styles.date}>{dateLabel(item)}</AppText><AppText style={styles.meta}>{dayName(item.startDate)} · {t(`status.${item.status}`)}</AppText><AppText style={styles.meta}>{t('holidays.createdBy')}: {getActorDisplayName(item.createdBy, t)}</AppText><AppText style={item.affectsAttendance ? styles.effect : styles.meta}>{t(item.affectsAttendance ? 'holidays.excludeAttendance' : 'holidays.informationOnly')}</AppText></PremiumDataCard>}
      ListFooterComponent={pagination.totalPages > 1 ? <View style={styles.pages}><CustomButton disabled={page <= 1} variant="secondary" title={t('common.previous')} onPress={() => load(page - 1)} /><AppText>{page}/{pagination.totalPages}</AppText><CustomButton disabled={page >= pagination.totalPages} variant="secondary" title={t('common.next')} onPress={() => load(page + 1)} /></View> : <View style={styles.bottom} />} />
    <Modal transparent animationType="fade" visible={Boolean(details)} onRequestClose={() => setDetails(null)}><View style={styles.overlay}><View style={styles.modal}><AppText style={styles.title}>{t('holidays.details')}</AppText>{details ? <><AppText style={styles.cardTitle}>{details.title}</AppText><AppText direction="ltr" style={styles.date}>{dateLabel(details)}</AppText><AppText style={styles.meta}>{dayName(details.startDate)}</AppText><AppText style={styles.description}>{details.description || t('common.none')}</AppText><AppText style={styles.meta}>{t('common.status')}: {t(`status.${details.status}`)}</AppText><AppText style={styles.meta}>{t('holidays.createdBy')}: {getActorDisplayName(details.createdBy, t)}</AppText><AppText style={styles.effect}>{t(details.affectsAttendance ? 'holidays.excludeAttendance' : 'holidays.informationOnly')}</AppText></> : null}<CustomButton title={t('common.close')} onPress={() => setDetails(null)} /></View></View></Modal>
  </>;
};
const styles = StyleSheet.create({ back: { color: colors.emerald, fontWeight: '800', marginBottom: 8 }, bottom: { height: 40 }, cardTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' }, content: { padding: 20, paddingBottom: 96 }, date: { color: colors.emeraldDark, fontWeight: '800', marginTop: 7 }, description: { color: colors.ink, marginVertical: 14 }, effect: { color: colors.emeraldDark, fontWeight: '800', marginTop: 8 }, empty: { color: colors.muted, padding: 24, textAlign: 'center' }, form: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 20, borderWidth: 1, marginBottom: 24, padding: 18 }, heading: { color: colors.ink, fontSize: 20, fontWeight: '900', marginBottom: 14 }, help: { color: colors.muted, fontSize: 13, marginBottom: 12 }, meta: { color: colors.muted, marginTop: 6 }, modal: { backgroundColor: colors.white, borderRadius: 22, maxHeight: '85%', padding: 22, width: '90%' }, overlay: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', flex: 1, justifyContent: 'center' }, pages: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'center', paddingVertical: 18 }, title: { color: colors.ink, fontSize: 28, fontWeight: '900', marginBottom: 20 } });
export default HolidayManagementScreen;
