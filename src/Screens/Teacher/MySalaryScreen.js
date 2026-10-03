import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Header from '../../Components/Header';
import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import Text from '../../Components/AppText';
import { getMySalaries } from '../../Services/payrollService';
import { useTranslation } from '../../localization/i18n';
import { translateApiError } from '../../api/errors';
import { showToast } from '../../Utils/uiFeedback';

const MySalaryScreen = ({ onBack }) => {
  const { t } = useTranslation();
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [items, setItems] = useState([]);
  const [viewed, setViewed] = useState(false);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    if (Number(month) < 1 || Number(month) > 12 || !/^\d{4}$/.test(year))
      return showToast(
        t('salaries.invalidPeriod'),
        t('validation.salaryMonth'),
        'error',
      );
    setLoading(true);
    try {
      const result = await getMySalaries({ month, year });
      setItems(result.items);
      setViewed(true);
    } catch (error) {
      showToast(t('salaries.loadFailed'), translateApiError(t, error), 'error');
    } finally {
      setLoading(false);
    }
  };
  const money = value =>
    Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const row = (label, value, negative = false) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.amount, negative && styles.negative]}>
        {money(value)}
      </Text>
    </View>
  );
  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={t('teacherAccess.mySalary')} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.panel}>
          <CustomInput
            keyboardType="number-pad"
            label={t('salaries.month')}
            onChangeText={setMonth}
            value={month}
          />
          <CustomInput
            keyboardType="number-pad"
            label={t('salaries.year')}
            onChangeText={setYear}
            value={year}
          />
          <CustomButton
            loading={loading}
            onPress={load}
            title={t('salaries.view')}
          />
        </View>
        {viewed && !items.length ? (
          <Text style={styles.empty}>{t('teacherAccess.noSalary')}</Text>
        ) : null}
        {items.map(item => (
          <View key={item.id} style={styles.panel}>
            <Text style={styles.title}>
              {item.month}/{item.year}
            </Text>
            {row(t('teachers.baseSalary'), item.baseSalary)}
            {row(t('teachers.ijaraFrequency'), t(item.ijaraFrequency === 'WEEKLY' ? 'teachers.weeklyIjara' : 'teachers.monthlyIjara'))}
            {row(t('teachers.agreedIjaraAmount'), item.agreedIjaraAmount)}
            {row(t('teachers.monthlyAllowance'), item.allowance)}
            {row(t('teachers.attendanceAllowance'), item.attendanceAllowance)}
            {row(t('teachers.conveyanceAllowance'), item.conveyanceAllowance)}
            {row(t('teachers.medicalAllowance'), item.medicalAllowance)}
            {row(t('salaries.grossAmount'), item.grossAmount)}
            {row(t('salaries.absentDeduction'), item.absentDeduction, true)}
            {row(t('salaries.lateDeduction'), item.lateDeduction, true)}
            {row(t('salaries.lateMinutes'), item.lateMinutes)}
            {row(
              t('salaries.otherAdjustment'),
              item.otherAdjustment,
              Number(item.otherAdjustment) < 0,
            )}
            <View style={styles.divider} />
            {row(t('salaries.finalSalary'), item.finalSalary)}
            <Text style={styles.days}>
              {t('salaries.daysBreakdown', {
                working: item.workingDays,
                present: item.presentDays,
                absent: item.absentDays,
                leave: item.leaveDays,
                late: item.lateDays,
              })}
            </Text>
            <Text style={styles.reason}>
              {t('teacherAccess.deductionReason')}:{' '}
              {item.calculationBreakdown?.policy ||
                t('teacherAccess.attendancePolicy')}
            </Text>
          </View>
        ))}
      </ScrollView>
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
    marginBottom: 16,
    padding: 16,
  },
  title: {
    color: '#142033',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  label: { color: '#4f5d73' },
  amount: { color: '#137333', fontWeight: '900' },
  negative: { color: '#b3261e' },
  divider: { borderTopColor: '#ccd6e2', borderTopWidth: 1, marginVertical: 6 },
  days: { color: '#687386', fontSize: 12, marginTop: 10 },
  reason: { color: '#4f5d73', fontSize: 12, marginTop: 8 },
  empty: { color: '#687386', padding: 24, textAlign: 'center' },
});
export default MySalaryScreen;
