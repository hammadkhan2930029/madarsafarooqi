import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

import AppText from './AppText';
import colors from '../theme/colors';

const AppButton = ({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  style,
}) => {
  const isDisabled = loading || disabled;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{
        disabled: Boolean(isDisabled),
        busy: Boolean(loading),
      }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        variant === 'secondary' ? styles.secondary : styles.primary,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? colors.emeraldDark : colors.white}
          size="small"
        />
      ) : (
        <AppText
          align="center"
          style={[styles.text, variant === 'secondary' && styles.secondaryText]}
        >
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 4,
    justifyContent: 'center',
    marginVertical: 10,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 13,
    shadowColor: colors.shadow,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
   
  },
  primary: { backgroundColor: colors.emerald, borderColor: colors.emeraldDark },
  secondary: {
    backgroundColor: colors.emeraldSoft,
    borderColor: colors.borderStrong,
    elevation: 1,
    shadowOpacity: 0.07,
  },
  disabled: { elevation: 0, opacity: 0.55 },
  text: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  secondaryText: { color: colors.emeraldDark },
});

export default AppButton;
