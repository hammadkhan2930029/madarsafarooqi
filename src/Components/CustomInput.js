import React from 'react';
import { StyleSheet } from 'react-native';
import AppTextInput from './AppTextInput';
import FormField from './FormField';
import colors from '../theme/colors';

const CustomInput = ({ label, error, style, ...props }) => {
  return (
    <FormField error={error} label={label}>
      <AppTextInput
        placeholderTextColor="#8a94a6"
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
    </FormField>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#f7f9fc',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#d93025',
  },
});

export default CustomInput;
