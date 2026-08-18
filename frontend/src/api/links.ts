import { apiRequest } from './apiClient'
import type { CreateShortLinkRequest, ShortLink } from '../types/ShortLink'

export const linksApi = {
  create: (request: CreateShortLinkRequest) =>
    apiRequest<ShortLink>('/links', { method: 'POST', body: JSON.stringify(request) }),

  getAll: () => apiRequest<ShortLink[]>('/links'),

  getByCode: (code: string) => apiRequest<ShortLink>(`/links/${encodeURIComponent(code)}`),

  disable: (code: string) => apiRequest<void>(`/links/${encodeURIComponent(code)}/disable`, { method: 'PATCH' }),

  enable: (code: string) => apiRequest<void>(`/links/${encodeURIComponent(code)}/enable`, { method: 'PATCH' }),

  delete: (code: string) => apiRequest<void>(`/links/${encodeURIComponent(code)}`, { method: 'DELETE' }),
}
