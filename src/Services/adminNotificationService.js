import apiClient from '../api/client';

export const getAdminLeaveNotifications = async () =>
  (await apiClient.get('/admin/notifications')).data.data;
