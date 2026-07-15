import { useState } from 'react';
import { DollarSign, TrendingUp, ShieldCheck, RotateCcw, Zap, Star, Users, Plus, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const GREEN  = '#4caf50';
const RED    = '#f44336';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const kpis: { label: string; value: string; delta: string; positive: boolean; icon: React.ElementType }[] = [
  { label: 'Gross Revenue (MTD)', value: '$180.3k', delta: '+8.4%',  positive: true,  icon: DollarSign  },
  { label: 'Net Revenue (MTD)',   value: '$175.1k', delta: '+8.1%',  positive: true,  icon: TrendingUp  },
  { label: 'Payment Success',     value: '97.3%',   delta: '+0.4pp', positive: true,  icon: ShieldCheck },
  { label: 'Refund Rate',         value: '1.2%',    delta: '−0.2pp', positive: true,  icon: RotateCcw   },
];

type Period = 'week' | 'month' | 'year';
const PERIOD_LABELS: Record<Period, string> = { week: 'Week', month: 'Month', year: 'Year' };

const trendData: Record<Period, { labels: string[]; gross: number[]; net: number[] }> = {
  week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    gross:  [5820, 6240, 5980, 6480, 7120, 8340, 7240],
    net:    [5650, 6050, 5800, 6290, 6910, 8090, 7030],
  },
  month: {
    labels: ['Jul 1', 'Jul 8', 'Jul 15', 'Jul 22', 'Jul 29'],
    gross:  [42400, 44200, 46800, 48200, 49200],
    net:    [41150, 42880, 45420, 46760, 47730],
  },
  year: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    gross:  [118400, 124800, 131200, 138400, 147200, 156800, 163400, 168200, 172800, 176400, 179600, 180335],
    net:    [114900, 121100, 127300, 134300, 142800, 152100, 158500, 163100, 167600, 171100, 174200, 175105],
  },
};

const TOTAL_GROSS = 180335;

const sources: { label: string; amount: number; icon: React.ElementType; color: string }[] = [
  { label: 'Subscriptions',  amount: 159075, icon: Users, color: ACCENT  },
  { label: 'Profile Boosts', amount: 12340,  icon: Zap,   color: GOLD    },
  { label: 'Spotlight',      amount: 8920,   icon: Star,  color: PURPLE  },
];

const planMRR = [
  { label: 'Orbit',     color: ACCENT,  current: 38362, prev: 35840 },
  { label: 'Nova',      color: GOLD,    current: 62448, prev: 58920 },
  { label: 'Supernova', color: PURPLE,  current: 58265, prev: 54890 },
];

const paymentHealth: { label: string; value: string; sub: string; color: string }[] = [
  { label: 'Success Rate', value: '97.3%', sub: '12,492 transactions', color: GREEN  },
  { label: 'Failed',       value: '2.7%',  sub: '347 transactions',    color: RED    },
  { label: 'Refunds',      value: '1.2%',  sub: '$2,164 returned',     color: GOLD   },
  { label: 'Chargebacks',  value: '0.18%', sub: '23 open disputes',    color: RED    },
];

type TxType = 'renewal' | 'new' | 'boost' | 'spotlight' | 'refund' | 'upgrade';

const transactions: { user: string; type: TxType; detail: string; amount: number; time: string }[] = [
  { user: 'sophia_l',   type: 'renewal',   detail: 'Nova renewal',       amount:  19.99, time: '3m ago'     },
  { user: 'luna_r',     type: 'new',       detail: 'Supernova — new',    amount:  39.99, time: '11m ago'    },
  { user: 'marcus_w',   type: 'boost',     detail: 'Profile Boost × 3',  amount:  14.97, time: '18m ago'    },
  { user: 'anon_4821',  type: 'refund',    detail: 'Nova refund',        amount: -19.99, time: '34m ago'    },
  { user: 'james_ok',   type: 'upgrade',   detail: 'Orbit → Nova',       amount:  10.00, time: '52m ago'    },
  { user: 'isabella_c', type: 'spotlight', detail: 'Spotlight feature',  amount:   9.99, time: '1h ago'     },
  { user: 'alex_cr',    type: 'renewal',   detail: 'Supernova renewal',  amount:  39.99, time: '1h 18m ago' },
];

