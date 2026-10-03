import apiClient, { requestWithoutAuth, setAccessToken } from './client';
import { clearTokens, getTokens, saveTokens } from '../storage/tokenStorage';

const dataOf = response => response.data.data;

export const login = async credentials => {
  const data = dataOf(await apiClient.post('/auth/login', credentials));
  await saveTokens(data);
  setAccessToken(data.accessToken);
  return data.user;
};

export const restoreTokens = async () => {
  const tokens = await getTokens();
  setAccessToken(tokens?.accessToken);
  return tokens;
};

export const getCurrentUser = async () =>
  dataOf(await apiClient.get('/auth/me'));

export const logout = async () => {
  const tokens = await getTokens();
  try {
    if (tokens?.refreshToken)
      await requestWithoutAuth({
        method: 'post',
        url: '/auth/logout',
        data: { refreshToken: tokens.refreshToken },
      });
  } finally {
    setAccessToken(null);
    await clearTokens();
  }
};

export const changePassword = async values => {
  await apiClient.patch('/auth/change-password', values);
  setAccessToken(null);
  await clearTokens();
};
export const acceptIjaraTerms = async version => dataOf(await apiClient.patch('/auth/accept-ijara-terms', { version: version || null }));
export const getOnboardingStatus = async () => dataOf(await apiClient.get('/auth/onboarding'));
export const uploadOnboardingProfileImage = async image => dataOf(await apiClient.post('/auth/onboarding/profile-image', image));
export const completeOnboarding = async values => dataOf(await apiClient.post('/auth/onboarding/complete', values));
