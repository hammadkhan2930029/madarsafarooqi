import { Platform } from 'react-native';

const runtimeEnv = typeof process !== 'undefined' ? process.env || {} : {};
const localDevelopmentHost = '192.168.18.10';
const developmentBaseUrl =
  Platform.OS === 'android'
    ? `http://${localDevelopmentHost}:4000/api`
    : 'http://localhost:4000/api';

const apiBaseUrls = Object.freeze({
  live: 'https://farooqi.naturalmusclesgym.com/api',
  local: developmentBaseUrl,
});

// const selectedBaseUrl = apiBaseUrls.live;
const selectedBaseUrl = apiBaseUrls.local;
// Local backend use karne ke liye upar wali line comment aur neeche wali uncomment karein.
// const selectedBaseUrl = apiBaseUrls.local;

export const env = Object.freeze({
  API_BASE_URL: runtimeEnv.API_BASE_URL || selectedBaseUrl,
  API_TIMEOUT_MS: Number(runtimeEnv.API_TIMEOUT_MS || 15000),
  APP_TIMEZONE: runtimeEnv.APP_TIMEZONE || 'Asia/Karachi',
});
