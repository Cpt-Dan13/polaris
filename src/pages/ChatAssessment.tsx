import { useState } from 'react';
import { MessageSquare, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const GREEN  = '#4caf50';
const RED    = '#f44336';

// ─── Static data ──────────────────────────────────────────────────────────────

const kpis: { label: string; value: string; delta: string; positive: boolean; icon: React.ElementType }[] = [
  { label: 'Monitored Today', value: '4,382', delta: '+12.3%', positive: true,  icon: MessageSquare },
  { label: 'Flagged Rate',    value: '3.2%',  delta: '+0.4pp', positive: false, icon: ShieldAlert   },
  { label: 'Auto-Approved',   value: '91.4%', delta: '+1.2pp', positive: true,  icon: CheckCircle   },
  { label: 'Awaiting Review', value: '47',    delta: '+8',     positive: false, icon: Clock         },
];

const RISK_TYPES: { label: string; count: number; color: string }[] = [
  { label: 'Harassment',       count: 59, color: RED      },
  { label: 'Explicit Content', count: 39, color: ACCENT   },
  { label: 'Spam / Promo',     count: 21, color: GOLD     },
  { label: 'Solicitation',     count: 13, color: PURPLE   },
  { label: 'Potential Scam',   count: 8,  color: '#00bcd4' },
];
const TOTAL_FLAGGED = RISK_TYPES.reduce((a, r) => a + r.count, 0);

type ConvStatus = 'pending' | 'approved' | 'escalated' | 'banned';
type Severity   = 'high' | 'medium' | 'low';

interface FlaggedConv {
  id: string; user: string; muse: string; risk: string;
  severity: Severity; confidence: number; snippet: string;
  time: string; status: ConvStatus;
}

const INITIAL_CONVOS: FlaggedConv[] = [
  { id: 'CHT-4821', user: 'marcus_w',  muse: 'Isla S.',   risk: 'Harassment',       severity: 'high',   confidence: 94, snippet: '"if you don\'t reply i\'ll find where you live..."',   time: '4m ago',     status: 'pending' },
  { id: 'CHT-4819', user: 'anon_9231', muse: 'Elena R.',  risk: 'Solicitation',     severity: 'high',   confidence: 88, snippet: '"I can pay you $200 for your personal contact..."',    time: '18m ago',    status: 'pending' },
  { id: 'CHT-4802', user: 'james_ok',  muse: 'Lyra B.',   risk: 'Explicit Content', severity: 'medium', confidence: 79, snippet: '"send me a [explicit] pic right now..."',               time: '41m ago',    status: 'pending' },
  { id: 'CHT-4795', user: 'kyle_09',   muse: 'Aurora S.', risk: 'Spam / Promo',     severity: 'low',    confidence: 72, snippet: '"check out my site for the best deals on..."',          time: '1h ago',     status: 'pending' },
  { id: 'CHT-4788', user: 'anon_3847', muse: 'Elena R.',  risk: 'Potential Scam',   severity: 'high',   confidence: 91, snippet: '"i\'m an investor, send me your bank details and..."',  time: '1h 22m ago', status: 'pending' },
  { id: 'CHT-4771', user: 'mike_v33',  muse: 'Lyra B.',   risk: 'Harassment',       severity: 'medium', confidence: 83, snippet: '"you\'re ugly anyway no wonder you\'re on here..."',    time: '2h ago',     status: 'pending' },
];

const SEV_COLOR: Record<Severity, string> = { high: RED,                          medium: GOLD,     low: GREEN                    };
const SEV_BG:    Record<Severity, string> = { high: 'rgba(244,67,54,0.12)',       medium: `${GOLD}20`, low: 'rgba(76,175,80,0.12)' };

const STATUS_META: Record<ConvStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: GOLD,     bg: `${GOLD}20`              },
  approved:  { label: 'Approved',  color: GREEN,    bg: 'rgba(76,175,80,0.12)'  },
  escalated: { label: 'Escalated', color: PURPLE,   bg: `${PURPLE}18`            },
  banned:    { label: 'Banned',    color: RED,      bg: 'rgba(244,67,54,0.12)'  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatAssessment() {
  const [convos, setConvos] = useState<FlaggedConv[]>(INITIAL_CONVOS);
  const [filter, setFilter] = useState<'all' | Severity>('all');

  const act = (id: string, status: ConvStatus) =>
    setConvos(prev => prev.map(c => c.id === id ? { ...c, status } : c));

  const filtered = filter === 'all' ? convos : convos.filter(c => c.severity === filter);

  return (
    <div className="space-y-5">

      {/* KPI Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: `${ACCENT}15` }}>
                  <Icon size={15} style={{ color: ACCENT }} />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: k.positive ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)',
                        color:      k.positive ? GREEN : RED,
                      }}>
                  {k.delta}
                </span>
              </div>
              <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Risk Distribution */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Risk Distribution —{' '}
          <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>{TOTAL_FLAGGED} flagged today</span>
        </h3>

        {/* Stacked bar */}
        <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-5">
          {RISK_TYPES.map(r => (
            <div key={r.label}
                 style={{ width: `${(r.count / TOTAL_FLAGGED * 100).toFixed(1)}%`, background: r.color }}
                 title={`${r.label}: ${r.count}`} />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {RISK_TYPES.map(r => (
            <div key={r.label} className="p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
              </div>
              <div className="text-lg font-black" style={{ color: 'var(--text)' }}>
                {r.count}
                <span className="text-xs ml-1" style={{ color: 'var(--text-light)', fontWeight: 400 }}>
                  ({(r.count / TOTAL_FLAGGED * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flagged Conversations */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Flagged Conversations</h3>
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg)' }}>
            {(['all', 'high', 'medium', 'low'] as const).map(f => {
              const active = filter === f;
              const color  = f === 'all' ? ACCENT : SEV_COLOR[f as Severity];
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all"
                  style={{ background: active ? color : 'transparent', color: active ? '#fff' : 'var(--text-secondary)' }}>
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(c => {
            const sm = STATUS_META[c.status];
            return (
              <div key={c.id} className="p-4 rounded-xl"
                   style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>

                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
                      {c.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: SEV_BG[c.severity], color: SEV_COLOR[c.severity] }}>
                      {c.severity}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${PURPLE}18`, color: PURPLE }}>
                      {c.risk}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: sm.bg, color: sm.color }}>
                      {sm.label}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>{c.time}</span>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>User</div>
                    <div className="text-sm font-semibold" style={{ color: ACCENT }}>@{c.user}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>Muse</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{c.muse}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>AI Confidence</div>
                    <div className="text-sm font-bold"
                         style={{ color: c.confidence >= 85 ? RED : GOLD }}>
                      {c.confidence}%
                    </div>
                  </div>
                </div>

                {/* Snippet */}
                <div className="p-2.5 rounded-lg mb-3 text-xs italic"
                     style={{
                       background: 'var(--card)',
                       color: 'var(--text-secondary)',
                       borderLeft: `3px solid ${SEV_COLOR[c.severity]}`,
                     }}>
                  {c.snippet}
                </div>

                {/* Actions */}
                {c.status === 'pending' && (
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => act(c.id, 'approved')}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold"
                      style={{ background: 'rgba(76,175,80,0.12)', color: GREEN }}>
                      Approve
                    </button>
                    <button onClick={() => act(c.id, 'escalated')}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold"
                      style={{ background: `${GOLD}20`, color: GOLD }}>
                      Escalate
                    </button>
                    <button onClick={() => act(c.id, 'banned')}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold"
                      style={{ background: 'rgba(244,67,54,0.12)', color: RED }}>
                      Ban User
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--text-light)' }}>
              No flagged conversations in this category
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
