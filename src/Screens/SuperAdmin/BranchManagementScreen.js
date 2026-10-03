import React, { useCallback, useEffect, useState } from 'react';
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
import {
  createBranch,
  getBranch,
  listBranches,
  updateBranch,
  updateBranchStatus,
} from '../../Services/branchService';
import { translateApiError } from '../../api/errors';
import {
  normalizeBranchCode,
  validateBranch,
} from '../../Utils/validationSchemas';

const emptyBranch = { name: '', code: '', address: '', contact: '' };

const formatTimestamp = value => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '--';
};

const BranchManagementScreen = ({ user, onBack }) => {
  const { isRTL, t } = useTranslation();
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(emptyBranch);
  const [classNames, setClassNames] = useState(['']);
  const [editing, setEditing] = useState(null);
  const [details, setDetails] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [formError, setFormError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');

  const loadBranches = useCallback(async () => {
    setLoadError('');
    try {
      const result = await listBranches({
        search,
        status: statusFilter,
        page,
        limit: 20,
      });
      setBranches(result.items);
      setPagination(result.pagination);
    } catch (error) {
      setLoadError(translateApiError(t, error));
      throw error;
    }
  }, [page, search, statusFilter, t]);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        loadBranches()
          .catch(() => {})
          .finally(() => setInitialLoading(false));
      },
      search ? 350 : 0,
    );
    return () => clearTimeout(timer);
  }, [loadBranches, search]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const updateForm = (field, value) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setFormError('');
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyBranch);
    setClassNames(['']);
    setFormError('');
  };

  const startEditing = branch => {
    setEditing(branch);
    setForm({
      name: branch.name || '',
      code: branch.code || '',
      address: branch.address || '',
      contact: branch.contact || '',
    });
    setFormError('');
  };

  const handleSave = async () => {
    const validationError = validateBranch(form);
    if (validationError) {
      setFormError(t(validationError));
      return;
    }
    const normalizedClasses = classNames
      .map(name => name.trim())
      .filter(Boolean);
    const uniqueClasses = new Set(
      normalizedClasses.map(name =>
        name.normalize('NFKC').replace(/\s+/g, ' ').toLocaleLowerCase('en-US'),
      ),
    );
    if (
      !editing &&
      (normalizedClasses.length !== classNames.length ||
        normalizedClasses.some(name => name.length < 2))
    ) {
      setFormError(t('validation.branchClassName'));
      return;
    }
    if (!editing && uniqueClasses.size !== normalizedClasses.length) {
      setFormError(t('validation.branchClassDuplicate'));
      return;
    }

    setLoadingAction(editing ? `edit-${editing.id}` : 'create');
    try {
      if (editing) {
        await updateBranch(editing.id, form);
      } else {
        await createBranch({ ...form, classes: normalizedClasses });
      }
      resetForm();
      await loadBranches();
      Alert.alert(
        t('branches.saved'),
        t(editing ? 'branches.updatedMessage' : 'branches.createdMessage'),
      );
    } catch (error) {
      Alert.alert(t('branches.saveFailed'), translateApiError(t, error));
    } finally {
      setLoadingAction('');
    }
  };

  const handleToggleStatus = branch => {
    const nextStatus = branch.status === 'inactive' ? 'active' : 'inactive';
    Alert.alert(
      t('dialogs.confirmStatus'),
      t('dialogs.statusMessage', {
        name: branch.name,
        status: t(`status.${nextStatus}`),
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t(`common.${nextStatus}`),
          style: nextStatus === 'active' ? 'default' : 'destructive',
          onPress: async () => {
            setLoadingAction(`status-${branch.id}`);
            try {
              await updateBranchStatus(branch.id, nextStatus);
              await loadBranches();
              Alert.alert(
                t('branches.statusUpdated'),
                t('dialogs.statusMessage', {
                  name: branch.name,
                  status: t(`status.${nextStatus}`),
                }),
              );
            } catch (error) {
              Alert.alert(
                t('branches.statusFailed'),
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

  const showDetails = async branch => {
    setLoadingAction(`details-${branch.id}`);
    try {
      setDetails(await getBranch(branch.id));
    } catch (error) {
      Alert.alert(t('branches.loadFailed'), translateApiError(t, error));
    } finally {
      setLoadingAction('');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadBranches();
    } catch (_) {
      // The inline error state already provides retry feedback.
    } finally {
      setRefreshing(false);
    }
  };

  const renderBranch = ({ item }) => (
    <PremiumDataCard
      actions={[
        {
          key: 'view',
          icon: CARD_ICONS.view,
          label: t('common.view'),
          loading: loadingAction === `details-${item.id}`,
          onPress: () => showDetails(item),
        },
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
      onPress={() => showDetails(item)}
    >
      <View style={styles.branchInfo}>
        <Text style={styles.branchName}>{item.name}</Text>
        <Text style={styles.branchMeta}>
          {item.code} · {item.address}
        </Text>
        <Text
          style={item.status === 'inactive' ? styles.inactive : styles.active}
        >
          {t(`status.${item.status}`)}
        </Text>
      </View>
    </PremiumDataCard>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text accessibilityRole="button" style={styles.back} onPress={onBack}>
          {t('common.back')}
        </Text>
        <View style={styles.heading}>
          <Text style={styles.kicker}>{t('common.superAdmin')}</Text>
          <Text style={styles.title}>{t('branches.title')}</Text>
        </View>
      </View>

      {initialLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.emerald} size="large" />
          <Text style={styles.loadingText}>{t('branches.loading')}</Text>
        </View>
      ) : (
        <FlashList
          contentContainerStyle={styles.content}
          data={branches}
          keyboardShouldPersistTaps="handled"
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {t(
                search || statusFilter !== 'all'
                  ? 'emptyStates.noFilterResults'
                  : 'emptyStates.noData',
              )}
            </Text>
          }
          ListHeaderComponent={
            <View>
              {loadError ? (
                <View style={styles.errorPanel}>
                  <Text style={styles.error}>{loadError}</Text>
                  <CustomButton
                    onPress={() => loadBranches().catch(() => {})}
                    title={t('common.retry')}
                    variant="secondary"
                  />
                </View>
              ) : null}

              <View style={styles.panel}>
                <Text style={styles.sectionTitle}>
                  {editing
                    ? `${t('common.edit')} ${editing.code}`
                    : t('branches.add')}
                </Text>
                <CustomInput
                  label={t('common.name')}
                  onChangeText={value => updateForm('name', value)}
                  placeholder={t('branches.namePlaceholder')}
                  value={form.name}
                />
                <CustomInput
                  autoCapitalize="characters"
                  editable={!editing}
                  label={t('branches.code')}
                  onChangeText={value =>
                    updateForm('code', normalizeBranchCode(value))
                  }
                  placeholder={t('branches.codePlaceholder')}
                  value={form.code}
                />
                {editing ? (
                  <Text style={styles.note}>{t('branches.codeImmutable')}</Text>
                ) : null}
                <CustomInput
                  label={t('branches.address')}
                  multiline
                  onChangeText={value => updateForm('address', value)}
                  placeholder={t('branches.addressPlaceholder')}
                  value={form.address}
                />
                <CustomInput
                  keyboardType="phone-pad"
                  label={`${t('common.contact')} (${t('common.optional')})`}
                  onChangeText={value => updateForm('contact', value)}
                  placeholder={t('branches.contactPlaceholder')}
                  value={form.contact}
                />
                {!editing ? (
                  <View>
                    <Text style={styles.fieldLabel}>
                      {t('branches.classesAtCreation')}
                    </Text>
                    {classNames.map((className, index) => (
                      <View
                        key={index}
                        style={[
                          styles.classInputRow,
                          isRTL ? styles.rtlRow : styles.ltrRow,
                        ]}
                      >
                        <CustomInput
                          label={t('branches.classNumber', {
                            number: index + 1,
                          })}
                          onChangeText={value => {
                            setClassNames(previous =>
                              previous.map((item, itemIndex) =>
                                itemIndex === index ? value : item,
                              ),
                            );
                            setFormError('');
                          }}
                          placeholder={t('branches.classPlaceholder')}
                          style={styles.classInput}
                          value={className}
                        />
                      </View>
                    ))}
                    <TouchableOpacity
                      accessibilityLabel={t('branches.addAnotherClass')}
                      accessibilityRole="button"
                      onPress={() =>
                        setClassNames(previous => [...previous, ''])
                      }
                      style={styles.addClassButton}
                    >
                      <Text align="center" style={styles.addClassText}>
                        + {t('branches.addAnotherClass')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                {formError ? (
                  <Text style={styles.error}>{formError}</Text>
                ) : null}
                <CustomButton
                  loading={
                    loadingAction === 'create' ||
                    loadingAction.startsWith('edit-')
                  }
                  onPress={handleSave}
                  title={t(editing ? 'common.save' : 'branches.add')}
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
                <Text style={styles.sectionTitle}>{t('branches.list')}</Text>
                <Text style={styles.count}>{pagination.total}</Text>
              </View>
              <CustomInput
                autoCapitalize="none"
                label={t('common.search')}
                onChangeText={setSearch}
                placeholder={t('branches.searchPlaceholder')}
                value={search}
              />
              <Text style={styles.filterLabel}>{t('common.status')}</Text>
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
          renderItem={renderBranch}
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
        onRequestClose={() => setDetails(null)}
        transparent
        visible={Boolean(details)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <KeyboardAwareScrollView>
              <Text style={styles.sectionTitle}>{t('branches.details')}</Text>
              <Text style={styles.detailName}>{details?.name}</Text>
              <Text style={styles.detailLine}>
                {t('branches.code')}: {details?.code}
              </Text>
              <Text style={styles.detailLine}>
                {t('branches.address')}: {details?.address}
              </Text>
              <Text style={styles.detailLine}>
                {t('common.contact')}: {details?.contact || '--'}
              </Text>
              <Text style={styles.detailLine}>
                {t('common.status')}: {t(`status.${details?.status}`)}
              </Text>
              <Text style={styles.detailLine}>
                {t('branches.classCount')}: {details?.class_count || 0}
              </Text>
              <Text style={styles.classesHeading}>
                {t('branches.assignedClasses')}
              </Text>
              {(details?.classes || []).map(item => (
                <Text key={item.id} style={styles.detailLine}>
                  • {item.name} ({t(`status.${item.status}`)})
                </Text>
              ))}
              {!details?.classes?.length ? (
                <Text style={styles.detailLine}>{t('branches.noClasses')}</Text>
              ) : null}
              <Text style={styles.detailLine}>
                {t('dates.created')}: {formatTimestamp(details?.created_at)}
              </Text>
              <Text style={styles.detailLine}>
                {t('dates.updated')}: {formatTimestamp(details?.updated_at)}
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
  note: { color: '#687386', fontSize: 12, marginBottom: 12, marginTop: -8 },
  error: { color: '#d93025', marginBottom: 6 },
  fieldLabel: {
    color: '#263244',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  classInputRow: { alignItems: 'center' },
  classInput: { flex: 1 },
  addClassButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.emeraldLight,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addClassText: { color: colors.emeraldDark, fontWeight: '900' },
  filterLabel: {
    color: '#263244',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
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
  branchRow: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 14,
  },
  branchInfo: { flex: 1, paddingRight: 12 },
  branchName: { color: '#142033', fontSize: 16, fontWeight: '800' },
  branchMeta: { color: '#687386', fontSize: 12, marginTop: 3 },
  rowActions: { alignItems: 'flex-end', gap: 4 },
  action: { color: colors.emeraldDark, fontWeight: '800' },
  active: { color: '#137333', fontSize: 12, fontWeight: '900', marginTop: 3 },
  inactive: { color: '#b3261e', fontSize: 12, fontWeight: '900', marginTop: 3 },
  deactivate: { color: '#b3261e', fontSize: 12, fontWeight: '900' },
  empty: { color: '#687386', paddingVertical: 24, textAlign: 'center' },
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
  detailName: {
    color: '#142033',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  detailLine: { color: '#4f5d73', lineHeight: 22 },
  classesHeading: { color: '#142033', fontWeight: '900', marginTop: 12 },
});

export default BranchManagementScreen;
