import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertOctagon, TrendingUp, CheckCircle, Layers, Clipboard, Check } from 'lucide-react';
import {
  api,
  type ReportKPIs,
  type ReportCategoryBreakdown,
  type ModerationReport,
  type ReportAction,
  type ReportStatus,
  type ReportPriority,
} from '../lib/api';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const GREEN  = '#4caf50';
const RED    = '#f44336';
const SLATE  = '#78909c';
const INDIGO = '#6366f1';

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  harassment:          { label: 'Harassment',           color: '#ef4444' },
  explicit_content:    { label: 'Explicit Content',     color: '#fb923c' },
  spam:                { label: 'Spam / Promo',         color: '#fbbf24' },
  solicitation:        { label: 'Solicitation',         color: '#f97316' },
  potential_scam:      { label: 'Potential Scam',       color: '#d97706' },
  underage_minor:      { label: 'Underage / Minor',     color: '#b91c1c' },
  physical_self_harm:  { label: 'Physical / Self-Harm', color: '#be123c' },
  terrorism_violence:  { label: 'Terrorism / Violence', color: '#7f1d1d' },
  community_guideline: { label: 'Community Guideline',  color: '#eab308' },
};

const CATEGORY_ORDER = [
  'underage_minor', 'physical_self_harm', 'terrorism_violence',
  'harassment', 'solicitation', 'explicit_content',
  'spam', 'potential_scam', 'community_guideline',
];

// ─── Priority / Status metadata ───────────────────────────────────────────────

const PRIORITY_META: Record<ReportPriority, { color: string; bg: string }> = {
  critical: { color: RED,    bg: 'rgba(244,67,54,0.12)'  },
  high:     { color: ACCENT, bg: `${ACCENT}18`            },
  medium:   { color: GOLD,   bg: `${GOLD}20`             },
  low:      { color: GREEN,  bg: 'rgba(76,175,80,0.12)'  },
};

const STATUS_META: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  open:          { label: 'Open',          color: GOLD,   bg: `${GOLD}20`              },
  investigating: { label: 'Investigating', color: PURPLE, bg: `${PURPLE}18`            },
  resolved:      { label: 'Resolved',      color: GREEN,  bg: 'rgba(76,175,80,0.12)'  },
  dismissed:     { label: 'Dismissed',     color: SLATE,  bg: 'rgba(120,144,156,0.12)' },
};

interface ActionDef { label: string; action: ReportAction; color: string; bg: string }

