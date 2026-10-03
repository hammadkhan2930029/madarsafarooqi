import * as Keychain from 'react-native-keychain';

const TOKEN_SERVICE = 'com.smarthazri.auth.tokens';
const TOKEN_USERNAME = 'jwt-session';

export const saveTokens = async ({ accessToken, refreshToken }) => {
  await Keychain.setGenericPassword(
    TOKEN_USERNAME,
    JSON.stringify({ accessToken, refreshToken }),
    {
      service: TOKEN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    },
  );
};

export const getTokens = async () => {
  const credentials = await Keychain.getGenericPassword({
    service: TOKEN_SERVICE,
  });
  if (!credentials) return null;
  try {
    const tokens = JSON.parse(credentials.password);
    return tokens.accessToken && tokens.refreshToken ? tokens : null;
  } catch {
    await clearTokens();
    return null;
  }
};

export const clearTokens = () =>
  Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
