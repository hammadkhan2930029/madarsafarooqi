import axios from 'axios';

import { env } from '../Config/env';
import { loadLanguage } from '../localization/languageStorage';
import { clearTokens, getTokens, saveTokens } from '../storage/tokenStorage';
import { beginRequest, endRequest } from '../Utils/uiFeedback';

const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT_MS,
});
const refreshClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT_MS,
});

let accessToken = null;
let refreshPromise = null;
let sessionInvalidHandler = () => {};

export const setAccessToken = token => {
  accessToken = token || null;
};
export const setSessionInvalidHandler = handler => {
  sessionInvalidHandler = handler || (() => {});
};

const languageHeader = async () => (await loadLanguage()) || 'en';

export const requestWithoutAuth = async config =>
  refreshClient({
    ...config,
    headers: { ...config.headers, 'Accept-Language': await languageHeader() },
  });

const permanentlyInvalid = error => {
  const code = error.response?.data?.error?.code;
  return (
    [
      'INVALID_REFRESH_TOKEN',
      'TOKEN_EXPIRED',
      'ACCOUNT_INACTIVE',
      'INVALID_TOKEN',
    ].includes(code) || [401, 403].includes(error.response?.status)
  );
};

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const tokens = await getTokens();
      if (!tokens?.refreshToken) {
        setAccessToken(null);
        await clearTokens();
        sessionInvalidHandler();
        throw new Error('NO_REFRESH_TOKEN');
      }
      try {
        const response = await refreshClient.post(
          '/auth/refresh',
          { refreshToken: tokens.refreshToken },
          { headers: { 'Accept-Language': await languageHeader() } },
        );
        const nextTokens = response.data.data;
        await saveTokens(nextTokens);
        setAccessToken(nextTokens.accessToken);
        return nextTokens.accessToken;
      } catch (error) {
        if (permanentlyInvalid(error)) {
          setAccessToken(null);
          await clearTokens();
          sessionInvalidHandler();
        }
        throw error;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

apiClient.interceptors.request.use(async config => {
  config.headers = config.headers || {};
  config.headers['Accept-Language'] = await languageHeader();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return beginRequest(config);
});

refreshClient.interceptors.request.use(config => beginRequest(config));
refreshClient.interceptors.response.use(
  response => {
    endRequest(response.config);
    return response;
  },
  error => {
    endRequest(error.config);
    throw error;
  },
);

apiClient.interceptors.response.use(
  response => {
    endRequest(response.config);
    return response;
  },
  async error => {
    const request = error.config;
    endRequest(request);
    if (
      error.response?.status !== 401 ||
      request?._retry ||
      request?.url === '/auth/login'
    ) {
      throw error;
    }
    request._retry = true;
    request.headers.Authorization = `Bearer ${await refreshSession()}`;
    return apiClient(request);
  },
);

export default apiClient;
