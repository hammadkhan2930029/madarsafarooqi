import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import AppText from './AppText';
import { useTranslation } from '../localization/i18n';
import colors from '../theme/colors';
import { getRowDirection } from '../localization/direction';

const RoleNavigation = ({ activeKey, items }) => {
  const { isRTL } = useTranslation();
  return (
    <View style={styles.shell}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isRTL ? styles.rtl : styles.ltr,
        ]}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {items.map(item => {
          const active = activeKey === item.key;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{
                disabled: Boolean(item.disabled),
                selected: active,
              }}
              disabled={item.disabled}
              key={item.key}
              onPress={item.onPress}
              style={[
                styles.item,
                active ? styles.activeItem : null,
                item.danger ? styles.dangerItem : null,
                item.disabled ? styles.disabledItem : null,
              ]}
            >
              <AppText
                align="center"
                style={[
                  styles.label,
                  active ? styles.activeLabel : null,
                  item.danger ? styles.dangerLabel : null,
                  item.disabled ? styles.disabledLabel : null,
                ]}
              >
                {item.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  activeItem: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  activeLabel: { color: '#ffffff' },
  content: { gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  dangerItem: { borderColor: '#d93025' },
  dangerLabel: { color: '#d93025' },
  disabledItem: { backgroundColor: '#f0f2f5', borderColor: '#e2e6eb' },
  disabledLabel: { color: '#8d97a6' },
  item: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  label: { color: '#33425a', fontSize: 12, fontWeight: '800' },
  ltr: { flexDirection: getRowDirection(false) },
  rtl: { flexDirection: getRowDirection(true) },
  shell: {
    backgroundColor: '#f7f9fc',
    borderBottomColor: '#e5eaf1',
    borderBottomWidth: 1,
  },
});

export default RoleNavigation;
