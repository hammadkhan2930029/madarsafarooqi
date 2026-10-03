import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Header from '../../Components/Header';
import SearchInput from '../../Components/SearchInput';
import CustomButton from '../../Components/CustomButton';
import Text from '../../Components/AppText';
import { getMyStudents } from '../../Services/studentService';
import { useTranslation } from '../../localization/i18n';
import { translateApiError } from '../../api/errors';
import { showToast } from '../../Utils/uiFeedback';
import colors from '../../theme/colors';

const MyStudentsScreen = ({ onBack }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const load = useCallback(async () => {
    try {
      const result = await getMyStudents({ search, page });
      setItems(result.items);
      setPagination(result.pagination);
    } catch (error) {
      showToast(t('students.loadFailed'), translateApiError(t, error), 'error');
    }
  }, [page, search, t]);
  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);
  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={t('teacherAccess.myStudents')} />
      <FlashList
        contentContainerStyle={styles.content}
        data={items}
        keyboardShouldPersistTaps="handled"
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            <SearchInput
              onChangeText={value => {
                setSearch(value);
                setPage(1);
              }}
              placeholder={t('students.searchPlaceholder')}
              value={search}
            />
            <Text style={styles.count}>
              {t('common.records', { count: pagination.total })}
            </Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {t('teacherAccess.noAssignedStudents')}
          </Text>
        }
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.scrollList}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {t('students.admissionNo')}: {item.admission_no}
            </Text>
            <Text style={styles.meta}>
              {t('students.fatherName')}: {item.father_name}
            </Text>
            <Text style={styles.meta}>
              {t('common.class')}: {item.class?.name || '--'}
            </Text>
          </View>
        )}
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
    </View>
  );
};
const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  scrollList: { flex: 1 },
  content: { padding: 20, paddingBottom: 96 },
  count: { color: colors.muted, marginBottom: 10 },
  card: {
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
  name: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 13, marginTop: 4 },
  empty: { color: colors.muted, padding: 24, textAlign: 'center' },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
export default MyStudentsScreen;
