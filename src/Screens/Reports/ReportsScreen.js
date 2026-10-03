import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Text from '../../Components/AppText';
import CustomButton from '../../Components/CustomButton';
import CustomInput from '../../Components/CustomInput';
import KeyboardAwareScrollView from '../../Components/KeyboardAwareScrollView';
import DailyPerformanceForm, {
  emptyDailyPerformance,
} from '../../Components/DailyPerformanceForm';
import Header from '../../Components/Header';
import ReportExportCard from '../../Components/ReportExportCard';
import ScalableSelector from '../../Components/ScalableSelector';
import { getBranches } from '../../Services/branchService';
import { getClasses } from '../../Services/classService';
import { getTeachers } from '../../Services/teacherService';
import {
  createTeacherReport,
  exportReportsCsv,
  getReportDetails,
  getReportEditHistory,
  getSuperAdminReports,
  getTeacherReports,
  updateReportContent,
} from '../../Services/reportService';
import {
  shareReportImage,
  shareReportPdf,
} from '../../Services/reportExportService';
import { useTranslation } from '../../localization/i18n';
import {
  canTeacherEditReport,
  getEditMinutesRemaining,
  getReportPeriod,
  REPORT_TYPES,
  validateReportContent,
  validateReportPeriod,
} from '../../Utils/reports';
import { translateApiError } from '../../api/errors';
import colors from '../../theme/colors';
import { getActorDisplayName } from '../../Utils/displayName';

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

