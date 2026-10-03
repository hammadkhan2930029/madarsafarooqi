import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import Text from './AppText';
import { DAILY_PERFORMANCE_FIELDS } from './DailyPerformanceForm';
import { useTranslation } from '../localization/i18n';
import colors from '../theme/colors';

const roleKey = value => {
  const role = String(value || 'TEACHER').toLowerCase();
  return `reports.role${role.charAt(0).toUpperCase()}${role.slice(1)}`;
};

const Metadata = ({ label, value }) => (
  <View style={styles.metaRow}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value || '--'}</Text>
  </View>
);

const ReportExportCard = forwardRef(({ report }, ref) => {
  const { language, t } = useTranslation();
  const generatedAt = new Intl.DateTimeFormat(
    language === 'ur' ? 'ur-PK' : 'en-PK',
    { dateStyle: 'medium', timeStyle: 'short' },
  ).format(new Date());
  const type = t(`reports.${report.report_type}`);
  const role = t(roleKey(report.teacherType || report.teacher?.teacherType));

  return (
    <View collapsable={false} ref={ref} style={styles.page}>
      <View style={styles.brandBar} />
      <Text style={styles.institution}>{t('common.appName')}</Text>
      <Text style={styles.title}>{t('reports.exportDocumentTitle')}</Text>
      <Metadata label={t('reports.type')} value={type} />
      <Metadata
        label={t('reports.exportDateOrWeek')}
        value={report.report_period || `${report.periodStart} — ${report.periodEnd}`}
      />
      <Metadata
        label={t('reports.exportStaffName')}
        value={report.teacherName || report.teacher?.name}
      />
      <Metadata label={t('reports.exportStaffRole')} value={role} />
      <Metadata label={t('common.branch')} value={report.branchName || report.branch?.name} />
      <Metadata label={t('common.class')} value={report.className || report.class?.name} />
      <Metadata
        label={t('reports.exportAdmin')}
        value={t('common.superAdminName')}
      />
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>{t('reports.contentLabel')}</Text>
      {report.report_type === 'daily' ? (
        DAILY_PERFORMANCE_FIELDS.map(key => (
          <Metadata
            key={key}
            label={t(`dailyPerformance.${key}`)}
            value={String(report.content?.[key] || '--')}
          />
        ))
      ) : (
        <Text style={styles.content}>{report.content?.summary || '--'}</Text>
      )}
      <View style={styles.divider} />
      <Metadata label={t('reports.generatedAt')} value={generatedAt} />
      <Text style={styles.footer}>{t('reports.generatedByInstitution')}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  page: { backgroundColor: colors.white, borderColor: '#cfe0d6', borderRadius: 12, borderWidth: 1, padding: 20, width: '100%' },
  brandBar: { alignSelf: 'center', backgroundColor: colors.emerald, borderRadius: 3, height: 5, marginBottom: 14, width: 72 },
  institution: { color: colors.emeraldDark, fontSize: 23, fontWeight: '900', textAlign: 'center' },
  title: { color: colors.ink, fontSize: 18, fontWeight: '900', marginBottom: 18, marginTop: 4, textAlign: 'center' },
  metaRow: { borderBottomColor: '#edf2ef', borderBottomWidth: 1, paddingVertical: 8 },
  metaLabel: { color: '#667085', fontSize: 11, fontWeight: '700' },
  metaValue: { color: colors.ink, fontSize: 14, fontWeight: '700', marginTop: 2 },
  divider: { backgroundColor: '#cfe0d6', height: 1, marginVertical: 15 },
  sectionTitle: { color: colors.emeraldDark, fontSize: 16, fontWeight: '900', marginBottom: 6 },
  content: { color: colors.ink, fontSize: 14, lineHeight: 24, minHeight: 80 },
  footer: { color: '#667085', fontSize: 10, marginTop: 16, textAlign: 'center' },
});

ReportExportCard.displayName = 'ReportExportCard';
export default ReportExportCard;
