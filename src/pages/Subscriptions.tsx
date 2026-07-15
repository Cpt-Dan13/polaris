import { useState } from 'react';
import { Users, DollarSign, TrendingDown, Star, ArrowUp, ArrowDown, X, RefreshCw, Plus } from 'lucide-react';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const GREEN  = '#4caf50';
const RED    = '#f44336';

// ─── Plan Data ────────────────────────────────────────────────────────────────

const plans = [
  { id: 'orbit',     label: 'Orbit',     price: 9.99,  color: ACCENT,  subs: 3840, mrr: 38362 },
  { id: 'nova',      label: 'Nova',      price: 19.99, color: GOLD,    subs: 3124, mrr: 62448 },
  { id: 'supernova', label: 'Supernova', price: 39.99, color: PURPLE,  subs: 1457, mrr: 58265 },
];

const TOTAL_SUBS = plans.reduce((a, p) => a + p.subs, 0);
const TOTAL_MRR  = plans.reduce((a, p) => a + p.mrr, 0);

const kpis: { label: string; value: string; delta: string; positive: boolean; icon: React.ElementType }[] = [
  { label: 'Total Subscribers', value: '8,421',   delta: '+6.2%',  positive: true,  icon: Users        },
  { label: 'MRR',               value: '$159.1k', delta: '+8.4%',  positive: true,  icon: DollarSign   },
  { label: 'ARPU',              value: '$18.89',  delta: '+1.9%',  positive: true,  icon: Star         },
  { label: 'Monthly Churn',     value: '4.2%',    delta: '−0.3pp', positive: true,  icon: TrendingDown },
];

// ─── Trend Data ───────────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'year';

const PERIOD_LABELS: Record<Period, string> = { week: 'Week', month: 'Month', year: 'Year' };

const trendData: Record<Period, { labels: string[]; newSubs: number[]; cancels: number[] }> = {
  week: {
    labels:   ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    newSubs:  [84,  92,  78, 103, 128, 156, 134],
    cancels:  [31,  28,  34,  29,  42,  38,  35],
  },
  month: {
    labels:   ['Jul 1', 'Jul 8', 'Jul 15', 'Jul 22', 'Jul 29'],
    newSubs:  [584, 621, 698, 742, 820],
    cancels:  [198, 212, 224, 231, 248],
  },
  year: {
    labels:   ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    newSubs:  [840,  920, 1040, 1120, 1340, 1480, 1620, 1840, 2120, 2340, 2580, 2820],
    cancels:  [280,  310,  340,  380,  420,  480,  540,  580,  640,  680,  720,  780],
  },
};

// ─── Recent Activity ──────────────────────────────────────────────────────────

type ActivityAction = 'subscribed' | 'upgraded' | 'cancelled' | 'downgraded' | 'renewed';

const recentActivity: {
  user: string; action: ActivityAction;
  plan?: string; from?: string; to?: string; time: string;
}[] = [
  { user: 'sophia_l',  action: 'upgraded',    from: 'Orbit',    to: 'Nova',       time: '2m ago'     },
  { user: 'james_ok',  action: 'subscribed',  plan: 'Orbit',                      time: '8m ago'     },
  { user: 'anon_4821', action: 'cancelled',   plan: 'Nova',                       time: '14m ago'    },
  { user: 'luna_r',    action: 'subscribed',  plan: 'Supernova',                  time: '23m ago'    },
  { user: 'derek_b',   action: 'downgraded',  from: 'Nova',     to: 'Orbit',      time: '41m ago'    },
  { user: 'alex_cr',   action: 'renewed',     plan: 'Supernova',                  time: '58m ago'    },
  { user: 'anon_2204', action: 'cancelled',   plan: 'Orbit',                      time: '1h 12m ago' },
];

const ACTION_META: Record<ActivityAction, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  subscribed:  { label: 'Subscribed',  color: GREEN,  bg: 'rgba(76,175,80,0.12)',   icon: Plus       },
  upgraded:    { label: 'Upgraded',    color: ACCENT, bg: `${ACCENT}18`,            icon: ArrowUp    },
  cancelled:   { label: 'Cancelled',   color: RED,    bg: 'rgba(244,67,54,0.12)',   icon: X          },
  downgraded:  { label: 'Downgraded',  color: GOLD,   bg: `${GOLD}20`,             icon: ArrowDown  },
  renewed:     { label: 'Renewed',     color: PURPLE, bg: `${PURPLE}18`,           icon: RefreshCw  },
};

const PLAN_COLORS: Record<string, string> = {
  Orbit: ACCENT, Nova: GOLD, Supernova: PURPLE,
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

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0); }
function pavg(arr: number[]) { return Math.round(sum(arr) / arr.length); }

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart() {
  const cx = 80, cy = 80, r = 56;
  const circumference = 2 * Math.PI * r;
  const gapDash = (1.8 / 360) * circumference;

  let cumPct = 0;

  return (
    <svg viewBox="0 0 160 160" style={{ width: '100%', maxWidth: 180 }}>
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="22" />

      {plans.map(plan => {
        const pct  = plan.subs / TOTAL_SUBS;
        const dash = pct * circumference - gapDash;
        const gap  = circumference - dash;
        const rot  = -90 + cumPct * 360;
        cumPct += pct;
        return (
          <circle key={plan.id}
            cx={cx} cy={cy} r={r}
            fill="none" stroke={plan.color} strokeWidth="22"
            strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
            transform={`rotate(${rot.toFixed(2)} ${cx} ${cy})`}
          />
        );
      })}

      {/* Center */}
      <text x={cx} y={cy - 4} textAnchor="middle"
            style={{ fill: 'var(--text)', fontSize: 22, fontWeight: 800 }}>
        {(TOTAL_SUBS / 1000).toFixed(1)}k
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle"
            style={{ fill: 'var(--text-light)', fontSize: 8.5 }}>
        subscribers
      </text>
    </svg>
  );
}

