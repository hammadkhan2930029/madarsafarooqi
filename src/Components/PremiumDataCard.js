import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { getRowDirection } from '../localization/direction';
import { useTranslation } from '../localization/i18n';
import colors from '../theme/colors';
import AppText from './AppText';

export const CARD_ICONS = Object.freeze({
  activate: 'check-circle-outline',
  deactivate: 'close-circle-outline',
  delete: 'delete-outline',
  edit: 'pencil-outline',
  reset: 'lock-reset',
  view: 'eye-outline',
});

const CardAction = ({ action }) => (
  <TouchableOpacity
    accessibilityLabel={action.label}
    accessibilityRole="button"
    disabled={action.disabled || action.loading}
    onPress={action.onPress}
    style={[
      styles.action,
      action.tone === 'danger' && styles.dangerAction,
      action.tone === 'success' && styles.successAction,
      (action.disabled || action.loading) && styles.disabled,
    ]}
  >
    {action.loading ? <ActivityIndicator color={action.tone === 'danger' ? colors.danger : colors.emeraldDark} size="small" /> : <MaterialCommunityIcons
      color={action.tone === 'danger' ? colors.danger : colors.emeraldDark}
      name={action.icon}
      size={19}
    />}
    <AppText
      align="center"
      numberOfLines={2}
      style={[
        styles.actionLabel,
        action.tone === 'danger' && styles.dangerText,
        action.tone === 'success' && styles.successText,
      ]}
    >
      {action.label}
    </AppText>
  </TouchableOpacity>
);

const PremiumDataCard = ({ actions = [], children, onPress, style }) => {
  const { isRTL } = useTranslation();
  const Content = onPress ? TouchableOpacity : View;
  return (
    <View style={[styles.card, style]}>
      <Content activeOpacity={0.78} onPress={onPress} style={styles.content}>
        {children}
      </Content>
      {actions.length ? (
        <View
          style={[styles.actions, { flexDirection: getRowDirection(isRTL) }]}
        >
          {actions.map(action => (
            <CardAction action={action} key={action.key} />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    backgroundColor: colors.emeraldSoft,
    borderColor: colors.border,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 84,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionLabel: {
    color: colors.emeraldDark,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '800',
  },
  actions: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 17,
    borderWidth: 1,
    elevation: 4,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  content: { padding: 16 },
  dangerAction: { backgroundColor: '#FFF3F2', borderColor: '#EAC1BE' },
  dangerText: { color: colors.danger },
  disabled: { opacity: 0.5 },
  successAction: {
    backgroundColor: colors.emeraldLight,
    borderColor: colors.borderStrong,
  },
  successText: { color: colors.emeraldDark },
});

export default PremiumDataCard;
