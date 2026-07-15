import { useState } from 'react';
import { Users, Clock, Zap, TrendingUp, UserCheck, Heart, Network } from 'lucide-react';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const liveKPIs: { label: string; value: string; sub: string; icon: React.ElementType }[] = [
  { label: 'Online Now',     value: '1,847',  sub: 'active sessions',    icon: Zap        },
  { label: 'Peak Today',     value: '4,231',  sub: 'at 9:14 PM',         icon: TrendingUp },
  { label: 'Avg Session',    value: '18.4m',  sub: 'per user today',      icon: Clock      },
  { label: 'Sessions Today', value: '12,840', sub: 'across all types',    icon: Users      },
];

// 24 hourly data points (index 0 = midnight)
const hourlyData = [
    420,  280,  190,  140,  120,  180,
    320,  580,  890, 1240, 1480, 1620,
   1580, 1420, 1340, 1380, 1520, 1840,
   2240, 2680, 3120, 3480, 2940, 1820,
];
const MONTHLY_PEAK_AVG = 3100;
const YEARLY_PEAK_AVG  = 2640;

const X_HOUR_LABELS = [
  { i: 0,  label: '12am' }, { i: 3,  label: '3am'  },
  { i: 6,  label: '6am'  }, { i: 9,  label: '9am'  },
  { i: 12, label: '12pm' }, { i: 15, label: '3pm'  },
  { i: 18, label: '6pm'  }, { i: 21, label: '9pm'  },
];

type Period = 'week' | 'month' | 'year';

const PERIOD_LABELS: Record<Period, string> = {
  week:  'This Week',
  month: 'This Month',
  year:  'This Year',
};

const trendData: Record<Period, {
  labels: string[];
  total: number[];
  patriarchs: number[];
  muses: number[];
  constellations: number[];
  monthlyAvg: number;
  yearlyAvg: number;
}> = {
  week: {
    labels:         ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    total:          [8420,  9140,  8780,  9380, 10240, 11840, 10120],
    patriarchs:     [2840,  3010,  2920,  3140,  3480,  3920,  3240],
    muses:          [4820,  5280,  5040,  5380,  5840,  6720,  5840],
    constellations: [ 760,   850,   820,   860,   920,  1200,  1040],
    monthlyAvg: 9480,
    yearlyAvg:  7840,
  },
  month: {
    labels:         ['Jul 1', 'Jul 8', 'Jul 15', 'Jul 22', 'Jul 29'],
    total:          [64800, 67200, 70400, 72800, 75200],
    patriarchs:     [21360, 22080, 23040, 24000, 24800],
    muses:          [37200, 38640, 40320, 41920, 43200],
    constellations: [ 6240,  6480,  7040,  6880,  7200],
    monthlyAvg: 70080,
    yearlyAvg:  54280,
  },
  year: {
    labels:         ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    total:          [42840, 45120, 48390, 51840, 56240, 61820, 67340, 74120, 81490, 87230, 94180, 98420],
    patriarchs:     [14120, 14840, 15920, 17040, 18480, 20240, 22120, 24120, 26480, 28240, 30480, 32120],
    muses:          [24820, 26140, 28040, 30120, 32840, 36040, 39480, 43480, 47840, 51240, 55480, 58240],
    constellations: [ 3900,  4140,  4430,  4680,  4920,  5540,  5740,  6520,  7170,  7750,  8220,  8060],
    monthlyAvg: 67420,
    yearlyAvg:  67420,
  },
};

const topUsers: { name: string; type: string; sessions: number; avgDuration: string; total: string }[] = [
  { name: 'sophia_l',    type: 'Muse',          sessions: 47, avgDuration: '24m', total: '18h 48m' },
  { name: 'marcus_w',    type: 'Patriarch',      sessions: 41, avgDuration: '21m', total: '14h 21m' },
  { name: 'webb_const',  type: 'Constellation',  sessions: 38, avgDuration: '19m', total: '12h 2m'  },
  { name: 'isabella_c',  type: 'Muse',           sessions: 35, avgDuration: '22m', total: '12h 50m' },
  { name: 'james_ok',    type: 'Patriarch',      sessions: 31, avgDuration: '18m', total: '9h 18m'  },
  { name: 'luna_r',      type: 'Muse',           sessions: 28, avgDuration: '20m', total: '9h 20m'  },
  { name: 'alex_cr',     type: 'Patriarch',      sessions: 24, avgDuration: '17m', total: '6h 48m'  },
];

