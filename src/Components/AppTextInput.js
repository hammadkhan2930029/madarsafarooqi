import React, { forwardRef, useCallback, useContext, useImperativeHandle, useRef } from 'react';
import { TextInput } from 'react-native';

import { KeyboardScrollContext } from './KeyboardAwareScrollView';
import { getTextAlign, getWritingDirection } from '../localization/direction';
import { useTranslation } from '../localization/i18n';
import { getUrduTextStyle } from '../theme/typography';

const AppTextInput = forwardRef(({ contentDirection, keyboardType, onFocus, style, ...props }, ref) => {
  const { isRTL } = useTranslation();
  const { onInputFocus } = useContext(KeyboardScrollContext);
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => inputRef.current);
  const numericKeyboard = [
    'decimal-pad',
    'email-address',
    'number-pad',
    'numeric',
    'phone-pad',
  ].includes(keyboardType);
  const rtl =
    contentDirection === 'ltr' || numericKeyboard
      ? false
      : contentDirection === 'rtl'
      ? true
      : isRTL;
  const handleFocus = useCallback(event => {
    onFocus?.(event);
    onInputFocus(inputRef.current);
  }, [onFocus, onInputFocus]);
  return (
    <TextInput
      {...props}
      ref={inputRef}
      keyboardType={keyboardType}
      onFocus={handleFocus}
      style={[
        style,
        {
          textAlign: getTextAlign(rtl),
          writingDirection: getWritingDirection(rtl),
        },
        rtl ? getUrduTextStyle(style) : null,
      ]}
    />
  );
});

export default AppTextInput;
