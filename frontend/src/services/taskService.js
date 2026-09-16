/**
 * Task service — wraps all /api/tasks endpoints.
 */
import api from './api';

export const taskService = {
  async getTasks() {
    const response = await api.get('/api/tasks');
    return response.data;
  },

  async createTask(payload) {
    const response = await api.post('/api/tasks', payload);
    return response.data;
  },

  async updateTaskStatus(taskId, status) {
    const response = await api.patch(`/api/tasks/${taskId}/status`, { status });
    return response.data;
  },

  /** Edit title, description, and priority of a task. */
  async editTask(taskId, payload) {
    const response = await api.put(`/api/tasks/${taskId}`, payload);
    return response.data;
  },

  /** Permanently delete a task. Returns nothing (204). */
  async deleteTask(taskId) {
    await api.delete(`/api/tasks/${taskId}`);
  },
};