const TYPE_COLORS: Record<string, string> = {
  Patriarch:     ACCENT,
  Muse:          GOLD,
  Constellation: PURPLE,
};
const TYPE_ICONS: Record<string, React.ElementType> = {
  Patriarch:     UserCheck,
  Muse:          Heart,
  Constellation: Network,
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

function avg(arr: number[]) {
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

// ─── Hourly Activity Chart ────────────────────────────────────────────────────

function HourlyChart() {
  const W = 520, H = 160;
  const pad = { t: 20, r: 20, b: 32, l: 44 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const maxVal = Math.max(...hourlyData);
  const n = hourlyData.length;
  const barW = cW / n;
  const gap = 2;
  const peakIdx = hourlyData.indexOf(maxVal);

  function bX(i: number) { return pad.l + i * barW + gap / 2; }
  function bH(v: number) { return (v / maxVal) * cH; }
  function bY(v: number) { return pad.t + cH - bH(v); }

  function barOpacity(v: number) {
    const r = v / maxVal;
    if (r > 0.85) return 1;
    if (r > 0.65) return 0.62;
    if (r > 0.45) return 0.42;
    if (r > 0.25) return 0.26;
    return 0.14;
  }

  const refYmo = pad.t + cH - (MONTHLY_PEAK_AVG / maxVal) * cH;
  const refYyr = pad.t + cH - (YEARLY_PEAK_AVG  / maxVal) * cH;
  const yTicks = [0, 1000, 2000, 3000];

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 420, width: '100%', height: 'auto', display: 'block' }}>
        {/* Y grid + labels */}
        {yTicks.map(t => {
          const y = pad.t + cH - (t / maxVal) * cH;
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y}
                    stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={pad.l - 6} y={y + 4} textAnchor="end"
                    style={{ fill: 'var(--text-light)', fontSize: 9 }}>
                {t === 0 ? '0' : `${t / 1000}k`}
              </text>
            </g>
          );
        })}

        {/* Reference lines */}
        <line x1={pad.l} x2={W - pad.r} y1={refYmo} y2={refYmo}
              stroke={GOLD} strokeWidth="1" strokeDasharray="5,3" />
        <line x1={pad.l} x2={W - pad.r} y1={refYyr} y2={refYyr}
              stroke={PURPLE} strokeWidth="1" strokeDasharray="5,3" />

        {/* Bars */}
        {hourlyData.map((v, i) => (
          <rect key={i}
            x={bX(i)} y={bY(v)} width={barW - gap} height={bH(v)}
            rx="2" fill={ACCENT} fillOpacity={i === peakIdx ? 1 : barOpacity(v)}
          />
        ))}

        {/* X labels */}
        {X_HOUR_LABELS.map(({ i, label }) => (
          <text key={label} x={bX(i) + (barW - gap) / 2} y={H - 8} textAnchor="middle"
                style={{ fill: 'var(--text-light)', fontSize: 9 }}>
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── Engagement Trend Chart ───────────────────────────────────────────────────

function TrendChart({ period }: { period: Period }) {
  const data = trendData[period];
  const W = 520, H = 160;
  const pad = { t: 20, r: 16, b: 32, l: 52 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const bottom = pad.t + cH;

  const ceiling = Math.max(...data.total, data.monthlyAvg, data.yearlyAvg) * 1.15;
  const yStep   = Math.pow(10, Math.floor(Math.log10(ceiling / 4)));
  const maxVal  = Math.ceil(ceiling / yStep) * yStep;
  const yTicks  = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i));

  const n = data.labels.length;
  function toX(i: number) { return pad.l + (i / (n - 1)) * cW; }
  function toY(v: number) { return pad.t + cH - (v / maxVal) * cH; }

  const pts      = data.total.map((v, i) => ({ x: toX(i), y: toY(v) }));
  const linePath = smoothCurve(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(2)} ${bottom} L ${pts[0].x.toFixed(2)} ${bottom} Z`;
  const showRefs = period !== 'year';
  const gid      = `tg-${period}`;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 420, width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={ACCENT} stopOpacity="0.25" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
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

        {/* Monthly / yearly avg reference lines */}
        {showRefs && (
          <>
            <line x1={pad.l} x2={W - pad.r} y1={toY(data.monthlyAvg)} y2={toY(data.monthlyAvg)}
                  stroke={GOLD} strokeWidth="1" strokeDasharray="5,3" />
            <line x1={pad.l} x2={W - pad.r} y1={toY(data.yearlyAvg)} y2={toY(data.yearlyAvg)}
                  stroke={PURPLE} strokeWidth="1" strokeDasharray="5,3" />
          </>
        )}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gid})`} />

        {/* Smooth line */}
        <path d={linePath} fill="none" stroke={ACCENT} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />

        {/* Nodes */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={ACCENT} opacity="0.85" />
        ))}
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="5" fill={ACCENT} />

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

