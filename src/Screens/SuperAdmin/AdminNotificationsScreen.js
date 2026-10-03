import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import AppText from '../../Components/AppText';
import CustomButton from '../../Components/CustomButton';
import Header from '../../Components/Header';
import KeyboardAwareScrollView from '../../Components/KeyboardAwareScrollView';
import { translateApiError } from '../../api/errors';
import { getAdminLeaveNotifications } from '../../Services/adminNotificationService';
import { reviewLeaveRequest } from '../../Services/leaveService';
import { useTranslation } from '../../localization/i18n';
import colors from '../../theme/colors';

const AdminNotificationsScreen = ({ onBack }) => {
  const { isRTL, t } = useTranslation();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getAdminLeaveNotifications()); }
    catch (error) { Alert.alert(isRTL ? 'اطلاع لوڈ نہیں ہوئی' : 'Notifications could not be loaded', translateApiError(t, error)); }
    finally { setLoading(false); }
  }, [isRTL, t]);

  useEffect(() => { load(); }, [load]);

  const review = async status => {
    if (!selected) return;
    try {
      setReviewing(status);
      await reviewLeaveRequest(selected.leaveRequest.id, status);
      setItems(previous => previous.filter(item => item.id !== selected.id));
      setSelected(null);
      Alert.alert(isRTL ? 'درخواست اپ ڈیٹ ہوگئی' : 'Request updated');
    } catch (error) {
      Alert.alert(isRTL ? 'درخواست اپ ڈیٹ نہیں ہوئی' : 'Request could not be updated', translateApiError(t, error));
    } finally { setReviewing(''); }
  };

  return (
    <View style={styles.container}>
      <Header onBack={onBack} title={isRTL ? 'اطلاعات' : 'Notifications'} />
      <KeyboardAwareScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl onRefresh={load} refreshing={loading} />}>
        {selected ? (
          <View style={styles.detailCard}>
            <AppText style={styles.heading}>{isRTL ? 'چھٹی کی درخواست' : 'Leave request'}</AppText>
            <AppText style={styles.detail}>{isRTL ? 'استاد: ' : 'Teacher: '}{selected.leaveRequest.teacher.name}</AppText>
            <AppText style={styles.detail}>{isRTL ? 'برانچ: ' : 'Branch: '}{selected.leaveRequest.branch.name}</AppText>
            <AppText style={styles.detail}>{isRTL ? 'مدت: ' : 'Dates: '}{selected.leaveRequest.startDate} — {selected.leaveRequest.endDate}</AppText>
            <AppText style={styles.detail}>{isRTL ? 'وجہ: ' : 'Reason: '}{selected.leaveRequest.reason}</AppText>
            <CustomButton loading={reviewing === 'approved'} onPress={() => review('approved')} title={isRTL ? 'منظور کریں' : 'Approve'} />
            <CustomButton loading={reviewing === 'rejected'} onPress={() => review('rejected')} title={isRTL ? 'مسترد کریں' : 'Reject'} variant="secondary" />
            <CustomButton onPress={() => setSelected(null)} title={t('common.close')} variant="secondary" />
          </View>
        ) : null}
        {!items.length && !loading ? <AppText align="center" style={styles.empty}>{isRTL ? 'کوئی زیرِ التوا اطلاع نہیں ہے۔' : 'There are no pending notifications.'}</AppText> : null}
        {items.map(item => (
          <TouchableOpacity key={item.id} onPress={() => setSelected(item)} style={styles.card}>
            <View style={styles.dot} />
            <View style={styles.cardContent}>
              <AppText style={styles.cardTitle}>{isRTL ? 'نئی چھٹی کی درخواست' : 'New leave request'}</AppText>
              <AppText style={styles.text}>{item.leaveRequest.teacher.name} · {item.leaveRequest.branch.name}</AppText>
              <AppText style={styles.text}>{item.leaveRequest.startDate} — {item.leaveRequest.endDate}</AppText>
            </View>
          </TouchableOpacity>
        ))}
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white, flex: 1 }, content: { padding: 20, paddingBottom: 96 },
  card: { alignItems: 'flex-start', backgroundColor: colors.emeraldSoft, borderColor: colors.borderStrong, borderRadius: 15, borderWidth: 1, flexDirection: 'row', gap: 12, marginBottom: 12, padding: 15 },
  dot: { backgroundColor: colors.emerald, borderRadius: 6, height: 12, marginTop: 5, width: 12 }, cardContent: { flex: 1 }, cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, text: { color: colors.muted, marginTop: 4 },
  detailCard: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 16, borderWidth: 1, marginBottom: 20, padding: 18 }, heading: { color: colors.ink, fontSize: 19, fontWeight: '900', marginBottom: 12 }, detail: { color: colors.ink, marginBottom: 10 }, empty: { color: colors.muted, marginTop: 35 },
});

export default AdminNotificationsScreen;
