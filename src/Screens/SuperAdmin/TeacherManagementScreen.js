import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  InteractionManager,
  Modal,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { launchImageLibrary } from 'react-native-image-picker';

import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import KeyboardAwareScrollView from '../../Components/KeyboardAwareScrollView';
import Text from '../../Components/AppText';
import PremiumDataCard, { CARD_ICONS } from '../../Components/PremiumDataCard';
import ScalableSelector from '../../Components/ScalableSelector';
import TeacherProfileScreen from './TeacherProfileScreen';
import { useTranslation } from '../../localization/i18n';
import { translateApiError } from '../../api/errors';
import { getBranches } from '../../Services/branchService';
import { getClasses } from '../../Services/classService';
import { getShifts } from '../../Services/shiftService';
import {
  createTeacher,
  deleteTeacher,
  getTeacher,
  listTeachers,
  resetTeacherPassword,
  updateTeacher,
  uploadTeacherProfileImage,
} from '../../Services/teacherService';
import { getBranchName } from '../../Utils/classes';
import colors from '../../theme/colors';
import {
  getDefaultIjaraTerms,
  IJARA_TERMS_VERSION,
} from '../../Config/ijaraTerms';
import { formatSalary, getClassesForBranch } from '../../Utils/teachers';
import {
  validateAdminResetPassword,
  validateTeacherManagement,
} from '../../Utils/validationSchemas';

const PAGE_SIZE = 20;
const emptyTeacher = language => ({
  name: '',
  loginId: '',
  email: '',
  password: '',
  contact: '',
  teacherType: 'teacher',
  supervisorBranchIds: [],
  branchId: '',
  classId: '',
  shiftId: '',
  timing: '',
  baseSalary: '',
  ijaraFrequency: 'monthly',
  weeklyIjaraAmount: '',
  monthlyAllowance: '0',
  attendanceAllowance: '0',
  attendanceAllowanceEnabled: false,
  conveyanceAllowance: '0',
  medicalAllowance: '0',
  workingDays: [],
  ijaraTerms: getDefaultIjaraTerms(language),
  ijaraTermsVersion: IJARA_TERMS_VERSION,
  onboardingRequired: true,
});

