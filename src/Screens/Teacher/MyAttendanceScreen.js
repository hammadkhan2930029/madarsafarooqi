import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '../../Components/Header';
import AppText from '../../Components/AppText';
import { getMyAttendance } from '../../Services/attendanceService';
import {
  formatAttendanceDate,
  formatDuration,
  formatTime,
  getDateRange,
  getWorkedMinutes,
} from '../../Utils/attendance';
import { useTranslation } from '../../localization/i18n';
import colors from '../../theme/colors';

const ranges = ['all', '7days', '30days'];

const MyAttendanceScreen = ({ onBack }) => {
  const { isRTL, t } = useTranslation();
  const [range, setRange] = useState('all');
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const result = await getMyAttendance({
      ...getDateRange(range),
      limit: 50,
      page,
    });
    setRecords(result.items || []);
    setPagination(result.pagination || { page, total: 0, totalPages: 1 });
  }, [page, range]);

  useEffect(() => {
    setLoading(true);
    load().catch(() => setRecords([])).finally(() => setLoading(false));
  }, [load]);

  const summary = useMemo(() => records.reduce((value, record) => {
    value.total += 1;
    if (record.status === 'complete') value.present += 1;
    if (record.is_late) value.late += 1;
    value.minutes += getWorkedMinutes(record);
    return value;
  }, { late: 0, minutes: 0, present: 0, total: 0 }), [records]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const rangeLabel = key => {
    if (key === 'all') return isRTL ? 'تمام' : 'All';
    if (key === '7days') return isRTL ? '7 دن' : '7 Days';
    return isRTL ? '30 دن' : '30 Days';
  };
  const statusLabel = record => t(
    record.status === 'complete'
      ? 'attendance.complete'
      : record.status === 'on_leave'
      ? 'attendance.onLeave'
      : 'attendance.incomplete',
  );

  const renderRecord = ({ item }) => {
    const isComplete = item.status === 'complete';
    return (
      <View style={styles.recordCard}>
        <View style={styles.recordTop}>
          <View>
            <AppText style={styles.date}>{formatAttendanceDate(item.attendance_date)}</AppText>
            <AppText style={styles.timing}>{item.timing || '--'}</AppText>
          </View>
          <View style={[styles.statusPill, isComplete ? styles.presentPill : styles.pendingPill]}>
            <AppText style={[styles.statusText, isComplete ? styles.presentText : styles.pendingText]}>{statusLabel(item)}</AppText>
          </View>
        </View>
        <View style={styles.timesRow}>
          <View style={styles.timeCell}>
            <MaterialCommunityIcons color={colors.emeraldDark} name="login" size={19} />
            <AppText style={styles.timeLabel}>{t('attendance.checkIn')}</AppText>
            <AppText direction="ltr" style={styles.timeValue}>{formatTime(item.checkInAt)}</AppText>
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeCell}>
            <MaterialCommunityIcons color={colors.emeraldDark} name="logout" size={19} />
            <AppText style={styles.timeLabel}>{t('attendance.checkOut')}</AppText>
            <AppText direction="ltr" style={styles.timeValue}>{formatTime(item.checkOutAt)}</AppText>
          </View>
        </View>
        <View style={styles.recordFooter}>
          <AppText style={item.is_late ? styles.late : styles.onTime}>
            {item.is_late
              ? t('attendance.lateMinutes', { count: item.lateMinutes || 0 })
              : t('attendance.onTime')}
          </AppText>
          <AppText direction="ltr" style={styles.duration}>{formatDuration(getWorkedMinutes(item))}</AppText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={t('navigation.attendanceHistory')} />
      <FlashList
        contentContainerStyle={styles.content}
        data={records}
        keyExtractor={item => String(item.id)}
        ListEmptyComponent={loading ? <ActivityIndicator color={colors.emerald} size="large" /> : <AppText align="center" style={styles.empty}>{t('attendance.noHistory')}</AppText>}
        ListFooterComponent={
          pagination.totalPages > 1 ? (
            <View style={styles.pagination}>
              <TouchableOpacity disabled={page <= 1} onPress={() => setPage(value => value - 1)} style={[styles.pageButton, page <= 1 && styles.disabledButton]}><AppText style={styles.pageButtonText}>{t('common.previous')}</AppText></TouchableOpacity>
              <AppText style={styles.pageInfo}>{page} / {pagination.totalPages}</AppText>
              <TouchableOpacity disabled={page >= pagination.totalPages} onPress={() => setPage(value => value + 1)} style={[styles.pageButton, page >= pagination.totalPages && styles.disabledButton]}><AppText style={styles.pageButtonText}>{t('common.next')}</AppText></TouchableOpacity>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <AppText style={styles.heroTitle}>{t('navigation.attendanceHistory')}</AppText>
              <AppText style={styles.heroSub}>{isRTL ? 'اپنی روزانہ حاضری اور اوقات دیکھیں' : 'View your daily attendance and timings'}</AppText>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCell}><AppText style={styles.summaryValue}>{pagination.total || summary.total}</AppText><AppText style={styles.summaryLabel}>{isRTL ? 'ریکارڈز' : 'Records'}</AppText></View>
                <View style={styles.summaryCell}><AppText style={styles.summaryValue}>{summary.present}</AppText><AppText style={styles.summaryLabel}>{t('attendance.complete')}</AppText></View>
                <View style={styles.summaryCell}><AppText style={styles.summaryValue}>{summary.late}</AppText><AppText style={styles.summaryLabel}>{t('attendance.late')}</AppText></View>
              </View>
            </View>
            <View style={styles.rangeRow}>
              {ranges.map(item => <TouchableOpacity key={item} onPress={() => { setPage(1); setRange(item); }} style={[styles.rangePill, range === item && styles.rangePillActive]}><AppText style={[styles.rangeText, range === item && styles.rangeTextActive]}>{rangeLabel(item)}</AppText></TouchableOpacity>)}
            </View>
          </View>
        }
        refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing} tintColor={colors.emerald} />}
        renderItem={renderRecord}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 96 },
  date: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  disabledButton: { opacity: 0.4 },
  duration: { color: colors.emeraldDark, fontWeight: '900' },
  empty: { color: colors.muted, marginTop: 32 },
  hero: { backgroundColor: colors.emeraldDeep, borderRadius: 20, marginBottom: 16, padding: 20 },
  heroSub: { color: 'rgba(255,255,255,0.76)', fontSize: 13, marginTop: 4 },
  heroTitle: { color: colors.white, fontSize: 23, fontWeight: '900' },
  late: { color: colors.danger, fontWeight: '800' },
  onTime: { color: colors.emeraldDark, fontWeight: '800' },
  pageButton: { backgroundColor: colors.emeraldLight, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  pageButtonText: { color: colors.emeraldDark, fontWeight: '800' },
  pageInfo: { color: colors.muted, fontWeight: '800' },
  pagination: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  pendingPill: { backgroundColor: '#FFF0DC' },
  pendingText: { color: '#9B5A00' },
  presentPill: { backgroundColor: colors.emeraldLight },
  presentText: { color: colors.emeraldDark },
  rangePill: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 9 },
  rangePillActive: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  rangeText: { color: colors.muted, fontWeight: '800' },
  rangeTextActive: { color: colors.white },
  recordCard: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginBottom: 12, padding: 16 },
  recordFooter: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12 },
  recordTop: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  statusPill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { fontSize: 12, fontWeight: '900' },
  summaryCell: { alignItems: 'center', flex: 1 },
  summaryLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 11, marginTop: 3 },
  summaryRow: { borderTopColor: 'rgba(255,255,255,0.18)', borderTopWidth: 1, flexDirection: 'row', marginTop: 18, paddingTop: 14 },
  summaryValue: { color: colors.white, fontSize: 21, fontWeight: '900' },
  timeCell: { alignItems: 'center', flex: 1 },
  timeDivider: { backgroundColor: colors.border, height: 45, width: 1 },
  timeLabel: { color: colors.muted, fontSize: 11, marginTop: 4 },
  timeValue: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 2 },
  timesRow: { alignItems: 'center', backgroundColor: colors.emeraldSoft, borderRadius: 14, flexDirection: 'row', marginTop: 14, paddingVertical: 12 },
  timing: { color: colors.muted, fontSize: 12, marginTop: 3 },
});

export default MyAttendanceScreen;
