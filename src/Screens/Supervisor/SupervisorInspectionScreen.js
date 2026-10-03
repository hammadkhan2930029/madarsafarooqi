import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Header from '../../Components/Header';
import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import KeyboardAwareScrollView from '../../Components/KeyboardAwareScrollView';
import Text from '../../Components/AppText';
import ScalableSelector from '../../Components/ScalableSelector';
import {
  getInspectionOptions,
  getMyInspections,
  submitInspection,
} from '../../Services/supervisorInspectionService';
import { getInstitutionDate } from '../../Utils/attendance';
import { useTranslation } from '../../localization/i18n';
import { translateApiError } from '../../api/errors';
import { showToast } from '../../Utils/uiFeedback';
import colors from '../../theme/colors';
const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];
const emptyAnswers = () => Object.fromEntries(questions.map(key => [key, '']));
const Pills = ({ items, value, onChange }) => (
  <View style={styles.pills}>
    {items.map(item => (
      <TouchableOpacity
        key={item.id}
        onPress={() => onChange(item.id)}
        style={[styles.pill, value === item.id && styles.activePill]}
      >
        <Text style={[styles.pillText, value === item.id && styles.activeText]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);
const SupervisorInspectionScreen = ({ onBack, user }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    branchId: '',
    classId: '',
    teacherId: '',
    inspectionDate: getInstitutionDate(),
    visitNumber: '',
    arrivalTime: '',
    departureTime: '',
    answers: emptyAnswers(),
    remarks: '',
  });
  const branch = options.find(item => item.id === form.branchId);
  const classes = branch?.classes || [];
  const teachers = useMemo(
    () =>
      (branch?.teachers || []).filter(
        item => !form.classId || item.classId === form.classId,
      ),
    [branch, form.classId],
  );
  const load = useCallback(async () => {
    try {
      const [result, records] = await Promise.all([
        getInspectionOptions(),
        getMyInspections(),
      ]);
      setOptions(result);
      setHistory(records.items);
    } catch (error) {
      showToast(
        t('inspection.loadFailed'),
        translateApiError(t, error),
        'error',
      );
    }
  }, [t]);
  useEffect(() => {
    load();
  }, [load]);
  const update = (key, value) =>
    setForm(current => ({ ...current, [key]: value }));
  const selectBranch = id =>
    setForm(current => ({
      ...current,
      branchId: id,
      classId: '',
      teacherId: '',
    }));
  const selectClass = id =>
    setForm(current => ({ ...current, classId: id, teacherId: '' }));
  const save = async () => {
    if (
      !form.branchId ||
      !form.classId ||
      !form.teacherId ||
      !form.visitNumber.trim() ||
      !form.arrivalTime ||
      !form.departureTime ||
      questions.some(key => !form.answers[key])
    )
      return showToast(
        t('inspection.invalid'),
        t('inspection.completeAll'),
        'error',
      );
    setLoading(true);
    try {
      await submitInspection(form);
      setForm({
        branchId: '',
        classId: '',
        teacherId: '',
        inspectionDate: getInstitutionDate(),
        visitNumber: '',
        arrivalTime: '',
        departureTime: '',
        answers: emptyAnswers(),
        remarks: '',
      });
      await load();
      showToast(t('inspection.saved'), t('inspection.savedMessage'), 'success');
    } catch (error) {
      showToast(
        t('inspection.saveFailed'),
        translateApiError(t, error),
        'error',
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={t('inspection.title')} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panel}>
          <Text style={styles.heading}>{t('inspection.weeklyForm')}</Text>
          <Text style={styles.meta}>
            {t('inspection.supervisorName')}: {user.name}
          </Text>
          <ScalableSelector
            label={t('common.branch')}
            onChange={selectBranch}
            options={options.map(item => ({ id: item.id, label: item.name }))}
            value={form.branchId}
          />
          <ScalableSelector
            disabled={!form.branchId}
            label={t('common.class')}
            onChange={selectClass}
            options={classes.map(item => ({ id: item.id, label: item.name }))}
            value={form.classId}
          />
          <ScalableSelector
            disabled={!form.classId}
            label={t('common.teacher')}
            onChange={id => update('teacherId', id)}
            options={teachers.map(item => ({ id: item.id, label: item.name }))}
            value={form.teacherId}
          />
          <CustomInput
            label={t('inspection.date')}
            onChangeText={value => update('inspectionDate', value)}
            value={form.inspectionDate}
          />
          <CustomInput
            label={t('inspection.visitNumber')}
            onChangeText={value => update('visitNumber', value)}
            value={form.visitNumber}
          />
          <CustomInput
            contentDirection="ltr"
            label={t('inspection.arrivalTime')}
            onChangeText={value => update('arrivalTime', value)}
            placeholder="08:00"
            value={form.arrivalTime}
          />
          <CustomInput
            contentDirection="ltr"
            label={t('inspection.departureTime')}
            onChangeText={value => update('departureTime', value)}
            placeholder="09:00"
            value={form.departureTime}
          />
          {questions.map((key, index) => (
            <View key={key} style={styles.question}>
              <Text style={styles.questionText}>
                {index + 1}. {t(`inspection.questions.${key}`)}
              </Text>
              <Pills
                items={[
                  { id: 'YES', label: t('common.yes') },
                  { id: 'NO', label: t('common.no') },
                ]}
                value={form.answers[key]}
                onChange={value =>
                  update('answers', { ...form.answers, [key]: value })
                }
              />
            </View>
          ))}
          <CustomInput
            label={t('inspection.remarks')}
            multiline
            onChangeText={value => update('remarks', value)}
            value={form.remarks}
          />
          <CustomButton
            loading={loading}
            onPress={save}
            title={t('inspection.submit')}
          />
        </View>
        <Text style={styles.heading}>{t('inspection.previous')}</Text>
        {history.map(item => (
          <View key={item.id} style={styles.record}>
            <Text style={styles.recordTitle}>
              {item.inspectionDate} · {item.teacher?.name}
            </Text>
            <Text style={styles.meta}>
              {item.branch?.name} · {item.class?.name} ·{' '}
              {t('inspection.visitNumber')}: {item.visitNumber}
            </Text>
            {questions.map((key, index) => (
              <Text key={key} style={styles.answer}>
                {index + 1}. {t(`inspection.questions.${key}`)} —{' '}
                {t(
                  item.answersJson?.[key] === 'YES'
                    ? 'common.yes'
                    : 'common.no',
                )}
              </Text>
            ))}
          </View>
        ))}
        {!history.length ? (
          <Text style={styles.empty}>{t('inspection.empty')}</Text>
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
  meta: { color: '#687386', fontSize: 12, marginBottom: 8 },
  label: { color: '#263244', fontSize: 13, fontWeight: '800', marginBottom: 7 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  pill: {
    backgroundColor: '#eef2f7',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  activePill: { backgroundColor: colors.emerald },
  pillText: { color: '#4f5d73', fontWeight: '800' },
  activeText: { color: '#fff' },
  question: { borderTopColor: '#e1e8f0', borderTopWidth: 1, paddingTop: 12 },
  questionText: { color: '#263244', lineHeight: 21, marginBottom: 8 },
  record: {
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  recordTitle: { color: '#142033', fontWeight: '900' },
  answer: { color: '#4f5d73', fontSize: 12, lineHeight: 19 },
  empty: { color: '#687386', padding: 24, textAlign: 'center' },
});
export default SupervisorInspectionScreen;
