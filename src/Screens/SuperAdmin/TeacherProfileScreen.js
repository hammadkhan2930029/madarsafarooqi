import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import Header from '../../Components/Header';
import Text from '../../Components/AppText';
import colors from '../../theme/colors';
import { env } from '../../Config/env';
import { useTranslation } from '../../localization/i18n';
import { formatSalary } from '../../Utils/teachers';

const TeacherProfileScreen = ({ teacher, branchName, className, onBack }) => {
  const { t, isRTL } = useTranslation();
  const imageUrl = teacher.profile_image_url || teacher.profileImageUrl;
  const imageUri = imageUrl?.startsWith('http') ? imageUrl : imageUrl ? `${env.API_BASE_URL.replace(/\/api\/?$/, '')}${imageUrl}` : null;
  const row = (label, value) => <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value || '--'}</Text></View>;
  const designation = t(({ supervisor: 'teachers.supervisorType', muawin: 'teachers.muawinType', khadim: 'teachers.khadimType' })[teacher.teacher_type] || 'teachers.teacherType');
  const amount = value => formatSalary(value);

  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={t('teachers.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.avatar} /> : <View style={styles.avatarFallback}><Text align="center" style={styles.avatarInitial}>{String(teacher.name || '?').trim().charAt(0).toUpperCase()}</Text></View>}
          <Text align="center" style={styles.name}>{teacher.name}</Text>
          <Text align="center" style={styles.designation}>{designation}</Text>
          <View style={[styles.status, teacher.status === 'inactive' && styles.statusInactive]}><Text align="center" style={styles.statusText}>{t(`status.${teacher.status}`)}</Text></View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('common.contact')}</Text>
          {row(t('teachers.loginId'), teacher.loginId)}
          {row(t('common.email'), teacher.email)}
          {row(t('common.contact'), teacher.contact)}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isRTL ? 'تعیینات' : 'Assignment'}</Text>
          {row(t('common.branch'), branchName)}
          {row(t('common.class'), className)}
          {row(t('shifts.shift'), teacher.shift?.name)}
          {row(t('teachers.timing'), teacher.timing)}
          {row(t('teachers.workingDays'), (teacher.working_days || []).map(day => t(`dates.${day.toLowerCase()}`)).join(', '))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('teachers.ijaraFrequency')}</Text>
          {row(t('teachers.ijaraFrequency'), t(teacher.ijara_frequency === 'weekly' ? 'teachers.weeklyIjara' : 'teachers.monthlyIjara'))}
          {row(teacher.ijara_frequency === 'weekly' ? t('teachers.weeklyIjaraAmount') : t('teachers.baseSalary'), amount(teacher.ijara_frequency === 'weekly' ? teacher.weekly_ijara_amount : teacher.base_salary))}
          {row(t('teachers.monthlyAllowance'), amount(teacher.monthly_allowance))}
          {row(t('teachers.attendanceAllowance'), teacher.attendance_allowance_enabled ? amount(teacher.attendance_allowance) : t('common.no'))}
          {row(t('teachers.conveyanceAllowance'), amount(teacher.conveyance_allowance))}
          {row(t('teachers.medicalAllowance'), amount(teacher.medical_allowance))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 }, content: { padding: 18, paddingBottom: 96 },
  hero: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: 20, borderWidth: 1, padding: 24 },
  avatar: { borderColor: colors.emerald, borderRadius: 56, borderWidth: 3, height: 112, width: 112 },
  avatarFallback: { alignItems: 'center', backgroundColor: colors.emeraldLight, borderColor: colors.emerald, borderRadius: 56, borderWidth: 3, height: 112, justifyContent: 'center', width: 112 },
  avatarInitial: { color: colors.emeraldDark, fontSize: 42, fontWeight: '900' }, name: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 14 }, designation: { color: colors.muted, fontSize: 15, marginTop: 4 },
  status: { backgroundColor: colors.emeraldLight, borderRadius: 16, marginTop: 14, paddingHorizontal: 14, paddingVertical: 6 }, statusInactive: { backgroundColor: '#FDECEC' }, statusText: { color: colors.emeraldDark, fontSize: 13, fontWeight: '800' },
  section: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginTop: 14, overflow: 'hidden', paddingHorizontal: 16 }, sectionTitle: { color: colors.emeraldDark, fontSize: 16, fontWeight: '900', paddingTop: 16 },
  row: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 12 }, label: { color: colors.muted, fontSize: 12, fontWeight: '700' }, value: { color: colors.ink, fontSize: 16, marginTop: 3 },
});

export default TeacherProfileScreen;
