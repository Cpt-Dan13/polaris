import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ShieldAlert, CheckCircle, Clock, Code2, ChevronDown } from 'lucide-react';
import { api, type ChatFlag, type ChatFlagAction, type ChatKPIs, type ChatRiskDistribution } from '../lib/api';

const ACCENT = '#e94560';
const GREEN  = '#4caf50';
const RED    = '#f44336';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
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

// ─── Severity ─────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'high' | 'medium' | 'low';

const SEV_COLOR: Record<Severity, string> = {
  critical: '#b91c1c',
  high:     '#ef4444',
  medium:   '#f97316',
  low:      '#eab308',
};

const SEV_BG: Record<Severity, string> = {
  critical: 'rgba(185,28,28,0.13)',
  high:     'rgba(239,68,68,0.12)',
  medium:   'rgba(249,115,22,0.12)',
  low:      'rgba(234,179,8,0.12)',
};

const SEV_ORDER: Severity[] = ['critical', 'high', 'medium', 'low'];

// Category ordering for the stacked bar (critical risk → lower risk)
const CATEGORY_ORDER = [
  'underage_minor', 'physical_self_harm', 'terrorism_violence',
  'harassment', 'solicitation', 'explicit_content',
  'spam', 'potential_scam', 'community_guideline',
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

function shortId(id: string): string {
  return `FLG-${id.replace(/-/g, '').slice(-4).toUpperCase()}`;
}

function displayName(
  person: { first_name: string; last_name: string | null } | null,
  fallback = 'Unknown',
): string {
  if (!person) return fallback;
  const last = person.last_name ? ` ${person.last_name[0]}.` : '';
  return `${person.first_name}${last}`;
}

function fmtInt(n: number): string {
  return n.toLocaleString();
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: GOLD,   bg: `${GOLD}20`             },
  approved:  { label: 'Approved',  color: GREEN,  bg: 'rgba(76,175,80,0.12)' },
  escalated: { label: 'Escalated', color: PURPLE, bg: `${PURPLE}18`           },
  banned:    { label: 'Banned',    color: RED,    bg: 'rgba(244,67,54,0.12)' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatAssessment() {
  const [kpis,         setKpis]         = useState<ChatKPIs | null>(null);
  const [distribution, setDistribution] = useState<ChatRiskDistribution | null>(null);
  const [flags,        setFlags]        = useState<ChatFlag[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [actioning,    setActioning]    = useState<string | null>(null);  // flag ID being acted on

  const [filter,       setFilter]       = useState<'all' | Severity>('all');
  const [hoveredCat,   setHoveredCat]   = useState<string | null>(null);
  const [resolvedOpen, setResolvedOpen] = useState(false);

  // Load all data in parallel
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpisData, distData, flagsData] = await Promise.all([
        api.moderation.chat.kpis(),
        api.moderation.chat.riskDistribution(),
        api.moderation.chat.flags({ limit: 100 }),
      ]);
      setKpis(kpisData);
      setDistribution(distData);
      setFlags(flagsData.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load chat assessment data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = async (flagId: string, action: ChatFlagAction) => {
    setActioning(flagId);
    try {
      await api.moderation.chat.action(flagId, action);

      if (action === 'tech_review') {
        // Mark tech review requested on the local flag (status stays the same)
        setFlags(prev => prev.map(f =>
          f.id === flagId ? { ...f, tech_review_requested: true } : f
        ));
      } else {
        const newStatus = action === 'approve'
          ? 'approved' as const
          : action === 'escalate'
            ? 'escalated' as const
            : 'banned' as const;
        setFlags(prev => prev.map(f =>
          f.id === flagId ? { ...f, status: newStatus } : f
        ));
      }
    } catch (e) {
      console.error('Action failed:', e);
    } finally {
      setActioning(null);
    }
  };

  // Derive display data
  const sortedDist = distribution
    ? CATEGORY_ORDER
        .map(cat => ({
          category: cat,
          count: distribution.by_category.find(b => b.category === cat)?.count ?? 0,
        }))
        .filter(r => r.count > 0)
    : [];
  const distTotal = sortedDist.reduce((a, r) => a + r.count, 0);

  const filtered = filter === 'all'
    ? flags
    : flags.filter(f => f.severity === filter);
  const pending  = filtered.filter(f => f.status === 'pending');
  const resolved = filtered.filter(f => f.status !== 'pending');

  // KPI pills config
  const kpiPills = kpis ? [
    {
      label:    'Monitored Today',
      value:    fmtInt(kpis.monitored_today),
      icon:     MessageSquare,
    },
    {
      label:    'Flagged Rate',
      value:    `${kpis.flag_rate.toFixed(1)}%`,
      icon:     ShieldAlert,
    },
    {
      label:    'Auto-Approved',
      value:    `${kpis.auto_approved_rate.toFixed(1)}%`,
      icon:     CheckCircle,
    },
    {
      label:    'Awaiting Review',
      value:    fmtInt(kpis.awaiting_review),
      icon:     Clock,
    },
  ] : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm" style={{ color: 'var(--text-light)' }}>Loading chat assessment…</div>
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

      {/* Risk Distribution */}
      {distTotal > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Risk Distribution —{' '}
            <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>{distTotal} flagged today</span>
          </h3>

          {/* Stacked bar */}
          <div className="flex h-6 gap-px mb-5">
            {sortedDist.map((r, i, arr) => {
              const meta    = CATEGORY_META[r.category];
              if (!meta) return null;
              const isFirst = i === 0;
              const isLast  = i === arr.length - 1;
              const isHot   = hoveredCat === r.category;
              const isDim   = hoveredCat !== null && !isHot;
              return (
                <div
                  key={r.category}
                  title={`${meta.label}: ${r.count}`}
                  onMouseEnter={() => setHoveredCat(r.category)}
                  onMouseLeave={() => setHoveredCat(null)}
                  style={{
                    width:        `${(r.count / distTotal * 100).toFixed(1)}%`,
                    background:   meta.color,
                    minWidth:     r.count > 0 ? 2 : 0,
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
            {sortedDist.map(r => {
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
                  style={{ opacity: isDim ? 0.35 : 1, transition: 'opacity 0.18s ease' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                       style={{
                         background: meta.color,
                         transform:  isHot ? 'scale(1.4)' : 'scale(1)',
                         transition: 'transform 0.18s ease',
                       }} />
                  <span className="text-xs font-medium"
                        style={{ color: isHot ? 'var(--text)' : 'var(--text-secondary)', transition: 'color 0.18s ease' }}>
                    {meta.label}
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{r.count}</span>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                    ({(r.count / distTotal * 100).toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Flagged Conversations */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Flagged Conversations</h3>

            {resolved.length > 0 && (
              <button
                onClick={() => setResolvedOpen(o => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all hover:brightness-90 active:scale-[0.97]"
                style={{
                  background: resolvedOpen ? ACCENT : 'var(--bg)',
                  color:      resolvedOpen ? '#fff' : 'var(--text-secondary)',
                }}>
                {resolved.length} Resolved
                <ChevronDown
                  size={11}
                  style={{
                    transform:  resolvedOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
            )}
          </div>

          {/* Severity filter */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg)' }}>
            {(['all', ...SEV_ORDER] as const).map(f => {
              const active = filter === f;
              const color  = f === 'all' ? ACCENT : SEV_COLOR[f as Severity];
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all"
                  style={{
                    background: active ? color : 'transparent',
                    color:      active ? '#fff' : 'var(--text-secondary)',
                  }}>
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Pending ──────────────────────────────────────────────── */}
        <div className="space-y-3">
          {pending.length === 0 && resolved.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--text-light)' }}>
              No flagged conversations in this category
            </div>
          )}
          {pending.length === 0 && resolved.length > 0 && (
            <div className="py-5 text-center text-sm" style={{ color: 'var(--text-light)' }}>
              No pending items — all cleared
            </div>
          )}

          {pending.map(flag => {
            const sev         = (flag.severity ?? 'low') as Severity;
            const sm          = STATUS_META[flag.status] ?? STATUS_META.pending;
            const catMeta     = flag.category ? (CATEGORY_META[flag.category] ?? { label: flag.category, color: ACCENT }) : null;
            const needsTech   = sev === 'high' || sev === 'critical';
            const isActioning = actioning === flag.id;

            return (
              <div key={flag.id} className="p-4 rounded-xl"
                   style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>

                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
                      {shortId(flag.id)}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: SEV_BG[sev], color: SEV_COLOR[sev] }}>
                      {sev}
                    </span>
                    {catMeta && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${catMeta.color}18`, color: catMeta.color }}>
                        {catMeta.label}
                      </span>
                    )}
                    {!catMeta && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--border)', color: 'var(--text-light)' }}>
                        Unclassified
                      </span>
                    )}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: sm.bg, color: sm.color }}>
                      {sm.label}
                    </span>
                    {flag.tech_review_requested && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${INDIGO}20`, color: INDIGO }}>
                        Tech Review Req.
                      </span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                    {relTime(flag.created_at)}
                  </span>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>Sender</div>
                    <div className="text-sm font-semibold" style={{ color: ACCENT }}>
                      @{flag.sender ? flag.sender.first_name.toLowerCase() : 'unknown'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>Recipient</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {displayName(flag.receiver)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>AI Confidence</div>
                    {flag.confidence != null ? (
                      <div className="text-sm font-bold"
                           style={{
                             color: flag.confidence >= 85
                               ? SEV_COLOR.critical
                               : flag.confidence >= 70
                                 ? SEV_COLOR.high
                                 : SEV_COLOR.medium,
                           }}>
                        {flag.confidence}%
                      </div>
                    ) : (
                      <div className="text-sm" style={{ color: 'var(--text-light)' }}>—</div>
                    )}
                  </div>
                </div>

                {/* Message snippet */}
                {flag.snippet && (
                  <div className="p-2.5 rounded-lg mb-3 text-xs italic"
                       style={{
                         background: 'var(--card)',
                         color: 'var(--text-secondary)',
                         borderLeft: `3px solid ${SEV_COLOR[sev]}`,
                       }}>
                    {flag.snippet}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap items-center">
                  <button
                    disabled={isActioning}
                    onClick={() => handleAction(flag.id, 'approve')}
                    className="px-3 py-1.5 rounded text-xs font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97] disabled:opacity-50"
                    style={{ background: GREEN }}>
                    Approve
                  </button>
                  <button
                    disabled={isActioning}
                    onClick={() => handleAction(flag.id, 'escalate')}
                    className="px-3 py-1.5 rounded text-xs font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97] disabled:opacity-50"
                    style={{ background: GOLD }}>
                    Escalate
                  </button>
                  <button
                    disabled={isActioning}
                    onClick={() => handleAction(flag.id, 'ban')}
                    className="px-3 py-1.5 rounded text-xs font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97] disabled:opacity-50"
                    style={{ background: RED }}>
                    Ban User
                  </button>
                  {needsTech && !flag.tech_review_requested && (
                    <button
                      disabled={isActioning}
                      onClick={() => handleAction(flag.id, 'tech_review')}
                      className="px-3 py-1.5 rounded text-xs font-semibold text-white flex items-center gap-1.5 ml-auto transition-all hover:brightness-90 active:scale-[0.97] disabled:opacity-50"
                      style={{ background: INDIGO }}>
                      <Code2 size={11} />
                      Request Tech Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Resolved ─────────────────────────────────────────────── */}
        {resolvedOpen && resolved.length > 0 && (
          <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-light)' }}>
                Resolved · {resolved.length} item{resolved.length !== 1 ? 's' : ''}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <div className="space-y-1.5">
              {resolved.map(flag => {
                const sev     = (flag.severity ?? 'low') as Severity;
                const sm      = STATUS_META[flag.status] ?? STATUS_META.approved;
                const catMeta = flag.category ? (CATEGORY_META[flag.category] ?? { label: flag.category, color: ACCENT }) : null;
                const needsTech = sev === 'high' || sev === 'critical';
                return (
                  <div key={flag.id}
                       className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg flex-wrap"
                       style={{ background: 'var(--bg)' }}>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {shortId(flag.id)}
                    </span>
                    <span className="text-xs font-semibold px-1.5 py-0.5 capitalize"
                          style={{ background: SEV_BG[sev], color: SEV_COLOR[sev], borderRadius: 3 }}>
                      {sev}
                    </span>
                    {catMeta && (
                      <span className="text-xs font-semibold px-1.5 py-0.5"
                            style={{ background: `${catMeta.color}15`, color: catMeta.color, borderRadius: 3 }}>
                        {catMeta.label}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      @{flag.sender?.first_name.toLowerCase() ?? 'unknown'} → {displayName(flag.receiver)}
                    </span>
                    <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>
                      {relTime(flag.created_at)}
                    </span>
                    <span className="text-xs font-semibold px-1.5 py-0.5"
                          style={{ background: sm.bg, color: sm.color, borderRadius: 3 }}>
                      {sm.label}
                    </span>
                    {needsTech && !flag.tech_review_requested && (
                      <button
                        onClick={() => handleAction(flag.id, 'tech_review')}
                        className="px-2.5 py-1 rounded text-xs font-semibold text-white flex items-center gap-1 transition-all hover:brightness-90 active:scale-[0.97]"
                        style={{ background: INDIGO }}>
                        <Code2 size={10} />
                        Request Tech Review
                      </button>
                    )}
                    {flag.tech_review_requested && (
                      <span className="text-xs font-semibold px-1.5 py-0.5"
                            style={{ background: `${INDIGO}20`, color: INDIGO, borderRadius: 3 }}>
                        Tech Review Req.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
