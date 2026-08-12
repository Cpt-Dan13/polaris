import { useState, useMemo } from 'react';
import { XCircle, UserCheck, CheckCircle2, TrendingDown, Search } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tier   = 'Orbit' | 'Nova' | 'Supernova';
type Status = 'pending' | 'saved' | 'approved';
type Window = 'all' | '< 24h' | '24–48h' | '48h+';

interface CancellationRecord {
  id:           string;
  user:         { name: string; email: string };
  tier:         Tier;
  amount:       number;
  reason:       string;
  requested_at: string;
  status:       Status;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const ago = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

const MOCK: CancellationRecord[] = [
  { id: 'c01', user: { name: 'James Carter',   email: 'james.c@gmail.com'   }, tier: 'Supernova', amount: 39.99, reason: 'Too expensive',       requested_at: ago(2),   status: 'pending'  },
  { id: 'c02', user: { name: 'Elijah Fox',      email: 'elijah.f@gmail.com'  }, tier: 'Nova',      amount: 19.99, reason: 'Not enough matches',   requested_at: ago(5),   status: 'pending'  },
  { id: 'c03', user: { name: 'Amara Diallo',    email: 'amara.d@icloud.com'  }, tier: 'Orbit',     amount: 9.99,  reason: 'Taking a break',       requested_at: ago(11),  status: 'pending'  },
  { id: 'c04', user: { name: 'Derek Osei',      email: 'derek.o@gmail.com'   }, tier: 'Orbit',     amount: 9.99,  reason: 'Taking a break',       requested_at: ago(15),  status: 'saved'    },
  { id: 'c05', user: { name: 'Mia Rodriguez',   email: 'mia.r@outlook.com'   }, tier: 'Nova',      amount: 19.99, reason: 'Not enough matches',   requested_at: ago(20),  status: 'pending'  },
  { id: 'c06', user: { name: 'Sofia Laurent',   email: 'sofia.l@icloud.com'  }, tier: 'Supernova', amount: 39.99, reason: 'Found another app',    requested_at: ago(30),  status: 'pending'  },
  { id: 'c07', user: { name: 'Aiden Park',      email: 'aiden.p@gmail.com'   }, tier: 'Nova',      amount: 19.99, reason: 'Met someone',          requested_at: ago(36),  status: 'saved'    },
  { id: 'c08', user: { name: 'Nina Walsh',      email: 'nina.w@yahoo.com'    }, tier: 'Orbit',     amount: 9.99,  reason: 'Technical issues',     requested_at: ago(44),  status: 'approved' },
  { id: 'c09', user: { name: 'Carlos Mendes',   email: 'carlos.m@gmail.com'  }, tier: 'Supernova', amount: 39.99, reason: 'Too expensive',        requested_at: ago(52),  status: 'approved' },
  { id: 'c10', user: { name: 'Leila Hassan',    email: 'leila.h@outlook.com' }, tier: 'Nova',      amount: 19.99, reason: 'App too complex',      requested_at: ago(72),  status: 'saved'    },
  { id: 'c11', user: { name: 'Tyler Brooks',    email: 'tyler.b@gmail.com'   }, tier: 'Orbit',     amount: 9.99,  reason: 'Privacy concerns',     requested_at: ago(96),  status: 'approved' },
  { id: 'c12', user: { name: 'Priya Sharma',    email: 'priya.s@gmail.com'   }, tier: 'Supernova', amount: 39.99, reason: 'Too expensive',        requested_at: ago(120), status: 'approved' },
  { id: 'c13', user: { name: 'Marcus Webb',     email: 'marcus.w@gmail.com'  }, tier: 'Nova',      amount: 19.99, reason: 'Found another app',    requested_at: ago(144), status: 'approved' },
  { id: 'c14', user: { name: 'Zara Mitchell',   email: 'zara.m@icloud.com'   }, tier: 'Supernova', amount: 39.99, reason: 'Not enough matches',   requested_at: ago(168), status: 'saved'    },
  { id: 'c15', user: { name: 'Leo Nakamura',    email: 'leo.n@gmail.com'     }, tier: 'Orbit',     amount: 9.99,  reason: 'Taking a break',       requested_at: ago(200), status: 'approved' },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const GREEN  = '#4caf50';
const SLATE  = '#78909c';
const TEAL   = '#00897b';
const BLUE   = '#1565c0';

const TIER_META: Record<Tier, { color: string; bg: string; price: string }> = {
  Orbit:     { color: TEAL,  bg: `${TEAL}18`,  price: '$9.99/mo'  },
  Nova:      { color: BLUE,  bg: `${BLUE}18`,  price: '$19.99/mo' },
  Supernova: { color: GOLD,  bg: `${GOLD}20`,  price: '$39.99/mo' },
};

const STATUS_META: Record<Status, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: '#f9a825', bg: 'rgba(249,168,37,0.12)'  },
  saved:    { label: 'Saved',    color: GREEN,     bg: 'rgba(76,175,80,0.12)'   },
  approved: { label: 'Approved', color: SLATE,     bg: 'rgba(120,144,156,0.12)' },
};

