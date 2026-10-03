import React from 'react';
import { Text } from 'react-native';

import { getTextAlign, getWritingDirection } from '../localization/direction';
import { useTranslation } from '../localization/i18n';
import { getUrduTextStyle } from '../theme/typography';

const AppText = ({ align, direction, style, ...props }) => {
  const { isRTL } = useTranslation();
  const rtl = direction === 'ltr' ? false : direction === 'rtl' ? true : isRTL;
  return (
    <Text
      {...props}
      style={[
        {
          textAlign: align || getTextAlign(rtl),
          writingDirection: getWritingDirection(rtl),
        },
        style,
        isRTL ? getUrduTextStyle(style) : null,
      ]}
    />
  );
};

export default AppText;
