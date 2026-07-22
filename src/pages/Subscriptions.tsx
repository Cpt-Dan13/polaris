import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingDown, Star, ArrowUp, ArrowDown, X, RefreshCw, Plus, RotateCcw } from 'lucide-react';
import { api } from '../lib/api';
import type { SubKPIs, PlanDistribution, PlanTier, SubTrendData, SubEvent, SubEventType } from '../lib/api';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const GREEN  = '#4caf50';
const RED    = '#f44336';
const TEAL   = '#009688';

const PLAN_COLOR: Record<string, string> = {
  orbit: ACCENT, nova: GOLD, supernova: PURPLE,
};

const PLAN_LABEL: Record<string, string> = {
  orbit: 'Orbit', nova: 'Nova', supernova: 'Supernova',
};

// ─── Recent Activity meta ─────────────────────────────────────────────────────

const ACTION_META: Record<SubEventType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  subscribed:  { label: 'Subscribed',   color: GREEN,  bg: 'rgba(76,175,80,0.12)',  icon: Plus       },
  upgraded:    { label: 'Upgraded',     color: ACCENT, bg: `${ACCENT}18`,           icon: ArrowUp    },
  cancelled:   { label: 'Cancelled',    color: RED,    bg: 'rgba(244,67,54,0.12)',  icon: X          },
  downgraded:  { label: 'Downgraded',   color: GOLD,   bg: `${GOLD}20`,            icon: ArrowDown  },
  renewed:     { label: 'Renewed',      color: PURPLE, bg: `${PURPLE}18`,          icon: RefreshCw  },
  reactivated: { label: 'Reactivated',  color: TEAL,   bg: 'rgba(0,150,136,0.14)', icon: RotateCcw  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'year';
const PERIOD_LABELS: Record<Period, string> = { week: 'Week', month: 'Month', year: 'Year' };

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000)      return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