const WINDOW_META: Record<string, { color: string; bg: string }> = {
  '< 24h':  { color: ACCENT, bg: 'rgba(233,69,96,0.1)'    },
  '24–48h': { color: GOLD,   bg: 'rgba(200,151,43,0.12)'  },
  '48h+':   { color: SLATE,  bg: 'rgba(120,144,156,0.1)'  },
};

const AVATAR_PALETTE = [ACCENT, GOLD, '#9c27b0', BLUE, TEAL, '#d84315', '#558b2f', '#6a1b9a'];

function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function diffHours(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

function getWindow(iso: string): '< 24h' | '24–48h' | '48h+' {
  const h = diffHours(iso);
  if (h < 24) return '< 24h';
  if (h < 48) return '24–48h';
  return '48h+';
}

function relativeTime(iso: string) {
  const h = diffHours(iso);
  if (h < 1)   return `${Math.round(h * 60)}m ago`;
  if (h < 24)  return `${Math.floor(h)}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmtCurrency(n: number) {
  return `$${n.toFixed(2)}`;
}

// ── Reasons breakdown ─────────────────────────────────────────────────────────

function ReasonsBreakdown({ data }: { data: CancellationRecord[] }) {
  const counts: Record<string, number> = {};
  for (const r of data) counts[r.reason] = (counts[r.reason] ?? 0) + 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max    = sorted[0]?.[1] ?? 1;

  return (
    <div className="card p-5">
      <h3 className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-secondary)' }}>
        Cancellation Reasons
      </h3>
      <div className="flex flex-col gap-3">
        {sorted.map(([reason, count]) => {
          const pct = Math.round((count / data.length) * 100);
          return (
            <div key={reason}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{reason}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {count} · {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(count / max) * 100}%`, background: ACCENT }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Cancellations() {
  const [records, setRecords]         = useState<CancellationRecord[]>(MOCK);
  const [windowFilter, setWindowFilter] = useState<Window>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [search, setSearch]           = useState('');

  function act(id: string, newStatus: Status) {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter(r => {
      const win = getWindow(r.requested_at);
      if (windowFilter !== 'all' && win !== windowFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (q && !r.user.name.toLowerCase().includes(q) &&
               !r.user.email.toLowerCase().includes(q) &&
               !r.tier.toLowerCase().includes(q) &&
               !r.reason.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [records, windowFilter, statusFilter, search]);

  const totalCount   = records.length;
  const pendingCount = records.filter(r => r.status === 'pending').length;
  const savedCount   = records.filter(r => r.status === 'saved').length;
  const approvedCount= records.filter(r => r.status === 'approved').length;
  const saveRate     = approvedCount + savedCount > 0
    ? Math.round((savedCount / (savedCount + approvedCount)) * 100)
    : 0;
  const revenueAtRisk = records
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const kpis = [
    { label: 'Total MTD',       value: totalCount,                icon: TrendingDown, color: ACCENT, bg: 'rgba(233,69,96,0.12)'  },
    { label: 'Pending Review',  value: pendingCount,              icon: XCircle,      color: '#f9a825', bg: 'rgba(249,168,37,0.12)' },
    { label: 'Saved',           value: savedCount,                icon: UserCheck,    color: GREEN,  bg: 'rgba(76,175,80,0.12)'  },
    { label: 'Save Rate',       value: `${saveRate}%`,            icon: CheckCircle2, color: BLUE,   bg: `${BLUE}18`             },
  ];

  const WINDOWS: Window[] = ['all', '< 24h', '24–48h', '48h+'];
  const STATUSES: (Status | 'all')[] = ['all', 'pending', 'saved', 'approved'];

  return (
    <div className="p-6 space-y-5">

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                   style={{ background: k.bg }}>
                <Icon size={15} style={{ color: k.color }} />
              </div>
              <div className="text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue at risk banner */}
      {revenueAtRisk > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
             style={{ background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.2)' }}>
          <XCircle size={15} style={{ color: ACCENT, flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            <span className="font-bold" style={{ color: ACCENT }}>{fmtCurrency(revenueAtRisk)}/mo</span>
            {' '}in subscriptions pending review — {pendingCount} {pendingCount === 1 ? 'request' : 'requests'} awaiting action.
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* Main table */}
        <div className="flex-1 min-w-0 space-y-3">

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">

            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-light)' }} />
              <input
                type="text"
                placeholder="Search name, email, reason…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg text-xs"
                style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', outline: 'none', width: 220,
                }}
              />
            </div>

            {/* Window filter */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--card)' }}>
              {WINDOWS.map(w => {
                const active = windowFilter === w;
                const color  = w === 'all' ? ACCENT : (WINDOW_META[w]?.color ?? SLATE);
                return (
                  <button key={w} onClick={() => setWindowFilter(w)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                    style={{ background: active ? color : 'transparent', color: active ? '#fff' : 'var(--text-secondary)' }}>
                    {w === 'all' ? 'All Time' : w}
                  </button>
                );
              })}
            </div>

            {/* Status filter */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--card)' }}>
              {STATUSES.map(s => {
                const active = statusFilter === s;
                const color  = s === 'all' ? ACCENT : STATUS_META[s].color;
                return (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all"
                    style={{ background: active ? color : 'transparent', color: active ? '#fff' : 'var(--text-secondary)' }}>
                    {s === 'all' ? 'All Status' : STATUS_META[s].label}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Table */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Tier', 'Requested', 'Window', 'Reason', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold"
                        style={{ color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center" style={{ color: 'var(--text-light)' }}>
                      No cancellations match the current filters.
                    </td>
                  </tr>
                ) : filtered.map(r => {
                  const sm   = STATUS_META[r.status];
                  const tm   = TIER_META[r.tier];
                  const win  = getWindow(r.requested_at);
                  const wm   = WINDOW_META[win];
                  const bg   = avatarColor(r.user.name);
                  const initials = r.user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>

                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                               style={{ background: bg, fontSize: 10 }}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.user.name}</div>
                            <div style={{ color: 'var(--text-light)' }}>{r.user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Tier */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="px-2 py-0.5 rounded-full font-semibold inline-block w-fit"
                                style={{ background: tm.bg, color: tm.color }}>
                            {r.tier}
                          </span>
                          <span style={{ color: 'var(--text-light)', fontSize: 10 }}>{tm.price}</span>
                        </div>
                      </td>

                      {/* Requested */}
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {relativeTime(r.requested_at)}
                      </td>

                      {/* Window */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded font-semibold"
                              style={{ background: wm.bg, color: wm.color }}>
                          {win}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                        {r.reason}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full font-semibold"
                              style={{ background: sm.bg, color: sm.color }}>
                          {sm.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        {r.status === 'pending' ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => act(r.id, 'saved')}
                              className="px-2.5 py-1 rounded text-xs font-semibold transition-all hover:brightness-90 active:scale-95"
                              style={{ background: GREEN, color: '#fff' }}>
                              Save
                            </button>
                            <button
                              onClick={() => act(r.id, 'approved')}
                              className="px-2.5 py-1 rounded text-xs font-semibold transition-all hover:brightness-90 active:scale-95"
                              style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                              Approve
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-light)' }}>—</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reasons sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <ReasonsBreakdown data={records} />
        </div>

      </div>
    </div>
  );
}
