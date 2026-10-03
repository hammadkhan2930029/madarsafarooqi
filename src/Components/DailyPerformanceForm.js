import React from 'react';
import { View } from 'react-native';

import CustomInput from './CustomInput';
import Text from './AppText';
import { useTranslation } from '../localization/i18n';

export const DAILY_PERFORMANCE_FIELDS = [
  'arrivalTime',
  'departureTime',
  'teachingMethod',
  'totalStudents',
  'presentStudents',
  'absentStudents',
  'leaveStudents',
  'lessonMemorizedCount',
  'revisionRecitationCount',
  'studentsNeedingLessonAttention',
  'studentsNeedingRulesAttention',
  'longAbsentContactCount',
  'visitingTeacherName',
  'remarks',
];
export const emptyDailyPerformance = () =>
  Object.fromEntries(DAILY_PERFORMANCE_FIELDS.map(key => [key, '']));
const numericFields = new Set([
  'totalStudents',
  'presentStudents',
  'absentStudents',
  'leaveStudents',
  'lessonMemorizedCount',
  'revisionRecitationCount',
  'studentsNeedingLessonAttention',
  'studentsNeedingRulesAttention',
  'longAbsentContactCount',
]);

const DailyPerformanceForm = ({ value, onChange, readOnly = false }) => {
  const { t } = useTranslation();
  return (
    <View>
      <Text
        style={{
          color: '#142033',
          fontSize: 16,
          fontWeight: '900',
          marginBottom: 10,
        }}
      >
        {t('dailyPerformance.title')}
      </Text>
      {DAILY_PERFORMANCE_FIELDS.map(key =>
        readOnly ? (
          <Text key={key} style={{ color: '#4f5d73', lineHeight: 24 }}>
            {t(`dailyPerformance.${key}`)}: {value?.[key] || '--'}
          </Text>
        ) : (
          <CustomInput
            key={key}
            keyboardType={numericFields.has(key) ? 'numeric' : 'default'}
            label={t(`dailyPerformance.${key}`)}
            multiline={key === 'remarks'}
            onChangeText={text => onChange({ ...value, [key]: text })}
            value={String(value?.[key] || '')}
          />
        ),
      )}
    </View>
  );
};
export default DailyPerformanceForm;
