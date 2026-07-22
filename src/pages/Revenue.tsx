import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShieldCheck, RotateCcw, Zap, Star, Users, Plus, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import type { RevenueKPIs, RevenueTrendData, PlanMRRData, RevTransaction } from '../lib/api';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const GREEN  = '#4caf50';
const RED    = '#f44336';
const TEAL   = '#009688';

const PLAN_LABEL: Record<string, string> = {
  orbit: 'Orbit', nova: 'Nova', supernova: 'Supernova',
};
const PLAN_COLOR: Record<string, string> = {
  orbit: ACCENT, nova: GOLD, supernova: PURPLE,
};

type Period = 'week' | 'month' | 'year';
const PERIOD_LABELS: Record<Period, string> = { week: 'Week', month: 'Month', year: 'Year' };

// ─── Static mockup data (components pending payment processor integration) ─────

const SOURCES_MOCK = [
  { label: 'Subscriptions',  amount: 159075, icon: Users, color: ACCENT  },
  { label: 'Profile Boosts', amount: 12340,  icon: Zap,   color: GOLD    },
  { label: 'Spotlight',      amount: 8920,   icon: Star,  color: PURPLE  },
];
const SOURCES_TOTAL = SOURCES_MOCK.reduce((s, x) => s + x.amount, 0);

const PAYMENT_HEALTH_MOCK = [
  { label: 'Success Rate', value: '97.3%', sub: '12,492 transactions', color: GREEN },
  { label: 'Failed',       value: '2.7%',  sub: '347 transactions',    color: RED   },
  { label: 'Refunds',      value: '1.2%',  sub: '$2,164 returned',     color: GOLD  },
  { label: 'Chargebacks',  value: '0.18%', sub: '23 open disputes',    color: RED   },
];

// ─── Recent transaction event type metadata ────────────────────────────────────

const REV_TX_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  subscribed:  { label: 'New Sub',     color: GREEN,  bg: 'rgba(76,175,80,0.12)',  icon: Plus      },
  upgraded:    { label: 'Upgrade',     color: ACCENT, bg: `${ACCENT}18`,           icon: ArrowUp   },
  downgraded:  { label: 'Downgrade',   color: GOLD,   bg: `${GOLD}20`,            icon: ArrowDown },
  renewed:     { label: 'Renewal',     color: PURPLE, bg: `${PURPLE}18`,          icon: RefreshCw },
  reactivated: { label: 'Reactivated', color: TEAL,   bg: 'rgba(0,150,136,0.14)', icon: RotateCcw },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function fmtMoney(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000)      return `$${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}k`;
  return `$${n.toFixed(2)}`;
}

