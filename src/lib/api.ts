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
    swipes:            (period: 'week' | 'month' | 'year' = 'week') =>
      request<SwipeAnalyticsData>(`/analytics/swipes?period=${period}`),
    profiles:          () => request<ProfileAnalyticsData>('/analytics/profiles'),
    insights:          () => request<ProfileInsightsData>('/analytics/insights'),
    health:            () => request<ProfileHealthData>('/analytics/insights/health'),
    correlations:      () => request<CorrelationLifts>('/analytics/insights/correlations'),
    activeUserKPIs:    () => request<ActiveUserKPIs>('/analytics/active-users/kpis'),
    activeUserTrend:    (period: 'week' | 'month' | 'year') => request<TrendData>(`/analytics/active-users/trend?period=${period}`),
    activeUserTopUsers:  (limit = 10) => request<TopActiveUser[]>(`/analytics/active-users/top-users?limit=${limit}`),
    acquisitionKPIs:     () => request<AcquisitionKPIs>('/analytics/acquisition/kpis'),
    acquisitionSignups:  () => request<AcquisitionSignups>('/analytics/acquisition/signups'),
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

export interface DistBucket { label: string; pct: number }

export interface TopPerformingEntry         { id: string; name: string; initials: string; photo_url: string | null; stars: number; likes: number }
export interface MostPopularEntry           { id: string; name: string; initials: string; photo_url: string | null; views: number }
export interface MostDislikedEntry          { id: string; name: string; initials: string; photo_url: string | null; passes: number }
export interface MostReportedEntry          { id: string; name: string; initials: string; photo_url: string | null; reports: number; blocks: number; severity: 'high' | 'medium' | 'low' }
export interface ConstellationTopEntry      { id: string; name: string; initials: string; photo_url: string | null; member_count: number; stars: number; likes: number }
export interface ConstellationPopularEntry  { id: string; name: string; initials: string; photo_url: string | null; member_count: number; views: number }
export interface ConstellationReportedEntry { id: string; name: string; initials: string; photo_url: string | null; member_count: number; reports: number; blocks: number; severity: 'high' | 'medium' | 'low' }
export interface ConstellationDislikedEntry { id: string; name: string; initials: string; photo_url: string | null; member_count: number; passes: number }

export interface ProfileAnalyticsData {
  patriarch: {
    avg_cm: number | null; mode_cm: number | null
    avg_age: number | null; mode_age: number | null
    height_dist:    { dist: DistBucket[]; mostIdx: number }
    age_dist:       { dist: DistBucket[]; mostIdx: number }
    ethnicity_dist: DistBucket[]
    top_performing: TopPerformingEntry[]
    most_popular:   MostPopularEntry[]
    most_disliked:  MostDislikedEntry[]
    most_reported:  MostReportedEntry[]
  }
  muse: {
    avg_cm: number | null; mode_cm: number | null
    avg_age: number | null; mode_age: number | null
    height_dist:    { dist: DistBucket[]; mostIdx: number }
    age_dist:       { dist: DistBucket[]; mostIdx: number }
    ethnicity_dist: DistBucket[]
    top_performing: TopPerformingEntry[]
    most_popular:   MostPopularEntry[]
    most_disliked:  MostDislikedEntry[]
    most_reported:  MostReportedEntry[]
  }
  constellation: {
    top_performing: ConstellationTopEntry[]
    most_popular:   ConstellationPopularEntry[]
    most_reported:  ConstellationReportedEntry[]
    most_disliked:  ConstellationDislikedEntry[]
  }
}

export interface ProfileInsightsFunnel { label: string; count: number }
export interface ProfileInsightsData {
  patriarch:     { funnel: ProfileInsightsFunnel[] }
  muse:          { funnel: ProfileInsightsFunnel[] }
  constellation: { funnel: ProfileInsightsFunnel[] }
}

export interface HealthSignal { label: string; score: number; detail: string }
export interface ProfileHealthData {
  patriarch:     { overall: number; signals: HealthSignal[] }
  muse:          { overall: number; signals: HealthSignal[] }
  constellation: { overall: number; signals: HealthSignal[] }
}

export interface AcquisitionSignups {
  labels:           string[]
  patriarchs:       number[]
  muses:            number[]
  constellations:   number[]
  this_month_total: number
}

export interface AcquisitionKPIs {
  new_users_month:     number
  new_users_delta:     number
  mom_growth_rate:     number
  mom_growth_delta:    number
  dau_mau_ratio:       number
  dau_mau_delta:       number
  monthly_churn:       number
  monthly_churn_delta: number
}

export interface TopActiveUser {
  user_id:              string
  name:                 string
  initials:             string
  type:                 string
  photo_url:            string | null
  sessions:             number
  avg_duration_seconds: number
  total_seconds:        number
}

export interface TrendData {
  labels:         string[]
  total:          number[]
  patriarchs:     number[]
  muses:          number[]
  constellations: number[]
  monthly_avg:    number
  yearly_avg:     number
}

export interface ActiveUserKPIs {
  online_now:          number
  sessions_today:      number
  avg_session_seconds: number
  peak_today:          number
  peak_today_at:       string | null
  hourly:              number[]
}

export interface CorrelationLifts {
  prompt_answers:    number | null
  bio_length:        number | null
  premium:           number | null
  religion_politics: number | null
  active_30d:        number | null
  ethnicity:         number | null
  has_children:      number | null
  vices:             number | null
  height:            number | null
}

export interface SwipeAnalyticsData {
  kpis: {
    total_swipes_today: number
    like_rate:          number
    match_rate:         number
    super_likes_today:  number
  }
  decisions: {
    like_pct:       number
    pass_pct:       number
    super_like_pct: number
  }
  volume: {
    labels:  string[]
    likes:   number[]
    passes:  number[]
  }
  funnel: {
    total_swipes:  number
    likes:         number
    matches:       number
    conversations: number
    active_chats:  number
  }
  hourly:    number[]
  top_liked: { user_id: string; first_name: string; last_name: string | null; likes: number }[]
  by_type: {
    patriarch:     { swipes: number; like_rate: number; match_rate: number; avg_daily: number }
    muse:          { swipes: number; like_rate: number; match_rate: number; avg_daily: number }
    constellation: { swipes: number; like_rate: number; match_rate: number; avg_daily: number }
  }
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
