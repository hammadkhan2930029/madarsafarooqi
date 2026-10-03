import * as Keychain from 'react-native-keychain';

import {
  clearTokens,
  getTokens,
  saveTokens,
} from '../src/storage/tokenStorage';
import { getApiErrorCode, translateApiError } from '../src/api/errors';

describe('REST authentication integration', () => {
  beforeEach(() => jest.clearAllMocks());

  test('stores only JWT tokens in secure native storage', async () => {
    await saveTokens({
      accessToken: 'access.jwt',
      refreshToken: 'refresh.jwt',
    });
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'jwt-session',
      JSON.stringify({
        accessToken: 'access.jwt',
        refreshToken: 'refresh.jwt',
      }),
      expect.objectContaining({ service: 'com.smarthazri.auth.tokens' }),
    );
  });

  test('restores and clears the secure session', async () => {
    Keychain.getGenericPassword.mockResolvedValueOnce({
      username: 'jwt-session',
      password: JSON.stringify({
        accessToken: 'access.jwt',
        refreshToken: 'refresh.jwt',
      }),
    });
    await expect(getTokens()).resolves.toEqual({
      accessToken: 'access.jwt',
      refreshToken: 'refresh.jwt',
    });
    await clearTokens();
    expect(Keychain.resetGenericPassword).toHaveBeenCalled();
  });

  test('uses backend error codes instead of backend English messages', () => {
    const error = {
      response: {
        data: { error: { code: 'ACCOUNT_INACTIVE', message: 'ignored' } },
      },
    };
    expect(getApiErrorCode(error)).toBe('ACCOUNT_INACTIVE');
    expect(
      translateApiError(
        key => ({ 'apiErrors.ACCOUNT_INACTIVE': 'translated' }[key] || key),
        error,
      ),
    ).toBe('translated');
  });
});
