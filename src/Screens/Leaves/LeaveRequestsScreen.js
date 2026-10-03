import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Text from '../../Components/AppText';
import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import KeyboardAwareScrollView from '../../Components/KeyboardAwareScrollView';
import Header from '../../Components/Header';
import ScalableSelector from '../../Components/ScalableSelector';
import { getActorDisplayName } from '../../Utils/displayName';
import { useTranslation } from '../../localization/i18n';
import { getTeachers } from '../../Services/teacherService';
import { getBranches } from '../../Services/branchService';
import {
  createLeaveRequest,
  getLeaveRequestDetails,
  getSuperAdminLeaveRequests,
  getTeacherLeaveRequests,
  reviewLeaveRequest,
} from '../../Services/leaveService';
import {
  filterLeaveRequests,
  isValidUtcDate,
  LEAVE_STATUSES,
  validateLeaveRequest,
} from '../../Utils/leaves';
import { getInstitutionDate } from '../../Utils/attendance';
import { translateApiError } from '../../api/errors';
import colors from '../../theme/colors';

const today = () => getInstitutionDate();
const Pill = ({ active, label, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.pill, active && styles.pillActive]}
  >
    <Text style={[styles.pillText, active && styles.pillTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const LeaveRequestsScreen = ({ user, mode = 'teacher', onBack }) => {
  const isAdmin = mode === 'admin';
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [reason, setReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const load = useCallback(async () => {
    if (isAdmin) {
      const [items, teacherItems, branchItems] = await Promise.all([
        getSuperAdminLeaveRequests({
          status: statusFilter,
          teacherId: teacherFilter,
          branchId: branchFilter,
          ...(isValidUtcDate(dateFilter.trim())
            ? { dateFrom: dateFilter.trim(), dateTo: dateFilter.trim() }
            : {}),
          page,
        }),
        getTeachers(user),
        getBranches(),
      ]);
      setRequests(items.items);
      setPagination(items.pagination);
      setTeachers(teacherItems);
      setBranches(branchItems);
    } else {
      const result = await getTeacherLeaveRequests({ page });
      setRequests(result.items);
      setPagination(result.pagination);
    }
  }, [
    branchFilter,
    dateFilter,
    isAdmin,
    page,
    statusFilter,
    teacherFilter,
    user,
  ]);

  useEffect(() => {
    load().catch(err =>
      Alert.alert(t('leaveRequests.loadFailed'), translateApiError(t, err)),
    );
  }, [load, t]);
  useEffect(
    () => setPage(1),
    [branchFilter, dateFilter, statusFilter, teacherFilter],
  );

  const visible = useMemo(() => {
    const teacherNames = Object.fromEntries(
      teachers.map(item => [item.uid, item.name]),
    );
    const branchNames = Object.fromEntries(
      branches.map(item => [item.id, item.name]),
    );
    return filterLeaveRequests(requests, {
      status: statusFilter,
      teacher: teacherFilter,
      branch: branchFilter,
      date: dateFilter.trim(),
    }).map(item => ({
      ...item,
      teacherName: teacherNames[item.teacher_id] || item.teacher_id,
      branchName: branchNames[item.branch_id] || item.branch_id,
    }));
  }, [
    requests,
    teachers,
    branches,
    statusFilter,
    teacherFilter,
    branchFilter,
    dateFilter,
  ]);

  const submit = async () => {
    const values = { startDate, endDate, reason };
    const error = validateLeaveRequest(values);
    if (error) return Alert.alert(t('leaveRequests.invalid'), t(error));
    try {
      setLoading('submit');
      await createLeaveRequest(user, values);
      setReason('');
      await load();
      Alert.alert(
        t('leaveRequests.submitted'),
        t('leaveRequests.submittedMessage'),
      );
    } catch (err) {
      Alert.alert(t('leaveRequests.submitFailed'), translateApiError(t, err));
    } finally {
      setLoading('');
    }
  };

  const review = async status => {
    try {
      setLoading(status);
      await reviewLeaveRequest(selected.id, status);
      setSelected(null);
      await load();
      Alert.alert(
        t('leaveRequests.updated'),
        t('leaveRequests.updatedMessage', { status: t(`status.${status}`) }),
      );
    } catch (err) {
      Alert.alert(t('leaveRequests.updateFailed'), translateApiError(t, err));
    } finally {
      setLoading('');
    }
  };

  const openDetails = async item => {
    if (isAdmin) {
      setSelected(item);
      return;
    }
    try {
      setLoading(`detail-${item.id}`);
      setSelected(await getLeaveRequestDetails(item.id));
    } catch (err) {
      Alert.alert(t('leaveRequests.loadFailed'), translateApiError(t, err));
    } finally {
      setLoading('');
    }
  };

  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={t('leaveRequests.title')} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {!isAdmin ? (
          <View style={styles.panel}>
            <Text style={styles.heading}>{t('leaveRequests.request')}</Text>
            <CustomInput
              contentDirection="ltr"
              label={t('leaveRequests.startDate')}
              onChangeText={setStartDate}
              value={startDate}
            />
            <CustomInput
              contentDirection="ltr"
              label={t('leaveRequests.endDate')}
              onChangeText={setEndDate}
              value={endDate}
            />
            <CustomInput
              label={t('common.reason')}
              multiline
              onChangeText={setReason}
              placeholder={t('leaveRequests.reasonPlaceholder')}
              value={reason}
            />
            <CustomButton
              loading={loading === 'submit'}
              onPress={submit}
              title={t('leaveRequests.submit')}
            />
            <Text style={styles.note}>{t('leaveRequests.readOnlyNote')}</Text>
          </View>
        ) : null}

        {isAdmin ? (
          <View style={styles.panel}>
            <Text style={styles.heading}>{t('common.filters')}</Text>
            <Text style={styles.label}>{t('common.status')}</Text>
            <View style={styles.pills}>
              {['all', ...LEAVE_STATUSES].map(item => (
                <Pill
                  active={statusFilter === item}
                  key={item}
                  label={t(`status.${item}`)}
                  onPress={() => setStatusFilter(item)}
                />
              ))}
            </View>
            <ScalableSelector
              label={t('common.teacher')}
              onChange={setTeacherFilter}
              options={[
                { id: 'all', label: t('common.all') },
                ...teachers.map(item => ({ id: item.uid, label: item.name })),
              ]}
              value={teacherFilter}
            />
            <ScalableSelector
              label={t('common.branch')}
              onChange={setBranchFilter}
              options={[
                { id: 'all', label: t('common.all') },
                ...branches.map(item => ({ id: item.id, label: item.name })),
              ]}
              value={branchFilter}
            />
            <CustomInput
              label={t('leaveRequests.dateFilter')}
              onChangeText={setDateFilter}
              placeholder="YYYY-MM-DD"
              value={dateFilter}
            />
          </View>
        ) : null}

        {selected ? (
          <View style={styles.panel}>
            <Text style={styles.heading}>
              {t('leaveRequests.requestDetails')}
            </Text>
            <Text style={styles.detail}>
              {t('common.teacher')}: {selected.teacherName}
            </Text>
            <Text style={styles.detail}>
              {t('leaveRequests.dates')}: {selected.start_date} {t('common.to')}{' '}
              {selected.end_date}
            </Text>
            <Text style={styles.detail}>
              {t('common.reason')}: {selected.reason}
            </Text>
            <Text style={styles.detail}>
              {t('common.status')}: {t(`status.${selected.status}`)}
            </Text>
            {selected.reviewedBy ? (
              <Text style={styles.detail}>
                {t('leaveRequests.reviewedBy')}: {getActorDisplayName(selected.reviewedBy, t)}
              </Text>
            ) : null}
            {isAdmin && selected.status === 'pending' ? (
              <>
                <CustomButton
                  loading={loading === 'approved'}
                  onPress={() => review('approved')}
                  title={t('leaveRequests.approve')}
                />
                <CustomButton
                  loading={loading === 'rejected'}
                  onPress={() => review('rejected')}
                  title={t('leaveRequests.reject')}
                  variant="secondary"
                />
              </>
            ) : null}
            <CustomButton
              onPress={() => setSelected(null)}
              title={t('common.close')}
              variant="secondary"
            />
          </View>
        ) : null}

        <Text style={styles.heading}>
          {t(isAdmin ? 'leaveRequests.allRequests' : 'leaveRequests.myHistory')}{' '}
          ({visible.length})
        </Text>
        {visible.map(item => (
          <TouchableOpacity
            disabled={loading === `detail-${item.id}`}
            key={item.id}
            onPress={() => openDetails(item)}
            style={styles.record}
          >
            <Text style={styles.recordTitle}>
              {isAdmin ? `${item.teacherName} | ` : ''}
              {item.start_date} {t('common.to')} {item.end_date}
            </Text>
            {isAdmin ? (
              <Text style={styles.meta}>{item.branchName}</Text>
            ) : null}
            <Text numberOfLines={2} style={styles.reason}>
              {item.reason}
            </Text>
            <Text style={[styles.status, styles[item.status]]}>
              {t(`status.${item.status}`)}
            </Text>
          </TouchableOpacity>
        ))}
        {!visible.length ? (
          <Text style={styles.empty}>{t('leaveRequests.empty')}</Text>
        ) : null}
        {pagination.totalPages > 1 ? (
          <View style={styles.pagination}>
            <CustomButton
              disabled={page <= 1}
              onPress={() => setPage(value => value - 1)}
              title={t('common.previous')}
              variant="secondary"
            />
            <Text>
              {t('common.pageOf', { page, total: pagination.totalPages })}
            </Text>
            <CustomButton
              disabled={page >= pagination.totalPages}
              onPress={() => setPage(value => value + 1)}
              title={t('common.next')}
              variant="secondary"
            />
          </View>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  content: { padding: 20, paddingBottom: 96 },
  topBar: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 20,
  },
  back: { color: colors.emeraldDark, fontWeight: '800', marginRight: 20 },
  title: { color: '#142033', fontSize: 22, fontWeight: '900' },
  heading: {
    color: '#142033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  panel: {
    backgroundColor: '#f8fafc',
    borderColor: '#dfe7f0',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    padding: 16,
  },
  note: { color: '#687386', fontSize: 12 },
  label: { color: '#4f5d73', fontSize: 12, fontWeight: '800', marginBottom: 7 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pill: {
    backgroundColor: colors.emeraldLight,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  pillActive: { backgroundColor: colors.emerald },
  pillText: { color: colors.emeraldDark, fontWeight: '800' },
  pillTextActive: { color: colors.white },
  record: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 15,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 12,
    padding: 15,
    shadowColor: colors.shadow,
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  recordTitle: { color: colors.ink, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  reason: { color: '#263449', marginTop: 7 },
  status: { fontSize: 12, fontWeight: '900', marginTop: 7 },
  pending: { color: '#b06000' },
  approved: { color: '#137333' },
  rejected: { color: '#b3261e' },
  detail: { color: '#263449', marginBottom: 8 },
  empty: { color: '#687386', padding: 20, textAlign: 'center' },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
});

export default LeaveRequestsScreen;
