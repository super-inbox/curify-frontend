import { apiClient } from './api';

export const savedItemsService = {
  async save(contentId: string, contentType: string): Promise<void> {
    await apiClient.request('/user/saved-items', {
      method: 'POST',
      body: JSON.stringify({ content_id: contentId, content_type: contentType }),
    });
  },

  async unsave(contentId: string): Promise<void> {
    await apiClient.request(`/user/saved-items/${encodeURIComponent(contentId)}`, {
      method: 'DELETE',
    });
  },
};
