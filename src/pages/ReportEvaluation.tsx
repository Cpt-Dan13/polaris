import { useState } from 'react';
import { AlertOctagon, TrendingUp, Clock, CheckCircle, Paperclip } from 'lucide-react';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const GREEN  = '#4caf50';
const RED    = '#f44336';
const SLATE  = '#78909c';

// ─── Static data ──────────────────────────────────────────────────────────────

const kpis: { label: string; value: string; delta: string; positive: boolean; icon: React.ElementType }[] = [
  { label: 'Open Reports',      value: '134',    delta: '+22',    positive: false, icon: AlertOctagon },
  { label: 'Escalated',         value: '18',     delta: '+5',     positive: false, icon: TrendingUp   },
  { label: 'Avg Response Time', value: '2h 14m', delta: '−18m',   positive: true,  icon: Clock        },
  { label: 'Resolution Rate',   value: '91.3%',  delta: '+2.1pp', positive: true,  icon: CheckCircle  },
];

const CATEGORIES: { label: string; count: number; color: string }[] = [
  { label: 'Fake Profile',          count: 51, color: ACCENT  },
  { label: 'Harassment',            count: 39, color: RED     },
  { label: 'Inappropriate Content', count: 21, color: PURPLE  },
  { label: 'Spam',                  count: 16, color: GOLD    },
  { label: 'Other',                 count: 7,  color: SLATE   },
];
const TOTAL_REPORTS = CATEGORIES.reduce((a, c) => a + c.count, 0);

type ReportStatus   = 'open' | 'investigating' | 'resolved' | 'dismissed';
type ReportPriority = 'critical' | 'high' | 'medium' | 'low';

interface Report {
  id: string; reporter: string; reported: string; category: string;
  priority: ReportPriority; status: ReportStatus; age: string; evidence: boolean;
}

const INITIAL_REPORTS: Report[] = [
  { id: 'RPT-0921', reporter: 'sophia_l',   reported: 'user_8821', category: 'Fake Profile',          priority: 'critical', status: 'open',          age: '2h ago',  evidence: true  },
  { id: 'RPT-0918', reporter: 'luna_r',     reported: 'alex_cr',   category: 'Harassment',            priority: 'high',     status: 'investigating', age: '5h ago',  evidence: true  },
  { id: 'RPT-0915', reporter: 'james_ok',   reported: 'anon_4821', category: 'Inappropriate Content', priority: 'high',     status: 'open',          age: '8h ago',  evidence: false },
  { id: 'RPT-0911', reporter: 'isabella_c', reported: 'user_3334', category: 'Spam',                  priority: 'medium',   status: 'open',          age: '12h ago', evidence: false },
  { id: 'RPT-0908', reporter: 'anon_7721',  reported: 'mike_v33',  category: 'Fake Profile',          priority: 'medium',   status: 'investigating', age: '18h ago', evidence: true  },
  { id: 'RPT-0902', reporter: 'marcus_w',   reported: 'user_1122', category: 'Harassment',            priority: 'low',      status: 'open',          age: '1d ago',  evidence: false },
];

const PRIORITY_META: Record<ReportPriority, { color: string; bg: string }> = {
  critical: { color: RED,    bg: 'rgba(244,67,54,0.12)'   },
  high:     { color: ACCENT, bg: `${ACCENT}18`             },
  medium:   { color: GOLD,   bg: `${GOLD}20`              },
  low:      { color: GREEN,  bg: 'rgba(76,175,80,0.12)'   },
};

const STATUS_META: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  open:          { label: 'Open',          color: GOLD,   bg: `${GOLD}20`                   },
  investigating: { label: 'Investigating', color: PURPLE, bg: `${PURPLE}18`                  },
  resolved:      { label: 'Resolved',      color: GREEN,  bg: 'rgba(76,175,80,0.12)'         },
  dismissed:     { label: 'Dismissed',     color: SLATE,  bg: 'rgba(120,144,156,0.12)'       },
};

interface ActionDef { label: string; nextStatus: ReportStatus; color: string; bg: string }
const ACTIONS: ActionDef[] = [
  { label: 'Warn',        nextStatus: 'resolved',   color: GOLD,   bg: `${GOLD}20`              },
  { label: 'Suspend 24h', nextStatus: 'resolved',   color: ACCENT, bg: `${ACCENT}18`             },
  { label: 'Suspend 7d',  nextStatus: 'resolved',   color: PURPLE, bg: `${PURPLE}18`             },
  { label: 'Ban',         nextStatus: 'resolved',   color: RED,    bg: 'rgba(244,67,54,0.12)'   },
  { label: 'Dismiss',     nextStatus: 'dismissed',  color: SLATE,  bg: 'rgba(120,144,156,0.12)' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportEvaluation() {
  const [reports, setReports]   = useState<Report[]>(INITIAL_REPORTS);
  const [catFilter, setCatFilter] = useState('all');

  const act = (id: string, nextStatus: ReportStatus) =>
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: nextStatus } : r));

  const visible = catFilter === 'all'
    ? reports
    : reports.filter(r => r.category === catFilter);

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

      {/* Category Breakdown */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Reports by Category —{' '}
          <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>{TOTAL_REPORTS} total open</span>
        </h3>

        <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-5">
          {CATEGORIES.map(c => (
            <div key={c.label}
                 style={{ width: `${(c.count / TOTAL_REPORTS * 100).toFixed(1)}%`, background: c.color }}
                 title={`${c.label}: ${c.count}`} />
          ))}
        </div>

        <div className="space-y-3">
          {CATEGORIES.map(c => (
            <div key={c.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {c.label}
                  </span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                  {c.count}{' '}
                  <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>
                    ({(c.count / TOTAL_REPORTS * 100).toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                <div className="h-full rounded-full transition-all"
                     style={{ width: `${(c.count / TOTAL_REPORTS * 100).toFixed(1)}%`, background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Queue */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Report Queue</h3>
          <div className="flex gap-1 flex-wrap">
            {['all', ...CATEGORIES.map(c => c.label)].map(cat => {
              const active = catFilter === cat;
              return (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                  style={{
                    background: active ? `${ACCENT}15` : 'var(--bg)',
                    color:      active ? ACCENT : 'var(--text-secondary)',
                    border:     `1px solid ${active ? `${ACCENT}40` : 'var(--border)'}`,
                  }}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {visible.map(r => {
            const pm     = PRIORITY_META[r.priority];
            const sm     = STATUS_META[r.status];
            const isOpen = r.status === 'open' || r.status === 'investigating';
            return (
              <div key={r.id} className="p-4 rounded-xl"
                   style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
                      {r.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: pm.bg, color: pm.color }}>
                      {r.priority}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: sm.bg, color: sm.color }}>
                      {sm.label}
                    </span>
                    {r.evidence && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(76,175,80,0.12)', color: GREEN }}>
                        <Paperclip size={10} /> Evidence
                      </span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>{r.age}</span>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>Reporter</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>@{r.reporter}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>Reported</div>
                    <div className="text-sm font-semibold" style={{ color: ACCENT }}>@{r.reported}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>Category</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{r.category}</div>
                  </div>
                </div>

                {/* Action buttons */}
                {isOpen && (
                  <div className="flex gap-2 pt-3 flex-wrap"
                       style={{ borderTop: '1px solid var(--border)' }}>
                    {ACTIONS.map(a => (
                      <button key={a.label} onClick={() => act(r.id, a.nextStatus)}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold"
                        style={{ background: a.bg, color: a.color }}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {visible.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--text-light)' }}>
              No reports in this category
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
