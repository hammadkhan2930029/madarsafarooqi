import fs from 'node:fs';
import path from 'node:path';

import en from '../src/localization/locales/en';
import ur from '../src/localization/locales/ur';
import {
  getDirectionalIcon,
  getRowDirection,
  getTextAlign,
  getWritingDirection,
  isRTL,
} from '../src/localization/direction';

const flatten = (value, prefix = '', result = {}) => {
  Object.entries(value).forEach(([key, child]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child))
      flatten(child, nextKey, result);
    else result[nextKey] = child;
  });
  return result;
};

const sourceFiles = directory =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(target)
      : entry.name.endsWith('.js')
      ? [target]
      : [];
  });

test('English and Urdu translation keys have exact parity', () => {
  expect(Object.keys(flatten(ur)).sort()).toEqual(
    Object.keys(flatten(en)).sort(),
  );
});

test('Urdu resources contain real connected-script Unicode and no mojibake', () => {
  const values = Object.values(flatten(ur)).join(' ');
  expect(ur.settings.urdu).toBe('اردو');
  expect(ur.auth.login).toMatch(/[\u0600-\u06ff]/);
  expect(values).not.toMatch(/[ÃÂØÙÛ]|â€|â†/);
});

test('direction helpers mirror only directional navigation icons', () => {
  expect(isRTL('ur')).toBe(true);
  expect(isRTL('en')).toBe(false);
  expect(getRowDirection(true)).toBe('row-reverse');
  expect(getTextAlign(true)).toBe('right');
  expect(getWritingDirection(false)).toBe('ltr');
  expect(getDirectionalIcon('\u2039', true)).toBe('\u203a');
  expect(getDirectionalIcon('⚙', true)).toBe('⚙');
});

test('screens do not display raw backend error messages', () => {
  const screens = sourceFiles(path.join(__dirname, '..', 'src', 'Screens'))
    .map(file => fs.readFileSync(file, 'utf8'))
    .join('\n');
  expect(screens).not.toMatch(/\b(?:err|error|requestError)\.message\b/);
});

test('all screens use localized AppText instead of React Native Text', () => {
  sourceFiles(path.join(__dirname, '..', 'src', 'Screens')).forEach(file => {
    const source = fs.readFileSync(file, 'utf8');
    expect(source).not.toMatch(
      /import\s*\{[^}]*\bText\b[^}]*\}\s*from\s*['"]react-native['"]/,
    );
  });
});
