import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { getDirectionalIcon, getRowDirection } from '../localization/direction';
import { useTranslation } from '../localization/i18n';
import AppText from './AppText';
import colors from '../theme/colors';

const Header = ({ title, subtitle, onBack, rightLabel, onRightPress }) => {
  const { isRTL, t } = useTranslation();
  return (
    <View style={[styles.container, { flexDirection: getRowDirection(isRTL) }]}>
      {onBack ? (
        <TouchableOpacity
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
          onPress={onBack}
          style={styles.side}
        >
          <AppText style={styles.action}>
            {getDirectionalIcon('\u2039', isRTL)} {t('common.back')}
          </AppText>
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}
      <View style={styles.center}>
        <AppText align="center" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText align="center" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {rightLabel ? (
        <TouchableOpacity onPress={onRightPress} style={styles.side}>
          <AppText align={isRTL ? 'left' : 'right'} style={styles.action}>
            {rightLabel}
          </AppText>
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: '#edf1f6',
    borderBottomWidth: 1,
    padding: 16,
  },
  side: { minWidth: 75 },
  center: { flex: 1 },
  title: { color: '#142033', fontSize: 21, fontWeight: '900' },
  subtitle: { color: '#687386', fontSize: 12, marginTop: 2 },
  action: { color: colors.emeraldDark, fontWeight: '800' },
});
export default Header;
