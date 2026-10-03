/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import LoginScreen from '../src/Screens/Auth/LoginScreen';
import { LocalizationProvider } from '../src/localization/i18n';
import { AuthProvider } from '../src/context/AuthContext';

test('renders correctly', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
}, 60000);

test('login has no public signup or forgot-password actions', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <LocalizationProvider fallback={null}>
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>
      </LocalizationProvider>,
    );
  });

  const loginScreen = JSON.stringify(renderer.toJSON());
  expect(loginScreen).toContain('contact the Super Admin');
  expect(loginScreen).not.toContain('Password bhool gaye?');
  expect(loginScreen).not.toContain('Super Admin signup');
  expect(loginScreen).not.toContain('Create Super Admin Account');

  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
}, 60000);
