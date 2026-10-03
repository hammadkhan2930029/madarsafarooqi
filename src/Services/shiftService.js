import apiClient from '../api/client';

const mapShift = item => ({
  ...item,
  status: String(item.status || '').toLowerCase(),
});
export const listShifts = async ({
  search = '',
  status = 'all',
  page = 1,
  limit = 100,
} = {}) => {
  const response = await apiClient.get('/shifts', {
    params: {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(status !== 'all' ? { status: status.toUpperCase() } : {}),
      page,
      limit,
    },
  });
  return {
    items: response.data.data.map(mapShift),
    pagination: response.data.meta,
  };
};
export const getShifts = async () => (await listShifts()).items;
export const createShift = async values =>
  mapShift((await apiClient.post('/shifts', values)).data.data);
export const updateShift = async (id, values) =>
  mapShift((await apiClient.patch(`/shifts/${id}`, values)).data.data);
export const updateShiftStatus = async (id, status) =>
  mapShift(
    (
      await apiClient.patch(`/shifts/${id}/status`, {
        status: status.toUpperCase(),
      })
    ).data.data,
  );
