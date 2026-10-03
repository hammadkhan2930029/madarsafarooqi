import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '../localization/i18n';
import colors from '../theme/colors';
import AppText from './AppText';

const LanguageSelector = ({ compact = false }) => {
  const { language, setLanguage, t } = useTranslation();
  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.container, compact && styles.compact]}
    >
      {[
        ['en', t('settings.english')],
        ['ur', t('settings.urdu')],
      ].map(([code, label]) => (
        <TouchableOpacity
          accessibilityHint={t('settings.languageAccessibilityHint')}
          accessibilityLabel={t('settings.languageOption', { language: label })}
          accessibilityRole="radio"
          accessibilityState={{ selected: language === code }}
          key={code}
          onPress={() => setLanguage(code)}
          style={[styles.option, language === code && styles.active]}
        >
          <AppText
            align="center"
            style={[styles.text, language === code && styles.activeText]}
          >
            {label}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: colors.emeraldLight,
    borderRadius: 18,
    flexDirection: 'row',
    marginVertical: 10,
    padding: 3,
  },
  compact: { marginVertical: 4 },
  option: { borderRadius: 15, paddingHorizontal: 14, paddingVertical: 7 },
  active: { backgroundColor: colors.emerald },
  text: { color: colors.emeraldDark, fontWeight: '800' },
  activeText: { color: colors.white },
});
export default LanguageSelector;
