import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '../../Components/Header';
import Text from '../../Components/AppText';
import CustomButton from '../../Components/CustomButton';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../localization/i18n';
import colors from '../../theme/colors';

const ProfileRow = ({ icon, label, value }) => (
  <View style={styles.row}>
    <View style={styles.rowIcon}>
      <MaterialCommunityIcons color={colors.emeraldDark} name={icon} size={19} />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '--'}</Text>
    </View>
  </View>
);

const ProfileSection = ({ children, title }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const MyProfileScreen = ({ onBack, user }) => {
  const { t } = useTranslation();
  const { acceptIjaraTerms } = useAuth();
  const designation = t(
    ({ supervisor: 'teachers.supervisorType', muawin: 'teachers.muawinType', khadim: 'teachers.khadimType' })[user.teacher_type] || 'teachers.teacherType',
  );
  const initials = String(user.name || '?').trim().charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={t('teacherAccess.myProfile')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.avatarRing}>
            {user.profile_image_url ? (
              <Image source={{ uri: user.profile_image_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}><Text style={styles.avatarInitial}>{initials}</Text></View>
            )}
          </View>
          <Text align="center" style={styles.name}>{user.name || '--'}</Text>
          <Text align="center" style={styles.designation}>{designation}</Text>
          <View style={styles.statusBadge}>
            <MaterialCommunityIcons color={colors.white} name="check-decagram-outline" size={16} />
            <Text style={styles.statusText}>{t(`status.${user.status}`)}</Text>
          </View>
        </View>

        <ProfileSection title={t('teacherAccess.myProfile')}>
          <ProfileRow icon="account-outline" label={t('teachers.loginId')} value={user.loginId} />
          <ProfileRow icon="email-outline" label={t('common.email')} value={user.email} />
          <ProfileRow icon="phone-outline" label={t('common.contact')} value={user.contact} />
        </ProfileSection>

        <ProfileSection title={t('teachers.designation')}>
          <ProfileRow icon="briefcase-outline" label={t('teachers.designation')} value={designation} />
          <ProfileRow icon="source-branch" label={t('common.branch')} value={user.branch?.name || user.branch_id} />
          <ProfileRow icon="google-classroom" label={t('common.class')} value={user.class?.name || user.class_id} />
          <ProfileRow icon="clock-outline" label={t('teachers.timing')} value={user.timing} />
          <ProfileRow icon="calendar-week-outline" label={t('teachers.workingDays')} value={(user.working_days || []).map(day => t(`dates.${day.toLowerCase()}`)).join(', ')} />
        </ProfileSection>

        <ProfileSection title={t('teachers.ijaraFrequency')}>
          <ProfileRow icon="calendar-sync-outline" label={t('teachers.ijaraFrequency')} value={t(user.ijara_frequency === 'weekly' ? 'teachers.weeklyIjara' : 'teachers.monthlyIjara')} />
          {user.ijara_frequency === 'weekly' ? <ProfileRow icon="cash" label={t('teachers.weeklyIjaraAmount')} value={user.weekly_ijara_amount} /> : <ProfileRow icon="cash" label={t('teachers.baseSalary')} value={user.base_salary} />}
          <ProfileRow icon="cash-plus" label={t('teachers.monthlyAllowance')} value={user.monthly_allowance} />
          <ProfileRow icon="calendar-check-outline" label={t('teachers.attendanceAllowance')} value={user.attendance_allowance_enabled ? user.attendance_allowance : t('common.no')} />
          <ProfileRow icon="bus" label={t('teachers.conveyanceAllowance')} value={user.conveyance_allowance} />
          <ProfileRow icon="medical-bag" label={t('teachers.medicalAllowance')} value={user.medical_allowance} />
        </ProfileSection>

        {user.ijara_terms ? (
          <View style={styles.termsCard}>
            <View style={styles.termsHeading}><MaterialCommunityIcons color={colors.emeraldDark} name="file-check-outline" size={22} /><Text style={styles.termsTitle}>{t('teachers.ijaraTerms')}</Text></View>
            <Text style={styles.termsText}>{user.ijara_terms}</Text>
            {!user.ijara_accepted_at ? <CustomButton onPress={acceptIjaraTerms} title={t('teachers.acceptIjaraTerms')} /> : <View style={styles.accepted}><MaterialCommunityIcons color={colors.emeraldDark} name="check-circle-outline" size={19} /><Text style={styles.acceptedText}>{t('teachers.ijaraAccepted')}</Text></View>}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  accepted: { alignItems: 'center', backgroundColor: colors.emeraldLight, borderRadius: 12, flexDirection: 'row', gap: 7, marginTop: 14, padding: 12 },
  acceptedText: { color: colors.emeraldDark, fontWeight: '800' },
  avatar: { borderRadius: 52, height: 104, width: 104 },
  avatarFallback: { alignItems: 'center', backgroundColor: colors.emerald, borderRadius: 52, height: 104, justifyContent: 'center', width: 104 },
  avatarInitial: { color: colors.white, fontSize: 42, fontWeight: '900' },
  avatarRing: { backgroundColor: colors.white, borderColor: 'rgba(255,255,255,0.72)', borderRadius: 60, borderWidth: 4, elevation: 5, height: 112, justifyContent: 'center', marginTop: -4, shadowColor: colors.shadow, shadowOpacity: 0.18, shadowRadius: 8, width: 112 },
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 16, paddingBottom: 96 },
  designation: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  hero: { alignItems: 'center', backgroundColor: colors.emeraldDeep, borderRadius: 24, padding: 20 },
  label: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  name: { color: colors.white, fontSize: 24, fontWeight: '900', marginTop: 12 },
  row: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 12, minHeight: 66, paddingVertical: 10 },
  rowIcon: { alignItems: 'center', backgroundColor: colors.emeraldLight, borderRadius: 13, height: 38, justifyContent: 'center', width: 38 },
  rowText: { flex: 1 },
  section: { marginTop: 18 },
  sectionCard: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 18, borderWidth: 1, paddingHorizontal: 16 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '900', marginBottom: 9 },
  statusBadge: { alignItems: 'center', backgroundColor: colors.emerald, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 5, marginTop: 14, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  termsCard: { backgroundColor: colors.white, borderColor: colors.borderStrong, borderRadius: 18, borderWidth: 1, marginTop: 18, padding: 16 },
  termsHeading: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  termsText: { color: colors.muted, lineHeight: 22, marginTop: 11 },
  termsTitle: { color: colors.ink, flex: 1, fontSize: 16, fontWeight: '900' },
  value: { color: colors.ink, fontSize: 15, fontWeight: '700', marginTop: 2 },
});

export default MyProfileScreen;
