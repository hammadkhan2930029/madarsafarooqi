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
import Text from '../../Components/AppText';
import PremiumDataCard, { CARD_ICONS } from '../../Components/PremiumDataCard';
import { useTranslation } from '../../localization/i18n';
import colors from '../../theme/colors';
import { getBranches } from '../../Services/branchService';
import {
  createClass,
  listClasses,
  updateClass,
  updateClassStatus,
} from '../../Services/classService';
import { translateApiError } from '../../api/errors';
import { getBranchName } from '../../Utils/classes';
import { validateClass } from '../../Utils/validationSchemas';

const emptyClass = { name: '', branchId: '' };

const ClassManagementScreen = ({ user, onBack }) => {
  const { isRTL, t } = useTranslation();
  const [classes, setClasses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(emptyClass);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [selectorMode, setSelectorMode] = useState('');
  const [formError, setFormError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');

  const activeBranches = useMemo(
    () => branches.filter(branch => branch.status === 'active'),
    [branches],
  );

  const loadData = useCallback(async () => {
    setLoadError('');
    try {
      const [classResult, branchList] = await Promise.all([
        listClasses({
          search,
          branchId: branchFilter,
          status: statusFilter,
          page,
          limit: 20,
        }),
        getBranches(),
      ]);
      setClasses(classResult.items);
      setPagination(classResult.pagination);
      setBranches(branchList);
    } catch (error) {
      setLoadError(translateApiError(t, error));
      throw error;
    }
  }, [branchFilter, page, search, statusFilter, t]);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        loadData()
          .catch(() => {})
          .finally(() => setInitialLoading(false));
      },
      search ? 350 : 0,
    );
    return () => clearTimeout(timer);
  }, [loadData, search]);

  useEffect(() => {
    setPage(1);
  }, [branchFilter, search, statusFilter]);

  const resetForm = () => {
    setEditing(null);
    setForm(emptyClass);
    setFormError('');
  };

  const startEditing = item => {
    setEditing(item);
    setForm({ name: item.name || '', branchId: item.branch_id || '' });
    setFormError('');
  };

  const handleSave = async () => {
    const validationError = validateClass(form);
    if (validationError) {
      setFormError(t(validationError));
      return;
    }

    const selectedBranch = branches.find(branch => branch.id === form.branchId);
    if (!editing && selectedBranch?.status !== 'active') {
      setFormError(t('classes.activeBranchRequired'));
      return;
    }
    if (
      editing &&
      form.branchId !== editing.branch_id &&
      selectedBranch?.status !== 'active'
    ) {
      setFormError(t('classes.activeBranchMove'));
      return;
    }

    setLoadingAction(editing ? `edit-${editing.id}` : 'create');
    try {
      if (editing) {
        await updateClass(editing.id, form);
      } else {
        await createClass(form);
      }
      const wasEditing = Boolean(editing);
      resetForm();
      await loadData();
      Alert.alert(
        t('classes.saved'),
        t(wasEditing ? 'classes.updatedMessage' : 'classes.createdMessage'),
      );
    } catch (error) {
      Alert.alert(t('classes.saveFailed'), translateApiError(t, error));
    } finally {
      setLoadingAction('');
    }
  };

  const handleToggleStatus = item => {
    const nextStatus = item.status === 'inactive' ? 'active' : 'inactive';
    Alert.alert(
      t('dialogs.confirmStatus'),
      t('dialogs.statusMessage', {
        name: item.name,
        status: t(`status.${nextStatus}`),
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t(`common.${nextStatus}`),
          style: nextStatus === 'active' ? 'default' : 'destructive',
          onPress: async () => {
            setLoadingAction(`status-${item.id}`);
            try {
              await updateClassStatus(item.id, nextStatus);
              await loadData();
              Alert.alert(
                t('classes.statusUpdated'),
                t('dialogs.statusMessage', {
                  name: item.name,
                  status: t(`status.${nextStatus}`),
                }),
              );
            } catch (error) {
              Alert.alert(
                t('classes.statusFailed'),
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } catch (_) {
      // The inline error state already provides retry feedback.
    } finally {
      setRefreshing(false);
    }
  };

  const selectedBranch = branches.find(branch => branch.id === form.branchId);
  const selectorBranches =
    selectorMode === 'filter' ? branches : activeBranches;

  const renderClass = ({ item }) => {
    const branch = branches.find(value => value.id === item.branch_id);
    const branchInactive = branch?.status === 'inactive';
    return (
      <PremiumDataCard
        actions={[
          {
            key: 'edit',
            icon: CARD_ICONS.edit,
            label: t('common.edit'),
            onPress: () => startEditing(item),
          },
          {
            key: 'status',
            icon:
              item.status === 'inactive'
                ? CARD_ICONS.activate
                : CARD_ICONS.deactivate,
            label:
              item.status === 'inactive'
                ? t('common.activate')
                : t('common.deactivate'),
            loading: loadingAction === `status-${item.id}`,
            onPress: () => handleToggleStatus(item),
            tone: item.status === 'inactive' ? 'success' : 'danger',
          },
        ]}
      >
        <View style={styles.classInfo}>
          <Text style={styles.className}>{item.name}</Text>
          <Text style={styles.classMeta}>
            {branch?.name || t('common.unknown')}
            {branchInactive ? ` (${t('classes.branchInactive')})` : ''}
          </Text>
          <Text
            style={item.status === 'inactive' ? styles.inactive : styles.active}
          >
            {t(`status.${item.status}`)}
          </Text>
        </View>
      </PremiumDataCard>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text accessibilityRole="button" style={styles.back} onPress={onBack}>
          {t('common.back')}
        </Text>
        <View style={styles.heading}>
          <Text style={styles.kicker}>{t('common.superAdmin')}</Text>
          <Text style={styles.title}>{t('classes.title')}</Text>
        </View>
      </View>

      {initialLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.emerald} size="large" />
          <Text style={styles.loadingText}>{t('classes.loading')}</Text>
        </View>
      ) : (
        <FlashList
          contentContainerStyle={styles.content}
          data={classes}
          keyboardShouldPersistTaps="handled"
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {search || branchFilter !== 'all' || statusFilter !== 'all'
                ? t('classes.empty')
                : t('emptyStates.noData')}
            </Text>
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
                    ? `${t('common.edit')} ${editing.name}`
                    : t('classes.add')}
                </Text>
                <CustomInput
                  label={t('common.name')}
                  onChangeText={name => {
                    setForm(previous => ({ ...previous, name }));
                    setFormError('');
                  }}
                  placeholder={t('classes.namePlaceholder')}
                  value={form.name}
                />
                <Text style={styles.fieldLabel}>{t('common.branch')}</Text>
                <TouchableOpacity
                  onPress={() => setSelectorMode('form')}
                  style={styles.selector}
                >
                  <Text
                    style={
                      form.branchId ? styles.selectorText : styles.placeholder
                    }
                  >
                    {selectedBranch
                      ? `${selectedBranch.name}${
                          selectedBranch.status === 'inactive'
                            ? ` (${t('status.inactive')})`
                            : ''
                        }`
                      : t('branches.select')}
                  </Text>
                </TouchableOpacity>
                {!activeBranches.length ? (
                  <Text style={styles.note}>
                    {t('classes.activeBranchRequired')}
                  </Text>
                ) : null}
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
                  title={t(editing ? 'common.save' : 'classes.add')}
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
                <Text style={styles.sectionTitle}>{t('classes.list')}</Text>
                <Text style={styles.count}>{pagination.total}</Text>
              </View>
              <CustomInput
                autoCapitalize="none"
                label={t('common.search')}
                onChangeText={setSearch}
                placeholder={t('classes.searchPlaceholder')}
                value={search}
              />
              <Text style={styles.fieldLabel}>{t('common.branch')}</Text>
              <TouchableOpacity
                onPress={() => setSelectorMode('filter')}
                style={styles.selector}
              >
                <Text style={styles.selectorText}>
                  {branchFilter === 'all'
                    ? t('branches.all')
                    : getBranchName(
                        branches,
                        branchFilter,
                        t('common.unknown'),
                      )}
                </Text>
              </TouchableOpacity>
              <Text style={styles.fieldLabel}>{t('common.status')}</Text>
              <View
                style={[
                  styles.statusFilters,
                  isRTL ? styles.rtlRow : styles.ltrRow,
                ]}
              >
                {['all', 'active', 'inactive'].map(status => (
                  <TouchableOpacity
                    accessibilityRole="button"
                    key={status}
                    onPress={() => setStatusFilter(status)}
                    style={[
                      styles.statusFilter,
                      statusFilter === status
                        ? styles.statusFilterActive
                        : null,
                    ]}
                  >
                    <Text
                      style={
                        statusFilter === status
                          ? styles.statusFilterTextActive
                          : styles.statusFilterText
                      }
                    >
                      {t(`status.${status}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          nestedScrollEnabled
          renderItem={renderClass}
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
                <Text style={styles.pageText}>
                  {t('common.pageOf', {
                    page: pagination.page,
                    total: pagination.totalPages,
                  })}
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
        animationType="fade"
        onRequestClose={() => setSelectorMode('')}
        transparent
        visible={Boolean(selectorMode)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>{t('branches.select')}</Text>
            {selectorMode === 'filter' ? (
              <Text
                style={styles.option}
                onPress={() => {
                  setBranchFilter('all');
                  setSelectorMode('');
                }}
              >
                {t('branches.all')}
              </Text>
            ) : null}
            {selectorBranches.map(branch => (
              <Text
                key={branch.id}
                style={styles.option}
                onPress={() => {
                  if (selectorMode === 'filter') {
                    setBranchFilter(branch.id);
                  } else {
                    setForm(previous => ({ ...previous, branchId: branch.id }));
                    setFormError('');
                  }
                  setSelectorMode('');
                }}
              >
                {branch.name} ({branch.code})
                {branch.status === 'inactive'
                  ? ` - ${t('status.inactive')}`
                  : ''}
              </Text>
            ))}
            {!selectorBranches.length ? (
              <Text style={styles.empty}>{t('common.noOption')}</Text>
            ) : null}
            <CustomButton
              onPress={() => setSelectorMode('')}
              title={t('common.cancel')}
              variant="secondary"
            />
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
  note: { color: '#b06000', fontSize: 12, marginBottom: 10 },
  error: { color: '#d93025', marginBottom: 6 },
  statusFilters: { flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statusFilter: {
    borderColor: '#d8e0eb',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  statusFilterActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  statusFilterText: { color: '#33425a', fontSize: 12, fontWeight: '800' },
  statusFilterTextActive: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  ltrRow: { flexDirection: 'row' },
  rtlRow: { flexDirection: 'row-reverse' },
  pagination: { alignItems: 'center', gap: 8, paddingTop: 20 },
  pageText: { color: '#4f5d73', fontWeight: '800' },
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
  classRow: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 14,
  },
  classInfo: { flex: 1, paddingRight: 12 },
  className: { color: '#142033', fontSize: 16, fontWeight: '800' },
  classMeta: { color: '#687386', fontSize: 12, marginTop: 3 },
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
});

export default ClassManagementScreen;