// ─── Trend Chart ──────────────────────────────────────────────────────────────

function TrendChart({ period }: { period: Period }) {
  const data = trendData[period];
  const W = 520, H = 160;
  const pad = { t: 18, r: 16, b: 32, l: 44 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const bottom = pad.t + cH;

  const maxVal = Math.max(...data.newSubs) * 1.18;
  const n = data.labels.length;

  function toX(i: number) { return pad.l + (i / (n - 1)) * cW; }
  function toY(v: number) { return pad.t + cH - (v / maxVal) * cH; }
  function getPoints(arr: number[]) { return arr.map((v, i) => ({ x: toX(i), y: toY(v) })); }

  const newPts    = getPoints(data.newSubs);
  const cancelPts = getPoints(data.cancels);

  const newLine    = smoothCurve(newPts);
  const cancelLine = smoothCurve(cancelPts);
  const newArea    = `${newLine} L ${newPts[newPts.length-1].x.toFixed(2)} ${bottom} L ${newPts[0].x.toFixed(2)} ${bottom} Z`;
  const cancelArea = `${cancelLine} L ${cancelPts[cancelPts.length-1].x.toFixed(2)} ${bottom} L ${cancelPts[0].x.toFixed(2)} ${bottom} Z`;

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

        {/* Y grid */}
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

        {/* Area fills */}
        <path d={newArea}    fill="url(#sg-new)"    />
        <path d={cancelArea} fill="url(#sg-cancel)" />

        {/* Lines */}
        <path d={newLine}    fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={cancelLine} fill="none" stroke={RED}   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Nodes */}
        {newPts.map((p, i) => (
          <circle key={`n${i}`} cx={p.x} cy={p.y} r="3" fill={GREEN} opacity="0.85" />
        ))}
        <circle cx={newPts[newPts.length-1].x} cy={newPts[newPts.length-1].y} r="5" fill={GREEN} />

        {cancelPts.map((p, i) => (
          <circle key={`c${i}`} cx={p.x} cy={p.y} r="3" fill={RED} opacity="0.85" />
        ))}
        <circle cx={cancelPts[cancelPts.length-1].x} cy={cancelPts[cancelPts.length-1].y} r="5" fill={RED} />

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

export default function Subscriptions() {
  const [period, setPeriod] = useState<Period>('week');
  const data = trendData[period];

  const netNew     = sum(data.newSubs) - sum(data.cancels);
  const avgNew     = pavg(data.newSubs);
  const avgCancel  = pavg(data.cancels);

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

      {/* Plan Distribution */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>
          Plan Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-center">
          {/* Donut */}
          <div className="flex justify-center">
            <DonutChart />
          </div>
          {/* Plan rows */}
          <div className="space-y-4">
            {plans.map(plan => {
              const pct = ((plan.subs / TOTAL_SUBS) * 100).toFixed(1);
              const mrrPct = ((plan.mrr / TOTAL_MRR) * 100).toFixed(1);
              return (
                <div key={plan.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                           style={{ background: plan.color }} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {plan.label}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                            style={{ background: `${plan.color}18`, color: plan.color }}>
                        ${plan.price}/mo
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                        {plan.subs.toLocaleString()}
                      </span>
                      <span className="text-xs ml-1.5" style={{ color: 'var(--text-light)' }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                    <div className="h-full rounded-full"
                         style={{ width: `${pct}%`, background: plan.color }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span style={{ fontSize: 10, color: 'var(--text-light)' }}>
                      MRR contribution
                    </span>
                    <span style={{ fontSize: 10, color: plan.color, fontWeight: 600 }}>
                      ${plan.mrr.toLocaleString()} · {mrrPct}%
                    </span>
                  </div>
                </div>
              );
            })}
            {/* Total MRR */}
            <div className="pt-3 flex items-center justify-between"
                 style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Total MRR
              </span>
              <span className="text-base font-black" style={{ color: 'var(--text)' }}>
                ${TOTAL_MRR.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Trend */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Subscription Trend
            </h3>
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
          {/* Period toggle */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg)' }}>
            {(['week', 'month', 'year'] as Period[]).map(p => {
              const active = period === p;
              return (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                  style={{
                    background: active ? ACCENT : 'transparent',
                    color:      active ? '#fff' : 'var(--text-secondary)',
                  }}>
                  {PERIOD_LABELS[p]}
                </button>
              );
            })}
          </div>
        </div>

        <TrendChart period={period} />

        {/* Period stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Net New',         value: `+${netNew}`,  color: GREEN  },
            { label: 'Avg New / Period', value: `${avgNew}`,  color: 'var(--text)' },
            { label: 'Avg Cancels',     value: `${avgCancel}`, color: RED   },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-lg text-center"
                 style={{ background: 'var(--bg)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-light)' }}>{s.label}</div>
              <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Recent Activity
        </h3>
        <div className="space-y-2">
          {recentActivity.map((item, i) => {
            const meta   = ACTION_META[item.action];
            const Icon   = meta.icon;
            const detail = item.action === 'upgraded' || item.action === 'downgraded'
              ? `${item.from} → ${item.to}`
              : item.plan ?? '';
            const planColor = PLAN_COLORS[item.plan ?? item.to ?? ''] ?? 'var(--text-secondary)';

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
                      @{item.user}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>
                    {detail && (
                      <span className="text-xs font-medium" style={{ color: planColor }}>
                        {detail}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-light)' }}>
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
