import apiClient from '../api/client';

const mapTeacher = teacher => ({
  ...teacher,
  uid: teacher.id,
  branch_id: teacher.branchId,
  class_id: teacher.classId,
  shift_id: teacher.shiftId,
  base_salary: teacher.baseSalary,
  ijara_frequency: String(teacher.ijaraFrequency || 'MONTHLY').toLowerCase(),
  weekly_ijara_amount: teacher.weeklyIjaraAmount,
  monthly_allowance: teacher.monthlyAllowance,
  attendance_allowance: teacher.attendanceAllowance,
  attendance_allowance_enabled: Boolean(teacher.attendanceAllowanceEnabled),
  conveyance_allowance: teacher.conveyanceAllowance,
  medical_allowance: teacher.medicalAllowance,
  working_days: teacher.workingDays || [],
  profile_image_url: teacher.profileImageUrl,
  ijara_terms: teacher.ijaraTerms,
  ijara_terms_version: teacher.ijaraTermsVersion,
  ijara_accepted_at: teacher.ijaraAcceptedAt,
  onboarding_required: Boolean(teacher.onboardingRequired),
  onboarding_completed_at: teacher.onboardingCompletedAt,
  teacher_type: String(teacher.teacherType || 'TEACHER').toLowerCase(),
  supervisor_branch_ids: teacher.supervisorBranchIds || [],
  supervisor_branches: teacher.supervisorBranches || [],
  created_at: teacher.createdAt,
  updated_at: teacher.updatedAt,
  status: String(teacher.status || '').toLowerCase(),
  branch: teacher.branch
    ? {
        ...teacher.branch,
        status: String(teacher.branch.status || '').toLowerCase(),
      }
    : null,
  class: teacher.class
    ? {
        ...teacher.class,
        status: String(teacher.class.status || '').toLowerCase(),
      }
    : null,
});

export const listTeachers = async ({
  search = '',
  branchId = 'all',
  classId = 'all',
  status = 'all',
  teacherType = 'all',
  page = 1,
  limit = 20,
} = {}) => {
  const response = await apiClient.get('/teachers', {
    params: {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(branchId !== 'all' ? { branchId } : {}),
      ...(classId !== 'all' ? { classId } : {}),
      ...(status !== 'all' ? { status: status.toUpperCase() } : {}),
      ...(teacherType !== 'all' ? { teacherType: teacherType.toUpperCase() } : {}),
      page,
      limit,
    },
  });
  return {
    items: response.data.data.map(mapTeacher),
    pagination: response.data.meta,
  };
};

export const getTeachers = async () => {
  const first = await listTeachers({ limit: 100 });
  const items = [...first.items];
  for (let page = 2; page <= first.pagination.totalPages; page += 1) {
    items.push(...(await listTeachers({ page, limit: 100 })).items);
  }
  return items;
};

export const getTeacher = async id =>
  mapTeacher((await apiClient.get(`/teachers/${id}`)).data.data);

export const createTeacher = async values =>
  mapTeacher(
    (
      await apiClient.post('/teachers', {
        name: values.name.trim(),
        loginId: values.loginId.trim(),
        email: values.email.trim() || null,
        password: values.password,
        contact: values.contact.trim(),
        teacherType: values.teacherType.toUpperCase(),
        supervisorBranchIds:
          values.teacherType === 'supervisor' ? values.supervisorBranchIds : [],
        branchId: values.branchId,
        ...(values.classId ? { classId: values.classId } : {}),
        ...(values.shiftId ? { shiftId: values.shiftId } : {}),
        timing: values.timing.trim(),
        ...((values.ijaraFrequency || 'monthly') === 'monthly' ? { baseSalary: String(values.baseSalary).trim() } : {}),
        ijaraFrequency: (values.ijaraFrequency || 'monthly').toUpperCase(),
        weeklyIjaraAmount: values.ijaraFrequency === 'weekly' ? String(values.weeklyIjaraAmount).trim() : null,
        monthlyAllowance: String(values.monthlyAllowance || 0).trim(),
        attendanceAllowance: String(values.attendanceAllowance || 0).trim(),
        attendanceAllowanceEnabled: Boolean(values.attendanceAllowanceEnabled),
        conveyanceAllowance: String(values.conveyanceAllowance || 0).trim(),
        medicalAllowance: String(values.medicalAllowance || 0).trim(),
        ...(values.workingDays?.length ? { workingDays: values.workingDays } : {}),
        profileImageUrl: values.profileImageUrl?.trim() || null,
        ijaraTerms: values.ijaraTerms?.trim() || null,
        ijaraConditions: String(values.ijaraTerms || '').split(/\r?\n/).map(value => value.trim()).filter(Boolean),
        ijaraTermsVersion: values.ijaraTermsVersion?.trim() || null,
      })
    ).data.data,
  );

