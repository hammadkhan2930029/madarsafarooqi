import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import { useConfirmLogout } from '../src/hooks/useConfirmLogout';

const mockLogout = jest.fn();
jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({ logout: mockLogout }),
}));
jest.mock('../src/localization/i18n', () => ({
  useTranslation: () => ({ t: key => key }),
}));
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

test('logout waits for translated destructive confirmation', async () => {
  let confirmLogout;
  const Harness = () => {
    confirmLogout = useConfirmLogout();
    return null;
  };
  let renderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<Harness />);
  });
  ReactTestRenderer.act(() => confirmLogout());
  expect(mockLogout).not.toHaveBeenCalled();
  const buttons = Alert.alert.mock.calls[0][2];
  expect(buttons[1]).toMatchObject({
    text: 'common.logout',
    style: 'destructive',
  });
  ReactTestRenderer.act(() => buttons[1].onPress());
  expect(mockLogout).toHaveBeenCalledTimes(1);
  await ReactTestRenderer.act(() => renderer.unmount());
});
