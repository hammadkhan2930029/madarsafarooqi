import apiClient from '../api/client';
import { normalizeBranchCode } from '../Utils/validationSchemas';

const mapBranch = branch => ({
  ...branch,
  class_count: Number(branch.classCount || 0),
  classes: (branch.classes || []).map(item => ({
    ...item,
    status: String(item.status || '').toLowerCase(),
  })),
  status: String(branch.status || '').toLowerCase(),
  created_at: branch.createdAt,
  updated_at: branch.updatedAt,
  created_by: branch.createdById,
});

export const listBranches = async ({
  search = '',
  status = 'all',
  page = 1,
  limit = 20,
} = {}) => {
  const response = await apiClient.get('/branches', {
    params: {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(status !== 'all' ? { status: status.toUpperCase() } : {}),
      page,
      limit,
    },
  });
  return {
    items: response.data.data.map(mapBranch),
    pagination: response.data.meta,
  };
};

// Existing Class/Teacher/Student modules expect an array until their REST migrations are completed.
export const getBranches = async () => {
  const first = await listBranches({ limit: 100 });
  const items = [...first.items];
  for (let page = 2; page <= first.pagination.totalPages; page += 1) {
    items.push(...(await listBranches({ page, limit: 100 })).items);
  }
  return items;
};

export const getBranch = async id =>
  mapBranch((await apiClient.get(`/branches/${id}`)).data.data);

export const createBranch = async values =>
  mapBranch(
    (
      await apiClient.post('/branches', {
        name: values.name.trim(),
        code: normalizeBranchCode(values.code),
        address: values.address.trim(),
        contact: String(values.contact || '').trim() || null,
        classes: values.classes.map(name => name.trim()),
      })
    ).data.data,
  );

export const updateBranch = async (id, values) =>
  mapBranch(
    (
      await apiClient.patch(`/branches/${id}`, {
        name: values.name.trim(),
        address: values.address.trim(),
        contact: String(values.contact || '').trim() || null,
      })
    ).data.data,
  );

export const updateBranchStatus = async (id, status) =>
  mapBranch(
    (
      await apiClient.patch(`/branches/${id}/status`, {
        status: status.toUpperCase(),
      })
    ).data.data,
  );
