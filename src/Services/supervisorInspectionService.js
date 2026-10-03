import apiClient from '../api/client';
export const getInspectionOptions = async () =>
  (await apiClient.get('/supervisor/inspections/options')).data.data;
export const submitInspection = async values =>
  (
    await apiClient.post('/supervisor/inspections', {
      ...values,
      remarks: values.remarks.trim() || null,
    })
  ).data.data;
export const getMyInspections = async (page = 1) => {
  const response = await apiClient.get('/supervisor/inspections/me', {
    params: { page, limit: 20 },
  });
  return { items: response.data.data, pagination: response.data.meta };
};
export const getInspection = async id =>
  (await apiClient.get(`/supervisor/inspections/${id}`)).data.data;
