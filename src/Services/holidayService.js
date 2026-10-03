import apiClient from '../api/client';
const mapHoliday = item => ({ ...item, status: String(item.status || '').toLowerCase() });
export const listHolidays = async ({ search = '', status = 'all', affectsAttendance = 'all', page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get('/holidays', { params: {
    ...(search.trim() ? { search: search.trim() } : {}), ...(status !== 'all' ? { status: status.toUpperCase() } : {}),
    ...(affectsAttendance !== 'all' ? { affectsAttendance: affectsAttendance === 'yes' } : {}), page, limit,
  } });
  return { items: response.data.data.map(mapHoliday), pagination: response.data.meta };
};
export const createHoliday = async values => mapHoliday((await apiClient.post('/holidays', values)).data.data);
export const updateHoliday = async (id, values) => mapHoliday((await apiClient.patch(`/holidays/${id}`, values)).data.data);
export const updateHolidayStatus = async (id, status) => mapHoliday((await apiClient.patch(`/holidays/${id}/status`, { status: status.toUpperCase() })).data.data);
export const deactivateHoliday = async id => mapHoliday((await apiClient.delete(`/holidays/${id}`)).data.data);
