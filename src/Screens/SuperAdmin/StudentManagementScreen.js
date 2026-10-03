import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';

import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import KeyboardAwareScrollView from '../../Components/KeyboardAwareScrollView';
import Text from '../../Components/AppText';
import PremiumDataCard, { CARD_ICONS } from '../../Components/PremiumDataCard';
import { useTranslation } from '../../localization/i18n';
import colors from '../../theme/colors';
import { translateApiError } from '../../api/errors';
import { getBranches } from '../../Services/branchService';
import { getClasses } from '../../Services/classService';
import {
  createStudent,
  deleteStudent,
  getStudent,
  listStudents,
  updateStudent,
} from '../../Services/studentService';
import { getBranchName } from '../../Utils/classes';
import { filterStudentClasses } from '../../Utils/students';
import { validateStudent } from '../../Utils/validationSchemas';

const emptyStudent = {
  admissionNo: '',
  name: '',
  fatherName: '',
  contact: '',
  branchId: '',
  classId: '',
};
const PAGE_SIZE = 20;

const StudentManagementScreen = ({ onBack }) => {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(emptyStudent);
  const [editing, setEditing] = useState(null);
  const [details, setDetails] = useState(null);
  const [selectorMode, setSelectorMode] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [formError, setFormError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');

  const activeBranches = useMemo(
    () => branches.filter(branch => branch.status === 'active'),
    [branches],
  );
  const selectableClasses = useMemo(
    () => filterStudentClasses(classes, form.branchId),
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

  const loadStudents = useCallback(async () => {
    const result = await listStudents({
      search: debouncedSearch,
      branchId: branchFilter,
      classId: classFilter,
      status: statusFilter,
      page,
      limit: PAGE_SIZE,
    });
    setStudents(result.items);
    setPagination(result.pagination);
  }, [branchFilter, classFilter, debouncedSearch, page, statusFilter]);

  const loadData = useCallback(async () => {
    setLoadError('');
    try {
      const [branchList, classList] = await Promise.all([
        getBranches(),
        getClasses(),
      ]);
      setBranches(branchList);
      setClasses(classList);
      await loadStudents();
    } catch (error) {
      setLoadError(translateApiError(t, error));
      throw error;
    }
  }, [loadStudents, t]);

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
    setForm(previous => {
      const currentClass = classes.find(item => item.id === previous.classId);
      return {
        ...previous,
        branchId,
        classId: currentClass?.branch_id === branchId ? previous.classId : '',
      };
    });
    setFormError('');
    setSelectorMode('');
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyStudent);
    setFormError('');
  };

  const startEditing = student => {
    setEditing(student);
    setForm({
      admissionNo: student.admission_no || '',
      name: student.name || '',
      fatherName: student.father_name || '',
      contact: student.contact || '',
      branchId: student.branch_id || '',
      classId: student.class_id || '',
    });
    setFormError('');
  };

  const handleSave = async () => {
    const validationError = validateStudent(form);
    if (validationError) {
      setFormError(t(validationError));
      return;
    }

    const selectedBranch = branches.find(branch => branch.id === form.branchId);
    const selectedClass = classes.find(item => item.id === form.classId);
    const assignmentChanged =
      editing &&
      (editing.branch_id !== form.branchId ||
        editing.class_id !== form.classId);
    if (
      (!editing || assignmentChanged) &&
      (selectedBranch?.status !== 'active' ||
        selectedClass?.status !== 'active' ||
        selectedClass?.branch_id !== form.branchId)
    ) {
      setFormError(t('validation.activeClassRequired'));
      return;
    }

    setLoadingAction(editing ? `edit-${editing.id}` : 'create');
    try {
      if (editing) {
        await updateStudent(editing.id, form);
      } else {
        await createStudent(form);
      }
      const wasEditing = Boolean(editing);
      resetForm();
      await loadStudents();
      Alert.alert(
        t('students.saved'),
        t(wasEditing ? 'students.updatedMessage' : 'students.createdMessage'),
      );
    } catch (error) {
      Alert.alert(t('students.saveFailed'), translateApiError(t, error));
    } finally {
      setLoadingAction('');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (_) {
      // Inline error state provides retry feedback.
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = student => {
    Alert.alert(
      t('students.deleteTitle'),
      t('students.deleteMessage', { name: student.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setLoadingAction(`delete-${student.id}`);
            try {
              await deleteStudent(student.id);
              await loadStudents();
              Alert.alert(t('students.deleted'), t('students.deletedMessage'));
            } catch (error) {
              Alert.alert(
                t('students.deleteFailed'),
                translateApiError(t, error),
              );
            } finally {
              setLoadingAction('');
            }
          },
        },
      ],
    );
  };

  const getClassName = classId =>
    classes.find(item => item.id === classId)?.name || t('common.unknown');

  const openDetails = async student => {
    setLoadingAction(`view-${student.id}`);
    try {
      setDetails(await getStudent(student.id));
    } catch (error) {
      Alert.alert(t('students.loadFailed'), translateApiError(t, error));
    } finally {
      setLoadingAction('');
    }
  };

  const renderStudent = ({ item }) => {
    const branch = branches.find(value => value.id === item.branch_id);
    const classItem = classes.find(value => value.id === item.class_id);
    return (
      <PremiumDataCard
        actions={[
          {
            key: 'view',
            icon: CARD_ICONS.view,
            label: t('common.view'),
            loading: loadingAction === `view-${item.id}`,
            onPress: () => openDetails(item),
          },
          {
            key: 'edit',
            icon: CARD_ICONS.edit,
            label: t('common.edit'),
            onPress: () => startEditing(item),
          },
          {
            key: 'delete',
            icon: CARD_ICONS.delete,
            label: t('common.delete'),
            loading: loadingAction === `delete-${item.id}`,
            onPress: () => handleDelete(item),
            tone: 'danger',
          },
        ]}
        onPress={() => openDetails(item)}
      >
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentMeta}>
            {t('students.admissionNo')}: {item.admission_no}
          </Text>
          <Text style={styles.studentMeta}>
            {branch?.name || t('students.unknownBranch')}
            {branch?.status === 'inactive'
              ? ` (${t('status.inactive')})`
              : ''}{' '}
            · {classItem?.name || t('students.unknownClass')}
            {classItem?.status === 'inactive'
              ? ` (${t('status.inactive')})`
              : ''}
          </Text>
        </View>
      </PremiumDataCard>
    );
  };

  const selectedBranch = branches.find(item => item.id === form.branchId);
  const selectedClass = classes.find(item => item.id === form.classId);

  const selectorOptions = () => {
    if (selectorMode === 'formBranch') {
      return activeBranches.map(item => ({
        id: item.id,
        label: `${item.name} (${item.code})`,
      }));
    }
    if (selectorMode === 'formClass') {
      return selectableClasses.map(item => ({ id: item.id, label: item.name }));
    }
    if (selectorMode === 'filterBranch') {
      return [
        { id: 'all', label: t('branches.all') },
        ...branches.map(item => ({ id: item.id, label: item.name })),
      ];
    }
    if (selectorMode === 'filterClass') {
      return [
        { id: 'all', label: t('classes.all') },
        ...filterClasses.map(item => ({ id: item.id, label: item.name })),
      ];
    }
    return [
      { id: 'all', label: t('status.all') },
      { id: 'active', label: t('status.active') },
      { id: 'inactive', label: t('status.inactive') },
    ];
  };

  const selectOption = id => {
    if (selectorMode === 'formBranch') {
      selectBranch(id);
      return;
    }
    if (selectorMode === 'formClass') {
      updateForm('classId', id);
    } else if (selectorMode === 'filterBranch') {
      setBranchFilter(id);
      setPage(1);
      const selected = classes.find(item => item.id === classFilter);
      if (id !== 'all' && selected?.branch_id !== id) {
        setClassFilter('all');
      }
    } else if (selectorMode === 'filterClass') {
      setClassFilter(id);
      setPage(1);
    } else {
      setStatusFilter(id);
      setPage(1);
    }
    setSelectorMode('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text accessibilityRole="button" style={styles.back} onPress={onBack}>
          {t('common.back')}
        </Text>
        <View style={styles.heading}>
          <Text style={styles.kicker}>{t('common.superAdmin')}</Text>
          <Text style={styles.title}>{t('students.title')}</Text>
        </View>
      </View>

      {initialLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.emerald} size="large" />
          <Text style={styles.loadingText}>{t('students.loading')}</Text>
        </View>
      ) : (
        <FlashList
          contentContainerStyle={styles.content}
          data={students}
          keyboardShouldPersistTaps="handled"
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('students.empty')}</Text>
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
                    ? t('students.editAdmission', {
                        admissionNo: editing.admission_no,
                      })
                    : t('students.add')}
                </Text>
                <CustomInput
                  autoCapitalize="characters"
                  editable={!editing}
                  contentDirection="ltr"
                  label={t('students.admissionNo')}
                  onChangeText={value => updateForm('admissionNo', value)}
                  value={form.admissionNo}
                />
                {editing ? (
                  <Text style={styles.note}>
                    {t('students.admissionImmutable')}
                  </Text>
                ) : null}
                <CustomInput
                  label={t('students.studentName')}
                  onChangeText={value => updateForm('name', value)}
                  value={form.name}
                />
                <CustomInput
                  label={t('students.fatherName')}
                  onChangeText={value => updateForm('fatherName', value)}
                  value={form.fatherName}
                />
                <CustomInput
                  keyboardType="phone-pad"
                  label={t('students.contactOptional')}
                  onChangeText={value => updateForm('contact', value)}
                  value={form.contact}
                />
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
                    {selectedBranch
                      ? `${selectedBranch.name}${
                          selectedBranch.status === 'inactive'
                            ? ` (${t('status.inactive')})`
                            : ''
                        }`
                      : t('students.selectActiveBranch')}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.fieldLabel}>{t('common.class')}</Text>
                <TouchableOpacity
                  disabled={!form.branchId}
                  style={[
                    styles.selector,
                    !form.branchId ? styles.disabled : null,
                  ]}
                  onPress={() => setSelectorMode('formClass')}
                >
                  <Text
                    style={
                      selectedClass ? styles.selectorText : styles.placeholder
                    }
                  >
                    {selectedClass
                      ? `${selectedClass.name}${
                          selectedClass.status === 'inactive'
                            ? ` (${t('status.inactive')})`
                            : ''
                        }`
                      : t('students.selectBranchClass')}
                  </Text>
                </TouchableOpacity>
                {formError ? (
                  <Text style={styles.error}>{formError}</Text>
                ) : null}
                <CustomButton
                  disabled={!editing && !activeBranches.length}
                  loading={
                    loadingAction === 'create' ||
                    loadingAction.startsWith('edit-')
                  }
                  onPress={handleSave}
                  title={editing ? t('students.save') : t('students.create')}
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
                <Text style={styles.sectionTitle}>{t('students.list')}</Text>
                <Text style={styles.count}>{pagination.total}</Text>
              </View>
              <CustomInput
                autoCapitalize="none"
                label={t('common.search')}
                onChangeText={setSearch}
                placeholder={t('students.searchPlaceholder')}
                value={search}
              />
              <View style={styles.filterRow}>
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
                    {statusFilter === 'all'
                      ? t('status.all')
                      : t(`status.${statusFilter}`)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          nestedScrollEnabled
          renderItem={renderStudent}
          showsVerticalScrollIndicator={false}
          style={styles.scrollList}
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
      )}

      <Modal
        transparent
        visible={Boolean(selectorMode)}
        onRequestClose={() => setSelectorMode('')}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>{t('common.selectOption')}</Text>
            <KeyboardAwareScrollView>
              {selectorOptions().map(option => (
                <Text
                  key={option.id}
                  style={styles.option}
                  onPress={() => selectOption(option.id)}
                >
                  {option.label}
                </Text>
              ))}
              {!selectorOptions().length ? (
                <Text style={styles.empty}>{t('common.noOption')}</Text>
              ) : null}
            </KeyboardAwareScrollView>
            <CustomButton
              onPress={() => setSelectorMode('')}
              title={t('common.cancel')}
              variant="secondary"
            />
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={Boolean(details)}
        onRequestClose={() => setDetails(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <KeyboardAwareScrollView>
              <Text style={styles.sectionTitle}>{t('students.details')}</Text>
              <Text style={styles.detailName}>{details?.name}</Text>
              <Text style={styles.detailLine}>
                {t('students.admissionNo')}: {details?.admission_no}
              </Text>
              <Text style={styles.detailLine}>
                {t('students.fatherName')}: {details?.father_name}
              </Text>
              <Text style={styles.detailLine}>
                {t('common.contact')}: {details?.contact || '--'}
              </Text>
              <Text style={styles.detailLine}>
                {t('common.branch')}:{' '}
                {getBranchName(branches, details?.branch_id)}
              </Text>
              <Text style={styles.detailLine}>
                {t('common.class')}: {getClassName(details?.class_id)}
              </Text>
              <Text style={styles.detailLine}>
                {t('common.status')}:{' '}
                {t(`status.${details?.status || 'active'}`)}
              </Text>
              <CustomButton
                onPress={() => setDetails(null)}
                title={t('common.close')}
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
  note: { color: '#687386', fontSize: 12, marginBottom: 12, marginTop: -8 },
  error: { color: '#d93025', marginBottom: 6 },
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
  studentRow: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 14,
  },
  studentInfo: { flex: 1, paddingRight: 12 },
  studentName: { color: '#142033', fontSize: 16, fontWeight: '800' },
  studentMeta: { color: '#687386', fontSize: 12, marginTop: 3 },
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
});

export default StudentManagementScreen;
