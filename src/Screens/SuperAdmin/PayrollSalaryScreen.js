import React, { useCallback, useEffect, useState } from 'react';
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
import { useTranslation } from '../../localization/i18n';
import { translateApiError } from '../../api/errors';
import { getBranches } from '../../Services/branchService';
import { getClasses } from '../../Services/classService';
import { getTeachers } from '../../Services/teacherService';
import {
  calculateSalaries,
  getPayrollSettings,
  getSalaries,
  getSalaryDetails,
  savePayrollSettings,
} from '../../Services/payrollService';
import {
  formatMoney,
  MONTH_KEYS,
  validatePayrollSettings,
  validateSalaryPeriod,
} from '../../Utils/payroll';
import colors from '../../theme/colors';
const emptySettings = {
  absentDeductionType: '',
  absentDeductionValue: '',
  lateDeductionType: '',
  lateDeductionValue: '',
  workingDaysMode: '',
  lateCountRule: '',
  lateGraceMinutes: '0',
  minimumSalaryAllowed: '',
  timezone: '',
  allowNegativeSalary: false,
};
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
const PayrollSalaryScreen = ({ user, onBack }) => {
  const { t } = useTranslation();
  const now = new Date();
  const [settings, setSettings] = useState(emptySettings);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState('');
  const [hasViewed, setHasViewed] = useState(false);
  const loadSetup = useCallback(async () => {
    const results = await Promise.all([
      getTeachers(user),
      getBranches(),
      getClasses(),
      getPayrollSettings().catch(error => {
        if (error?.response?.data?.error?.code === 'PAYROLL_SETTINGS_MISSING')
          return null;
        throw error;
      }),
    ]);
    setTeachers(results[0]);
    setBranches(results[1]);
    setClasses(results[2]);
    if (results[3])
      setSettings(
        Object.fromEntries(
          Object.entries(emptySettings).map(([key]) => [
            key,
            key === 'allowNegativeSalary'
              ? Boolean(results[3][key])
              : String(results[3][key] ?? ''),
          ]),
        ),
      );
  }, [user]);
  useEffect(() => {
    loadSetup().catch(error =>
      Alert.alert(t('errors.loadFailed'), translateApiError(t, error)),
    );
  }, [loadSetup, t]);
  const update = (key, value) =>
    setSettings(current => ({ ...current, [key]: value }));
  const saveSettings = async () => {
    const validationError = validatePayrollSettings(settings);
    if (validationError)
      return Alert.alert(t('payroll.invalid'), t(validationError));
    setLoading('settings');
    setSettingsMessage('');
    try {
      const saved = await savePayrollSettings(settings);
      setSettings(current => ({
        ...current,
        ...Object.fromEntries(
          Object.keys(emptySettings).map(key => [
            key,
            key === 'allowNegativeSalary'
              ? Boolean(saved[key])
              : String(saved[key] ?? ''),
          ]),
        ),
      }));
      setSettingsMessage(t('payroll.savedMessage'));
    } catch (requestError) {
      Alert.alert(t('payroll.saveFailed'), translateApiError(t, requestError));
    } finally {
      setLoading('');
    }
  };
  const view = async (page = 1) => {
    const validationError = validateSalaryPeriod(month, year);
    if (validationError)
      return Alert.alert(t('salaries.invalidPeriod'), t(validationError));
    setLoading('salaries');
    setDetails(null);
    try {
      const result = await getSalaries({
        month,
        year,
        teacherId: teacherFilter,
        branchId: branchFilter,
        classId: classFilter,
        page,
      });
      setSalaries(result.items);
      setPagination(result.pagination);
      setHasViewed(true);
    } catch (requestError) {
      Alert.alert(t('salaries.loadFailed'), translateApiError(t, requestError));
    } finally {
      setLoading('');
    }
  };
  const showDetails = async item => {
    setLoading(`detail-${item.id}`);
    try {
      setDetails(await getSalaryDetails(item.id));
    } catch (requestError) {
      Alert.alert(t('salaries.loadFailed'), translateApiError(t, requestError));
    } finally {
      setLoading('');
    }
  };
  const calculate = () => {
    const validationError = validateSalaryPeriod(month, year);
    if (validationError)
      return Alert.alert(t('salaries.invalidPeriod'), t(validationError));
    Alert.alert(
      t('salaries.calculate'),
      t('salaries.calculateConfirm', {
        month: t(`dates.months.${MONTH_KEYS[Number(month) - 1]}`),
        year,
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('salaries.calculate'),
          onPress: async () => {
            setLoading('calculate');
            try {
              const result = await calculateSalaries(month, year);
              Alert.alert(
                t('salaries.calculated'),
                t('salaries.calculatedMessage', result),
              );
              await view(1);
            } catch (requestError) {
              Alert.alert(
                t('salaries.calculateFailed'),
                translateApiError(t, requestError),
              );
            } finally {
              setLoading('');
            }
          },
        },
      ],
    );
  };
  const amount = (label, value) => (
    <View style={styles.breakdownRow}>
      <Text>{label}</Text>
      <Text style={styles.number}>{formatMoney(value)}</Text>
    </View>
  );
  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={t('salaries.title')} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <Text style={styles.heading}>{t('payroll.settings')}</Text>
          <CustomInput
            label={t('payroll.absentDeductionType')}
            onChangeText={value => update('absentDeductionType', value)}
            value={settings.absentDeductionType}
          />
          <CustomInput
            keyboardType="decimal-pad"
            label={t('payroll.absentDeductionValue')}
            onChangeText={value => update('absentDeductionValue', value)}
            value={settings.absentDeductionValue}
          />
          <CustomInput
            label={t('payroll.lateDeductionType')}
            onChangeText={value => update('lateDeductionType', value)}
            value={settings.lateDeductionType}
          />
          <CustomInput
            keyboardType="decimal-pad"
            label={t('payroll.lateDeductionValue')}
            onChangeText={value => update('lateDeductionValue', value)}
            value={settings.lateDeductionValue}
          />
          <CustomInput
            label={t('payroll.workingDaysMode')}
            onChangeText={value => update('workingDaysMode', value)}
            value={settings.workingDaysMode}
          />
          <CustomInput
            keyboardType="number-pad"
            label={t('payroll.lateCountRule')}
            onChangeText={value => update('lateCountRule', value)}
            value={settings.lateCountRule}
          />
          <CustomInput
            keyboardType="number-pad"
            label={t('payroll.lateGraceMinutes')}
            onChangeText={value => update('lateGraceMinutes', value)}
            value={settings.lateGraceMinutes}
          />
          <CustomInput
            keyboardType="decimal-pad"
            label={t('payroll.minimumSalaryAllowed')}
            onChangeText={value => update('minimumSalaryAllowed', value)}
            value={settings.minimumSalaryAllowed}
          />
          <CustomInput
            autoCapitalize="none"
            label={t('payroll.timezone')}
            onChangeText={value => update('timezone', value)}
            value={settings.timezone}
          />
          <Text style={styles.label}>{t('payroll.allowNegativeSalary')}</Text>
          <View style={styles.pills}>
            <Pill
              active={!settings.allowNegativeSalary}
              label={t('common.no')}
              onPress={() => update('allowNegativeSalary', false)}
            />
            <Pill
              active={settings.allowNegativeSalary}
              label={t('common.yes')}
              onPress={() => update('allowNegativeSalary', true)}
            />
          </View>
          {settingsMessage ? (
            <Text style={styles.success}>{settingsMessage}</Text>
          ) : null}
          <CustomButton
            loading={loading === 'settings'}
            onPress={saveSettings}
            title={t('common.save')}
          />
        </View>
        <View style={styles.panel}>
          <Text style={styles.heading}>{t('salaries.view')}</Text>
          <Text style={styles.label}>{t('salaries.month')}</Text>
          <View style={styles.pills}>
            {MONTH_KEYS.map((key, index) => (
              <Pill
                active={month === String(index + 1)}
                key={key}
                label={t(`dates.months.${key}`)}
                onPress={() => setMonth(String(index + 1))}
              />
            ))}
          </View>
          <CustomInput
            keyboardType="number-pad"
            label={t('salaries.year')}
            onChangeText={setYear}
            value={year}
          />
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
            onChange={id => {
              setBranchFilter(id);
              setClassFilter('all');
            }}
            options={[
              { id: 'all', label: t('common.all') },
              ...branches.map(item => ({ id: item.id, label: item.name })),
            ]}
            value={branchFilter}
          />
          <ScalableSelector
            label={t('common.class')}
            onChange={setClassFilter}
            options={[
              { id: 'all', label: t('common.all') },
              ...classes
                .filter(
                  item =>
                    branchFilter === 'all' || item.branch_id === branchFilter,
                )
                .map(item => ({ id: item.id, label: item.name })),
            ]}
            value={classFilter}
          />
          <CustomButton
            loading={loading === 'calculate'}
            onPress={calculate}
            title={t('salaries.calculate')}
            variant="secondary"
          />
          <CustomButton
            loading={loading === 'salaries'}
            onPress={() => view(1)}
            title={t('salaries.view')}
          />
        </View>
        {details ? (
          <View style={styles.panel}>
            <Text style={styles.heading}>{t('salaries.breakdown')}</Text>
            <Text>
              {details.teacher?.name} |{' '}
              {t(`dates.months.${MONTH_KEYS[details.month - 1]}`)}{' '}
              {details.year}
            </Text>
            {amount(t('salaries.base'), details.baseSalary)}
            {amount(t('teachers.attendanceAllowance'), details.attendanceAllowance)}
            {amount(t('teachers.conveyanceAllowance'), details.conveyanceAllowance)}
            {amount(t('teachers.medicalAllowance'), details.medicalAllowance)}
            {amount(t('teachers.otherAllowance'), details.allowance)}
            {amount(t('salaries.grossAmount'), details.grossAmount)}
            {amount(t('salaries.absentDeduction'), details.absentDeduction)}
            {amount(t('salaries.lateDeduction'), details.lateDeduction)}
            {amount(t('salaries.lateMinutes'), details.lateMinutes)}
            {amount(t('salaries.otherAdjustment'), details.otherAdjustment)}
            {amount(t('salaries.final'), details.finalSalary)}
            <Text style={styles.meta}>
              {t('salaries.daysBreakdown', {
                working: details.workingDays,
                present: details.presentDays,
                absent: details.absentDays,
                leave: details.leaveDays,
                late: details.lateDays,
              })}
            </Text>
            <Text style={styles.meta}>
              {t('salaries.calculationVersion')}: {details.calculationVersion}
            </Text>
            <CustomButton
              onPress={() => setDetails(null)}
              title={t('common.close')}
              variant="secondary"
            />
          </View>
        ) : null}
        {hasViewed ? (
          <View>
            <Text style={styles.heading}>
              {t('salaries.results', { count: pagination.total })}
            </Text>
            {salaries.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() => showDetails(item)}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>
                  {item.teacher?.name || t('common.teacher')}
                </Text>
                <Text>
                  {t(`dates.months.${MONTH_KEYS[item.month - 1]}`)} {item.year}
                </Text>
                <Text style={styles.number}>
                  {t('salaries.final')}: {formatMoney(item.finalSalary)}
                </Text>
              </TouchableOpacity>
            ))}
            {!salaries.length ? (
              <Text style={styles.empty}>{t('salaries.empty')}</Text>
            ) : null}
            {pagination.totalPages > 1 ? (
              <View style={styles.pagination}>
                <CustomButton
                  disabled={pagination.page <= 1}
                  onPress={() => view(pagination.page - 1)}
                  title={t('common.previous')}
                  variant="secondary"
                />
                <Text>
                  {t('common.pageOf', {
                    page: pagination.page,
                    total: pagination.totalPages,
                  })}
                </Text>
                <CustomButton
                  disabled={pagination.page >= pagination.totalPages}
                  onPress={() => view(pagination.page + 1)}
                  title={t('common.next')}
                  variant="secondary"
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  content: { padding: 20, paddingBottom: 96 },
  panel: {
    backgroundColor: '#f8fafc',
    borderColor: '#dfe7f0',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    padding: 16,
  },
  heading: {
    color: '#142033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  label: { color: '#4f5d73', fontSize: 12, fontWeight: '800', marginBottom: 7 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pill: {
    backgroundColor: '#eef2f7',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  pillActive: { backgroundColor: colors.emerald },
  pillText: { color: '#4f5d73', fontWeight: '800' },
  pillTextActive: { color: '#fff' },
  success: { color: '#137333', marginBottom: 10 },
  breakdownRow: {
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  number: { fontVariant: ['tabular-nums'], writingDirection: 'ltr' },
  meta: { color: '#687386', fontSize: 12, marginTop: 8 },
  card: {
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  cardTitle: { color: '#142033', fontWeight: '900' },
  empty: { color: '#687386', padding: 20, textAlign: 'center' },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
});
export default PayrollSalaryScreen;