function fmtMRR(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000)      return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function fmtDelta(v: number, pp = false): string {
  const sign = v >= 0 ? '+' : '−';
  return `${sign}${Math.abs(v).toFixed(1)}${pp ? 'pp' : '%'}`;
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours < 2 ? `${hours}h ${mins % 60}m ago` : `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0); }
function pavg(arr: number[]) { return arr.length ? Math.round(sum(arr) / arr.length) : 0; }

function smoothCurve(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6, cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6, cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ plans, totalSubs }: { plans: PlanTier[]; totalSubs: number }) {
  const cx = 80, cy = 80, r = 56;
  const circumference = 2 * Math.PI * r;
  const gapDash = (1.8 / 360) * circumference;
  let cumPct = 0;

  return (
    <svg viewBox="0 0 160 160" style={{ width: '100%', maxWidth: 180 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="22" />
      {plans.map(plan => {
        const pct  = totalSubs > 0 ? plan.subs / totalSubs : 0;
        const dash = pct * circumference - gapDash;
        const gap  = circumference - dash;
        const rot  = -90 + cumPct * 360;
        cumPct += pct;
        return (
          <circle key={plan.tier}
            cx={cx} cy={cy} r={r}
            fill="none" stroke={PLAN_COLOR[plan.tier] ?? ACCENT} strokeWidth="22"
            strokeDasharray={`${Math.max(0, dash).toFixed(2)} ${gap.toFixed(2)}`}
            transform={`rotate(${rot.toFixed(2)} ${cx} ${cy})`}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle"
            style={{ fill: 'var(--text)', fontSize: 22, fontWeight: 800 }}>
        {totalSubs >= 1000 ? `${(totalSubs / 1000).toFixed(1)}k` : totalSubs}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle"
            style={{ fill: 'var(--text-light)', fontSize: 8.5 }}>
        subscribers
      </text>
    </svg>
  );
}

// ─── Trend Chart ──────────────────────────────────────────────────────────────

function TrendChart({ data, loading }: { data: SubTrendData | null; loading: boolean }) {
  const W = 520, H = 160;
  const pad = { t: 18, r: 16, b: 32, l: 44 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const bottom = pad.t + cH;

  if (loading) {
    return (
      <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const newSubs = data?.newSubs ?? [];
  const cancels = data?.cancels ?? [];
  const labels  = data?.labels  ?? [];
  const hasData = newSubs.some(v => v > 0) || cancels.some(v => v > 0);
  const maxVal  = Math.max(...newSubs, ...cancels, 1) * 1.18;
  const n       = labels.length || 1;

  function toX(i: number) { return pad.l + (i / Math.max(n - 1, 1)) * cW; }
  function toY(v: number) { return pad.t + cH - (v / maxVal) * cH; }
  function getPoints(arr: number[]) { return arr.map((v, i) => ({ x: toX(i), y: toY(v) })); }

  const newPts    = getPoints(newSubs);
  const cancelPts = getPoints(cancels);
  const newLine    = smoothCurve(newPts);
  const cancelLine = smoothCurve(cancelPts);
  const newArea    = newLine ? `${newLine} L ${newPts[newPts.length-1].x.toFixed(2)} ${bottom} L ${newPts[0].x.toFixed(2)} ${bottom} Z` : '';
  const cancelArea = cancelLine ? `${cancelLine} L ${cancelPts[cancelPts.length-1].x.toFixed(2)} ${bottom} L ${cancelPts[0].x.toFixed(2)} ${bottom} Z` : '';

  const yTicks = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), Math.round(maxVal)];

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 420, width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="sg-new" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={GREEN} stopOpacity="0.2" />
            <stop offset="100%" stopColor={GREEN} stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="sg-cancel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={RED} stopOpacity="0.14" />
            <stop offset="100%" stopColor={RED} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map(t => {
          const y = toY(t);
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y}
                    stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={pad.l - 6} y={y + 4} textAnchor="end"
                    style={{ fill: 'var(--text-light)', fontSize: 9 }}>
                {fmt(t)}
              </text>
            </g>
          );
        })}

        {hasData ? (
          <>
            <path d={newArea}    fill="url(#sg-new)"    />
            <path d={cancelArea} fill="url(#sg-cancel)" />
            <path d={newLine}    fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={cancelLine} fill="none" stroke={RED}   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {newPts.map((p, i) => <circle key={`n${i}`} cx={p.x} cy={p.y} r="3" fill={GREEN} opacity="0.85" />)}
            {newPts.length > 0 && <circle cx={newPts[newPts.length-1].x} cy={newPts[newPts.length-1].y} r="5" fill={GREEN} />}
            {cancelPts.map((p, i) => <circle key={`c${i}`} cx={p.x} cy={p.y} r="3" fill={RED} opacity="0.85" />)}
            {cancelPts.length > 0 && <circle cx={cancelPts[cancelPts.length-1].x} cy={cancelPts[cancelPts.length-1].y} r="5" fill={RED} />}
          </>
        ) : (
          <text x={W / 2} y={H / 2} textAnchor="middle" dominantBaseline="middle"
                style={{ fill: 'var(--text-light)', fontSize: 11 }}>
            No subscription activity in this period
          </text>
        )}

        {labels.map((l, i) => (
          <text key={l} x={toX(i)} y={H - 8} textAnchor="middle"
                style={{ fill: 'var(--text-light)', fontSize: 9 }}>
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
           style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Subscriptions() {
  const [period, setPeriod]         = useState<Period>('week');
  const [kpis, setKpis]             = useState<SubKPIs | null>(null);
  const [kpisLoading, setKpisL]     = useState(true);
  const [dist, setDist]             = useState<PlanDistribution | null>(null);
  const [distLoading, setDistL]     = useState(true);
  const [trend, setTrend]           = useState<SubTrendData | null>(null);
  const [trendLoading, setTrendL]   = useState(true);
  const [events, setEvents]         = useState<SubEvent[]>([]);
  const [eventsLoading, setEventsL] = useState(true);

  useEffect(() => {
    api.finance.subscriptionKPIs()
      .then(setKpis).catch(() => {}).finally(() => setKpisL(false));
    api.finance.subscriptionDistribution()
      .then(setDist).catch(() => {}).finally(() => setDistL(false));
    api.finance.subscriptionEvents()
      .then(setEvents).catch(() => {}).finally(() => setEventsL(false));
  }, []);

  useEffect(() => {
    setTrendL(true);
    api.finance.subscriptionTrend(period)
      .then(setTrend).catch(() => setTrend(null)).finally(() => setTrendL(false));
  }, [period]);

  const plans     = dist?.plans ?? [];
  const totalSubs = dist?.total_subs ?? 0;
  const totalMRR  = dist?.total_mrr  ?? 0;

  const trendData  = trend;
  const netNew     = trendData ? sum(trendData.newSubs) - sum(trendData.cancels) : 0;
  const avgNew     = trendData ? pavg(trendData.newSubs) : 0;
  const avgCancel  = trendData ? pavg(trendData.cancels)  : 0;

  const liveKPIs = [
    {
      label:    'Total Subscribers',
      value:    kpisLoading ? '—' : fmt(kpis?.total_subscribers ?? 0),
      delta:    fmtDelta(kpis?.total_subscribers_delta ?? 0),
      positive: (kpis?.total_subscribers_delta ?? 0) >= 0,
      icon:     Users,
    },
    {
      label:    'MRR',
      value:    kpisLoading ? '—' : fmtMRR(kpis?.mrr ?? 0),
      delta:    fmtDelta(kpis?.mrr_delta ?? 0),
      positive: (kpis?.mrr_delta ?? 0) >= 0,
      icon:     DollarSign,
    },
    {
      label:    'ARPU',
      value:    kpisLoading ? '—' : `$${(kpis?.arpu ?? 0).toFixed(2)}`,
      delta:    fmtDelta(kpis?.arpu_delta ?? 0),
      positive: (kpis?.arpu_delta ?? 0) >= 0,
      icon:     Star,
    },
    {
      label:    'Monthly Churn',
      value:    kpisLoading ? '—' : `${(kpis?.monthly_churn ?? 0).toFixed(1)}%`,
      delta:    fmtDelta(kpis?.monthly_churn_delta ?? 0, true),
      positive: (kpis?.monthly_churn_delta ?? 0) <= 0,
      icon:     TrendingDown,
    },
  ];

  return (
    <div className="space-y-5">

      {/* KPI Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {liveKPIs.map(k => {
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

      {/* Plan Distribution */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>Plan Distribution</h3>
        {distLoading ? <Spinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-center">
            <div className="flex justify-center">
              <DonutChart plans={plans} totalSubs={totalSubs} />
            </div>
            <div className="space-y-4">
              {plans.map(plan => {
                const pct    = totalSubs > 0 ? ((plan.subs / totalSubs) * 100).toFixed(1) : '0.0';
                const mrrPct = totalMRR > 0  ? ((plan.mrr  / totalMRR)  * 100).toFixed(1) : '0.0';
                const color  = PLAN_COLOR[plan.tier] ?? ACCENT;
                return (
                  <div key={plan.tier}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                          {PLAN_LABEL[plan.tier] ?? plan.tier}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                              style={{ background: `${color}18`, color }}>
                          ${plan.price}/mo
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                          {plan.subs.toLocaleString()}
                        </span>
                        <span className="text-xs ml-1.5" style={{ color: 'var(--text-light)' }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span style={{ fontSize: 10, color: 'var(--text-light)' }}>MRR contribution</span>
                      <span style={{ fontSize: 10, color, fontWeight: 600 }}>
                        ${plan.mrr.toLocaleString()} · {mrrPct}%
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 flex items-center justify-between"
                   style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Total MRR</span>
                <span className="text-base font-black" style={{ color: 'var(--text)' }}>
                  {fmtMRR(totalMRR)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Trend */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Subscription Trend</h3>
            <div className="flex items-center gap-4 mt-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 rounded-full" style={{ background: GREEN }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>New</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 rounded-full" style={{ background: RED }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Cancellations</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg)' }}>
            {(['week', 'month', 'year'] as Period[]).map(p => {
              const active = period === p;
              return (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                  style={{ background: active ? ACCENT : 'transparent', color: active ? '#fff' : 'var(--text-secondary)' }}>
                  {PERIOD_LABELS[p]}
                </button>
              );
            })}
          </div>
        </div>

        <TrendChart data={trendData} loading={trendLoading} />

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Net New',          value: trendLoading ? '—' : `${netNew >= 0 ? '+' : ''}${netNew}`, color: netNew >= 0 ? GREEN : RED },
            { label: 'Avg New / Period', value: trendLoading ? '—' : `${avgNew}`,    color: 'var(--text)' },
            { label: 'Avg Cancels',      value: trendLoading ? '—' : `${avgCancel}`, color: RED },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-lg text-center" style={{ background: 'var(--bg)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-light)' }}>{s.label}</div>
              <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Recent Activity</h3>
        {eventsLoading ? <Spinner /> : events.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--text-light)' }}>
            No subscription events yet
          </p>
        ) : (
          <div className="space-y-2">
            {events.map(item => {
              const meta   = ACTION_META[item.event_type];
              const Icon   = meta.icon;
              const isMove = item.event_type === 'upgraded' || item.event_type === 'downgraded';
              const detail = isMove
                ? `${PLAN_LABEL[item.from_tier ?? ''] ?? item.from_tier} → ${PLAN_LABEL[item.to_tier ?? ''] ?? item.to_tier}`
                : PLAN_LABEL[item.tier ?? ''] ?? item.tier ?? '';
              const detailColor = PLAN_COLOR[isMove ? (item.to_tier ?? '') : (item.tier ?? '')] ?? 'var(--text-secondary)';

              return (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ background: meta.bg }}>
                    <Icon size={13} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {item.name}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                      {detail && (
                        <span className="text-xs font-medium" style={{ color: detailColor }}>
                          {detail}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-light)' }}>
                    {timeAgo(item.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
