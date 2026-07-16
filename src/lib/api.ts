import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL as string

async function request<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...(options?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? body.message ?? `Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  me: () => request<{ data: AdminUser }>('/me'),

  analytics: {
    engagement:        () => request('/analytics/engagement'),
    matchFunnel:       () => request('/analytics/match-funnel'),
    growth:            (days = 30) => request(`/analytics/growth?days=${days}`),
    activeUsers:       () => request('/analytics/active-users'),
    genderSplit:       () => request('/analytics/gender-split'),
    subscriptionSplit: () => request('/analytics/subscription-split'),
  },

  moderation: {
    reports:         (limit = 50) => request(`/moderation/reports?limit=${limit}`),
    flaggedMessages: (limit = 50) => request(`/moderation/flagged-messages?limit=${limit}`),
    blocks:          (limit = 50) => request(`/moderation/blocks?limit=${limit}`),
    userSanctions:   (userId: string) => request(`/moderation/users/${userId}/sanctions`),
    warn:            (userId: string, reason: string) =>
      request(`/moderation/users/${userId}/warn`, { method: 'POST', body: JSON.stringify({ reason }) }),
    suspend:         (userId: string, duration_hours: number, reason: string) =>
      request(`/moderation/users/${userId}/suspend`, { method: 'POST', body: JSON.stringify({ duration_hours, reason }) }),
    ban:             (userId: string, reason: string) =>
      request(`/moderation/users/${userId}/ban`, { method: 'POST', body: JSON.stringify({ reason }) }),
    revokeSanction:  (sanctionId: string) =>
      request(`/moderation/sanctions/${sanctionId}/revoke`, { method: 'POST' }),
  },

  finance: {
    summary:       () => request('/finance/subscriptions/summary'),
    subscriptions: (params?: Record<string, string>) =>
      request(`/finance/subscriptions${params ? `?${new URLSearchParams(params)}` : ''}`),
    growth:        (days = 30) => request(`/finance/subscriptions/growth?days=${days}`),
    churn:         (days = 30) => request(`/finance/subscriptions/churn?days=${days}`),
    expiring:      (days = 7)  => request(`/finance/subscriptions/expiring?days=${days}`),
  },

  users: {
    list:      (params?: Record<string, string>) =>
      request(`/users${params ? `?${new URLSearchParams(params)}` : ''}`),
    counts:    () => request('/users/summary/counts'),
    get:       (id: string) => request(`/users/${id}`),
    reports:   (id: string) => request(`/users/${id}/reports`),
    messages:  (id: string) => request(`/users/${id}/messages`),
    sanctions: (id: string) => request(`/users/${id}/sanctions`),
    patch:     (id: string, body: Record<string, unknown>) =>
      request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
}

export interface AdminUser {
  id:           string
  user_id:      string
  email:        string
  full_name:    string | null
  role:         'viewer' | 'support' | 'moderator' | 'admin' | 'super_admin'
  created_at:   string
  last_seen_at: string | null
}
