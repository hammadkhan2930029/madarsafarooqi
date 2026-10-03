import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  BackHandler,
  Modal,
  RefreshControl,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import KeyboardAwareScrollView from '../../Components/KeyboardAwareScrollView';
import Text from '../../Components/AppText';
import AppDrawerNavigation from '../../Components/AppDrawerNavigation';
import AnimatedEntrance from '../../Components/AnimatedEntrance';
import LanguageSelector from '../../Components/LanguageSelector';
import ScalableSelector from '../../Components/ScalableSelector';
import BranchManagementScreen from './BranchManagementScreen';
import ClassManagementScreen from './ClassManagementScreen';
import ShiftManagementScreen from './ShiftManagementScreen';
import HolidayManagementScreen from './HolidayManagementScreen';
import StudentManagementScreen from './StudentManagementScreen';
import TeacherManagementScreen from './TeacherManagementScreen';
import ReportsScreen from '../Reports/ReportsScreen';
import LeaveRequestsScreen from '../Leaves/LeaveRequestsScreen';
import AdminNotificationsScreen from './AdminNotificationsScreen';
import InstitutionProfileScreen from './InstitutionProfileScreen';
import PayrollSalaryScreen from './PayrollSalaryScreen';
import SettingsScreen from '../Settings/SettingsScreen';
import { getBranches } from '../../Services/branchService';
import { getClasses } from '../../Services/classService';
import {
  correctAttendance,
  getAdminAttendance,
} from '../../Services/attendanceService';
import {
  getTeachers,
  updateTeacher,
  updateTeacherStatus,
} from '../../Services/teacherService';
import {
  attendanceToCsv,
  formatAttendanceDate,
  formatDuration,
  formatTime,
  getDateRange,
  getInstitutionDate,
  summarizeAttendance,
  toIsoString,
  validateAttendanceCorrection,
} from '../../Utils/attendance';
import { useTranslation } from '../../localization/i18n';
import { useConfirmLogout } from '../../hooks/useConfirmLogout';
import { translateApiError } from '../../api/errors';
import { validateName } from '../../Utils/validationSchemas';
import colors from '../../theme/colors';
import { getRowDirection } from '../../localization/direction';

const filters = ['all', 'complete', 'pending'];
const ranges = ['today', '7days', '30days', 'all'];

const FilterPill = ({ active, label, onPress }) => (
  <TouchableOpacity
    accessibilityRole="button"
    onPress={onPress}
    style={[styles.filterPill, active ? styles.filterPillActive : null]}
  >
    <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const DashboardActionCard = ({ delay, icon, isRTL, label, onPress }) => (
  <AnimatedEntrance delay={delay}>
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.84}
      onPress={onPress}
      style={[styles.moduleCard, { flexDirection: getRowDirection(isRTL) }]}
    >
      <View style={styles.moduleIconShell}>
        <MaterialCommunityIcons color={colors.emeraldDark} name={icon} size={24} />
      </View>
      <Text style={styles.moduleLabel}>{label}</Text>
      <MaterialCommunityIcons color={colors.borderStrong} name={isRTL ? 'chevron-left' : 'chevron-right'} size={29} />
    </TouchableOpacity>
  </AnimatedEntrance>
);

