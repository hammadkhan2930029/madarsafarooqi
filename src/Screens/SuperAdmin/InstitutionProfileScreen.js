import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '../../Components/Header';
import AppText from '../../Components/AppText';
import { useTranslation } from '../../localization/i18n';
import colors from '../../theme/colors';

const InstitutionProfileScreen = ({
  branchCount,
  classCount,
  onBack,
  teacherCount,
  user,
}) => {
  const { isRTL, t } = useTranslation();
  const label = (urdu, english) => (isRTL ? urdu : english);
  const rows = [
    ['school-outline', label('مدرسہ', 'Institution'), t('common.appName')],
    ['account-tie-outline', label('منتظم', 'Administrator'), user?.name],
    ['account-outline', label('لاگ ان آئی ڈی', 'Login ID'), user?.loginId],
    ['email-outline', label('ای میل', 'Email'), user?.email],
    ['phone-outline', label('رابطہ', 'Contact'), user?.contact],
    ['source-branch', label('برانچز', 'Branches'), branchCount],
    ['google-classroom', label('کلاسز', 'Classes'), classCount],
    ['account-group-outline', label('اساتذہ', 'Teachers'), teacherCount],
  ];

  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={label('مدرسہ کی تفصیلات', 'Madarsa Details')} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}><MaterialCommunityIcons color={colors.white} name="school-outline" size={34} /></View>
          <AppText align="center" style={styles.institutionName}>
            {t('common.appName')}
          </AppText>
          <AppText align="center" style={styles.subtitle}>
            {label('ادارے کی معلومات', 'Institution information')}
          </AppText>
        </View>
        <View style={styles.card}>
          {rows.map(([icon, title, value]) => (
            <View key={title} style={styles.row}>
              <View style={styles.rowIcon}><MaterialCommunityIcons color={colors.emeraldDark} name={icon} size={19} /></View>
              <View style={styles.rowText}><AppText style={styles.label}>{title}</AppText><AppText style={styles.value}>{value || '--'}</AppText></View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
  },
  container: { backgroundColor: colors.background, flex: 1 },
  content: { padding: 20, paddingBottom: 96 },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.emeraldDeep,
    borderRadius: 22,
    marginBottom: 16,
    padding: 22,
  },
  heroIcon: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.28)', borderRadius: 30, borderWidth: 1, height: 60, justifyContent: 'center', width: 60 },
  institutionName: { color: colors.white, fontSize: 24, fontWeight: '900', marginTop: 11 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  row: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: 12, paddingVertical: 14 },
  rowIcon: { alignItems: 'center', backgroundColor: colors.emeraldLight, borderRadius: 13, height: 40, justifyContent: 'center', width: 40 },
  rowText: { flex: 1 },
  subtitle: { color: 'rgba(255,255,255,0.76)', fontSize: 13, marginTop: 5 },
  value: { color: colors.ink, fontSize: 16, fontWeight: '700', marginTop: 4 },
});

export default InstitutionProfileScreen;
