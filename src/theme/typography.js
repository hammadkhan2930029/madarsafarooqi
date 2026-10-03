import { Platform, StyleSheet } from 'react-native';

const URDU_FONTS = {
  bold: 'NotoSansArabic-Bold',
  medium: 'NotoSansArabic-Medium',
  regular: 'NotoSansArabic-Regular',
};

const getWeight = style => {
  const weight = StyleSheet.flatten(style)?.fontWeight;
  if (weight === 'bold') return 700;
  const numericWeight = Number.parseInt(String(weight || '400'), 10);
  return Number.isFinite(numericWeight) ? numericWeight : 400;
};

export const getUrduFontFamily = style => {
  const weight = getWeight(style);
  if (weight >= 700) return URDU_FONTS.bold;
  if (weight >= 500) return URDU_FONTS.medium;
  return URDU_FONTS.regular;
};

export const getUrduTextStyle = style => {
  const flattened = StyleSheet.flatten(style) || {};
  const fontSize = Number(flattened.fontSize) || 14;
  const safeLineHeight = Math.ceil(fontSize * 1.55);

  return {
    fontFamily: getUrduFontFamily(style),
    fontWeight: 'normal',
    includeFontPadding: Platform.OS === 'android',
    lineHeight: Math.max(Number(flattened.lineHeight) || 0, safeLineHeight),
  };
};

export const URDU_FONT_NAMES = URDU_FONTS;