const AttendanceStatusCard = ({ icon, label, tone, value }) => (
  <View style={[styles.summaryCard, styles[`summary${tone}`]]}>
    <MaterialCommunityIcons color={colors.emeraldDark} name={icon} size={21} />
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const SuperAdminDashboard = ({ user }) => {
  const { isRTL, t } = useTranslation();
  const confirmLogout = useConfirmLogout();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [activeNavigation, setActiveNavigation] = useState('dashboard');
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingAction, setLoadingAction] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [reportFilter, setReportFilter] = useState('all');
  const [reportRange, setReportRange] = useState('30days');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [lateFilter, setLateFilter] = useState('all');
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendancePagination, setAttendancePagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [attendanceEdit, setAttendanceEdit] = useState(null);
  const [correctionCheckIn, setCorrectionCheckIn] = useState('');
  const [correctionCheckOut, setCorrectionCheckOut] = useState('');
  const [correctionStatus, setCorrectionStatus] = useState('INCOMPLETE');
  const [correctionLate, setCorrectionLate] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionError, setCorrectionError] = useState('');
  const [showAttendanceFilters, setShowAttendanceFilters] = useState(false);

  const todayAttendance = useMemo(
    () =>
      attendance.filter(item => item.attendance_date === getInstitutionDate()),
    [attendance],
  );
  const todaySummary = useMemo(
    () => summarizeAttendance(todayAttendance),
    [todayAttendance],
  );
  const reportRecords = useMemo(() => {
    return attendance;
  }, [attendance]);
  const reportSummary = useMemo(
    () => summarizeAttendance(reportRecords),
    [reportRecords],
  );
  const visibleTeachers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return teachers;
    }
    return teachers.filter(
      teacher =>
        teacher.name?.toLowerCase().includes(term) ||
        teacher.email?.toLowerCase().includes(term),
    );
  }, [teachers, search]);

  const navigate = key => {
    setActiveNavigation(key);
    setActiveModule(key === 'attendance' ? 'dashboard' : key);
  };
  const returnToDashboard = () => navigate('dashboard');

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
      identityLabel: t('common.superAdminName'),
      label: t('navigation.dashboard'),
      onPress: () => navigate('dashboard'),
      profileOnPress: () => {
        setActiveNavigation('dashboard');
        setActiveModule('institutionProfile');
      },
    },
    {
      key: 'branches',
      label: t('navigation.branches'),
      onPress: () => navigate('branches'),
    },
    {
      key: 'classes',
      label: t('navigation.classes'),
      onPress: () => navigate('classes'),
    },
    {
      key: 'teachers',
      label: t('navigation.teachers'),
      onPress: () => navigate('teachers'),
    },
    {
      key: 'shifts',
      label: t('navigation.shifts'),
      onPress: () => navigate('shifts'),
    },
    {
      key: 'holidays',
      label: t('navigation.holidays'),
      onPress: () => navigate('holidays'),
    },
    {
      key: 'students',
      label: t('navigation.students'),
      onPress: () => navigate('students'),
    },
    {
      key: 'attendance',
      label: t('navigation.attendance'),
      onPress: () => navigate('attendance'),
    },
    {
      key: 'reports',
      label: t('navigation.reports'),
      onPress: () => navigate('reports'),
    },
    {
      key: 'leaves',
      label: t('navigation.leaveRequests'),
      onPress: () => navigate('leaves'),
    },
    {
      key: 'notifications',
      label: isRTL ? 'اطلاعات' : 'Notifications',
      onPress: () => navigate('notifications'),
    },
    {
      key: 'salaries',
      label: t('navigation.salaries'),
      onPress: () => navigate('salaries'),
    },
    {
      key: 'settings',
      label: t('navigation.settings'),
      onPress: () => navigate('settings'),
    },
    {
      key: 'logout',
      danger: true,
      label: t('common.logout'),
      onPress: confirmLogout,
    },
  ];

  const loadDashboard = useCallback(async () => {
    const attendanceQuery = {
      ...getDateRange(reportRange),
      teacherId: teacherFilter,
      branchId: branchFilter,
      classId: classFilter,
      status:
        reportFilter === 'complete'
          ? 'PRESENT'
          : reportFilter === 'pending'
          ? 'INCOMPLETE'
          : 'all',
      isLate:
        lateFilter === 'late' ? true : lateFilter === 'on_time' ? false : 'all',
      page: attendancePage,
      limit: 50,
    };
    const [teacherList, attendanceResult, branchList, classList] =
      await Promise.all([
        getTeachers(user),
        getAdminAttendance(attendanceQuery),
        getBranches(),
        getClasses(),
      ]);
    setTeachers(teacherList);
    setAttendance(attendanceResult.items);
    setAttendancePagination(attendanceResult.pagination);
    setBranches(branchList);
    setClasses(classList);
  }, [
    attendancePage,
    branchFilter,
    classFilter,
    lateFilter,
    reportFilter,
    reportRange,
    teacherFilter,
    user,
  ]);

  useEffect(() => {
    loadDashboard().catch(err =>
      Alert.alert(t('errors.loadFailed'), translateApiError(t, err)),
    );
  }, [loadDashboard, t]);

  const startEditing = teacher => {
    setEditing(teacher);
    setEditName(teacher.name);
  };

  const handleSaveTeacher = async () => {
    const validationError = validateName(editName);
    if (validationError) {
      Alert.alert(t('validation.nameLength'), t(validationError));
      return;
    }

    setLoadingAction(`edit-${editing.uid}`);
    try {
      await updateTeacher(editing.uid, { name: editName });
      setEditing(null);
      await loadDashboard();
    } catch (err) {
      Alert.alert(t('teachers.saveFailed'), translateApiError(t, err));
    } finally {
      setLoadingAction('');
    }
  };

  const handleToggleStatus = teacher => {
    const nextStatus = teacher.status === 'inactive' ? 'active' : 'inactive';
    Alert.alert(
      t('dialogs.confirmStatus'),
      t('dialogs.statusMessage', {
        name: teacher.name,
        status: t(`status.${nextStatus}`),
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t(
            nextStatus === 'active' ? 'common.activate' : 'common.deactivate',
          ),
          style: nextStatus === 'active' ? 'default' : 'destructive',
          onPress: async () => {
            setLoadingAction(`status-${teacher.uid}`);
            try {
              await updateTeacherStatus(teacher.uid, nextStatus);
              await loadDashboard();
            } catch (err) {
              Alert.alert(
                t('teachers.statusFailed'),
                translateApiError(t, err),
              );
            } finally {
              setLoadingAction('');
            }
          },
        },
      ],
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboard();
    } catch (err) {
      Alert.alert(t('attendance.refreshFailed'), translateApiError(t, err));
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    if (!reportRecords.length) {
      Alert.alert(
        t('attendance.exportEmptyTitle'),
        t('attendance.exportEmptyMessage'),
      );
      return;
    }

    try {
      await Share.share({
        title: t('attendance.exportTitle'),
        message: attendanceToCsv(reportRecords, {
          date: t('common.date'),
          teacher: t('common.teacher'),
          branch: t('common.branch'),
          class: t('common.class'),
          timing: t('teachers.timing'),
          checkIn: t('attendance.checkIn'),
          checkOut: t('attendance.checkOut'),
          late: t('attendance.late'),
          status: t('common.status'),
          worked: t('attendance.worked'),
          onTime: t('attendance.onTime'),
          unknown: t('common.unknown'),
        }),
      });
    } catch (err) {
      Alert.alert(t('attendance.exportFailed'), translateApiError(t, err));
    }
  };

  const closeCorrection = () => {
    setAttendanceEdit(null);
    setCorrectionReason('');
    setCorrectionError('');
  };

  const startCorrection = item => {
    const status =
      item.status === 'complete'
        ? 'PRESENT'
        : item.status === 'on_leave'
        ? 'ON_LEAVE'
        : 'INCOMPLETE';
    setAttendanceEdit(item);
    setCorrectionCheckIn(toIsoString(item.checkInAt));
    setCorrectionCheckOut(toIsoString(item.checkOutAt));
    setCorrectionStatus(status);
    setCorrectionLate(status === 'ON_LEAVE' ? null : Boolean(item.is_late));
    setCorrectionReason('');
    setCorrectionError('');
  };

  const selectCorrectionStatus = status => {
    setCorrectionStatus(status);
    if (status === 'ON_LEAVE') {
      setCorrectionCheckIn('');
      setCorrectionCheckOut('');
      setCorrectionLate(null);
    } else {
      if (status === 'INCOMPLETE') setCorrectionCheckOut('');
      if (correctionLate === null) setCorrectionLate(false);
    }
  };

  const handleCorrection = async () => {
    const values = {
      checkInAt: correctionCheckIn.trim(),
      checkOutAt: correctionCheckOut.trim(),
      status: correctionStatus,
      isLate: correctionLate,
      reason: correctionReason,
    };
    const validationError = validateAttendanceCorrection(values);
    if (validationError) {
      setCorrectionError(t(validationError));
      return;
    }
    setLoadingAction('attendance-correction');
    setCorrectionError('');
    try {
      await correctAttendance(attendanceEdit.id, values);
      await loadDashboard();
      closeCorrection();
      Alert.alert(
        t('attendance.correctionSaved'),
        t('attendance.correctionSavedMessage'),
      );
    } catch (err) {
      setCorrectionError(translateApiError(t, err));
    } finally {
      setLoadingAction('');
    }
  };

  const renderTeacher = ({ item }) => (
    <View style={styles.teacherRow}>
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.teacherEmail}>{item.email}</Text>
      </View>
      <View style={styles.rowActions}>
        <Text
          accessibilityRole="button"
          onPress={() => startEditing(item)}
          style={styles.actionLink}
        >
          Edit
        </Text>
        <Text
          accessibilityRole="button"
          onPress={() => handleToggleStatus(item)}
          style={[
            styles.statusLink,
            item.status === 'inactive'
              ? styles.activeText
              : styles.inactiveText,
          ]}
        >
          {loadingAction === `status-${item.uid}`
            ? '...'
            : item.status === 'inactive'
            ? 'Inactive'
            : 'Active'}
        </Text>
      </View>
    </View>
  );

  const renderAttendance = item => (
    <View
      key={item.id}
      style={styles.attendanceRow}
    >
      <View style={[styles.attendanceTop, { flexDirection: getRowDirection(isRTL) }]}>
        <View style={styles.avatarPlaceholder}>
          <MaterialCommunityIcons color={colors.emeraldDark} name="account-outline" size={23} />
        </View>
        <View style={styles.attendanceInfo}>
          <Text style={styles.teacherName}>{item.employeeName || t('common.teacher')}</Text>
          <Text style={styles.teacherEmail}>{item.branchName || '--'} · {item.className || '--'}</Text>
          <Text style={styles.teacherEmail}>{formatAttendanceDate(item.attendance_date)}</Text>
        </View>
        <Text style={[styles.statusBadge, item.status === 'complete' ? styles.statusPresent : item.status === 'on_leave' ? styles.statusLeave : styles.statusPending]}>
          {t(item.status === 'complete' ? 'attendance.complete' : item.status === 'on_leave' ? 'attendance.onLeave' : 'attendance.pending')}
        </Text>
      </View>
      <View style={[styles.attendanceTimes, { flexDirection: getRowDirection(isRTL) }]}>
        <Text style={styles.timeItem}>{t('attendance.inLabel')}: {formatTime(item.checkInAt)}</Text>
        <Text style={styles.timeItem}>{t('attendance.outLabel')}: {formatTime(item.checkOutAt)}</Text>
        <Text style={styles.timeItem}>{item.is_late === true ? t('attendance.lateMinutes', { count: item.lateMinutes || 0 }) : item.is_late === false ? t('attendance.onTime') : t('attendance.lateUnknown')}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={() => startCorrection(item)} style={styles.editAttendanceButton}>
        <Text style={styles.editAttendance}>{t('attendance.edit')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (activeModule === 'institutionProfile') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <InstitutionProfileScreen
          branchCount={branches.length}
          classCount={classes.length}
          onBack={returnToDashboard}
          teacherCount={teachers.length}
          user={user}
        />
      </View>
    );
  }

  if (activeModule === 'branches') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <BranchManagementScreen onBack={returnToDashboard} user={user} />
      </View>
    );
  }

  if (activeModule === 'classes') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <ClassManagementScreen onBack={returnToDashboard} user={user} />
      </View>
    );
  }

  if (activeModule === 'teachers') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <TeacherManagementScreen
          onBack={() => {
            returnToDashboard();
            loadDashboard().catch(() => {});
          }}
          user={user}
        />
      </View>
    );
  }

  if (activeModule === 'shifts') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <ShiftManagementScreen onBack={returnToDashboard} />
      </View>
    );
  }

  if (activeModule === 'holidays') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation activeKey={activeNavigation} items={navigationItems} />
        <HolidayManagementScreen onBack={returnToDashboard} />
      </View>
    );
  }

  if (activeModule === 'students') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <StudentManagementScreen onBack={returnToDashboard} />
      </View>
    );
  }

  if (activeModule === 'reports') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <ReportsScreen mode="admin" onBack={returnToDashboard} user={user} />
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
          mode="admin"
          onBack={returnToDashboard}
          user={user}
        />
      </View>
    );
  }

  if (activeModule === 'notifications') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation activeKey={activeNavigation} items={navigationItems} />
        <AdminNotificationsScreen onBack={returnToDashboard} />
      </View>
    );
  }

  if (activeModule === 'salaries') {
    return (
      <View style={styles.container}>
        <AppDrawerNavigation
          activeKey={activeNavigation}
          items={navigationItems}
        />
        <PayrollSalaryScreen onBack={returnToDashboard} user={user} />
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
        <SettingsScreen onBack={returnToDashboard} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppDrawerNavigation
        activeKey={activeNavigation}
        items={navigationItems}
      />

      <FlashList
        contentContainerStyle={styles.listContent}
        data={visibleTeachers}
        keyboardShouldPersistTaps="handled"
        keyExtractor={item => item.uid}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {t(search ? 'teachers.searchEmpty' : 'teachers.noTeachers')}
          </Text>
        }
        ListFooterComponent={
          <View>
            <View style={styles.attendancePanel}>
              <View style={[styles.attendanceHeader, { flexDirection: getRowDirection(isRTL) }]}>
                <Text style={styles.sectionTitle}>{t('attendance.title')}</Text>
                <TouchableOpacity onPress={() => setShowAttendanceFilters(value => !value)} style={styles.filterToggle}>
                  <Text style={styles.filterToggleText}>{showAttendanceFilters ? (isRTL ? 'فلٹر چھپائیں' : 'Hide filters') : (isRTL ? 'فلٹر لگائیں' : 'Filters')}</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.attendanceSummaryGrid, { flexDirection: getRowDirection(isRTL) }]}>
                <AttendanceStatusCard icon="check-circle-outline" label={t('dashboard.todayComplete')} tone="Green" value={todaySummary.complete} />
                <AttendanceStatusCard icon="clock-alert-outline" label={t('dashboard.todayPending')} tone="Amber" value={todaySummary.pending} />
                <AttendanceStatusCard icon="account-group-outline" label={t('teachers.list')} tone="Soft" value={teachers.length} />
              </View>
              {showAttendanceFilters ? <>
              <View style={styles.filters}>
                {ranges.map(range => (
                  <FilterPill
                    active={reportRange === range}
                    key={range}
                    label={
                      range === 'today'
                        ? t('attendance.today')
                        : range === '7days'
                        ? t('attendance.sevenDays')
                        : range === '30days'
                        ? t('attendance.thirtyDays')
                        : t('attendance.allTime')
                    }
                    onPress={() => {
                      setReportRange(range);
                      setAttendancePage(1);
                    }}
                  />
                ))}
              </View>
              <View style={styles.filters}>
                {filters.map(filter => (
                  <FilterPill
                    active={reportFilter === filter}
                    key={filter}
                    label={
                      filter === 'all'
                        ? t('common.all')
                        : t(
                            filter === 'complete'
                              ? 'attendance.complete'
                              : 'attendance.pending',
                          )
                    }
                    onPress={() => {
                      setReportFilter(filter);
                      setAttendancePage(1);
                    }}
                  />
                ))}
              </View>
              <ScalableSelector
                label={t('common.teacher')}
                onChange={id => {
                  setTeacherFilter(id);
                  setAttendancePage(1);
                }}
                options={[
                  { id: 'all', label: t('common.all') },
                  ...teachers.map(item => ({ id: item.uid, label: item.name })),
                ]}
                value={teacherFilter}
              />
              <ScalableSelector
                label={t('common.branch')}
                onChange={id => {
                  setBranchFilter(id);
                  setClassFilter('all');
                  setAttendancePage(1);
                }}
                options={[
                  { id: 'all', label: t('common.all') },
                  ...branches.map(item => ({ id: item.id, label: item.name })),
                ]}
                value={branchFilter}
              />
              <ScalableSelector
                label={t('common.class')}
                onChange={id => {
                  setClassFilter(id);
                  setAttendancePage(1);
                }}
                options={[
                  { id: 'all', label: t('common.all') },
                  ...classes
                    .filter(
                      item =>
                        branchFilter === 'all' ||
                        item.branch_id === branchFilter,
                    )
                    .map(item => ({ id: item.id, label: item.name })),
                ]}
                value={classFilter}
              />
              <Text style={styles.filterLabel}>
                {t('attendance.punctuality')}
              </Text>
              <View style={styles.filters}>
                {['all', 'late', 'on_time'].map(filter => (
                  <FilterPill
                    active={lateFilter === filter}
                    key={filter}
                    label={
                      filter === 'all'
                        ? t('common.all')
                        : t(
                            filter === 'late'
                              ? 'attendance.late'
                              : 'attendance.onTime',
                          )
                    }
                    onPress={() => {
                      setLateFilter(filter);
                      setAttendancePage(1);
                    }}
                  />
                ))}
              </View>
              <Text style={styles.reportMeta}>
                {t('attendance.adminSummary', {
                  total: attendancePagination.total,
                  complete: reportSummary.complete,
                  worked: formatDuration(reportSummary.minutes),
                })}
              </Text>
              <CustomButton
                onPress={handleExport}
                title={t('attendance.exportCsv')}
                variant="secondary"
              />
              </> : null}
              {reportRecords.length ? (
                reportRecords.map(renderAttendance)
              ) : (
                <Text style={styles.empty}>{t('attendance.filterEmpty')}</Text>
              )}
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
          </View>
        }
        ListHeaderComponent={
          <View>
            <LanguageSelector />
            <AnimatedEntrance style={styles.hero}>
              <View
                style={[
                  styles.heroAccent,
                  isRTL ? styles.heroAccentRight : styles.heroAccentLeft,
                ]}
              />
              <Text style={styles.heroKicker}>{t('common.superAdminName')}</Text>
              <Text style={styles.companyName}>
                {user.companyName || t('common.company')}
              </Text>
              {user.email ? (
                <Text style={styles.companyMeta}>{user.email}</Text>
              ) : null}
              <Text style={styles.timeNote}>
                {t('dashboard.attendanceTimezone')}
              </Text>
            </AnimatedEntrance>

            <View style={styles.moduleGrid}>
              <DashboardActionCard
                delay={50}
                icon="office-building-outline"
                isRTL={isRTL}
                label={t('navigation.branches')}
                onPress={() => navigate('branches')}
              />
              <DashboardActionCard
                delay={90}
                icon="view-grid-outline"
                isRTL={isRTL}
                label={t('navigation.classes')}
                onPress={() => navigate('classes')}
              />
              <DashboardActionCard
                delay={130}
                icon="account-group-outline"
                isRTL={isRTL}
                label={t('navigation.teachers')}
                onPress={() => navigate('teachers')}
              />
              <DashboardActionCard
                delay={150}
                icon="clock-outline"
                isRTL={isRTL}
                label={t('navigation.shifts')}
                onPress={() => navigate('shifts')}
              />
              <DashboardActionCard
                delay={160}
                icon="white-balance-sunny"
                isRTL={isRTL}
                label={t('navigation.holidays')}
                onPress={() => navigate('holidays')}
              />
              <DashboardActionCard
                delay={170}
                icon="school-outline"
                isRTL={isRTL}
                label={t('navigation.students')}
                onPress={() => navigate('students')}
              />
              <DashboardActionCard
                delay={210}
                icon="file-chart-outline"
                isRTL={isRTL}
                label={t('navigation.reports')}
                onPress={() => navigate('reports')}
              />
              <DashboardActionCard
                delay={250}
                icon="calendar-clock-outline"
                isRTL={isRTL}
                label={t('navigation.leaveRequests')}
                onPress={() => navigate('leaves')}
              />
            </View>

            <AnimatedEntrance delay={410} style={styles.panel}>
              <Text style={styles.sectionTitle}>
                {t('navigation.teachers')}
              </Text>
              <Text style={styles.teacherManagementNote}>
                {t('dashboard.teacherManagementNote')}
              </Text>
              <CustomButton
                onPress={() => navigate('teachers')}
                title={t('dashboard.openTeacherManagement')}
              />
            </AnimatedEntrance>

            {editing ? (
              <View style={styles.panel}>
                <Text style={styles.sectionTitle}>
                  {t('teachers.editEmail', { email: editing.email })}
                </Text>
                <CustomInput
                  label={t('teachers.teacherName')}
                  onChangeText={setEditName}
                  value={editName}
                />
                <CustomButton
                  loading={loadingAction === `edit-${editing.uid}`}
                  onPress={handleSaveTeacher}
                  title={t('teachers.save')}
                />
                <CustomButton
                  onPress={() => setEditing(null)}
                  title={t('common.cancel')}
                  variant="secondary"
                />
              </View>
            ) : null}

            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>{t('teachers.list')}</Text>
              <Text style={styles.count}>{visibleTeachers.length}</Text>
            </View>
            <CustomInput
              autoCapitalize="none"
              label={t('common.search')}
              onChangeText={setSearch}
              placeholder={t('teachers.searchPlaceholder')}
              value={search}
            />
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        nestedScrollEnabled
        renderItem={renderTeacher}
        showsVerticalScrollIndicator={false}
        style={styles.scrollList}
      />
      <Modal
        animationType="fade"
        onRequestClose={closeCorrection}
        transparent
        visible={Boolean(attendanceEdit)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.sectionTitle}>{t('attendance.edit')}</Text>
              <View style={styles.correctionIdentity}>
                <View style={styles.correctionAvatar}><MaterialCommunityIcons color={colors.emeraldDark} name="account-outline" size={27} /></View>
                <View style={styles.correctionIdentityText}>
                  <Text style={styles.correctionName}>{attendanceEdit?.employeeName || '--'}</Text>
                  <Text style={styles.correctionCurrent}>{attendanceEdit?.branchName || '--'} · {attendanceEdit?.className || '--'}</Text>
                  <Text style={styles.correctionCurrent}>{formatAttendanceDate(attendanceEdit?.attendance_date)}</Text>
                </View>
              </View>
              <View style={[styles.currentAttendanceRow, { flexDirection: getRowDirection(isRTL) }]}>
                <View style={styles.currentTime}><Text style={styles.currentTimeLabel}>{t('attendance.inLabel')}</Text><Text style={styles.currentTimeValue}>{formatTime(attendanceEdit?.checkInAt)}</Text></View>
                <View style={styles.currentTime}><Text style={styles.currentTimeLabel}>{t('attendance.outLabel')}</Text><Text style={styles.currentTimeValue}>{formatTime(attendanceEdit?.checkOutAt)}</Text></View>
              </View>
              <Text style={styles.correctionSectionTitle}>{isRTL ? 'حاضری میں ترمیم' : 'Edit attendance'}</Text>
              <CustomInput
                autoCapitalize="none"
                label={t('attendance.checkInIso')}
                onChangeText={setCorrectionCheckIn}
                value={correctionCheckIn}
              />
              <CustomInput
                autoCapitalize="none"
                label={t('attendance.checkOutIso')}
                onChangeText={setCorrectionCheckOut}
                value={correctionCheckOut}
              />
              <Text style={styles.filterLabel}>{t('common.status')}</Text>
              <View style={styles.filters}>
                {['PRESENT', 'INCOMPLETE', 'ON_LEAVE'].map(status => (
                  <FilterPill
                    active={correctionStatus === status}
                    key={status}
                    label={t(
                      `attendance.${
                        status === 'PRESENT'
                          ? 'present'
                          : status === 'INCOMPLETE'
                          ? 'incomplete'
                          : 'onLeave'
                      }`,
                    )}
                    onPress={() => selectCorrectionStatus(status)}
                  />
                ))}
              </View>
              {correctionStatus !== 'ON_LEAVE' ? (
                <>
                  <Text style={styles.filterLabel}>
                    {t('attendance.lateStatus')}
                  </Text>
                  <View style={styles.filters}>
                    <FilterPill
                      active={correctionLate === false}
                      label={t('attendance.onTime')}
                      onPress={() => setCorrectionLate(false)}
                    />
                    <FilterPill
                      active={correctionLate === true}
                      label={t('attendance.late')}
                      onPress={() => setCorrectionLate(true)}
                    />
                  </View>
                </>
              ) : null}
              <CustomInput
                label={t('attendance.correctionReason')}
                multiline
                onChangeText={setCorrectionReason}
                value={correctionReason}
              />
              {correctionError ? (
                <Text style={styles.error}>{correctionError}</Text>
              ) : null}
              <CustomButton
                disabled={loadingAction === 'attendance-correction'}
                loading={loadingAction === 'attendance-correction'}
                onPress={handleCorrection}
                title={t('attendance.saveCorrection')}
              />
              <CustomButton
                disabled={loadingAction === 'attendance-correction'}
                onPress={closeCorrection}
                title={t('common.cancel')}
                variant="secondary"
              />
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  scrollList: { flex: 1 },
  topBar: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  kicker: { color: '#687386', fontSize: 13, fontWeight: '700' },
  title: { color: '#142033', fontSize: 26, fontWeight: '900' },
  logout: { color: colors.emeraldDark, fontWeight: '800' },
  listContent: { padding: 16, paddingBottom: 104 },
  hero: {
    backgroundColor: colors.emeraldSoft,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 4,
    marginBottom: 16,
    overflow: 'hidden',
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  heroAccent: {
    backgroundColor: colors.emerald,
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: 6,
  },
  heroAccentLeft: { left: 0 },
  heroAccentRight: { right: 0 },
  heroKicker: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginBottom: 5,
  },
  companyName: { color: colors.ink, fontSize: 26, fontWeight: '900' },
  companyMeta: { color: colors.muted, marginTop: 3 },
  timeNote: { color: '#7a5a00', fontSize: 12, lineHeight: 19, marginTop: 10 },
  moduleGrid: { gap: 11, marginBottom: 18 },
  moduleCard: {
    alignItems: 'center',
    backgroundColor: colors.emeraldDark,
    borderColor: colors.borderStrong,
    borderRadius: 17,
    borderWidth: 1,
    elevation: 5,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: colors.shadow,
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  moduleIconShell: {
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    borderRadius: 13,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  moduleIcon: { color: colors.emeraldDark, fontSize: 24, lineHeight: 29 },
  moduleLabel: {
    color: colors.white,
    flex: 1,
    fontSize: 17,
    fontWeight: '900',
    paddingHorizontal: 14,
  },
  moduleArrow: {
    color: colors.borderStrong,
    fontSize: 30,
    lineHeight: 32,
    width: 24,
  },
  statsGrid: {
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 4,
    flex: 1,
    minWidth: 90,
    minHeight: 125,
    padding: 13,
    shadowColor: colors.shadow,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
  },
  statIcon: {
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    borderColor: colors.borderStrong,
    borderRadius: 22,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    marginBottom: 5,
    width: 42,
  },
  statIconText: { color: colors.emeraldDark, fontSize: 20, lineHeight: 24 },
  statValue: { color: colors.emeraldDark, fontSize: 25, fontWeight: '900' },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 18,
    padding: 18,
    shadowColor: colors.shadow,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 9,
  },
  sectionTitle: {
    color: '#142033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  error: { color: '#d93025' },
  teacherManagementNote: { color: '#687386', lineHeight: 20 },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  count: {
    backgroundColor: colors.emeraldLight,
    borderRadius: 8,
    color: colors.emeraldDark,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  teacherRow: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  teacherInfo: { flex: 1, paddingRight: 12 },
  teacherName: { color: '#142033', fontSize: 16, fontWeight: '800' },
  teacherEmail: { color: '#687386', fontSize: 13, marginTop: 3 },
  rowActions: { alignItems: 'flex-end', gap: 5 },
  actionLink: { color: colors.emeraldDark, fontWeight: '800' },
  statusLink: { fontSize: 12, fontWeight: '900' },
  activeText: { color: '#137333' },
  inactiveText: { color: '#b3261e' },
  attendancePanel: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 4,
    marginTop: 24,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  attendanceHeader: { alignItems: 'center', justifyContent: 'space-between' },
  filterToggle: { backgroundColor: colors.emeraldLight, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7 },
  filterToggleText: { color: colors.emeraldDark, fontSize: 12, fontWeight: '900' },
  attendanceSummaryGrid: { gap: 8, marginBottom: 14 },
  summaryCard: { alignItems: 'center', borderRadius: 14, flex: 1, minHeight: 94, padding: 10 },
  summaryGreen: { backgroundColor: colors.emeraldLight },
  summaryAmber: { backgroundColor: '#FFF4D8' },
  summarySoft: { backgroundColor: '#EEF3FF' },
  summaryIcon: { color: colors.emeraldDark, fontSize: 19, fontWeight: '900' },
  summaryValue: { color: colors.ink, fontSize: 24, fontWeight: '900', marginTop: 3 },
  summaryLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', marginTop: 2, textAlign: 'center' },
  attendanceRow: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    marginTop: 10,
    padding: 14,
    shadowColor: colors.shadow,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  attendanceTop: { alignItems: 'center' },
  attendanceInfo: { flex: 1, paddingHorizontal: 10 },
  avatarPlaceholder: { alignItems: 'center', backgroundColor: colors.emeraldLight, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  avatarText: { color: colors.emeraldDark, fontSize: 22 },
  statusBadge: { borderRadius: 14, fontSize: 12, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 6 },
  statusPresent: { backgroundColor: colors.emeraldLight, color: colors.emeraldDark },
  statusPending: { backgroundColor: '#FFF4D8', color: '#9A6400' },
  statusLeave: { backgroundColor: '#F4ECFF', color: '#6343A5' },
  attendanceTimes: { borderTopColor: colors.border, borderTopWidth: 1, gap: 9, marginTop: 12, paddingTop: 10 },
  timeItem: { color: colors.muted, flex: 1, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  editAttendanceButton: { alignItems: 'center', borderColor: colors.borderStrong, borderRadius: 10, borderWidth: 1, marginTop: 12, paddingVertical: 9 },
  badge: { fontSize: 12, fontWeight: '900' },
  complete: { color: '#137333' },
  incomplete: { color: '#b06000' },
  empty: { color: '#687386', paddingVertical: 18, textAlign: 'center' },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  filterLabel: {
    color: '#4f5d73',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
  },
  filterPill: {
    backgroundColor: '#f1f4f8',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterPillActive: { backgroundColor: colors.emerald },
  filterText: { color: '#4f5d73', fontWeight: '800' },
  filterTextActive: { color: '#ffffff' },
  reportMeta: { color: '#4f5d73', fontSize: 13, marginBottom: 4 },
  note: { color: '#687386', fontSize: 12, marginBottom: 10 },
  editAttendance: { color: colors.emeraldDark, fontWeight: '900' },
  correctionIdentity: { alignItems: 'center', backgroundColor: colors.emeraldSoft, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginBottom: 12, padding: 12 },
  correctionAvatar: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 28, height: 56, justifyContent: 'center', width: 56 },
  correctionIdentityText: { flex: 1, paddingHorizontal: 12 },
  correctionName: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  currentAttendanceRow: { gap: 10, marginBottom: 18 },
  currentTime: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flex: 1, padding: 11 },
  currentTimeLabel: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  currentTimeValue: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 3 },
  correctionSectionTitle: { color: colors.emeraldDark, fontSize: 16, fontWeight: '900', marginBottom: 12 },
  correctionCurrent: {
    color: colors.emeraldDark,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 10,
  },
  correctionCurrent: { color: '#687386', lineHeight: 20, marginBottom: 12 },
  modalBackdrop: {
    backgroundColor: 'rgba(20,32,51,0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    maxHeight: '90%',
    padding: 18,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
});

export default SuperAdminDashboard;