const TeacherManagementScreen = ({ onBack }) => {
  const { t, isRTL, language } = useTranslation();
  const listRef = useRef(null);
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [form, setForm] = useState(() => emptyTeacher(language));
  const [editing, setEditing] = useState(null);
  const [details, setDetails] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [selectorMode, setSelectorMode] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [formError, setFormError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [profileImageAsset, setProfileImageAsset] = useState(null);

  const activeBranches = useMemo(
    () => branches.filter(item => item.status === 'active'),
    [branches],
  );
  const selectableClasses = useMemo(
    () => getClassesForBranch(classes, form.branchId),
    [classes, form.branchId],
  );
  const filterClasses = useMemo(
    () =>
      branchFilter === 'all'
        ? classes
        : classes.filter(item => item.branch_id === branchFilter),
    [branchFilter, classes],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTeachers = useCallback(async () => {
    const result = await listTeachers({
      search: debouncedSearch,
      branchId: branchFilter,
      classId: classFilter,
      status: statusFilter,
      teacherType: designationFilter,
      page,
      limit: PAGE_SIZE,
    });
    setTeachers(result.items);
    setPagination(result.pagination);
  }, [branchFilter, classFilter, debouncedSearch, designationFilter, page, statusFilter]);

  const loadData = useCallback(async () => {
    setLoadError('');
    try {
      const [branchList, classList, shiftList] = await Promise.all([
        getBranches(),
        getClasses(),
        getShifts(),
      ]);
      setBranches(branchList);
      setClasses(classList);
      setShifts(shiftList);
      await loadTeachers();
    } catch (error) {
      setLoadError(translateApiError(t, error, 'teachers.loadFailed'));
      throw error;
    }
  }, [loadTeachers, t]);

  useEffect(() => {
    loadData()
      .catch(() => {})
      .finally(() => setInitialLoading(false));
  }, [loadData]);

  const updateForm = (field, value) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setFormError('');
  };
  const selectBranch = branchId => {
    setForm(previous => ({
      ...previous,
      branchId,
      classId:
        classes.find(item => item.id === previous.classId)?.branch_id ===
        branchId
          ? previous.classId
          : '',
    }));
    setFormError('');
    setSelectorMode('');
  };
  const resetForm = () => {
    setEditing(null);
    setForm(emptyTeacher(language));
    setProfileImageAsset(null);
    setFormError('');
  };
  useEffect(() => {
    if (!editing) return undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    });
    const fallback = setTimeout(() => {
      listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }, 180);
    return () => {
      task.cancel();
      clearTimeout(fallback);
    };
  }, [editing]);

  const startEditing = teacher => {
    setEditing(teacher);
    setForm({
      name: teacher.name || '',
      loginId: teacher.loginId || '',
      email: teacher.email || '',
      password: '',
      contact: teacher.contact || '',
      teacherType: teacher.teacher_type || 'teacher',
      supervisorBranchIds: teacher.supervisor_branch_ids || [],
      branchId: teacher.branch_id || '',
      classId: teacher.class_id || '',
      shiftId: teacher.shift_id || '',
      timing: teacher.timing || '',
      baseSalary: String(teacher.base_salary ?? ''),
      ijaraFrequency: teacher.ijara_frequency || 'monthly',
      weeklyIjaraAmount: String(teacher.weekly_ijara_amount ?? ''),
      monthlyAllowance: String(teacher.monthly_allowance ?? '0'),
      attendanceAllowance: String(teacher.attendance_allowance ?? '0'),
      attendanceAllowanceEnabled: Boolean(teacher.attendance_allowance_enabled),
      conveyanceAllowance: String(teacher.conveyance_allowance ?? '0'),
      medicalAllowance: String(teacher.medical_allowance ?? '0'),
      workingDays: teacher.working_days || [],
      ijaraTerms: teacher.ijara_terms || '',
      ijaraTermsVersion: teacher.ijara_terms_version || '',
      onboardingRequired: Boolean(teacher.onboardingRequired ?? teacher.onboarding_required),
    });
    setProfileImageAsset(null);
    setFormError('');
  };

  const chooseProfileImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      selectionLimit: 1,
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.6,
    });
    if (result.didCancel) return;
    if (result.errorCode) return setFormError(t('onboarding.imageSelectionFailed'));
    const asset = result.assets?.[0];
    if (!asset?.base64 || !asset.type) return setFormError(t('onboarding.invalidImage'));
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(asset.type)) return setFormError(t('onboarding.invalidImage'));
    if (asset.fileSize > 2 * 1024 * 1024 || asset.base64.length > 2_796_204) return setFormError(t('onboarding.imageTooLarge'));
    setProfileImageAsset({
      uri: asset.uri,
      fileName: asset.fileName || 'profile-image',
      mimeType: asset.type === 'image/jpg' ? 'image/jpeg' : asset.type,
      data: asset.base64,
    });
    setFormError('');
  };

  const handleSave = async () => {
    if (!form.shiftId) return setFormError(t('validation.shiftRequired'));
    const validationError = validateTeacherManagement(form, !editing);
    if (validationError) return setFormError(t(validationError));
    const assignmentChanged =
      !editing ||
      editing.branch_id !== form.branchId ||
      editing.class_id !== form.classId;
    if (assignmentChanged) {
      const branch = branches.find(item => item.id === form.branchId);
      const classItem = classes.find(item => item.id === form.classId);
      if (branch?.status !== 'active')
        return setFormError(t('validation.activeBranchRequired'));
      if (form.classId &&
        classItem?.status !== 'active' ||
        classItem?.branch_id !== form.branchId
      )
        return setFormError(t('validation.activeClassRequired'));
    }
    setLoadingAction(editing ? `edit-${editing.uid}` : 'create');
    try {
      const savedTeacher = editing
        ? await updateTeacher(editing.uid, form)
        : await createTeacher(form);
      let profileUploadError = null;
      if (profileImageAsset) {
        try {
          await uploadTeacherProfileImage(savedTeacher.uid, profileImageAsset);
        } catch (error) {
          profileUploadError = error;
        }
      }
      const wasEditing = Boolean(editing);
      resetForm();
      try {
        await loadTeachers();
      } catch {
        // The teacher has already been saved; the list can refresh later.
      }
      Alert.alert(
        t('teachers.saved'),
        profileUploadError
          ? `${t(wasEditing ? 'teachers.updatedMessage' : 'teachers.createdMessage')}\n\n${t('onboarding.imageTitle')}: ${translateApiError(t, profileUploadError)}`
          : t(wasEditing ? 'teachers.updatedMessage' : 'teachers.createdMessage'),
      );
    } catch (error) {
      Alert.alert(t('teachers.saveFailed'), translateApiError(t, error));
    } finally {
      setLoadingAction('');
    }
  };

  const openDetails = async teacher => {
    setLoadingAction(`view-${teacher.uid}`);
    try {
      setDetails(await getTeacher(teacher.uid));
    } catch (error) {
      Alert.alert(t('teachers.loadFailed'), translateApiError(t, error));
    } finally {
      setLoadingAction('');
    }
  };

  const handleDelete = teacher => {
    Alert.alert(
      t('common.delete'),
      isRTL ? `کیا آپ واقعی ${teacher.name} کو حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہوگا۔` : `Delete ${teacher.name} permanently? This cannot be undone.`,
      [{ text: t('common.cancel'), style: 'cancel' }, { text: t('common.delete'), style: 'destructive', onPress: async () => {
        setLoadingAction(`delete-${teacher.uid}`);
        try { await deleteTeacher(teacher.uid); await loadTeachers(); }
        catch (error) { Alert.alert(t('common.delete'), translateApiError(t, error)); }
        finally { setLoadingAction(''); }
      } }],
    );
  };

  const closePasswordReset = () => {
    setResetTarget(null);
    setResetPassword('');
    setConfirmPassword('');
    setShowResetPassword(false);
    setResetError('');
  };
  const openPasswordReset = teacher => {
    setDetails(null);
    setResetTarget(teacher);
    setResetPassword('');
    setConfirmPassword('');
    setShowResetPassword(false);
    setResetError('');
  };
  const handlePasswordReset = async () => {
    const validationError = validateAdminResetPassword(resetPassword);
    if (validationError) return setResetError(t(validationError));
    if (resetPassword !== confirmPassword)
      return setResetError(t('validation.passwordMismatch'));
    setLoadingAction(`reset-${resetTarget.uid}`);
    setResetError('');
    try {
      await resetTeacherPassword(
        resetTarget.uid,
        resetPassword,
        confirmPassword,
      );
      closePasswordReset();
      Alert.alert(
        t('teachers.passwordResetComplete'),
        t('teachers.passwordResetMessage'),
      );
    } catch (error) {
      setResetError(translateApiError(t, error));
    } finally {
      setLoadingAction('');
    }
  };

  const getClassName = id =>
    classes.find(item => item.id === id)?.name || t('teachers.unassigned');
  const selectedBranch = branches.find(item => item.id === form.branchId);
  const selectedClass = classes.find(item => item.id === form.classId);
  const activeShifts = shifts.filter(item => item.status === 'active');
  const selectedShift = shifts.find(item => item.id === form.shiftId);
  const teacherTypeLabel = value =>
    t(({ supervisor: 'teachers.supervisorType', muawin: 'teachers.muawinType', khadim: 'teachers.khadimType' })[value] || 'teachers.teacherType');
  const selectorOptions = () => {
    if (selectorMode === 'formTeacherType')
      return [
        { id: 'teacher', label: t('teachers.teacherType') },
        { id: 'supervisor', label: t('teachers.supervisorType') },
        { id: 'muawin', label: t('teachers.muawinType') },
        { id: 'khadim', label: t('teachers.khadimType') },
      ];
    if (selectorMode === 'formBranch')
      return activeBranches.map(item => ({
        id: item.id,
        label: `${item.name} (${item.code})`,
      }));
    if (selectorMode === 'formClass')
      return selectableClasses.map(item => ({ id: item.id, label: item.name }));
    if (selectorMode === 'formShift')
      return activeShifts.map(item => ({
        id: item.id,
        label: `${item.name} (${item.startTime} - ${item.endTime})`,
      }));
    if (selectorMode === 'formIjaraFrequency')
      return [{ id: 'monthly', label: t('teachers.monthlyIjara') }, { id: 'weekly', label: t('teachers.weeklyIjara') }];
    if (selectorMode === 'filterBranch')
      return [
        { id: 'all', label: t('branches.all') },
        ...branches.map(item => ({ id: item.id, label: item.name })),
      ];
    if (selectorMode === 'filterClass')
      return [
        { id: 'all', label: t('classes.all') },
        ...filterClasses.map(item => ({ id: item.id, label: item.name })),
      ];
    if (selectorMode === 'filterDesignation')
      return [{ id: 'all', label: t('teachers.allDesignations') }, { id: 'teacher', label: t('teachers.teacherType') }, { id: 'supervisor', label: t('teachers.supervisorType') }, { id: 'muawin', label: t('teachers.muawinType') }, { id: 'khadim', label: t('teachers.khadimType') }];
    return [
      { id: 'all', label: t('status.all') },
      { id: 'active', label: t('status.active') },
      { id: 'inactive', label: t('status.inactive') },
    ];
  };
  const selectOption = id => {
    if (selectorMode === 'formBranch') return selectBranch(id);
    if (selectorMode === 'formTeacherType') { updateForm('teacherType', id); setSelectorMode(''); return; }
    if (selectorMode === 'filterDesignation') { setDesignationFilter(id); setPage(1); }
    else if (selectorMode === 'formClass') updateForm('classId', id);
    else if (selectorMode === 'formShift') {
      const shift = shifts.find(item => item.id === id);
      setForm(previous => ({
        ...previous,
        shiftId: id,
        timing: shift?.timing || `${shift?.startTime}-${shift?.endTime}`,
      }));
    } else if (selectorMode === 'formIjaraFrequency') {
      updateForm('ijaraFrequency', id);
    } else if (selectorMode === 'filterBranch') {
      setBranchFilter(id);
      setPage(1);
      if (
        id !== 'all' &&
        classes.find(item => item.id === classFilter)?.branch_id !== id
      )
        setClassFilter('all');
    } else if (selectorMode === 'filterClass') {
      setClassFilter(id);
      setPage(1);
    } else {
      setStatusFilter(id);
      setPage(1);
    }
    setSelectorMode('');
  };

  const renderTeacher = ({ item }) => (
    <PremiumDataCard
      actions={[
        {
          key: 'view',
          icon: CARD_ICONS.view,
          label: t('common.view'),
          loading: loadingAction === `view-${item.uid}`,
          onPress: () => openDetails(item),
        },
        {
          key: 'edit',
          icon: CARD_ICONS.edit,
          label: t('common.edit'),
          onPress: () => startEditing(item),
        },
        {
          key: 'reset',
          icon: CARD_ICONS.reset,
          label: t('teachers.resetPassword'),
          onPress: () => openPasswordReset(item),
        },
        {
          key: 'delete', icon: CARD_ICONS.delete, label: t('common.delete'),
          loading: loadingAction === `delete-${item.uid}`,
          onPress: () => handleDelete(item), tone: 'danger',
        },
      ]}
      onPress={() => openDetails(item)}
    >
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.name}</Text>
        <Text style={styles.teacherMeta}>
          {t('teachers.designation')}: {teacherTypeLabel(item.teacher_type)}
        </Text>
        <Text style={styles.teacherMeta}>
          {item.loginId}
          {item.email ? ` · ${item.email}` : ''}
        </Text>
        <Text style={styles.teacherMeta}>
          {getBranchName(branches, item.branch_id)} ·{' '}
          {getClassName(item.class_id)}
        </Text>
      </View>
    </PremiumDataCard>
  );

  if (initialLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.emerald} size="large" />
        <Text style={styles.loadingText}>{t('teachers.loading')}</Text>
      </View>
    );
  if (details) {
    return (
      <TeacherProfileScreen
        branchName={getBranchName(branches, details.branch_id)}
        className={getClassName(details.class_id)}
        onBack={() => setDetails(null)}
        teacher={details}
      />
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text accessibilityRole="button" style={styles.back} onPress={onBack}>
          {t('common.back')}
        </Text>
        <View style={styles.heading}>
          <Text style={styles.kicker}>{t('common.superAdmin')}</Text>
          <Text style={styles.title}>{t('teachers.title')}</Text>
        </View>
      </View>
      <FlashList
        ref={listRef}
        contentContainerStyle={styles.content}
        data={teachers}
        keyboardShouldPersistTaps="handled"
        keyExtractor={item => item.uid}
        maintainVisibleContentPosition={{ disabled: true }}
        nestedScrollEnabled
        renderItem={renderTeacher}
        showsVerticalScrollIndicator={false}
        style={styles.scrollList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await loadData();
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>{t('teachers.empty')}</Text>
        }
        ListHeaderComponent={
          <View>
            {loadError ? (
              <View style={styles.errorPanel}>
                <Text style={styles.error}>{loadError}</Text>
                <CustomButton
                  onPress={() => loadData().catch(() => {})}
                  title={t('common.retry')}
                  variant="secondary"
                />
              </View>
            ) : null}
            <View style={styles.panel}>
              <Text style={styles.sectionTitle}>
                {editing
                  ? t('teachers.editLoginId', { loginId: editing.loginId })
                  : t('teachers.register')}
              </Text>
              <CustomInput
                label={t('common.name')}
                onChangeText={value => updateForm('name', value)}
                value={form.name}
              />
              <CustomInput
                autoCapitalize="none"
                contentDirection="ltr"
                editable={!editing}
                label={t('teachers.loginId')}
                onChangeText={value => updateForm('loginId', value)}
                value={form.loginId}
              />
              {editing ? (
                <Text style={styles.note}>
                  {t('teachers.loginIdImmutable')}
                </Text>
              ) : null}
              <CustomInput
                autoCapitalize="none"
                keyboardType="email-address"
                label={t('teachers.emailOptional')}
                onChangeText={value => updateForm('email', value)}
                value={form.email}
              />
              {!editing ? (
                <CustomInput
                  autoCapitalize="none"
                  label={t('teachers.temporaryPassword')}
                  onChangeText={value => updateForm('password', value)}
                  secureTextEntry
                  value={form.password}
                />
              ) : null}
              <CustomInput
                keyboardType="phone-pad"
                label={t('common.contact')}
                onChangeText={value => updateForm('contact', value)}
                value={form.contact}
              />
              <Text style={styles.fieldLabel}>{t('teachers.designation')}</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setSelectorMode('formTeacherType')}
              >
                <Text style={styles.selectorText}>
                  {teacherTypeLabel(form.teacherType)}
                </Text>
              </TouchableOpacity>
              {form.teacherType === 'supervisor' ? (
                <>
                  <ScalableSelector
                    label={t('teachers.assignedBranches')}
                    multiple
                    onChange={value => updateForm('supervisorBranchIds', value)}
                    options={activeBranches.map(item => ({
                      id: item.id,
                      label: item.name,
                    }))}
                    value={form.supervisorBranchIds}
                  />
                </>
              ) : null}
              <Text style={styles.fieldLabel}>{t('common.branch')}</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setSelectorMode('formBranch')}
              >
                <Text
                  style={
                    selectedBranch ? styles.selectorText : styles.placeholder
                  }
                >
                  {selectedBranch?.name || t('teachers.selectActiveBranch')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.fieldLabel}>{t('common.class')}</Text>
              <TouchableOpacity
                disabled={!form.branchId}
                style={[styles.selector, !form.branchId && styles.disabled]}
                onPress={() => setSelectorMode('formClass')}
              >
                <Text
                  style={
                    selectedClass ? styles.selectorText : styles.placeholder
                  }
                >
                  {selectedClass?.name || t('teachers.selectBranchClass')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.fieldLabel}>{t('shifts.shift')}</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setSelectorMode('formShift')}
              >
                <Text
                  style={
                    selectedShift ? styles.selectorText : styles.placeholder
                  }
                >
                  {selectedShift
                    ? `${selectedShift.name} (${selectedShift.startTime} - ${selectedShift.endTime})`
                    : t('shifts.select')}
                </Text>
              </TouchableOpacity>
              <CustomInput
                editable={false}
                contentDirection="ltr"
                label={t('teachers.timing')}
                value={form.timing}
              />
              <Text style={styles.fieldLabel}>{t('teachers.ijaraFrequency')}</Text>
              <TouchableOpacity style={styles.selector} onPress={() => setSelectorMode('formIjaraFrequency')}><Text style={styles.selectorText}>{t(form.ijaraFrequency === 'weekly' ? 'teachers.weeklyIjara' : 'teachers.monthlyIjara')}</Text></TouchableOpacity>
              {form.ijaraFrequency === 'weekly' ? (
                <CustomInput keyboardType="numeric" label={t('teachers.weeklyIjaraAmount')} onChangeText={value => updateForm('weeklyIjaraAmount', value)} placeholder="10000" value={form.weeklyIjaraAmount} />
              ) : (
                <CustomInput keyboardType="numeric" label={t('teachers.baseSalary')} onChangeText={value => updateForm('baseSalary', value)} placeholder="35000" value={form.baseSalary} />
              )}
              <CustomInput keyboardType="numeric" label={t('teachers.monthlyAllowance')} onChangeText={value => updateForm('monthlyAllowance', value)} placeholder="0" value={form.monthlyAllowance} />
              <CustomInput keyboardType="numeric" label={t('teachers.attendanceAllowance')} onChangeText={value => updateForm('attendanceAllowance', value)} placeholder="0" value={form.attendanceAllowance} />
              <Text style={styles.fieldLabel}>{t('teachers.applyAttendanceAllowance')}</Text>
              <View style={styles.dayRow}><TouchableOpacity onPress={() => updateForm('attendanceAllowanceEnabled', true)} style={[styles.dayChip, form.attendanceAllowanceEnabled && styles.dayChipActive]}><Text style={form.attendanceAllowanceEnabled ? styles.dayTextActive : styles.dayText}>{t('common.yes')}</Text></TouchableOpacity><TouchableOpacity onPress={() => updateForm('attendanceAllowanceEnabled', false)} style={[styles.dayChip, !form.attendanceAllowanceEnabled && styles.dayChipActive]}><Text style={!form.attendanceAllowanceEnabled ? styles.dayTextActive : styles.dayText}>{t('common.no')}</Text></TouchableOpacity></View>
              <CustomInput keyboardType="numeric" label={t('teachers.conveyanceAllowance')} onChangeText={value => updateForm('conveyanceAllowance', value)} placeholder="0" value={form.conveyanceAllowance} />
              <CustomInput keyboardType="numeric" label={t('teachers.medicalAllowance')} onChangeText={value => updateForm('medicalAllowance', value)} placeholder="0" value={form.medicalAllowance} />
              <Text style={styles.fieldLabel}>{t('teachers.workingDays')}</Text>
              <View style={styles.dayRow}>
                {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].map(day => (
                  <TouchableOpacity key={day} onPress={() => updateForm('workingDays', form.workingDays.includes(day) ? form.workingDays.filter(value => value !== day) : [...form.workingDays, day])} style={[styles.dayChip, form.workingDays.includes(day) && styles.dayChipActive]}>
                    <Text style={form.workingDays.includes(day) ? styles.dayTextActive : styles.dayText}>{t(`dates.${day.toLowerCase()}`)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.offDays}>{t('teachers.offDays')}: {['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].filter(day => !form.workingDays.includes(day)).map(day => t(`dates.${day.toLowerCase()}`)).join(', ') || '--'}</Text>
              <Text style={styles.fieldLabel}>{t('onboarding.imageTitle')}</Text>
              <View style={styles.profileImageRow}>
                {profileImageAsset?.uri ? (
                  <Image source={{ uri: profileImageAsset.uri }} style={styles.profileImagePreview} />
                ) : null}
                <View style={styles.profileImageAction}>
                  <CustomButton
                    onPress={chooseProfileImage}
                    title={t('onboarding.chooseImage')}
                    variant="secondary"
                  />
                  <Text style={styles.note}>{t('onboarding.imageHelp')}</Text>
                </View>
              </View>
              {editing ? <><Text style={styles.fieldLabel}>{t('onboarding.requireOnboarding')}</Text><View style={styles.dayRow}><TouchableOpacity onPress={() => updateForm('onboardingRequired', true)} style={[styles.dayChip, form.onboardingRequired && styles.dayChipActive]}><Text style={form.onboardingRequired ? styles.dayTextActive : styles.dayText}>{t('common.yes')}</Text></TouchableOpacity><TouchableOpacity onPress={() => updateForm('onboardingRequired', false)} style={[styles.dayChip, !form.onboardingRequired && styles.dayChipActive]}><Text style={!form.onboardingRequired ? styles.dayTextActive : styles.dayText}>{t('common.no')}</Text></TouchableOpacity></View></> : null}
              {formError ? <Text style={styles.error}>{formError}</Text> : null}
              <CustomButton
                disabled={!activeBranches.length}
                loading={
                  loadingAction === 'create' ||
                  loadingAction.startsWith('edit-')
                }
                onPress={handleSave}
                title={editing ? t('teachers.save') : t('teachers.register')}
              />
              {editing ? (
                <CustomButton
                  onPress={resetForm}
                  title={t('common.cancel')}
                  variant="secondary"
                />
              ) : null}
            </View>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>{t('teachers.list')}</Text>
              <Text style={styles.count}>{pagination.total}</Text>
            </View>
            <CustomInput
              label={t('common.search')}
              onChangeText={setSearch}
              value={search}
            />
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filter} onPress={() => setSelectorMode('filterDesignation')}><Text style={styles.filterText}>{designationFilter === 'all' ? t('teachers.allDesignations') : teacherTypeLabel(designationFilter)}</Text></TouchableOpacity>
              <TouchableOpacity
                style={styles.filter}
                onPress={() => setSelectorMode('filterBranch')}
              >
                <Text style={styles.filterText}>
                  {branchFilter === 'all'
                    ? t('branches.all')
                    : getBranchName(branches, branchFilter)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filter}
                onPress={() => setSelectorMode('filterClass')}
              >
                <Text style={styles.filterText}>
                  {classFilter === 'all'
                    ? t('classes.all')
                    : getClassName(classFilter)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filter}
                onPress={() => setSelectorMode('filterStatus')}
              >
                <Text style={styles.filterText}>
                  {t(`status.${statusFilter}`)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListFooterComponent={
          pagination.totalPages > 1 ? (
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
          ) : null
        }
      />
      <Modal
        animationType="fade"
        transparent
        visible={Boolean(selectorMode)}
        onRequestClose={() => setSelectorMode('')}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackdrop}
          onPress={() => setSelectorMode('')}
        >
          <View style={styles.modalCard}>
            {selectorOptions().map(item => (
              <Text
                key={item.id}
                style={styles.option}
                onPress={() => selectOption(item.id)}
              >
                {item.label}
              </Text>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        animationType="fade"
        transparent
        visible={Boolean(resetTarget)}
        onRequestClose={closePasswordReset}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.detailName}>{t('teachers.resetTitle')}</Text>
              <Text style={styles.note}>
                {t('teachers.resetFor', { name: resetTarget?.name || '' })}
              </Text>
              <CustomInput
                autoCapitalize="none"
                label={t('common.newPassword')}
                onChangeText={value => {
                  setResetPassword(value);
                  setResetError('');
                }}
                secureTextEntry={!showResetPassword}
                value={resetPassword}
              />
              <CustomInput
                autoCapitalize="none"
                label={t('common.confirmPassword')}
                onChangeText={value => {
                  setConfirmPassword(value);
                  setResetError('');
                }}
                secureTextEntry={!showResetPassword}
                value={confirmPassword}
              />
              <Text
                accessibilityRole="button"
                style={[
                  styles.showPassword,
                  isRTL ? styles.alignLeft : styles.alignRight,
                ]}
                onPress={() => setShowResetPassword(value => !value)}
              >
                {t(
                  showResetPassword
                    ? 'teachers.hidePassword'
                    : 'teachers.showPassword',
                )}
              </Text>
              <Text style={styles.note}>
                {t('teachers.passwordRequirements')}
              </Text>
              {resetError ? (
                <Text style={styles.error}>{resetError}</Text>
              ) : null}
              <CustomButton
                loading={loadingAction === `reset-${resetTarget?.uid}`}
                onPress={handlePasswordReset}
                title={t('teachers.resetPassword')}
              />
              <CustomButton
                disabled={loadingAction === `reset-${resetTarget?.uid}`}
                onPress={closePasswordReset}
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
  offDays: { color: '#687386', fontSize: 13, marginBottom: 14 },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  dayChip: { backgroundColor: '#f1f5f3', borderColor: '#cfe0d6', borderRadius: 18, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 },
  dayChipActive: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  dayText: { color: '#435267', fontSize: 12 },
  dayTextActive: { color: '#fff', fontSize: 12 },
  profileImageRow: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 14 },
  profileImagePreview: { borderColor: colors.border, borderRadius: 36, borderWidth: 1, height: 72, width: 72 },
  profileImageAction: { flex: 1 },
  container: { backgroundColor: '#ffffff', flex: 1 },
  scrollList: { flex: 1 },
  topBar: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 20,
  },
  back: { color: colors.emeraldDark, fontWeight: '800', marginRight: 16 },
  heading: { flex: 1 },
  kicker: { color: '#687386', fontSize: 12, fontWeight: '700' },
  title: { color: '#142033', fontSize: 22, fontWeight: '900' },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  loadingText: { color: '#687386', marginTop: 10 },
  content: { padding: 20, paddingBottom: 96 },
  panel: {
    backgroundColor: '#f8fafc',
    borderColor: '#dfe7f0',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    padding: 16,
  },
  errorPanel: {
    backgroundColor: '#fff4f3',
    borderRadius: 8,
    marginBottom: 16,
    padding: 14,
  },
  sectionTitle: {
    color: '#142033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#263244',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
  },
  selector: {
    backgroundColor: '#f7f9fc',
    borderColor: '#d8e0eb',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 14,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  selectorText: { color: '#142033', fontSize: 15 },
  placeholder: { color: '#8a94a6', fontSize: 15 },
  disabled: { opacity: 0.6 },
  error: { color: '#d93025', marginBottom: 6 },
  note: { color: '#687386', fontSize: 12, marginBottom: 12 },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  filter: {
    backgroundColor: colors.emeraldLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: { color: colors.emeraldDark, fontSize: 12, fontWeight: '800' },
  teacherRow: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 14,
  },
  teacherInfo: { flex: 1, paddingRight: 12 },
  teacherName: { color: '#142033', fontSize: 16, fontWeight: '800' },
  teacherMeta: { color: '#687386', fontSize: 12, marginTop: 3 },
  rowActions: { alignItems: 'flex-end', gap: 5 },
  action: { color: colors.emeraldDark, fontWeight: '800' },
  active: { color: '#137333', fontSize: 12, fontWeight: '900', marginTop: 3 },
  inactive: { color: '#b3261e', fontSize: 12, fontWeight: '900', marginTop: 3 },
  deactivate: { color: '#b3261e', fontSize: 12, fontWeight: '900' },
  empty: { color: '#687386', paddingVertical: 20, textAlign: 'center' },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(20, 32, 51, 0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    maxHeight: '80%',
    padding: 20,
    width: '100%',
  },
  option: {
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    color: '#142033',
    fontSize: 15,
    paddingVertical: 14,
  },
  detailName: {
    color: '#142033',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  detailLine: { color: '#4f5d73', lineHeight: 22 },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  showPassword: {
    color: colors.emeraldDark,
    fontWeight: '800',
    marginBottom: 14,
  },
  alignLeft: { textAlign: 'left' },
  alignRight: { textAlign: 'right' },
});

export default TeacherManagementScreen;
