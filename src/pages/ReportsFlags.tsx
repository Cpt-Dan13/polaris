import { useState } from 'react';
import { Flag, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { reportFlags } from '../data/sampleData';
import type { ReportFlag } from '../types';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const GREEN  = '#4caf50';
const RED    = '#f44336';

// ─── Meta maps ────────────────────────────────────────────────────────────────

const STATUS_META: Record<ReportFlag['status'], { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: GOLD,   bg: `${GOLD}20`,              icon: Clock        },
  reviewed:  { label: 'Reviewed',  color: ACCENT, bg: `${ACCENT}18`,            icon: Flag         },
  actioned:  { label: 'Actioned',  color: GREEN,  bg: 'rgba(76,175,80,0.12)',   icon: CheckCircle  },
  dismissed: { label: 'Dismissed', color: '#78909c', bg: 'rgba(120,144,156,0.12)', icon: XCircle  },
};

const SEV_META: Record<ReportFlag['severity'], { color: string; bg: string; barColor: string }> = {
  high:   { color: RED,    bg: 'rgba(244,67,54,0.12)',   barColor: RED    },
  medium: { color: GOLD,   bg: `${GOLD}20`,              barColor: GOLD   },
  low:    { color: GREEN,  bg: 'rgba(76,175,80,0.12)',   barColor: GREEN  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportsFlags() {
  const [flags, setFlags] = useState<ReportFlag[]>(reportFlags);
  const [statusFilter,   setStatusFilter]   = useState<ReportFlag['status'] | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<ReportFlag['severity'] | 'all'>('all');

  const updateStatus = (id: string, status: ReportFlag['status']) =>
    setFlags(prev => prev.map(f => f.id === id ? { ...f, status } : f));

  const filtered = flags.filter(f => {
    const matchStatus   = statusFilter   === 'all' || f.status   === statusFilter;
    const matchSeverity = severityFilter === 'all' || f.severity === severityFilter;
    return matchStatus && matchSeverity;
  });

  // Severity distribution
  const sevCounts = {
    high:   flags.filter(f => f.severity === 'high').length,
    medium: flags.filter(f => f.severity === 'medium').length,
    low:    flags.filter(f => f.severity === 'low').length,
  };
  const total = flags.length;

  return (
    <div className="space-y-5">

      {/* Status KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['pending', 'reviewed', 'actioned', 'dismissed'] as const).map(s => {
          const meta  = STATUS_META[s];
          const count = flags.filter(f => f.status === s).length;
          const Icon  = meta.icon;
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className="card p-4 text-left transition-all"
              style={{ outline: statusFilter === s ? `2px solid ${meta.color}` : 'none' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: meta.bg }}>
                  <Icon size={15} style={{ color: meta.color }} />
                </div>
                {statusFilter === s && (
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: meta.bg, color: meta.color }}>active</span>
                )}
              </div>
              <div className="text-2xl font-black" style={{ color: meta.color }}>{count}</div>
              <div className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-secondary)' }}>
                {meta.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Severity Distribution */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Severity Overview —{' '}
            <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>{total} reports</span>
          </h3>
        </div>

        <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-4">
          {(['high', 'medium', 'low'] as const).map(s => (
            <div key={s}
                 style={{ width: `${(sevCounts[s] / total * 100).toFixed(1)}%`, background: SEV_META[s].barColor }}
                 title={`${s}: ${sevCounts[s]}`} />
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'high', 'medium', 'low'] as const).map(s => {
            const active = severityFilter === s;
            const color  = s === 'all' ? ACCENT : SEV_META[s as ReportFlag['severity']].color;
            const count  = s === 'all' ? total : sevCounts[s as ReportFlag['severity']];
            return (
              <button key={s} onClick={() => setSeverityFilter(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                style={{
                  background: active ? color : 'var(--bg)',
                  color:      active ? '#fff' : 'var(--text-secondary)',
                  border:     `1px solid ${active ? color : 'var(--border)'}`,
                }}>
                {s}
                <span className="opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flag Cards */}
      <div className="space-y-3">
        {filtered.map(flag => {
          const sm      = STATUS_META[flag.status];
          const sv      = SEV_META[flag.severity];
          const isOpen  = flag.status === 'pending' || flag.status === 'reviewed';
          const StatusIcon = sm.icon;
          return (
            <div key={flag.id} className="card overflow-hidden"
                 style={{ borderLeft: `4px solid ${sv.barColor}` }}>
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold"
                          style={{ color: 'var(--text-secondary)' }}>
                      {flag.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: sv.bg, color: sv.color }}>
                      {flag.severity}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: sm.bg, color: sm.color }}>
                      <StatusIcon size={10} />
                      {sm.label}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                    {flag.date}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-light)' }}>Reporter</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {flag.reporter}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-light)' }}>Reported</div>
                    <div className="text-sm font-semibold" style={{ color: ACCENT }}>
                      {flag.reported}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-light)' }}>Reason</div>
                    <div className="text-sm" style={{ color: 'var(--text)' }}>{flag.reason}</div>
                  </div>
                </div>

                {/* Actions */}
                {isOpen && (
                  <div className="flex gap-2 pt-4 flex-wrap"
                       style={{ borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => updateStatus(flag.id, 'actioned')}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold"
                      style={{ background: 'rgba(244,67,54,0.12)', color: RED }}>
                      Take Action
                    </button>
                    <button onClick={() => updateStatus(flag.id, 'reviewed')}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold"
                      style={{ background: `${ACCENT}15`, color: ACCENT }}>
                      Mark Reviewed
                    </button>
                    <button onClick={() => updateStatus(flag.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold"
                      style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card p-12 text-center" style={{ color: 'var(--text-light)' }}>
            No reports match the current filters
          </div>
        )}
      </div>

    </div>
  );
}