export const updateTeacher = async (id, values) =>
  mapTeacher(
    (
      await apiClient.patch(`/teachers/${id}`, {
        ...(values.name !== undefined ? { name: values.name.trim() } : {}),
        ...(values.email !== undefined
          ? { email: values.email.trim() || null }
          : {}),
        ...(values.contact !== undefined
          ? { contact: values.contact.trim() }
          : {}),
        ...(values.teacherType !== undefined
          ? { teacherType: values.teacherType.toUpperCase() }
          : {}),
        ...(values.supervisorBranchIds !== undefined
          ? {
              supervisorBranchIds:
                values.teacherType === 'supervisor'
                  ? values.supervisorBranchIds
                  : [],
            }
          : {}),
        ...(values.branchId !== undefined ? { branchId: values.branchId } : {}),
        ...(values.classId !== undefined ? { classId: values.classId } : {}),
        ...(values.shiftId !== undefined ? { shiftId: values.shiftId } : {}),
        ...(values.timing !== undefined
          ? { timing: values.timing.trim() }
          : {}),
        ...(values.baseSalary !== undefined
          ? { baseSalary: String(values.baseSalary).trim() }
          : {}),
        ...(values.ijaraFrequency !== undefined ? { ijaraFrequency: values.ijaraFrequency.toUpperCase() } : {}),
        ...(values.weeklyIjaraAmount !== undefined ? { weeklyIjaraAmount: values.ijaraFrequency === 'weekly' ? String(values.weeklyIjaraAmount).trim() : null } : {}),
        ...(values.monthlyAllowance !== undefined ? { monthlyAllowance: String(values.monthlyAllowance || 0).trim() } : {}),
        ...(values.attendanceAllowance !== undefined ? { attendanceAllowance: String(values.attendanceAllowance || 0).trim() } : {}),
        ...(values.attendanceAllowanceEnabled !== undefined ? { attendanceAllowanceEnabled: Boolean(values.attendanceAllowanceEnabled) } : {}),
        ...(values.conveyanceAllowance !== undefined ? { conveyanceAllowance: String(values.conveyanceAllowance || 0).trim() } : {}),
        ...(values.medicalAllowance !== undefined ? { medicalAllowance: String(values.medicalAllowance || 0).trim() } : {}),
        ...(values.workingDays !== undefined ? { workingDays: values.workingDays } : {}),
        ...(values.profileImageUrl !== undefined ? { profileImageUrl: values.profileImageUrl?.trim() || null } : {}),
        ...(values.ijaraTerms !== undefined ? { ijaraTerms: values.ijaraTerms?.trim() || null } : {}),
        ...(values.ijaraTerms !== undefined ? { ijaraConditions: String(values.ijaraTerms || '').split(/\r?\n/).map(value => value.trim()).filter(Boolean) } : {}),
        ...(values.onboardingRequired !== undefined ? { onboardingRequired: Boolean(values.onboardingRequired) } : {}),
        ...(values.ijaraTermsVersion !== undefined ? { ijaraTermsVersion: values.ijaraTermsVersion?.trim() || null } : {}),
      })
    ).data.data,
  );

export const updateTeacherStatus = async (id, status) =>
  mapTeacher(
    (
      await apiClient.patch(`/teachers/${id}/status`, {
        status: status.toUpperCase(),
      })
    ).data.data,
  );

export const deleteTeacher = async id =>
  mapTeacher((await apiClient.delete(`/teachers/${id}`)).data.data);

export const uploadTeacherProfileImage = async (id, image) =>
  mapTeacher(
    (
      await apiClient.post(`/teachers/${id}/profile-image`, {
        fileName: image.fileName,
        mimeType: image.mimeType,
        data: image.data,
      })
    ).data.data,
  );

export const resetTeacherPassword = async (id, newPassword, confirmPassword) =>
  (
    await apiClient.patch(`/teachers/${id}/reset-password`, {
      newPassword,
      confirmPassword,
    })
  ).data;
