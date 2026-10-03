import apiClient from '../src/api/client';
import {
  createTeacher,
  resetTeacherPassword,
  updateTeacher,
} from '../src/Services/teacherService';

jest.mock('../src/api/client', () => ({
  __esModule: true,
  default: { patch: jest.fn(), post: jest.fn() },
}));

describe('Teacher REST service', () => {
  beforeEach(() => jest.clearAllMocks());

  test('sends matching password fields only to the protected reset endpoint', async () => {
    apiClient.patch.mockResolvedValueOnce({ data: { success: true } });
    await resetTeacherPassword('42', 'NewPassword2', 'NewPassword2');
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/teachers/42/reset-password',
      {
        newPassword: 'NewPassword2',
        confirmPassword: 'NewPassword2',
      },
    );
  });

  test('sends the selected designation when creating and editing a Teacher', async () => {
    const response = { id: '42', teacherType: 'SUPERVISOR', status: 'ACTIVE' };
    const values = {
      name: 'One',
      loginId: 'one',
      email: '',
      password: 'StrongPass8',
      contact: '+923001234567',
      teacherType: 'supervisor',
      branchId: '1',
      classId: '2',
      timing: '08:00 AM-02:00 PM',
      baseSalary: '100',
    };
    apiClient.post.mockResolvedValueOnce({ data: { data: response } });
    expect((await createTeacher(values)).teacher_type).toBe('supervisor');
    expect(apiClient.post.mock.calls[0][1].teacherType).toBe('SUPERVISOR');
    apiClient.patch.mockResolvedValueOnce({ data: { data: response } });
    await updateTeacher('42', values);
    expect(apiClient.patch.mock.calls[0][1].teacherType).toBe('SUPERVISOR');
  });
});
