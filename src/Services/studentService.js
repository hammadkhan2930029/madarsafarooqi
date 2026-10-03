import apiClient from '../api/client';
import { normalizeAdmissionNumber } from '../Utils/students';

const mapStudent = student => ({
  ...student,
  admission_no: student.admissionNo,
  father_name: student.fatherName,
  branch_id: student.branchId,
  class_id: student.classId,
  created_by: student.createdById,
  created_at: student.createdAt,
  updated_at: student.updatedAt,
  status: String(student.status || '').toLowerCase(),
  branch: student.branch
    ? {
        ...student.branch,
        status: String(student.branch.status || '').toLowerCase(),
      }
    : null,
  class: student.class
    ? {
        ...student.class,
        status: String(student.class.status || '').toLowerCase(),
      }
    : null,
});

export const listStudents = async ({
  search = '',
  branchId = 'all',
  classId = 'all',
  status = 'all',
  page = 1,
  limit = 20,
} = {}) => {
  const response = await apiClient.get('/students', {
    params: {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(branchId !== 'all' ? { branchId } : {}),
      ...(classId !== 'all' ? { classId } : {}),
      ...(status !== 'all' ? { status: status.toUpperCase() } : {}),
      page,
      limit,
    },
  });
  return {
    items: response.data.data.map(mapStudent),
    pagination: response.data.meta,
  };
};

export const getStudent = async id =>
  mapStudent((await apiClient.get(`/students/${id}`)).data.data);
export const getMyStudents = async ({
  search = '',
  page = 1,
  limit = 20,
} = {}) => {
  const response = await apiClient.get('/students/me', {
    params: {
      ...(search.trim() ? { search: search.trim() } : {}),
      page,
      limit,
    },
  });
  return {
    items: response.data.data.map(mapStudent),
    pagination: response.data.meta,
  };
};
export const createStudent = async values =>
  mapStudent(
    (
      await apiClient.post('/students', {
        admissionNo: normalizeAdmissionNumber(values.admissionNo),
        name: values.name.trim(),
        fatherName: values.fatherName.trim(),
        contact: values.contact.trim() || null,
        branchId: values.branchId,
        classId: values.classId,
      })
    ).data.data,
  );
export const updateStudent = async (id, values) =>
  mapStudent(
    (
      await apiClient.patch(`/students/${id}`, {
        ...(values.name !== undefined ? { name: values.name.trim() } : {}),
        ...(values.fatherName !== undefined
          ? { fatherName: values.fatherName.trim() }
          : {}),
        ...(values.contact !== undefined
          ? { contact: values.contact.trim() || null }
          : {}),
        ...(values.branchId !== undefined ? { branchId: values.branchId } : {}),
        ...(values.classId !== undefined ? { classId: values.classId } : {}),
      })
    ).data.data,
  );
export const updateStudentStatus = async (id, status) =>
  mapStudent(
    (
      await apiClient.patch(`/students/${id}/status`, {
        status: status.toUpperCase(),
      })
    ).data.data,
  );
export const deleteStudent = async id =>
  mapStudent((await apiClient.delete(`/students/${id}`)).data.data);