export default function ActiveUsers() {
  const [period, setPeriod] = useState<Period>('week');
  const data = trendData[period];

  const periodAvg = avg(data.total);
  const pAvg      = avg(data.patriarchs);
  const mAvg      = avg(data.muses);
  const cAvg      = avg(data.constellations);
  const showRefs  = period !== 'year';

  return (
    <div className="space-y-5">

      {/* KPI Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {liveKPIs.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4">
              <div className="mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: `${ACCENT}15` }}>
                  <Icon size={15} style={{ color: ACCENT }} />
                </div>
              </div>
              <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{k.label}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>{k.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Activity by Hour */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Activity by Hour
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
              Concurrent sessions throughout the day · today
            </p>
          </div>
          {/* Reference line legend */}
          <div className="flex flex-col gap-1.5 text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs" style={{ color: 'var(--text-light)' }}>Monthly peak avg</span>
              <div className="w-6 border-t border-dashed" style={{ borderColor: GOLD }} />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs" style={{ color: 'var(--text-light)' }}>Yearly peak avg</span>
              <div className="w-6 border-t border-dashed" style={{ borderColor: PURPLE }} />
            </div>
          </div>
        </div>
        <HourlyChart />
      </div>

      {/* Engagement Trend */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Engagement Trend
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
              Daily active users · {PERIOD_LABELS[period].toLowerCase()}
            </p>
          </div>
          {/* Period toggle */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg)' }}>
            {(['week', 'month', 'year'] as Period[]).map(p => {
              const active = period === p;
              return (
                <button key={p} onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize"
                  style={{
                    background: active ? ACCENT : 'transparent',
                    color:      active ? '#fff' : 'var(--text-secondary)',
                  }}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        <TrendChart period={period} />

        {/* Avg comparison row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: `${PERIOD_LABELS[period]} Avg`, value: periodAvg, color: ACCENT },
            { label: 'Monthly Avg', value: data.monthlyAvg, color: showRefs ? GOLD : 'var(--text-light)' },
            { label: 'Yearly Avg',  value: data.yearlyAvg,  color: showRefs ? PURPLE : 'var(--text-light)' },
          ].map(row => (
            <div key={row.label} className="p-3 rounded-lg text-center"
                 style={{ background: 'var(--bg)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-light)' }}>{row.label}</div>
              <div className="text-lg font-black" style={{ color: row.color }}>
                {fmt(row.value)}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-light)' }}>DAU / day</div>
            </div>
          ))}
        </div>

        {/* Type breakdown */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: 'Patriarchs',     value: pAvg, color: ACCENT,  icon: UserCheck },
            { label: 'Muses',          value: mAvg, color: GOLD,    icon: Heart     },
            { label: 'Constellations', value: cAvg, color: PURPLE,  icon: Network   },
          ].map(row => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center gap-2 p-3 rounded-lg"
                   style={{ background: 'var(--bg)' }}>
                <Icon size={13} style={{ color: row.color, flexShrink: 0 }} />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate" style={{ color: row.color }}>
                    {fmt(row.value)}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-light)', fontSize: 10 }}>
                    {row.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Active Users */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={15} style={{ color: ACCENT }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Top Active Users
          </h3>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>
            by sessions this week
          </span>
        </div>
        <div className="space-y-2">
          {topUsers.map((u, i) => {
            const typeColor = TYPE_COLORS[u.type];
            const TypeIcon  = TYPE_ICONS[u.type];
            return (
              <div key={u.name} className="flex items-center gap-3 p-3 rounded-lg"
                   style={{ background: 'var(--bg)' }}>
                <span className="text-sm font-black w-5 text-center flex-shrink-0"
                      style={{ color: i < 3 ? ['#c8972b','#a0a8bb','#cd7f32'][i] : 'var(--text-light)' }}>
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ background: `${typeColor}20` }}>
                  <TypeIcon size={13} style={{ color: typeColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    @{u.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-light)' }}>
                    {u.sessions} sessions · {u.avgDuration} avg
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{u.total}</div>
                  <div className="text-xs" style={{ color: 'var(--text-light)' }}>total time</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                      style={{ background: `${typeColor}18`, color: typeColor }}>
                  {u.type}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