const SANCTION_ACTIONS: ActionDef[] = [
  { label: 'Warn',        action: 'warn',        color: '#fff', bg: GOLD   },
  { label: 'Suspend 24h', action: 'suspend_24h', color: '#fff', bg: ACCENT },
  { label: 'Suspend 7d',  action: 'suspend_7d',  color: '#fff', bg: PURPLE },
  { label: 'Ban',         action: 'ban',         color: '#fff', bg: RED    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs < 24)  return rem > 0 ? `${hrs}h ${rem}m ago` : `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fullName(
  person: { first_name: string; last_name: string | null } | null,
  fallback = 'Unknown',
): string {
  if (!person) return fallback;
  return [person.first_name, person.last_name].filter(Boolean).join(' ');
}

function fmtInt(n: number): string {
  return n.toLocaleString();
}

function PersonChip({
  person,
  accent = false,
}: {
  person: { first_name: string; last_name: string | null; photo_url?: string | null } | null;
  accent?: boolean;
}) {
  const name     = fullName(person);
  const initials = name !== 'Unknown'
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <span className="flex items-center gap-1.5 flex-shrink-0">
      {person?.photo_url ? (
        <img
          src={person.photo_url}
          alt={name}
          className="flex-shrink-0 object-cover rounded-full"
          style={{ width: 28, height: 28 }}
        />
      ) : (
        <span
          className="flex-shrink-0 rounded-full flex items-center justify-center font-bold"
          style={{
            width: 28, height: 28,
            fontSize: 10,
            background: accent ? `${ACCENT}25` : 'var(--border)',
            color:      accent ? ACCENT : 'var(--text-secondary)',
          }}>
          {initials}
        </span>
      )}
      <span className="text-xs font-semibold"
            style={{ color: accent ? ACCENT : 'var(--text-secondary)' }}>
        {name}
      </span>
    </span>
  );
}

function CopyButton({ id, copiedId, onCopy }: { id: string; copiedId: string | null; onCopy: (id: string) => void }) {
  const copied = copiedId === id;
  const Icon   = copied ? Check : Clipboard;
  return (
    <button
      onClick={() => onCopy(id)}
      title={copied ? 'Copied!' : `Copy ID: ${id}`}
      className="flex-shrink-0 rounded p-0.5 transition-all hover:opacity-70 active:scale-90 focus:outline-none"
      style={{ color: copied ? GREEN : '#38bdf8' }}>
      <Icon size={12} />
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReportEvaluation() {
  const [kpis,         setKpis]         = useState<ReportKPIs | null>(null);
  const [breakdown,    setBreakdown]    = useState<ReportCategoryBreakdown | null>(null);
  const [reports,      setReports]      = useState<ModerationReport[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [actioning,    setActioning]    = useState<string | null>(null);
  const [catFilter,    setCatFilter]    = useState('all');
  const [hoveredCat,   setHoveredCat]   = useState<string | null>(null);
  const [copiedId,     setCopiedId]     = useState<string | null>(null);
  const [showWipModal, setShowWipModal] = useState(false);

  const copyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpisData, breakdownData, reportsData] = await Promise.all([
        api.moderation.reportKpis(),
        api.moderation.reportCategoryBreakdown(),
        api.moderation.reports({ limit: 100 }),
      ]);
      setKpis(kpisData);
      setBreakdown(breakdownData);
      setReports(reportsData.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (reportId: string, action: ReportAction) => {
    setActioning(reportId);
    try {
      const result = await api.moderation.reportAction(reportId, action);
      setReports(prev => prev.map(r =>
        r.id === reportId ? { ...r, status: result.status as ReportStatus } : r
      ));
    } catch (e) {
      console.error('Action failed:', e);
    } finally {
      setActioning(null);
    }
  };

  // Breakdown counts used by the stacked bar + filter pill badges
  const sortedDist = breakdown
    ? CATEGORY_ORDER
        .map(cat => ({
          category: cat,
          count: breakdown.by_category.find(b => b.category === cat)?.count ?? 0,
        }))
    : [];

  const distTotal = sortedDist.reduce((a, r) => a + r.count, 0);

  // Filter report list
  const visible = catFilter === 'all'
    ? reports
    : reports.filter(r => r.category === catFilter);

  const kpiPills = kpis ? [
    { label: 'Open Reports',    value: fmtInt(kpis.open_reports),             icon: AlertOctagon, positive: false },
    { label: 'Investigating',   value: fmtInt(kpis.escalated),                icon: TrendingUp,   positive: false },
    { label: 'Resolution Rate', value: `${kpis.resolution_rate.toFixed(1)}%`, icon: CheckCircle,  positive: true  },
    { label: 'Total Reports',   value: fmtInt(kpis.total_reports),            icon: Layers,       positive: true  },
  ] : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm" style={{ color: 'var(--text-light)' }}>Loading report evaluation…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm" style={{ color: RED }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* KPI Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(kpiPills ?? []).map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: `${ACCENT}15` }}>
                  <Icon size={15} style={{ color: ACCENT }} />
                </div>
              </div>
              <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Reports by Category — stacked bar */}
      {distTotal > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Reports by Category —{' '}
            <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>{distTotal} classified</span>
          </h3>

          {/* Stacked bar */}
          <div className="flex h-6 gap-px mb-5">
            {sortedDist.map((r, i, arr) => {
              const meta    = CATEGORY_META[r.category];
              if (!meta || r.count === 0) return null;
              const isHot   = hoveredCat === r.category;
              const isDim   = hoveredCat !== null && !isHot;
              const isFirst = arr.findIndex(x => x.count > 0) === i;
              const isLast  = arr.map(x => x.count > 0).lastIndexOf(true) === i;
              return (
                <div
                  key={r.category}
                  title={`${meta.label}: ${r.count}`}
                  onMouseEnter={() => setHoveredCat(r.category)}
                  onMouseLeave={() => setHoveredCat(null)}
                  style={{
                    width:        `${((r.count / distTotal) * 100).toFixed(1)}%`,
                    background:   meta.color,
                    minWidth:     2,
                    borderRadius: isFirst ? '6px 0 0 6px' : isLast ? '0 6px 6px 0' : 0,
                    transform:    isHot ? 'scaleY(1.45)' : 'scaleY(1)',
                    filter:       isDim ? 'brightness(0.5) saturate(0.5)' : 'none',
                    transition:   'transform 0.18s ease, filter 0.18s ease',
                    cursor:       'default',
                  }}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {sortedDist.filter(r => r.count > 0).map(r => {
              const meta  = CATEGORY_META[r.category];
              if (!meta) return null;
              const isHot = hoveredCat === r.category;
              const isDim = hoveredCat !== null && !isHot;
              return (
                <div
                  key={r.category}
                  className="flex items-center gap-2 cursor-default"
                  onMouseEnter={() => setHoveredCat(r.category)}
                  onMouseLeave={() => setHoveredCat(null)}
                  style={{ opacity: isDim ? 0.35 : 1, transition: 'opacity 0.18s ease' }}>
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      background: meta.color,
                      transform:  isHot ? 'scale(1.4)' : 'scale(1)',
                      transition: 'transform 0.18s ease',
                    }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: isHot ? 'var(--text)' : 'var(--text-secondary)', transition: 'color 0.18s ease' }}>
                    {meta.label}
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{r.count}</span>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                    ({((r.count / distTotal) * 100).toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Report Queue */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Report Queue
            {visible.length > 0 && (
              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-light)' }}>
                {visible.length} report{visible.length !== 1 ? 's' : ''}
              </span>
            )}
          </h3>

          {/* Category filter pills — all 9 categories always shown */}
          <div className="flex gap-1 flex-wrap">
            {(['all', ...CATEGORY_ORDER] as const).map(cat => {
              const active = catFilter === cat;
              const meta   = cat === 'all' ? null : CATEGORY_META[cat];
              const color  = meta?.color ?? ACCENT;
              const count  = cat === 'all' ? null : (sortedDist.find(d => d.category === cat)?.count ?? 0);
              return (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                  style={{
                    background: active ? `${color}15` : 'var(--bg)',
                    color:      active ? color : 'var(--text-secondary)',
                    border:     `1px solid ${active ? `${color}40` : 'var(--border)'}`,
                    opacity:    count === 0 ? 0.45 : 1,
                  }}>
                  {cat === 'all' ? 'All' : (meta?.label ?? cat)}
                  {count !== null && count > 0 && (
                    <span className="font-bold" style={{ color: active ? color : 'var(--text-light)' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {visible.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--text-light)' }}>
              No reports in this category
            </div>
          )}

          {visible.map(r => {
            const pm       = PRIORITY_META[r.priority];
            const sm       = STATUS_META[r.status];
            const catMeta  = r.category ? CATEGORY_META[r.category] : null;
            const isOpen   = r.status === 'open' || r.status === 'investigating';
            const isActioning = actioning === r.id;

            return (
              <div key={r.id} className="p-4 rounded-xl"
                   style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
                      RPT-{r.id.replace(/-/g, '').slice(-4).toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: pm.bg, color: pm.color }}>
                      {r.priority}
                    </span>
                    {catMeta && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${catMeta.color}18`, color: catMeta.color }}>
                        {catMeta.label}
                      </span>
                    )}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: sm.bg, color: sm.color }}>
                      {sm.label}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                    {relTime(r.created_at)}
                  </span>
                </div>

                {/* Reporter / Reported / Reason grid */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: 'var(--text-light)' }}>Reporter</div>
                    <div className="flex items-center gap-1">
                      <PersonChip person={r.reporter} />
                      {r.reporter?.id && (
                        <CopyButton id={r.reporter.id} copiedId={copiedId} onCopy={copyId} />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1.5" style={{ color: 'var(--text-light)' }}>Reported</div>
                    <div className="flex items-center gap-1">
                      <PersonChip person={r.reported} accent />
                      {r.reported?.id && (
                        <CopyButton id={r.reported.id} copiedId={copiedId} onCopy={copyId} />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>Reason</div>
                    <div className="text-xs font-medium line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {r.reason || '—'}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {r.notes && (
                  <div className="px-2.5 pt-2 pb-2 mb-3"
                       style={{
                         background:   'var(--card)',
                         borderLeft:   `3px solid ${catMeta?.color ?? ACCENT}`,
                         borderRadius: 6,
                       }}>
                    <div className="text-xs mb-0.5 uppercase tracking-wide" style={{ color: 'var(--text-light)', fontSize: 10 }}>
                      Notes
                    </div>
                    <span className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
                      {r.notes}
                    </span>
                  </div>
                )}

                {/* Actions */}
                {isOpen && (
                  <div className="flex gap-2 pt-3 flex-wrap items-center"
                       style={{ borderTop: '1px solid var(--border)' }}>

                    {/* Investigate (only for open) */}
                    {r.status === 'open' && (
                      <button
                        onClick={() => setShowWipModal(true)}
                        className="px-3 py-1.5 rounded text-xs font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97] focus:outline-none focus:brightness-90"
                        style={{ background: INDIGO }}>
                        Investigate
                      </button>
                    )}

                    {/* Sanction actions */}
                    {SANCTION_ACTIONS.map(a => (
                      <button key={a.action}
                        onClick={() => setShowWipModal(true)}
                        className="px-3 py-1.5 rounded text-xs font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97] focus:outline-none focus:brightness-90"
                        style={{ background: a.bg }}>
                        {a.label}
                      </button>
                    ))}

                    {/* Dismiss */}
                    <button
                      onClick={() => setShowWipModal(true)}
                      className="px-3 py-1.5 rounded text-xs font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97] focus:outline-none focus:brightness-90"
                      style={{ background: SLATE }}>
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* WIP modal — portal so fixed isn't clipped by scroll ancestor */}
      {showWipModal && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowWipModal(false)}>
          <div
            className="card p-8 flex flex-col items-center gap-3 rounded-2xl"
            style={{ maxWidth: 340, width: '90%', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: 48, lineHeight: 1 }}>🚧</span>
            <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Work in Progress</h3>
            <p className="text-sm text-center" style={{ color: 'var(--text-light)' }}>
              This feature is under active development.
            </p>
            <button
              onClick={() => setShowWipModal(false)}
              className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97]"
              style={{ background: INDIGO }}>
              Got it
            </button>
          </div>
        </div>,
        document.body,
      )}

    </div>
  );
}
