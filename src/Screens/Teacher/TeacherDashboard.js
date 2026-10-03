import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  BackHandler,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';

import Text from '../../Components/AppText';
import CustomButton from '../../Components/CustomButton';
import AppDrawerNavigation from '../../Components/AppDrawerNavigation';
import ReportsScreen from '../Reports/ReportsScreen';
import LeaveRequestsScreen from '../Leaves/LeaveRequestsScreen';
import SettingsScreen from '../Settings/SettingsScreen';
import MyStudentsScreen from './MyStudentsScreen';
import MyProfileScreen from './MyProfileScreen';
import MySalaryScreen from './MySalaryScreen';
import MyAttendanceScreen from './MyAttendanceScreen';
import SupervisorInspectionScreen from '../Supervisor/SupervisorInspectionScreen';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getCheckInAvailability,
  getTodayAttendance,
} from '../../Services/attendanceService';
import {
  formatAttendanceDate,
  formatDuration,
  formatTime,
  getWorkedMinutes,
  summarizeAttendance,
} from '../../Utils/attendance';
import { useTranslation } from '../../localization/i18n';
import { translateApiError } from '../../api/errors';
import { useConfirmLogout } from '../../hooks/useConfirmLogout';
import colors from '../../theme/colors';

const TeacherDashboard = ({ user }) => {
  const { t } = useTranslation();
  const confirmLogout = useConfirmLogout();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [activeNavigation, setActiveNavigation] = useState('dashboard');
  const [attendance, setAttendance] = useState([]);
  const [today, setToday] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendancePagination, setAttendancePagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loadingAction, setLoadingAction] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const processingAttendance = useRef(false);
  const summary = useMemo(() => summarizeAttendance(attendance), [attendance]);
  const isSupervisor = user.teacher_type === 'supervisor';
  const isTeacher = user.teacher_type === 'teacher';

  const showDashboardSection = key => {
    setActiveNavigation(key);
    setActiveModule('dashboard');
  };
  const showSettings = key => {
    setActiveNavigation(key);
    setActiveModule('settings');
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (activeModule !== 'dashboard' || activeNavigation !== 'dashboard') {
          setActiveModule('dashboard');
          setActiveNavigation('dashboard');
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [activeModule, activeNavigation]);

  const navigationItems = [
    {
      key: 'dashboard',
      label: t('navigation.dashboard'),
      onPress: () => showDashboardSection('dashboard'),
    },
    {
      key: 'checkInOut',
      label: t('navigation.checkInOut'),
      onPress: () => showDashboardSection('checkInOut'),
    },
    {
      key: 'attendanceHistory',
      label: t('navigation.attendanceHistory'),
      onPress: () => {
        setActiveNavigation('attendanceHistory');
        setActiveModule('attendanceHistory');
      },
    },
    ...(isSupervisor
      ? [
          {
            key: 'inspections',
            label: t('inspection.title'),
            onPress: () => {
              setActiveNavigation('inspections');
              setActiveModule('inspections');
            },
          },
        ]
      : []),
    ...(isTeacher
      ? [
          {
            key: 'myStudents',
            label: t('teacherAccess.myStudents'),
            onPress: () => {
              setActiveNavigation('myStudents');
              setActiveModule('students');
            },
          },
        ]
      : []),
    ...(isTeacher || isSupervisor
      ? [
          {
            key: 'reports',
            label: t('navigation.reports'),
            onPress: () => {
              setActiveNavigation('reports');
              setActiveModule('reports');
            },
          },
        ]
      : []),
    {
      key: 'leaveRequest',
      label: t('navigation.leaveRequest'),
      onPress: () => {
        setActiveNavigation('leaveRequest');
        setActiveModule('leaves');
      },
    },
    {
      key: 'leaveHistory',
      label: t('navigation.leaveHistory'),
      onPress: () => {
        setActiveNavigation('leaveHistory');
        setActiveModule('leaves');
      },
    },
    {
      key: 'myProfile',
      label: t('teacherAccess.myProfile'),
      onPress: () => {
        setActiveNavigation('myProfile');
        setActiveModule('profile');
      },
    },
    {
      key: 'mySalary',
      label: t('teacherAccess.mySalary'),
      onPress: () => {
        setActiveNavigation('mySalary');
        setActiveModule('salary');
      },
    },
    {
      key: 'changePassword',
      label: t('navigation.changePassword'),
      onPress: () => showSettings('changePassword'),
    },
    {
      key: 'settings',
      label: t('navigation.settings'),
      onPress: () => showSettings('settings'),
    },
    {
      key: 'logout',
      danger: true,
      label: t('common.logout'),
      onPress: confirmLogout,
    },
  ];

  const loadAttendance = useCallback(async () => {
    const [todayRecord, history, checkInStatus] = await Promise.all([
      getTodayAttendance(),
      getMyAttendance({ page: attendancePage, limit: 50 }),
      getCheckInAvailability(),
    ]);
    setToday(todayRecord);
    setAttendance(history.items);
    setAttendancePagination(history.pagination);
    setAvailability(checkInStatus);
  }, [attendancePage]);

  useEffect(() => {
    loadAttendance().catch(err =>
      Alert.alert(t('attendance.loadFailed'), translateApiError(t, err)),
    );
  }, [loadAttendance, t]);

  useEffect(() => {
    if (today?.checkOutAt || today?.status === 'on_leave') return undefined;
    const timer = setInterval(() => {
      getCheckInAvailability().then(setAvailability).catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, [today?.checkOutAt, today?.status]);

  const runAction = async (type, action) => {
    if (processingAttendance.current) return;
    processingAttendance.current = true;
    setLoadingAction(type);
    try {
      await action();
      await loadAttendance();
    } catch (err) {
      Alert.alert(t('attendance.markFailed'), translateApiError(t, err));
    } finally {
      setLoadingAction('');
      processingAttendance.current = false;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAttendance();
    } catch (err) {
      Alert.alert(t('attendance.refreshFailed'), translateApiError(t, err));
    } finally {
      setRefreshing(false);
    }
  };

  const renderAttendance = ({ item }) => (
    <View style={styles.record}>
      <View style={styles.recordInfo}>
        <Text style={styles.recordDate}>
          {formatAttendanceDate(item.attendance_date)}
        </Text>
        <Text style={styles.recordTime}>
          {t('attendance.inLabel')} {formatTime(item.checkInAt)} |{' '}
          {t('attendance.outLabel')} {formatTime(item.checkOutAt)} |{' '}
          {formatDuration(getWorkedMinutes(item))}
        </Text>
        {item.lateMinutes > 0 ? (
          <Text style={styles.recordLate}>
            {t('attendance.lateMinutes', { count: item.lateMinutes })}
          </Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.status,
          item.status === 'complete' ? styles.complete : styles.incomplete,
        ]}
      >
        {t(
          item.status === 'complete'
            ? 'attendance.complete'
            : item.status === 'on_leave'
            ? 'attendance.onLeave'
            : 'attendance.incomplete',
        )}
      </Text>
    </View>
  );

  if (activeModule === 'reports') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <ReportsScreen
          mode="teacher"
          onBack={() => showDashboardSection('dashboard')}
          user={user}
        />
      </View>
    );
  }

  if (activeModule === 'attendanceHistory') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <MyAttendanceScreen
          onBack={() => showDashboardSection('dashboard')}
        />
      </View>
    );
  }

  if (activeModule === 'leaves') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <LeaveRequestsScreen
          mode="teacher"
          onBack={() => showDashboardSection('dashboard')}
          user={user}
        />
      </View>
    );
  }

  if (activeModule === 'settings') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <SettingsScreen onBack={() => showDashboardSection('dashboard')} />
      </View>
    );
  }
  if (activeModule === 'students')
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <MyStudentsScreen onBack={() => showDashboardSection('dashboard')} />
      </View>
    );
  if (activeModule === 'profile')
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <MyProfileScreen
          onBack={() => showDashboardSection('dashboard')}
          user={user}
        />
      </View>
    );
  if (activeModule === 'salary')
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <MySalaryScreen onBack={() => showDashboardSection('dashboard')} />
      </View>
    );
  if (activeModule === 'inspections')
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <SupervisorInspectionScreen
          onBack={() => showDashboardSection('dashboard')}
          user={user}
        />
      </View>
    );

  return (
    <View style={styles.container}>
      <AppDrawerNavigation
        activeKey={activeNavigation}
        items={navigationItems}
      />

      <FlashList
        contentContainerStyle={styles.listContent}
        data={attendance}
        keyboardShouldPersistTaps="handled"
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('attendance.noHistory')}</Text>
        }
        ListFooterComponent={
          <View>
            {attendancePagination.totalPages > 1 ? (
              <View style={styles.pagination}>
                <CustomButton
                  disabled={attendancePage <= 1}
                  onPress={() => setAttendancePage(value => value - 1)}
                  title={t('common.previous')}
                  variant="secondary"
                />
                <Text>
                  {t('common.pageOf', {
                    page: attendancePage,
                    total: attendancePagination.totalPages,
                  })}
                </Text>
                <CustomButton
                  disabled={attendancePage >= attendancePagination.totalPages}
                  onPress={() => setAttendancePage(value => value + 1)}
                  title={t('common.next')}
                  variant="secondary"
                />
              </View>
            ) : null}
          </View>
        }
        ListHeaderComponent={
          <View>
            <View style={styles.todayPanel}>
              <Text style={styles.sectionTitle}>
                {t('attendance.todayTitle')}
              </Text>
              <View style={styles.todayGrid}>
                <View style={styles.todayCell}>
                  <Text style={styles.label}>{t('attendance.checkIn')}</Text>
                  <Text style={styles.value}>
                    {formatTime(today?.checkInAt)}
                  </Text>
                </View>
                <View style={styles.todayCell}>
                  <Text style={styles.label}>{t('attendance.checkOut')}</Text>
                  <Text style={styles.value}>
                    {formatTime(today?.checkOutAt)}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.todayStatus,
                  today?.status === 'complete'
                    ? styles.complete
                    : styles.incomplete,
                ]}
              >
                {today?.status === 'complete'
                  ? t('attendance.completeMessage')
                  : today?.status === 'on_leave'
                  ? t('attendance.onLeaveMessage')
                  : t('attendance.incompleteMessage')}
              </Text>
              {!today?.checkInAt ? (
                <Text style={styles.availabilityNote}>
                  {availability?.canCheckIn
                    ? t('attendance.checkInAvailable')
                    : availability?.reason === 'ATTENDANCE_HOLIDAY'
                    ? t('attendance.holidayToday', { title: availability?.holiday?.title || t('navigation.holidays') })
                    : availability?.reason === 'MISSING_TIMING'
                    ? t('attendance.missingTiming')
                    : availability?.reason === 'CHECK_IN_CLOSED'
                    ? t('attendance.checkInClosed')
                    : t('attendance.checkInOpensIn', {
                        count: availability?.opensInMinutes || 0,
                      })}
                </Text>
              ) : null}
              {today?.checkInAt && !today?.checkOutAt && availability?.checkOutReason === 'CHECK_OUT_CLOSED' ? (
                <Text style={styles.availabilityNote}>{t('attendance.checkOutClosed')}</Text>
              ) : null}
              {today?.lateMinutes > 0 ? (
                <Text style={styles.lateMinutes}>
                  {t('attendance.lateMinutes', { count: today.lateMinutes })}
                </Text>
              ) : null}
              <CustomButton
                disabled={
                  Boolean(loadingAction) ||
                  Boolean(today?.checkInAt) ||
                  today?.status === 'on_leave' ||
                  !availability?.canCheckIn
                }
                loading={loadingAction === 'checkIn'}
                onPress={() => runAction('checkIn', checkIn)}
                title={t('attendance.checkIn')}
              />
              <CustomButton
                disabled={
                  Boolean(loadingAction) ||
                  !today?.checkInAt ||
                  Boolean(today?.checkOutAt) ||
                  !availability?.canCheckOut
                }
                loading={loadingAction === 'checkOut'}
                onPress={() => runAction('checkOut', checkOut)}
                title={t('attendance.checkOut')}
                variant="secondary"
              />
            </View>

            {isTeacher ? (
              <CustomButton
                onPress={() => {
                  setActiveNavigation('reports');
                  setActiveModule('reports');
                }}
                title={t('navigation.reports')}
                variant="secondary"
              />
            ) : null}
            <CustomButton
              onPress={() => {
                setActiveNavigation('leaveRequest');
                setActiveModule('leaves');
              }}
              title={t('navigation.leaveRequests')}
              variant="secondary"
            />

            <View style={styles.summaryPanel}>
              <Text style={styles.summaryText}>
                {t('attendance.summary', {
                  total: summary.total,
                  complete: summary.complete,
                  worked: formatDuration(summary.minutes),
                })}
              </Text>
            </View>
            <Text style={styles.historyTitle}>{t('attendance.myHistory')}</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        nestedScrollEnabled
        renderItem={renderAttendance}
        showsVerticalScrollIndicator={false}
        style={styles.scrollList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  topBar: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  kicker: { color: '#687386', fontSize: 13, fontWeight: '700' },
  title: { color: '#142033', fontSize: 24, fontWeight: '900' },
  logout: { color: colors.emeraldDark, fontWeight: '800' },
  listContent: { padding: 20, paddingBottom: 104 },
  todayPanel: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 4,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
  },
  sectionTitle: {
    color: '#142033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  todayGrid: { flexDirection: 'row', gap: 12 },
  todayCell: {
    backgroundColor: '#ffffff',
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  label: { color: '#687386', fontSize: 12, fontWeight: '700' },
  value: { color: '#142033', fontSize: 18, fontWeight: '900', marginTop: 4 },
  todayStatus: { fontSize: 15, fontWeight: '900', marginTop: 14 },
  complete: { color: '#137333' },
  incomplete: { color: '#b06000' },
  summaryPanel: {
    backgroundColor: colors.emeraldLight,
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  summaryText: { color: colors.emeraldDark, fontSize: 13, fontWeight: '800' },
  historyTitle: {
    color: '#142033',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 24,
  },
  record: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  recordInfo: { flex: 1, paddingRight: 10 },
  recordLate: { color: '#b06000', fontSize: 12, fontWeight: '800', marginTop: 4 },
  recordDate: { color: '#142033', fontSize: 16, fontWeight: '800' },
  recordTime: { color: '#687386', fontSize: 12, marginTop: 3 },
  status: { fontSize: 12, fontWeight: '900' },
  empty: { color: '#687386', paddingVertical: 18, textAlign: 'center' },
  availabilityNote: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  lateMinutes: {
    color: '#b06000',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
});

export default TeacherDashboard;
