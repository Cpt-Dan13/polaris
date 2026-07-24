import { useState, useEffect, useRef } from 'react';
import { Search, Filter, UserX, UserCheck, Mail, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import Badge from '../components/Badge';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';

const PAGE_SIZES = [10, 20, 50, 100] as const;

interface UserProfile {
  id:                   string;
  email:                string;
  first_name:           string | null;
  last_name:            string | null;
  gender:               string | null;
  subscription_tier:    'orbit' | 'nova' | 'supernova' | null;
  is_paused:            boolean;
  onboarding_completed: boolean;
  location:             string | null;
  created_at:           string;
  photo_url:            string | null;
  conversation_count:   number;
}

const TIER_BADGE: Record<string, 'neutral' | 'info' | 'gold'> = {
  orbit:     'neutral',
  nova:      'info',
  supernova: 'gold',
};

const TIER_LABEL: Record<string, string> = {
  orbit:     'Orbit',
  nova:      'Nova',
  supernova: 'Supernova',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function displayName(u: UserProfile) {
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || '—';
}

function initials(u: UserProfile) {
  const parts = [u.first_name, u.last_name].filter(Boolean);
  return parts.length ? parts.map(p => p![0]).join('').toUpperCase() : '?';
}

function userStatus(u: UserProfile): { label: string; variant: 'success' | 'warning' | 'error' } {
  if (u.is_paused)             return { label: 'Paused',     variant: 'warning' };
  if (!u.onboarding_completed) return { label: 'Incomplete', variant: 'warning' };
  return                              { label: 'Active',     variant: 'success' };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserManagement() {
  const [users,        setUsers]        = useState<UserProfile[]>([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter,   setTierFilter]   = useState('all');
  const [togglingId,   setTogglingId]   = useState<string | null>(null);
  const [page,         setPage]         = useState(1);
  const [pageSize,     setPageSize]     = useState<typeof PAGE_SIZES[number]>(20);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, total);

  const fetchUsers = async (q: string, status: string, tier: string, pg: number, ps: number) => {
    setLoading(true);
    const offset = (pg - 1) * ps;
    const params: Record<string, string> = { limit: String(ps), offset: String(offset) };
    if (q)                   params.search = q;
    if (tier !== 'all')      params.tier   = tier;
    if (status === 'active') params.paused = 'false';
    if (status === 'paused') params.paused = 'true';
    try {
      const res = await api.users.list(params) as { data: UserProfile[]; count: number };
      setUsers(res.data ?? []);
      setTotal(res.count ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, tierFilter, pageSize]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => fetchUsers(search, statusFilter, tierFilter, page, pageSize),
      300,
    );
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, statusFilter, tierFilter, page, pageSize]);

  const togglePause = async (user: UserProfile) => {
    setTogglingId(user.id);
    try {
      await api.users.patch(user.id, { is_paused: !user.is_paused });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_paused: !u.is_paused } : u));
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md text-sm outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={13} style={{ color: 'var(--text-secondary)' }} />
          {['all', 'active', 'paused'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all"
              style={{
                background: statusFilter === s ? `${ACCENT}1a` : 'transparent',
                color:      statusFilter === s ? ACCENT : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Tier filter */}
        <div className="flex gap-1">
          {(['all', 'orbit', 'nova', 'supernova'] as const).map(p => (
            <button
              key={p}
              onClick={() => setTierFilter(p)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background: tierFilter === p ? `${GOLD}1f` : 'transparent',
                color:      tierFilter === p ? GOLD : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {p === 'all' ? 'All Plans' : TIER_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card card-static overflow-hidden">

        {/* Table header row */}
        <div className="px-5 py-3 border-b flex items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {loading
              ? 'Loading…'
              : total === 0
                ? 'No users found'
                : `Showing ${rangeStart}–${rangeEnd} of ${total.toLocaleString()} users`
            }
          </span>

          <div className="flex items-center gap-3">
            {loading && <Loader2 size={13} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />}

            {/* Page size picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Show</span>
              <div className="flex gap-1">
                {PAGE_SIZES.map(n => (
                  <button
                    key={n}
                    onClick={() => setPageSize(n)}
                    className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                    style={{
                      background: pageSize === n ? `${ACCENT}1a` : 'transparent',
                      color:      pageSize === n ? ACCENT : 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">User</th>
                <th className="text-left">Plan</th>
                <th className="text-left">Status</th>
                <th className="text-left">Country</th>
                <th className="text-right">Conversations</th>
                <th className="text-left">Joined</th>
                <th className="text-left">Last Seen</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const status = userStatus(user);
                return (
                  <tr key={user.id}>

                    {/* User */}
                    <td>
                      <div className="flex items-center gap-3">
                        {user.photo_url ? (
                          <img
                            src={user.photo_url}
                            alt={displayName(user)}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #1a1a2e, #e94560)' }}
                          >
                            {initials(user)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{displayName(user)}</div>
                          <div className="text-xs" style={{ color: 'var(--text-light)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td>
                      {user.subscription_tier
                        ? <Badge label={TIER_LABEL[user.subscription_tier]} variant={TIER_BADGE[user.subscription_tier]} />
                        : <Badge label="Free" variant="neutral" />
                      }
                    </td>

                    {/* Status */}
                    <td><Badge label={status.label} variant={status.variant} dot /></td>

                    {/* Country */}
                    <td>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {user.location ?? '—'}
                      </span>
                    </td>

                    {/* Conversations */}
                    <td className="text-right">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {user.conversation_count.toLocaleString()}
                      </span>
                    </td>

                    {/* Joined */}
                    <td>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(user.created_at)}
                      </span>
                    </td>

                    {/* Last Seen — not yet in schema */}
                    <td>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>—</span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 rounded transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          title="Email"
                        >
                          <Mail size={13} />
                        </button>
                        <button
                          className="p-1.5 rounded transition-colors"
                          style={{
                            color:   user.is_paused ? '#4caf50' : '#f44336',
                            opacity: togglingId === user.id ? 0.5 : 1,
                            cursor:  togglingId === user.id ? 'not-allowed' : 'pointer',
                          }}
                          title={user.is_paused ? 'Activate' : 'Pause'}
                          onClick={() => togglePause(user)}
                          disabled={togglingId === user.id}
                        >
                          {user.is_paused ? <UserCheck size={13} /> : <UserX size={13} />}
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8" style={{ color: 'var(--text-light)' }}>
                    No users match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
        {totalPages > 1 && (
          <div
            className="px-5 py-3 border-t flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages.toLocaleString()}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1.5 rounded text-xs font-medium transition-all disabled:opacity-30"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                First
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded transition-all disabled:opacity-30"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                <ChevronLeft size={14} />
              </button>

              {/* Page number pills */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pg: number;
                if (totalPages <= 5) {
                  pg = i + 1;
                } else if (page <= 3) {
                  pg = i + 1;
                } else if (page >= totalPages - 2) {
                  pg = totalPages - 4 + i;
                } else {
                  pg = page - 2 + i;
                }
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className="min-w-[30px] px-2 py-1.5 rounded text-xs font-medium transition-all"
                    style={{
                      background: pg === page ? ACCENT : 'transparent',
                      color:      pg === page ? '#fff' : 'var(--text-secondary)',
                      border: `1px solid ${pg === page ? ACCENT : 'var(--border)'}`,
                    }}
                  >
                    {pg}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded transition-all disabled:opacity-30"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1.5 rounded text-xs font-medium transition-all disabled:opacity-30"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
