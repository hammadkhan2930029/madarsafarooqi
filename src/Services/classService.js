import apiClient from '../api/client';

const mapClass = item => ({
  ...item,
  branch_id: item.branchId,
  normalized_name: item.normalizedName,
  status: String(item.status || '').toLowerCase(),
  created_at: item.createdAt,
  updated_at: item.updatedAt,
  created_by: item.createdById,
  branch: item.branch
    ? { ...item.branch, status: String(item.branch.status || '').toLowerCase() }
    : null,
});

export const listClasses = async ({
  search = '',
  branchId = 'all',
  status = 'all',
  page = 1,
  limit = 20,
} = {}) => {
  const response = await apiClient.get('/classes', {
    params: {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(branchId !== 'all' ? { branchId } : {}),
      ...(status !== 'all' ? { status: status.toUpperCase() } : {}),
      page,
      limit,
    },
  });
  return {
    items: response.data.data.map(mapClass),
    pagination: response.data.meta,
  };
};

// Compatibility adapter for Teacher/Student modules until their REST migrations are implemented.
export const getClasses = async () => {
  const first = await listClasses({ limit: 100 });
  const items = [...first.items];
  for (let page = 2; page <= first.pagination.totalPages; page += 1) {
    items.push(...(await listClasses({ page, limit: 100 })).items);
  }
  return items;
};

export const getClass = async id =>
  mapClass((await apiClient.get(`/classes/${id}`)).data.data);

export const createClass = async values =>
  mapClass(
    (
      await apiClient.post('/classes', {
        name: values.name.trim(),
        branchId: values.branchId,
      })
    ).data.data,
  );

export const updateClass = async (id, values) =>
  mapClass(
    (
      await apiClient.patch(`/classes/${id}`, {
        name: values.name.trim(),
        branchId: values.branchId,
      })
    ).data.data,
  );

export const updateClassStatus = async (id, status) =>
  mapClass(
    (
      await apiClient.patch(`/classes/${id}/status`, {
        status: status.toUpperCase(),
      })
    ).data.data,
  );
