import apiClient from '../src/api/client';
import {
  createStudent,
  deleteStudent,
  listStudents,
  updateStudentStatus,
} from '../src/Services/studentService';

jest.mock('../src/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const apiStudent = {
  id: '1',
  admissionNo: 'ADM-001',
  name: 'Student',
  fatherName: 'Father',
  branchId: '1',
  classId: '2',
  status: 'ACTIVE',
};
describe('Student REST service', () => {
  beforeEach(() => jest.clearAllMocks());
  test('passes server-side search, filters and pagination', async () => {
    apiClient.get.mockResolvedValueOnce({
      data: { data: [apiStudent], meta: { page: 2, total: 1, totalPages: 1 } },
    });
    const result = await listStudents({
      search: 'ADM',
      branchId: '1',
      classId: '2',
      status: 'active',
      page: 2,
      limit: 10,
    });
    expect(apiClient.get).toHaveBeenCalledWith('/students', {
      params: {
        search: 'ADM',
        branchId: '1',
        classId: '2',
        status: 'ACTIVE',
        page: 2,
        limit: 10,
      },
    });
    expect(result.items[0]).toMatchObject({
      admission_no: 'ADM-001',
      status: 'active',
    });
  });
  test('normalizes admission number and never sends creator identity', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { data: apiStudent } });
    await createStudent({
      admissionNo: ' adm-001 ',
      name: ' Student ',
      fatherName: ' Father ',
      contact: '',
      branchId: '1',
      classId: '2',
    });
    expect(apiClient.post).toHaveBeenCalledWith('/students', {
      admissionNo: 'ADM-001',
      name: 'Student',
      fatherName: 'Father',
      contact: null,
      branchId: '1',
      classId: '2',
    });
  });
  test('uses dedicated status and soft-delete endpoints', async () => {
    apiClient.patch.mockResolvedValueOnce({ data: { data: apiStudent } });
    apiClient.delete.mockResolvedValueOnce({
      data: { data: { ...apiStudent, status: 'INACTIVE' } },
    });
    await updateStudentStatus('1', 'inactive');
    await deleteStudent('1');
    expect(apiClient.patch).toHaveBeenCalledWith('/students/1/status', {
      status: 'INACTIVE',
    });
    expect(apiClient.delete).toHaveBeenCalledWith('/students/1');
  });
});
