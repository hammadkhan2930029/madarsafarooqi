import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

import Text from '../../Components/AppText';
import CustomButton from '../../Components/CustomButton';
import { useTranslation } from '../../localization/i18n';
import { useAuth } from '../../context/AuthContext';
import { getOnboardingStatus, uploadOnboardingProfileImage } from '../../api/authApi';
import { translateApiError } from '../../api/errors';
import colors from '../../theme/colors';

const FirstLoginOnboardingScreen = () => {
  const { t, isRTL } = useTranslation();
  const { completeOnboarding, logout } = useAuth();
  const [status, setStatus] = useState(null);
  const [answers, setAnswers] = useState({});
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getOnboardingStatus().then(setStatus).catch(err => setError(translateApiError(t, err)));
  }, [t]);

  const pickImage = async () => {
    setError('');
    const result = await launchImageLibrary({ mediaType: 'photo', includeBase64: true, selectionLimit: 1, maxWidth: 1000, maxHeight: 1000, quality: 0.6 });
    if (result.didCancel) return;
    if (result.errorCode) return setError(t('onboarding.imageSelectionFailed'));
    const asset = result.assets?.[0];
    if (!asset?.base64 || !asset.type) return setError(t('onboarding.invalidImage'));
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(asset.type)) return setError(t('onboarding.invalidImage'));
    if (asset.fileSize > 2 * 1024 * 1024 || asset.base64.length > 2_796_204) return setError(t('onboarding.imageTooLarge'));
    const mimeType = asset.type === 'image/jpg' ? 'image/jpeg' : asset.type;
    try {
      setLoading('image');
      await uploadOnboardingProfileImage({ fileName: asset.fileName || 'profile', mimeType, data: asset.base64 });
      setPreview(asset.uri);
      setStatus(value => ({ ...value, profileImageUploaded: true }));
    } catch (err) { setError(translateApiError(t, err)); } finally { setLoading(''); }
  };

  const submit = async () => {
    setError('');
    if (status.conditions.some(item => answers[item.id] !== true)) return setError(t('onboarding.allMustBeYes'));
    try {
      setLoading('complete');
      await completeOnboarding({ termsVersion: status.termsVersion, answers: status.conditions.map(item => ({ conditionId: item.id, answer: answers[item.id] === true })) });
    } catch (err) { setError(translateApiError(t, err)); } finally { setLoading(''); }
  };

  if (!status) return <View style={styles.loading}><ActivityIndicator color={colors.primary} />{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
  const imageDone = status.profileImageUploaded;
  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t(imageDone ? 'onboarding.termsTitle' : 'onboarding.imageTitle')}</Text>
      <Text style={styles.step}>{t(imageDone ? 'onboarding.stepTwo' : 'onboarding.stepOne')}</Text>
      {!imageDone ? (
        <View style={styles.card}>
          {preview ? <Image source={{ uri: preview }} style={styles.image} /> : <View style={styles.placeholder}><Text>{t('onboarding.imagePlaceholder')}</Text></View>}
          <CustomButton loading={loading === 'image'} onPress={pickImage} title={t('onboarding.chooseImage')} />
          <Text style={styles.help}>{t('onboarding.imageHelp')}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {status.conditions.map((condition, index) => (
            <View key={condition.id} style={styles.condition}>
              <Text style={[styles.conditionText, isRTL ? styles.textRTL : styles.textLTR]}>{index + 1}. {condition.text}</Text>
              <View style={[styles.answers, isRTL ? styles.rowRTL : styles.rowLTR]}>
                {[true, false].map(answer => <TouchableOpacity key={String(answer)} onPress={() => setAnswers(value => ({ ...value, [condition.id]: answer }))} style={[styles.answer, answers[condition.id] === answer && styles.answerActive]}><Text style={answers[condition.id] === answer ? styles.answerTextActive : styles.answerText}>{t(answer ? 'common.yes' : 'common.no')}</Text></TouchableOpacity>)}
              </View>
            </View>
          ))}
          <CustomButton loading={loading === 'complete'} onPress={submit} title={t('onboarding.continue')} />
        </View>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <CustomButton onPress={logout} title={t('common.logout')} variant="secondary" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5faf7', flexGrow: 1, padding: 24 }, loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  title: { color: '#142033', fontSize: 25, fontWeight: '900', marginTop: 24, textAlign: 'center' }, step: { color: '#687386', marginBottom: 20, marginTop: 6, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderColor: '#cfe0d6', borderRadius: 18, borderWidth: 1, padding: 18 }, placeholder: { alignItems: 'center', backgroundColor: '#eef7f1', borderRadius: 70, height: 140, justifyContent: 'center', marginBottom: 18 },
  image: { alignSelf: 'center', borderRadius: 70, height: 140, marginBottom: 18, width: 140 }, help: { color: '#687386', fontSize: 12, textAlign: 'center' }, condition: { borderBottomColor: '#e4ece7', borderBottomWidth: 1, paddingVertical: 14 },
  conditionText: { color: '#142033', fontSize: 16, lineHeight: 25 }, answers: { gap: 10, marginTop: 10 }, answer: { borderColor: '#b8c9bf', borderRadius: 18, borderWidth: 1, paddingHorizontal: 22, paddingVertical: 9 },
  answerActive: { backgroundColor: colors.emerald, borderColor: colors.emerald }, answerText: { color: '#435267' }, answerTextActive: { color: '#fff' }, error: { color: '#b42318', marginVertical: 12, textAlign: 'center' },
  textRTL: { textAlign: 'right' }, textLTR: { textAlign: 'left' }, rowRTL: { flexDirection: 'row-reverse' }, rowLTR: { flexDirection: 'row' },
});
export default FirstLoginOnboardingScreen;
