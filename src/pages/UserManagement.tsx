import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Filter, UserX, UserCheck, Mail, Loader2, ChevronLeft, ChevronRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import Badge from '../components/Badge';
import BlurhashImg from '../components/BlurhashImg';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';

const SUBJECT_SUGGESTIONS = [
  'Scheduled Maintenance Window',
  'Emergency Maintenance Notice',
  'Service Interruption Update',
  'App Update Available',
  'Community Guidelines Update',
  'Terms of Service Update',
  'Privacy Policy Update',
  'Important Safety Notice',
  'New Feature Alert',
  'Constellation Mode Update',
  'Exciting New Features Are Live',
  'App Improvements & Bug Fixes',
  'Exclusive Offer for Orbit Members',
  'Exclusive Offer for Nova Members',
  'Exclusive Offer for Supernova Members',
  'Subscription Renewal Reminder',
  'Limited Time Upgrade Offer',
  'Complete Your Profile',
  'Your Constellation Is Growing',
  'New Matches Are Waiting',
  'Tips to Improve Your Experience',
  'Important Account Notice',
  'Account Security Update',
  'Verify Your Profile',
  'Welcome to Constell8tion',
  'A Message from the Team',
  "We'd Love Your Feedback",
];

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
  const [togglingId,    setTogglingId]    = useState<string | null>(null);
  const [showWipModal,  setShowWipModal]  = useState(false);
  const [composeUser,   setComposeUser]   = useState<UserProfile | null>(null);
  const [compSubject,   setCompSubject]   = useState('');
  const [compBody,      setCompBody]      = useState('');
  const [compSending,         setCompSending]         = useState(false);
  const [compSent,            setCompSent]            = useState(false);
  const [compError,           setCompError]           = useState<string | null>(null);
  const [showSubjectSuggest,  setShowSubjectSuggest]  = useState(false);
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

  const openCompose = (user: UserProfile) => {
    setComposeUser(user);
    setCompSubject('A message from Constell8tion');
    setCompBody('');
    setCompSent(false);
    setCompError(null);
  };

  const closeCompose = () => {
    setComposeUser(null);
    setCompSending(false);
    setCompSent(false);
    setCompError(null);
    setShowSubjectSuggest(false);
  };

  const handleSendEmail = async () => {
    if (!composeUser || !compSubject.trim() || !compBody.trim()) return;
    setCompSending(true);
    setCompError(null);
    try {
      await api.email.sendToUser(composeUser.id, compSubject, compBody);
      setCompSent(true);
      setTimeout(closeCompose, 2000);
    } catch (err) {
      setCompError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setCompSending(false);
    }
  };

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
    <>
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
                        <BlurhashImg
                          src={user.photo_url ?? null}
                          blurhash={user.photo_blurhash ?? null}
                          alt={displayName(user)}
                          size={32}
                          className="rounded-full flex-shrink-0"
                          fallback={
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #1a1a2e, #e94560)' }}
                            >
                              {initials(user)}
                            </div>
                          }
                        />
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
                          title="Email user"
                          onClick={() => openCompose(user)}
                        >
                          <Mail size={13} />
                        </button>
                        <button
                          className="p-1.5 rounded transition-colors"
                          style={{
                            color:  user.is_paused ? '#4caf50' : '#f44336',
                          }}
                          title={user.is_paused ? 'Activate' : 'Pause'}
                          onClick={() => setShowWipModal(true)}
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

    {/* Compose email modal */}
    {composeUser && createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={() => !compSending && closeCompose()}
      >
        <div
          className="card rounded-2xl p-6 space-y-4"
          style={{ width: 440, maxWidth: '92vw', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-2">
            <Mail size={15} style={{ color: ACCENT }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
              Email '{displayName(composeUser)}'
            </h3>
          </div>

          {/* Recipient (readonly) */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>To</label>
            <div
              className="w-full px-3 py-2 rounded-md text-xs"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {composeUser.email}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Subject</label>
            <div className="relative">
              <input
                className="w-full pl-3 pr-9 py-2 rounded-md text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                value={compSubject}
                onChange={e => { setCompSubject(e.target.value); setShowSubjectSuggest(true); }}
                onFocus={() => setShowSubjectSuggest(true)}
                onBlur={() => setTimeout(() => setShowSubjectSuggest(false), 120)}
                onKeyDown={e => { if (e.key === 'Escape') setShowSubjectSuggest(false); }}
                disabled={compSending || compSent}
                autoComplete="off"
              />
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); setShowSubjectSuggest(v => !v); }}
                className="absolute right-2.5 top-1/2"
                style={{
                  color: 'var(--text-light)',
                  transform: `translateY(-50%) rotate(${showSubjectSuggest ? 180 : 0}deg)`,
                  transition: 'transform 0.15s',
                }}
                tabIndex={-1}
                disabled={compSending || compSent}
              >
                <ChevronDown size={14} />
              </button>

              {showSubjectSuggest && !compSending && !compSent && (() => {
                const matches = SUBJECT_SUGGESTIONS.filter(s =>
                  compSubject.trim() === '' || s.toLowerCase().includes(compSubject.toLowerCase())
                );
                return matches.length > 0 ? (
                  <div
                    className="absolute left-0 right-0 z-20 rounded-md overflow-hidden"
                    style={{
                      top: 'calc(100% + 4px)',
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                      maxHeight: 200,
                      overflowY: 'auto',
                    }}
                  >
                    {matches.map(s => (
                      <button
                        key={s}
                        type="button"
                        onMouseDown={e => { e.preventDefault(); setCompSubject(s); setShowSubjectSuggest(false); }}
                        className="w-full text-left px-3 py-2 text-sm transition-colors hover:brightness-110"
                        style={{
                          color:      compSubject === s ? ACCENT : 'var(--text)',
                          background: compSubject === s ? `${ACCENT}12` : 'transparent',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Message</label>
            <textarea
              className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              rows={5}
              placeholder="Write your message…"
              value={compBody}
              onChange={e => setCompBody(e.target.value)}
              disabled={compSending || compSent}
            />
          </div>

          {/* Error */}
          {compError && (
            <p className="text-xs px-3 py-2 rounded-md" style={{ background: `${ACCENT}15`, color: ACCENT }}>
              {compError}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={closeCompose}
              disabled={compSending}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
              style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmail}
              disabled={!compSubject.trim() || !compBody.trim() || compSending || compSent}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: compSent ? '#4caf50' : ACCENT }}
            >
              {compSent
                ? <><CheckCircle2 size={12} /> Sent!</>
                : compSending
                  ? <><Loader2 size={12} className="animate-spin" /> Sending…</>
                  : <><Mail size={12} /> Send</>
              }
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )}

    {/* WIP modal */}
    {showWipModal && createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={() => setShowWipModal(false)}
      >
        <div
          className="card p-8 flex flex-col items-center gap-3 rounded-2xl"
          style={{ maxWidth: 340, width: '90%', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
          onClick={e => e.stopPropagation()}
        >
          <span style={{ fontSize: 48, lineHeight: 1 }}>🚧</span>
          <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Work in Progress</h3>
          <p className="text-sm text-center" style={{ color: 'var(--text-light)' }}>
            This feature is under active development.
          </p>
          <button
            onClick={() => setShowWipModal(false)}
            className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97]"
            style={{ background: ACCENT }}
          >
            Got it
          </button>
        </div>
      </div>,
      document.body,
    )}
    </>
  );
}