const ReportsScreen = ({ user, mode = 'teacher', onBack }) => {
  const isAdmin = mode === 'admin';
  const staffType = String(user?.teacher_type || 'teacher').toLowerCase();
  const isSupervisor = !isAdmin && staffType === 'supervisor';
  const canCreateReport =
    !isAdmin && ['teacher', 'supervisor'].includes(staffType);
  const { language, t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [type, setType] = useState(isSupervisor ? 'weekly' : 'daily');
  const [period, setPeriod] = useState(
    getReportPeriod(isSupervisor ? 'weekly' : 'daily'),
  );
  const [content, setContent] = useState('');
  const [dailyContent, setDailyContent] = useState(emptyDailyPerformance);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [weekFilter, setWeekFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editHistory, setEditHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState('');
  const exportCardRef = useRef(null);
  const creationTypes = isSupervisor ? ['weekly'] : REPORT_TYPES;

  const load = useCallback(async () => {
    if (isAdmin) {
      const [items, teacherItems, branchItems, classItems] = await Promise.all([
        getSuperAdminReports({
          search,
          teacherId: teacherFilter,
          branchId: branchFilter,
          classId: classFilter,
          reportType: typeFilter,
          role: roleFilter,
          status: statusFilter,
          week: /^\d{4}-W\d{2}$/.test(weekFilter.trim())
            ? weekFilter.trim()
            : undefined,
          dateFrom: /^\d{4}-\d{2}-\d{2}$/.test(dateFilter.trim())
            ? dateFilter.trim()
            : undefined,
          dateTo: /^\d{4}-\d{2}-\d{2}$/.test(dateFilter.trim())
            ? dateFilter.trim()
            : undefined,
          page,
        }),
        getTeachers(user),
        getBranches(),
        getClasses(),
      ]);
      setReports(items.items);
      setPagination(items.pagination);
      setTeachers(teacherItems);
      setBranches(branchItems);
      setClasses(classItems);
    } else {
      const result = await getTeacherReports({ page });
      setReports(result.items);
      setPagination(result.pagination);
    }
  }, [
    branchFilter,
    classFilter,
    dateFilter,
    isAdmin,
    page,
    teacherFilter,
    typeFilter,
    roleFilter,
    search,
    statusFilter,
    weekFilter,
    user,
  ]);

  useEffect(() => {
    load().catch(err =>
      Alert.alert(t('reports.loadFailed'), translateApiError(t, err)),
    );
  }, [load, t]);

  const visible = useMemo(() => {
    const branchNames = Object.fromEntries(
      branches.map(item => [item.id, item.name]),
    );
    const classNames = Object.fromEntries(
      classes.map(item => [item.id, item.name]),
    );
    const teacherNames = Object.fromEntries(
      teachers.map(item => [item.uid, item.name]),
    );
    return reports
      .filter(
        item => teacherFilter === 'all' || item.teacher_id === teacherFilter,
      )
      .filter(item => branchFilter === 'all' || item.branch_id === branchFilter)
      .filter(item => classFilter === 'all' || item.class_id === classFilter)
      .filter(item => typeFilter === 'all' || item.report_type === typeFilter)
      .filter(
        item =>
          !dateFilter.trim() || item.report_period.includes(dateFilter.trim()),
      )
      .map(item => ({
        ...item,
        teacherName: teacherNames[item.teacher_id] || item.teacher_id,
        branchName: branchNames[item.branch_id] || item.branch_id,
        className: classNames[item.class_id] || item.class_id,
      }));
  }, [
    reports,
    teachers,
    branches,
    classes,
    teacherFilter,
    branchFilter,
    classFilter,
    typeFilter,
    dateFilter,
  ]);

  const changeType = next => {
    setType(next);
    setPeriod(getReportPeriod(next));
  };
  const startEdit = report => {
    setEditing(report);
    if (report.report_type === 'daily')
      setDailyContent({ ...emptyDailyPerformance(), ...report.content });
    else setContent(report.content?.summary || '');
  };
  const save = async () => {
    const daily = (editing?.report_type || type) === 'daily';
    const error =
      (daily
        ? !Object.values(dailyContent).some(value => String(value).trim())
          ? 'validation.required'
          : ''
        : validateReportContent(content)) ||
      (!editing ? validateReportPeriod(type, period) : '');
    if (error) return Alert.alert(t('reports.invalid'), t(error));
    try {
      setLoading(true);
      const reportContent = daily ? dailyContent : content;
      if (editing)
        await updateReportContent(editing.id, reportContent, isAdmin);
      else await createTeacherReport(user, type, period, reportContent);
      setContent('');
      setDailyContent(emptyDailyPerformance());
      setEditing(null);
      await load();
      Alert.alert(t('reports.saved'), t('reports.savedMessage'));
    } catch (err) {
      Alert.alert(t('reports.saveFailed'), translateApiError(t, err));
    } finally {
      setLoading(false);
    }
  };

  const showDetails = async report => {
    try {
      const [detail, history] = await Promise.all([
        getReportDetails(report.id, isAdmin),
        isAdmin ? getReportEditHistory(report.id) : Promise.resolve([]),
      ]);
      setSelected(detail);
      setEditHistory(history);
    } catch (err) {
      Alert.alert(t('reports.loadFailed'), translateApiError(t, err));
    }
  };
  const shareCsv = async () => {
    try {
      const message = await exportReportsCsv(
        {
          ...(teacherFilter !== 'all' ? { teacherId: teacherFilter } : {}),
          ...(branchFilter !== 'all' ? { branchId: branchFilter } : {}),
          ...(classFilter !== 'all' ? { classId: classFilter } : {}),
          ...(typeFilter !== 'all'
            ? { reportType: typeFilter.toUpperCase() }
            : {}),
          ...(roleFilter !== 'all' ? { role: roleFilter.toUpperCase() } : {}),
          ...(statusFilter !== 'all'
            ? { status: statusFilter.toUpperCase() }
            : {}),
          ...(weekFilter.trim() ? { week: weekFilter.trim() } : {}),
          ...(dateFilter.trim()
            ? { dateFrom: dateFilter.trim(), dateTo: dateFilter.trim() }
            : {}),
        },
        language,
      );
      await Share.share({ title: t('reports.title'), message });
    } catch (err) {
      Alert.alert(t('reports.exportFailed'), translateApiError(t, err));
    }
  };

  const exportSelected = async format => {
    if (!selected || exporting) return;
    try {
      setExporting(format);
      // Verify current view permission on the backend immediately before export.
      const authorizedReport = await getReportDetails(selected.id, isAdmin);
      setSelected(authorizedReport);
      await new Promise(resolve => requestAnimationFrame(resolve));
      if (format === 'pdf') {
        await shareReportPdf(
          exportCardRef,
          authorizedReport,
          t('reports.shareReport'),
        );
      } else {
        await shareReportImage(
          exportCardRef,
          authorizedReport,
          t('reports.shareReport'),
        );
      }
    } catch {
      Alert.alert(
        t('reports.exportFailedTitle'),
        t('reports.exportGenerationFailed'),
      );
    } finally {
      setExporting('');
    }
  };

  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={t('reports.title')} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {canCreateReport ? (
          <View style={styles.panel}>
            <Text style={styles.heading}>
              {t(editing ? 'reports.editTitle' : 'reports.submitTitle')}
            </Text>
            {!editing ? (
              <>
                <View style={styles.pills}>
                  {creationTypes.map(item => (
                    <Pill
                      active={type === item}
                      key={item}
                      label={t(`reports.${item}`)}
                      onPress={() => changeType(item)}
                    />
                  ))}
                </View>
                <CustomInput
                  label={t('reports.reportingPeriod')}
                  onChangeText={setPeriod}
                  value={period}
                />
              </>
            ) : null}
            {(editing?.report_type || type) === 'daily' ? (
              <DailyPerformanceForm
                onChange={setDailyContent}
                value={dailyContent}
              />
            ) : (
              <CustomInput
                label={t('reports.contentLabel')}
                multiline
                onChangeText={setContent}
                placeholder={t('reports.contentPlaceholder')}
                value={content}
              />
            )}
            <CustomButton
              loading={loading}
              onPress={save}
              title={t(editing ? 'reports.update' : 'reports.submit')}
            />
            {editing ? (
              <CustomButton
                onPress={() => {
                  setEditing(null);
                  setContent('');
                  setDailyContent(emptyDailyPerformance());
                }}
                title={t('common.cancel')}
                variant="secondary"
              />
            ) : null}
          </View>
        ) : null}

        {isAdmin && editing ? (
          <View style={styles.panel}>
            <Text style={styles.heading}>
              {t('reports.editTitle')} — {t(`reports.${editing.report_type}`)}
            </Text>
            <Text style={styles.meta}>
              {editing.teacherName || editing.teacher_id} |{' '}
              {editing.report_period}
            </Text>
            {editing.report_type === 'daily' ? (
              <DailyPerformanceForm
                onChange={setDailyContent}
                value={dailyContent}
              />
            ) : (
              <CustomInput
                label={t('reports.contentLabel')}
                multiline
                onChangeText={setContent}
                value={content}
              />
            )}
            <CustomButton
              loading={loading}
              onPress={save}
              title={t('reports.update')}
            />
            <CustomButton
              onPress={() => {
                setEditing(null);
                setContent('');
              }}
              title={t('common.cancel')}
              variant="secondary"
            />
          </View>
        ) : null}

        {isAdmin ? (
          <View style={styles.panel}>
            <Text style={styles.heading}>{t('reports.filters')}</Text>
            <CustomInput
              label={t('reports.searchLabel')}
              onChangeText={setSearch}
              placeholder={t('reports.searchPlaceholder')}
              value={search}
            />
            <Text style={styles.label}>{t('reports.type')}</Text>
            <View style={styles.pills}>
              {['all', ...REPORT_TYPES].map(item => (
                <Pill
                  active={typeFilter === item}
                  key={item}
                  label={
                    item === 'all' ? t('common.all') : t(`reports.${item}`)
                  }
                  onPress={() => setTypeFilter(item)}
                />
              ))}
            </View>
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
              label={t('reports.personRole')}
              onChange={setRoleFilter}
              options={[
                { id: 'all', label: t('common.all') },
                { id: 'teacher', label: t('reports.roleTeacher') },
                { id: 'supervisor', label: t('reports.roleSupervisor') },
                { id: 'muawin', label: t('reports.roleMuawin') },
                { id: 'khadim', label: t('reports.roleKhadim') },
              ]}
              value={roleFilter}
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
            <CustomInput
              label={t('reports.dateFilter')}
              onChangeText={setDateFilter}
              placeholder="YYYY-MM-DD"
              value={dateFilter}
            />
            <CustomInput
              contentDirection="ltr"
              label={t('reports.weekFilter')}
              onChangeText={setWeekFilter}
              placeholder="YYYY-W01"
              value={weekFilter}
            />
            <ScalableSelector
              label={t('common.status')}
              onChange={setStatusFilter}
              options={[
                { id: 'all', label: t('common.all') },
                { id: 'submitted', label: t('status.submitted') },
              ]}
              value={statusFilter}
            />
            <CustomButton
              onPress={shareCsv}
              title={t('reports.shareCsv')}
              variant="secondary"
            />
          </View>
        ) : null}

        {selected ? (
          <View style={styles.panel}>
            <ReportExportCard ref={exportCardRef} report={selected} />
            <Text style={styles.heading}>{t('reports.details')}</Text>
            <Text style={styles.meta}>
              {selected.teacherName || user.name} |{' '}
              {t(`reports.${selected.report_type}`)}
            </Text>
            <Text style={styles.meta}>
              {selected.periodStart} — {selected.periodEnd}
            </Text>
            <Text style={styles.meta}>
              {t('reports.originalCreator')}:{' '}
              {selected.originalCreator?.name || selected.teacherName}
            </Text>
            <Text style={styles.meta}>
              {t('reports.originalReportDate')}: {selected.originalReportDate}
            </Text>
            {selected.lastEditedBy ? (
              <Text style={styles.meta}>
                {t('reports.lastEditedBy')}:{' '}
                {getActorDisplayName(selected.lastEditedBy, t)} ·{' '}
                {selected.lastEditedAt}
              </Text>
            ) : null}
            {selected.report_type === 'daily' ? (
              <DailyPerformanceForm readOnly value={selected.content} />
            ) : (
              <Text style={styles.reportText}>
                {selected.content?.summary || '--'}
              </Text>
            )}
            <Text style={styles.exportHeading}>{t('reports.shareReport')}</Text>
            <View style={styles.exportActions}>
              <CustomButton
                disabled={Boolean(exporting)}
                loading={exporting === 'image'}
                onPress={() => exportSelected('image')}
                title={t('reports.exportImage')}
                variant="secondary"
              />
              <CustomButton
                disabled={Boolean(exporting)}
                loading={exporting === 'pdf'}
                onPress={() => exportSelected('pdf')}
                title={t('reports.exportPdf')}
                variant="secondary"
              />
            </View>
            {exporting ? (
              <Text style={styles.exportStatus}>
                {t('reports.generatingExport')}
              </Text>
            ) : null}
            {isAdmin && editHistory.length ? (
              <View style={styles.historyBox}>
                <Text style={styles.heading}>{t('reports.editHistory')}</Text>
                {editHistory.map(entry => (
                  <Text key={entry.id} style={styles.meta}>
                    {getActorDisplayName(entry.editedBy, t)} · {entry.editedAt}
                  </Text>
                ))}
              </View>
            ) : null}
            <CustomButton
              onPress={() => {
                setSelected(null);
                setEditHistory([]);
              }}
              title={t('common.close')}
              variant="secondary"
            />
          </View>
        ) : null}

        <Text style={styles.heading}>
          {t('reports.submitted', { count: visible.length })}
        </Text>
        {visible.map(report => {
          const editable =
            isAdmin ||
            (staffType === 'teacher' && canTeacherEditReport(report)) ||
            (staffType === 'supervisor' &&
              report.report_type === 'weekly' &&
              canTeacherEditReport(report));
          return (
            <View key={report.id} style={styles.record}>
              <Text style={styles.recordTitle}>
                {isAdmin ? `${report.teacherName} | ` : ''}
                {t(`reports.${report.report_type}`)} | {report.report_period}
              </Text>
              {isAdmin ? (
                <Text style={styles.meta}>
                  {report.branchName} | {report.className}
                </Text>
              ) : null}
              <Text style={styles.meta}>
                {t('common.status')}: {t(`status.${report.status || 'submitted'}`)}
              </Text>
              {report.report_type === 'daily' ? (
                <Text style={styles.reportText}>
                  {t('dailyPerformance.summary', {
                    present: report.content?.presentStudents || '0',
                    total: report.content?.totalStudents || '0',
                  })}
                </Text>
              ) : (
                <Text style={styles.reportText}>
                  {report.content?.summary || '--'}
                </Text>
              )}
              <Text style={styles.meta}>
                {editable && !isAdmin
                  ? t('reports.minutesRemaining', {
                      count: getEditMinutesRemaining(report),
                    })
                  : t(editable ? 'reports.editable' : 'reports.expired')}
              </Text>
              <CustomButton
                onPress={() => showDetails(report)}
                title={t('reports.viewDetails')}
                variant="secondary"
              />
              {editable ? (
                <CustomButton
                  onPress={() => startEdit(report)}
                  title={t('reports.edit')}
                  variant="secondary"
                />
              ) : null}
            </View>
          );
        })}
        {!visible.length ? (
          <Text style={styles.empty}>{t('reports.empty')}</Text>
        ) : null}
        {pagination.totalPages > 1 ? (
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
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', flex: 1 },
  content: { padding: 20, paddingBottom: 96 },
  topBar: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 20,
  },
  back: { color: colors.emeraldDark, fontWeight: '800', marginRight: 20 },
  title: { color: '#142033', fontSize: 22, fontWeight: '900' },
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
  historyBox: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
  },
  exportHeading: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 18,
  },
  exportActions: { gap: 8, marginTop: 8 },
  exportStatus: {
    color: colors.emeraldDark,
    marginVertical: 8,
    textAlign: 'center',
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
  pillTextActive: { color: colors.white },
  record: {
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
  recordTitle: { color: colors.ink, fontWeight: '900' },
  reportText: { color: '#263449', marginTop: 8 },
  meta: { color: '#687386', fontSize: 12, marginTop: 5 },
  empty: { color: '#687386', padding: 20, textAlign: 'center' },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
});

export default ReportsScreen;