function fmtAxis(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
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

// ─── Mockup Badge ─────────────────────────────────────────────────────────────

function MockupBadge() {
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
      Mockup
    </span>
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

// ─── Revenue Trend Chart ──────────────────────────────────────────────────────

function RevenueTrendChart({ data, loading }: { data: RevenueTrendData | null; loading: boolean }) {
  const W = 520, H = 160;
  const pad = { t: 18, r: 16, b: 32, l: 52 };
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

  const gross  = data?.gross  ?? [];
  const net    = data?.net    ?? [];
  const labels = data?.labels ?? [];
  const hasData = gross.some(v => v > 0) || net.some(v => v > 0);
  const maxVal  = Math.max(...gross, ...net, 1) * 1.15;
  const n       = labels.length || 1;

  function toX(i: number) { return pad.l + (i / Math.max(n - 1, 1)) * cW; }
  function toY(v: number) { return pad.t + cH - (v / maxVal) * cH; }
  function getPoints(arr: number[]) { return arr.map((v, i) => ({ x: toX(i), y: toY(v) })); }

  const grossPts  = getPoints(gross);
  const netPts    = getPoints(net);
  const grossLine = smoothCurve(grossPts);
  const netLine   = smoothCurve(netPts);
  const grossArea = grossLine ? `${grossLine} L ${grossPts[grossPts.length-1].x.toFixed(2)} ${bottom} L ${grossPts[0].x.toFixed(2)} ${bottom} Z` : '';
  const netArea   = netLine   ? `${netLine} L ${netPts[netPts.length-1].x.toFixed(2)} ${bottom} L ${netPts[0].x.toFixed(2)} ${bottom} Z`         : '';

  const step   = Math.pow(10, Math.floor(Math.log10(maxVal / 4)));
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i / step) * step);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 420, width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="rev-gross" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={ACCENT} stopOpacity="0.2"  />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="rev-net" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={GOLD} stopOpacity="0.18" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0.01" />
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
                {fmtAxis(t)}
              </text>
            </g>
          );
        })}

        {hasData ? (
          <>
            <path d={grossArea} fill="url(#rev-gross)" />
            <path d={netArea}   fill="url(#rev-net)"   />
            <path d={grossLine} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={netLine}   fill="none" stroke={GOLD}   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {grossPts.map((p, i) => <circle key={`g${i}`} cx={p.x} cy={p.y} r="3" fill={ACCENT} opacity="0.85" />)}
            {grossPts.length > 0 && <circle cx={grossPts[grossPts.length-1].x} cy={grossPts[grossPts.length-1].y} r="5" fill={ACCENT} />}
            {netPts.map((p, i) => <circle key={`n${i}`} cx={p.x} cy={p.y} r="3" fill={GOLD} opacity="0.85" />)}
            {netPts.length > 0 && <circle cx={netPts[netPts.length-1].x} cy={netPts[netPts.length-1].y} r="5" fill={GOLD} />}
          </>
        ) : (
          <text x={W / 2} y={H / 2} textAnchor="middle" dominantBaseline="middle"
                style={{ fill: 'var(--text-light)', fontSize: 11 }}>
            No revenue data in this period
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Revenue() {
  const [period, setPeriod]         = useState<Period>('year');
  const [kpis, setKpis]             = useState<RevenueKPIs | null>(null);
  const [kpisLoading, setKpisL]     = useState(true);
  const [trend, setTrend]           = useState<RevenueTrendData | null>(null);
  const [trendLoading, setTrendL]   = useState(true);
  const [planMRR, setPlanMRR]       = useState<PlanMRRData | null>(null);
  const [planMRRLoading, setPlanL]  = useState(true);
  const [txs, setTxs]               = useState<RevTransaction[]>([]);
  const [txsLoading, setTxsL]       = useState(true);

  useEffect(() => {
    api.finance.revenueKPIs()
      .then(setKpis).catch(() => {}).finally(() => setKpisL(false));
    api.finance.revenuePlanMRR()
      .then(setPlanMRR).catch(() => {}).finally(() => setPlanL(false));
    api.finance.revenueTransactions()
      .then(setTxs).catch(() => {}).finally(() => setTxsL(false));
  }, []);

  useEffect(() => {
    setTrendL(true);
    api.finance.revenueTrend(period)
      .then(setTrend).catch(() => setTrend(null)).finally(() => setTrendL(false));
  }, [period]);

  const lastGross = trend ? (trend.gross[trend.gross.length - 1] ?? 0) : 0;
  const lastNet   = trend ? (trend.net[trend.net.length - 1]   ?? 0) : 0;
  const feePct    = lastGross > 0 ? (((lastGross - lastNet) / lastGross) * 100).toFixed(1) : '—';

  const plans    = planMRR?.plans    ?? [];
  const totalMRR = planMRR?.total_mrr ?? 0;
  const maxMRR   = Math.max(...plans.map(p => p.current), 1);

  const liveKPIs = [
    {
      label:    'Gross Revenue (MTD)',
      value:    kpisLoading ? '—' : fmtMoney(kpis?.gross_mtd ?? 0),
      delta:    fmtDelta(kpis?.gross_delta ?? 0),
      positive: (kpis?.gross_delta ?? 0) >= 0,
      icon:     DollarSign,
      mockup:   false,
    },
    {
      label:    'Net Revenue (MTD)',
      value:    kpisLoading ? '—' : fmtMoney(kpis?.net_mtd ?? 0),
      delta:    fmtDelta(kpis?.net_delta ?? 0),
      positive: (kpis?.net_delta ?? 0) >= 0,
      icon:     TrendingUp,
      mockup:   false,
    },
    {
      label: 'Payment Success', value: '97.3%', delta: '+0.4pp', positive: true, icon: ShieldCheck, mockup: true,
    },
    {
      label: 'Refund Rate',     value: '1.2%',  delta: '−0.2pp', positive: true, icon: RotateCcw,   mockup: true,
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
                {k.mockup ? <MockupBadge /> : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: k.positive ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)',
                          color:      k.positive ? GREEN : RED,
                        }}>
                    {k.delta}
                  </span>
                )}
              </div>
              <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue Trend */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Revenue Trend</h3>
            <div className="flex items-center gap-4 mt-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 rounded-full" style={{ background: ACCENT }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Gross</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 rounded-full" style={{ background: GOLD }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Net</span>
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

        <RevenueTrendChart data={trend} loading={trendLoading} />

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Gross',           value: trendLoading ? '—' : fmtMoney(lastGross), color: ACCENT },
            { label: 'Net',             value: trendLoading ? '—' : fmtMoney(lastNet),   color: GOLD   },
            { label: 'Processing Fee',  value: trendLoading ? '—' : `${feePct}%`,        color: 'var(--text-secondary)' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-lg text-center" style={{ background: 'var(--bg)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-light)' }}>{s.label}</div>
              <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Sources + Plan MRR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Revenue Sources — Mockup (Profile Boosts and Spotlight features don't exist yet) */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Revenue Sources</h3>
            <MockupBadge />
          </div>

          <div className="flex h-3 rounded-full overflow-hidden gap-px mb-5">
            {SOURCES_MOCK.map(s => (
              <div key={s.label}
                   style={{ width: `${(s.amount / SOURCES_TOTAL * 100).toFixed(1)}%`, background: s.color }}
                   title={`${s.label}: ${(s.amount / SOURCES_TOTAL * 100).toFixed(1)}%`} />
            ))}
          </div>

          <div className="space-y-4">
            {SOURCES_MOCK.map(s => {
              const pct  = (s.amount / SOURCES_TOTAL * 100).toFixed(1);
              const Icon = s.icon;
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background: `${s.color}18` }}>
                        <Icon size={13} style={{ color: s.color }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{s.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                        ${s.amount.toLocaleString()}
                      </span>
                      <span className="text-xs ml-1.5" style={{ color: 'var(--text-light)' }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan MRR — Live */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Plan MRR</h3>
            <span className="text-xs" style={{ color: 'var(--text-light)' }}>vs last month</span>
          </div>
          {planMRRLoading ? <Spinner /> : (
            <div className="space-y-5">
              {plans.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-light)' }}>
                  No paid subscription data
                </p>
              ) : plans.map(p => {
                const positive  = p.current >= p.prev;
                const deltaStr  = p.prev > 0
                  ? `${positive ? '+' : ''}${((p.current - p.prev) / p.prev * 100).toFixed(1)}%`
                  : 'New';
                const color     = PLAN_COLOR[p.tier] ?? ACCENT;
                const label     = PLAN_LABEL[p.tier] ?? p.tier;
                const diff      = Math.round(p.current - p.prev);
                return (
                  <div key={p.tier}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                          ${p.current.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: positive ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)',
                                color:      positive ? GREEN : RED,
                              }}>
                          {deltaStr}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                      <div className="absolute inset-y-0 left-0 rounded-full opacity-25"
                           style={{ width: `${(p.prev / maxMRR * 100).toFixed(1)}%`, background: color }} />
                      <div className="absolute inset-y-0 left-0 rounded-full"
                           style={{ width: `${(p.current / maxMRR * 100).toFixed(1)}%`, background: color }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span style={{ fontSize: 10, color: 'var(--text-light)' }}>
                        prev ${p.prev.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 10, color, fontWeight: 600 }}>
                        {diff >= 0 ? '+' : '−'}${Math.abs(diff).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 flex items-center justify-between"
                   style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Total MRR</span>
                <span className="text-base font-black" style={{ color: 'var(--text)' }}>
                  ${totalMRR.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Health — Mockup (requires payment processor integration) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Payment Health</h3>
          <MockupBadge />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PAYMENT_HEALTH_MOCK.map(h => (
            <div key={h.label} className="card p-4">
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                {h.label}
              </div>
              <div className="text-2xl font-black mb-1" style={{ color: h.color }}>{h.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-light)' }}>{h.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Recent Transactions</h3>
        {txsLoading ? <Spinner /> : txs.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--text-light)' }}>
            No transactions yet
          </p>
        ) : (
          <div className="space-y-2">
            {txs.map(tx => {
              const meta   = REV_TX_META[tx.event_type] ?? REV_TX_META.subscribed;
              const Icon   = meta.icon;
              const isMove = tx.event_type === 'upgraded' || tx.event_type === 'downgraded';
              const detail = isMove
                ? `${PLAN_LABEL[tx.from_tier ?? ''] ?? tx.from_tier} → ${PLAN_LABEL[tx.to_tier ?? ''] ?? tx.to_tier}`
                : PLAN_LABEL[tx.tier ?? ''] ?? tx.tier ?? '';
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg"
                     style={{ background: 'var(--bg)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ background: meta.bg }}>
                    <Icon size={13} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {tx.name}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                      {detail && (
                        <span className="text-xs" style={{ color: 'var(--text-light)' }}>{detail}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                      +${tx.amount.toFixed(2)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                      {timeAgo(tx.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