const TX_META: Record<TxType, { color: string; bg: string; icon: React.ElementType }> = {
  renewal:   { color: PURPLE, bg: `${PURPLE}18`,            icon: RefreshCw },
  new:       { color: GREEN,  bg: 'rgba(76,175,80,0.12)',   icon: Plus       },
  boost:     { color: GOLD,   bg: `${GOLD}20`,              icon: Zap        },
  spotlight: { color: ACCENT, bg: `${ACCENT}18`,            icon: Star       },
  refund:    { color: RED,    bg: 'rgba(244,67,54,0.12)',   icon: ArrowDown  },
  upgrade:   { color: GREEN,  bg: 'rgba(76,175,80,0.12)',   icon: ArrowUp    },
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
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function fmtMoney(n: number): string {
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k`;
  return `$${n.toFixed(2)}`;
}

function fmtAxis(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

// ─── Revenue Trend Chart ──────────────────────────────────────────────────────

function RevenueTrendChart({ period }: { period: Period }) {
  const data = trendData[period];
  const W = 520, H = 160;
  const pad = { t: 18, r: 16, b: 32, l: 52 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const bottom = pad.t + cH;

  const maxVal = Math.max(...data.gross) * 1.15;
  const n = data.labels.length;

  function toX(i: number) { return pad.l + (i / (n - 1)) * cW; }
  function toY(v: number) { return pad.t + cH - (v / maxVal) * cH; }
  function getPoints(arr: number[]) { return arr.map((v, i) => ({ x: toX(i), y: toY(v) })); }

  const grossPts = getPoints(data.gross);
  const netPts   = getPoints(data.net);

  const grossLine = smoothCurve(grossPts);
  const netLine   = smoothCurve(netPts);
  const grossArea = `${grossLine} L ${grossPts[grossPts.length-1].x.toFixed(2)} ${bottom} L ${grossPts[0].x.toFixed(2)} ${bottom} Z`;
  const netArea   = `${netLine}   L ${netPts[netPts.length-1].x.toFixed(2)} ${bottom} L ${netPts[0].x.toFixed(2)} ${bottom} Z`;

  const step = Math.pow(10, Math.floor(Math.log10(maxVal / 4)));
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

        {/* Y grid */}
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

        {/* Areas */}
        <path d={grossArea} fill="url(#rev-gross)" />
        <path d={netArea}   fill="url(#rev-net)"   />

        {/* Lines */}
        <path d={grossLine} fill="none" stroke={ACCENT} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
        <path d={netLine}   fill="none" stroke={GOLD}   strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />

        {/* Nodes */}
        {grossPts.map((p, i) => <circle key={`g${i}`} cx={p.x} cy={p.y} r="3" fill={ACCENT} opacity="0.85" />)}
        <circle cx={grossPts[grossPts.length-1].x} cy={grossPts[grossPts.length-1].y} r="5" fill={ACCENT} />

        {netPts.map((p, i) => <circle key={`n${i}`} cx={p.x} cy={p.y} r="3" fill={GOLD} opacity="0.85" />)}
        <circle cx={netPts[netPts.length-1].x} cy={netPts[netPts.length-1].y} r="5" fill={GOLD} />

        {/* X labels */}
        {data.labels.map((l, i) => (
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
  const [period, setPeriod] = useState<Period>('year');

  const data      = trendData[period];
  const lastGross = data.gross[data.gross.length - 1];
  const lastNet   = data.net[data.net.length - 1];
  const feePct    = (((lastGross - lastNet) / lastGross) * 100).toFixed(1);

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

        <RevenueTrendChart period={period} />

        {/* Period stat strip */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Gross',         value: fmtMoney(lastGross), color: ACCENT },
            { label: 'Net',           value: fmtMoney(lastNet),   color: GOLD   },
            { label: 'Processing Fee', value: `${feePct}%`,        color: 'var(--text-secondary)' },
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

        {/* Revenue Sources */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>Revenue Sources</h3>

          {/* Stacked bar */}
          <div className="flex h-3 rounded-full overflow-hidden gap-px mb-5">
            {sources.map(s => (
              <div key={s.label}
                   style={{ width: `${(s.amount / TOTAL_GROSS * 100).toFixed(1)}%`, background: s.color }}
                   title={`${s.label}: ${(s.amount / TOTAL_GROSS * 100).toFixed(1)}%`} />
            ))}
          </div>

          <div className="space-y-4">
            {sources.map(s => {
              const pct = (s.amount / TOTAL_GROSS * 100).toFixed(1);
              const Icon = s.icon;
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background: `${s.color}18` }}>
                        <Icon size={13} style={{ color: s.color }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                        {s.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                        ${s.amount.toLocaleString()}
                      </span>
                      <span className="text-xs ml-1.5" style={{ color: 'var(--text-light)' }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                    <div className="h-full rounded-full"
                         style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan MRR Comparison */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Plan MRR</h3>
            <span className="text-xs" style={{ color: 'var(--text-light)' }}>vs last month</span>
          </div>
          <div className="space-y-5">
            {planMRR.map(p => {
              const delta    = ((p.current - p.prev) / p.prev * 100).toFixed(1);
              const positive = p.current >= p.prev;
              const maxVal   = Math.max(...planMRR.map(x => x.current));
              return (
                <div key={p.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                        {p.label}
                      </span>
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
                        {positive ? '+' : ''}{delta}%
                      </span>
                    </div>
                  </div>
                  {/* Current vs prev bar */}
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                    {/* Prev bar (behind) */}
                    <div className="absolute inset-y-0 left-0 rounded-full opacity-25"
                         style={{ width: `${(p.prev / maxVal * 100).toFixed(1)}%`, background: p.color }} />
                    {/* Current bar */}
                    <div className="absolute inset-y-0 left-0 rounded-full"
                         style={{ width: `${(p.current / maxVal * 100).toFixed(1)}%`, background: p.color }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span style={{ fontSize: 10, color: 'var(--text-light)' }}>
                      prev ${p.prev.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 10, color: p.color, fontWeight: 600 }}>
                      +${(p.current - p.prev).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="pt-3 flex items-center justify-between"
                 style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Total MRR
              </span>
              <span className="text-base font-black" style={{ color: 'var(--text)' }}>
                ${planMRR.reduce((a, p) => a + p.current, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Health */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {paymentHealth.map(h => (
          <div key={h.label} className="card p-4">
            <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              {h.label}
            </div>
            <div className="text-2xl font-black mb-1" style={{ color: h.color }}>{h.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-light)' }}>{h.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Recent Transactions
        </h3>
        <div className="space-y-2">
          {transactions.map((tx, i) => {
            const meta    = TX_META[tx.type];
            const Icon    = meta.icon;
            const isDebit = tx.amount < 0;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg"
                   style={{ background: 'var(--bg)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ background: meta.bg }}>
                  <Icon size={13} style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      @{tx.user}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                      {tx.detail}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-bold"
                        style={{ color: isDebit ? RED : 'var(--text)' }}>
                    {isDebit ? '−' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                    {tx.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
