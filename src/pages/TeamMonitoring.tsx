import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { api, type MonitoringMember, type MonitoringTicket } from '../lib/api';
import { ROLE_LABEL, type AdminRole } from '../lib/rbac';
import { useNavigation } from '../context/NavigationContext';

// ── Constants ─────────────────────────────────────────────────────────────────

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

const ACCENT  = '#e94560';
const GOLD    = '#c8972b';
const PURPLE  = '#9c27b0';
const BLUE    = '#1565c0';
const SLATE   = '#78909c';
const GREEN   = '#4caf50';

const ROLE_COLOR: Record<AdminRole, { color: string; bg: string }> = {
  super_admin: { color: ACCENT,  bg: 'rgba(233,69,96,0.12)'  },
  admin:       { color: GOLD,    bg: `${GOLD}20`             },
  moderator:   { color: PURPLE,  bg: `${PURPLE}18`           },
  support:     { color: BLUE,    bg: 'rgba(21,101,192,0.12)' },
  viewer:      { color: SLATE,   bg: 'rgba(120,144,156,0.12)'},
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}

function isOnline(lastSeen: string | null): boolean {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < ONLINE_THRESHOLD_MS;
}

function lastSeenLabel(lastSeen: string | null): string {
  if (!lastSeen) return 'Never';
  const diffMs  = Date.now() - new Date(lastSeen).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1)  return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)  return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ── Ticket pills ──────────────────────────────────────────────────────────────

function TicketPill({ ticket }: { ticket: MonitoringTicket }) {
  const isInProg = ticket.status === 'in-progress';
  const color    = isInProg ? BLUE : '#f9a825';

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0"
          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
      #{ticket.ref}
      {ticket.is_urgent && (
        <span style={{ color: '#f44336', fontSize: 9, fontWeight: 800 }}>!</span>
      )}
    </span>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function MemberRow({ member }: { member: MonitoringMember }) {
  const online = isOnline(member.last_seen_at);
  const rc     = ROLE_COLOR[member.role];

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>

      {/* Member */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-shrink-0">
            {member.avatar_seed ? (
              <img src={avatarUrl(member.avatar_seed)} alt=""
                   style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)' }} />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: ACCENT, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>
                {(member.full_name ?? member.email).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <span style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 9, height: 9, borderRadius: '50%',
              background: online ? GREEN : SLATE,
              border: '2px solid var(--card-bg)',
            }} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {member.full_name ?? '—'}
            </span>
            <span className="text-xs truncate" style={{ color: 'var(--text-light)' }}>
              {member.email}
            </span>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="py-3 pr-4">
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: rc.bg, color: rc.color }}>
          {ROLE_LABEL[member.role]}
        </span>
      </td>

      {/* Status */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1.5">
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: online ? GREEN : SLATE, flexShrink: 0, display: 'inline-block' }} />
          <span className="text-xs font-semibold" style={{ color: online ? GREEN : 'var(--text-light)' }}>
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
      </td>

      {/* Last seen */}
      <td className="py-3 pr-4">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {lastSeenLabel(member.last_seen_at)}
        </span>
      </td>

      {/* Active tickets */}
      <td className="py-3">
        {member.active_tickets.length === 0 ? (
          <span className="text-xs" style={{ color: 'var(--text-light)' }}>—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {member.active_tickets.map(t => <TicketPill key={t.id} ticket={t} />)}
          </div>
        )}
      </td>

    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeamMonitoring() {
  const { navigate } = useNavigation();
  const [members,     setMembers]     = useState<MonitoringMember[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const [search,      setSearch]      = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const { data } = await api.team.monitoring();
      // Sort: online first, then alphabetically
      data.sort((a, b) => {
        const aOn = isOnline(a.last_seen_at) ? 0 : 1;
        const bOn = isOnline(b.last_seen_at) ? 0 : 1;
        if (aOn !== bOn) return aOn - bOn;
        return (a.full_name ?? a.email).localeCompare(b.full_name ?? b.email);
      });
      setMembers(data);
      setLastUpdated(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(true), 30_000);
    return () => clearInterval(id);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m =>
      (m.full_name ?? '').toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  }, [members, search]);

  const onlineCount  = members.filter(m => isOnline(m.last_seen_at)).length;
  const offlineCount = members.length - onlineCount;

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>
            Team Monitoring
          </h1>
          {lastUpdated && (
            <span className="text-xs" style={{ color: 'var(--text-light)' }}>
              Updated {fmtTime(lastUpdated)}
            </span>
          )}
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-90 disabled:opacity-50"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-light)' }}>Loading…</p>
      ) : error ? (
        <p className="text-sm" style={{ color: '#f44336' }}>{error}</p>
      ) : (
        <div className="card">

          {/* Toolbar */}
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--border)' }}>

            {/* Search */}
            <div className="relative flex-1" style={{ maxWidth: 300 }}>
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-light)' }} />
              <input
                type="text"
                placeholder="Search by name, email or role…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs"
                style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', outline: 'none',
                }}
              />
            </div>

            {/* Status pills */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${GREEN}15`, color: GREEN }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, display: 'inline-block' }} />
                {onlineCount} Online
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(120,144,156,0.12)', color: SLATE }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: SLATE, display: 'inline-block' }} />
                {offlineCount} Offline
              </span>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-light)' }}>Member</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-light)' }}>Role</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-light)' }}>Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-light)' }}>Last Seen</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--text-light)' }}>Support Tickets</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-xs text-center" style={{ color: 'var(--text-light)' }}>
                      No members match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map(m => (
                    <tr
                      key={m.id}
                      onClick={() => navigate('admin-profile', { profileUserId: m.id, fromPage: 'team-monitoring' })}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                      className="transition-opacity hover:opacity-80"
                    >

                      {/* Member */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative flex-shrink-0">
                            {m.avatar_seed ? (
                              <img src={avatarUrl(m.avatar_seed)} alt=""
                                   style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)' }} />
                            ) : (
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%', background: ACCENT, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                              }}>
                                {(m.full_name ?? m.email).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span style={{
                              position: 'absolute', bottom: 0, right: 0,
                              width: 9, height: 9, borderRadius: '50%',
                              background: isOnline(m.last_seen_at) ? GREEN : SLATE,
                              border: '2px solid var(--card-bg)',
                            }} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                              {m.full_name ?? '—'}
                            </span>
                            <span className="text-xs truncate" style={{ color: 'var(--text-light)' }}>
                              {m.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: ROLE_COLOR[m.role].bg, color: ROLE_COLOR[m.role].color }}>
                          {ROLE_LABEL[m.role]}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                                         background: isOnline(m.last_seen_at) ? GREEN : SLATE }} />
                          <span className="text-xs font-semibold"
                                style={{ color: isOnline(m.last_seen_at) ? GREEN : 'var(--text-light)' }}>
                            {isOnline(m.last_seen_at) ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </td>

                      {/* Last seen */}
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {lastSeenLabel(m.last_seen_at)}
                        </span>
                      </td>

                      {/* Active tickets */}
                      <td className="px-4 py-3">
                        {m.active_tickets.length === 0 ? (
                          <span className="text-xs" style={{ color: 'var(--text-light)' }}>—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {m.active_tickets.map(t => {
                              const inProg = t.status === 'in-progress';
                              const color  = inProg ? BLUE : '#f9a825';
                              return (
                                <span key={t.id}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold"
                                      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                                  #{t.ref}
                                  {t.is_urgent && (
                                    <span style={{ color: '#f44336', fontWeight: 800, fontSize: 10 }}>!</span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}
