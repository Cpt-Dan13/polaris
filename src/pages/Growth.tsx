import { Users, TrendingUp, Activity, UserMinus, MapPin } from 'lucide-react';

const ACCENT      = '#e94560';
const GOLD        = '#c8972b';
const PURPLE      = '#9c27b0';
const RANK_COLORS = ['#c8972b', '#a0a8bb', '#cd7f32'];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const acquisitionData = {
  patriarchs:     [420, 390, 451, 480, 512, 498, 534, 581, 620, 644, 698, 731],
  muses:          [680, 720, 755, 810, 892, 948, 1020, 1104, 1198, 1280, 1354, 1421],
  constellations: [45,  52,  61,  78,  94,  103, 128,  142,  167,  189,  214,  241],
};

const kpis: {
  label: string; value: string; delta: string; positive: boolean; icon: React.ElementType;
}[] = [
  { label: 'New Users (Month)', value: '4,821', delta: '+12.4%', positive: true,  icon: Users      },
  { label: 'MoM Growth Rate',   value: '12.4%', delta: '+2.1pp', positive: true,  icon: TrendingUp },
  { label: 'DAU / MAU Ratio',   value: '34.2%', delta: '+1.8pp', positive: true,  icon: Activity   },
  { label: 'Monthly Churn',     value: '6.8%',  delta: '−0.4pp', positive: true,  icon: UserMinus  },
];

const retentionData = [
  { label: 'Patriarchs',     color: ACCENT,  d1: 72, d7: 48, d30: 31 },
  { label: 'Muses',          color: GOLD,    d1: 84, d7: 63, d30: 42 },
  { label: 'Constellations', color: PURPLE,  d1: 68, d7: 41, d30: 24 },
];

const sourcesData = [
  { label: 'Organic Search', pct: 38, color: ACCENT    },
  { label: 'Word of Mouth',  pct: 29, color: GOLD      },
  { label: 'Social Media',   pct: 21, color: '#4caf50' },
  { label: 'Paid Ads',       pct: 12, color: '#2196f3' },
];

const marketsData = [
  { city: 'Phoenix, AZ',  users: 387,  delta: 31.2 },
  { city: 'Atlanta, GA',  users: 892,  delta: 24.1 },
  { city: 'Dallas, TX',   users: 445,  delta: 22.8 },
  { city: 'Houston, TX',  users: 741,  delta: 18.7 },
  { city: 'Miami, FL',    users: 623,  delta: 16.4 },
  { city: 'Chicago, IL',  users: 598,  delta: 14.2 },
  { city: 'New York, NY', users: 1204, delta: 11.8 },
];

// ─── Acquisition Chart ────────────────────────────────────────────────────────

const SERIES_COLORS: Record<string, string> = {
  patriarchs:     ACCENT,
  muses:          GOLD,
  constellations: PURPLE,
};
const SERIES_LABELS: Record<string, string> = {
  patriarchs:     'Patriarchs',
  muses:          'Muses',
  constellations: 'Constellations',
};

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

function smoothArea(pts: { x: number; y: number }[], bottom: number): string {
  const line  = smoothCurve(pts);
  const last  = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L ${last.x.toFixed(2)} ${bottom.toFixed(2)} L ${first.x.toFixed(2)} ${bottom.toFixed(2)} Z`;
}

function AcquisitionChart() {
  const W = 520, H = 180;
  const pad = { t: 16, r: 16, b: 36, l: 44 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const maxVal = 1500;
  const n = MONTHS.length;
  const bottom = pad.t + cH;

  function toX(i: number) { return pad.l + (i / (n - 1)) * cW; }
  function toY(v: number) { return pad.t + cH - (v / maxVal) * cH; }
  function getPoints(data: number[]) {
    return data.map((v, i) => ({ x: toX(i), y: toY(v) }));
  }

  const yTicks = [0, 500, 1000, 1500];
  const series = ['patriarchs', 'muses', 'constellations'] as const;

  return (
    <div>
      <div className="flex gap-5 mb-4 flex-wrap">
        {series.map(key => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-6 h-0.5 rounded-full" style={{ background: SERIES_COLORS[key] }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {SERIES_LABELS[key]}
            </span>
          </div>
        ))}
      </div>
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ minWidth: 420, width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            {series.map(key => (
              <linearGradient key={key} id={`acq-grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={SERIES_COLORS[key]} stopOpacity="0.22" />
                <stop offset="100%" stopColor={SERIES_COLORS[key]} stopOpacity="0.01" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid + Y labels */}
          {yTicks.map(t => (
            <g key={t}>
              <line
                x1={pad.l} x2={W - pad.r} y1={toY(t)} y2={toY(t)}
                stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3"
              />
              <text x={pad.l - 6} y={toY(t) + 4} textAnchor="end"
                    style={{ fill: 'var(--text-light)', fontSize: 9 }}>
                {t === 0 ? '0' : `${t / 1000}k`}
              </text>
            </g>
          ))}

          {/* X labels */}
          {MONTHS.map((m, i) => (
            <text key={m} x={toX(i)} y={H - 7} textAnchor="middle"
                  style={{ fill: 'var(--text-light)', fontSize: 9 }}>
              {m}
            </text>
          ))}

          {/* Area fills (behind lines) */}
          {series.map(key => {
            const pts = getPoints(acquisitionData[key]);
            return (
              <path key={`area-${key}`}
                    d={smoothArea(pts, bottom)}
                    fill={`url(#acq-grad-${key})`} />
            );
          })}

          {/* Smooth lines + terminal dot */}
          {series.map(key => {
            const color = SERIES_COLORS[key];
            const pts   = getPoints(acquisitionData[key]);
            const last  = pts[pts.length - 1];
            return (
              <g key={key}>
                <path
                  d={smoothCurve(pts)} fill="none"
                  stroke={color} strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                {/* Intermediate dots */}
                {pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3"
                          fill={color} opacity="0.85" />
                ))}
                {/* Prominent terminal dot */}
                <circle cx={last.x} cy={last.y} r="5" fill={color} />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Growth() {
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
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: k.positive ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)',
                    color:      k.positive ? '#4caf50'              : '#f44336',
                  }}
                >
                  {k.delta}
                </span>
              </div>
              <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Acquisition Trend */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              New User Acquisition
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
              Monthly signups by profile type · Jan – Dec 2025
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-black" style={{ color: ACCENT }}>4,821</div>
            <div className="text-xs" style={{ color: 'var(--text-light)' }}>this month</div>
          </div>
        </div>
        <AcquisitionChart />
      </div>

      {/* Retention + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Retention Snapshot */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Retention Snapshot
          </h3>
          <div
            className="grid pb-2 mb-1"
            style={{
              gridTemplateColumns: '1fr repeat(3, 56px)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span />
            {['D1', 'D7', 'D30'].map(d => (
              <span key={d} className="text-xs font-semibold text-center"
                    style={{ color: 'var(--text-secondary)' }}>
                {d}
              </span>
            ))}
          </div>
          {retentionData.map(row => (
            <div
              key={row.label}
              className="grid py-2.5 items-center"
              style={{ gridTemplateColumns: '1fr repeat(3, 56px)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {row.label}
                </span>
              </div>
              {[row.d1, row.d7, row.d30].map((v, i) => {
                const color = v >= 75 ? '#4caf50' : v >= 55 ? GOLD : v >= 35 ? ACCENT : '#f44336';
                return (
                  <div key={i} className="text-center">
                    <span className="text-sm font-bold" style={{ color }}>{v}%</span>
                  </div>
                );
              })}
            </div>
          ))}
          <p className="text-xs mt-3" style={{ color: 'var(--text-light)' }}>
            % of users still active at Day 1 / 7 / 30 after signup
          </p>
        </div>

        {/* Signup Sources */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>
            Signup Sources
          </h3>
          <div className="space-y-4">
            {sourcesData.map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {s.label}
                  </span>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                       style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          {/* Stacked bar summary */}
          <div className="flex h-3 rounded-full overflow-hidden gap-px mt-6">
            {sourcesData.map(s => (
              <div
                key={s.label}
                style={{ width: `${s.pct}%`, background: s.color }}
                title={`${s.label}: ${s.pct}%`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Top Growing Markets */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={15} style={{ color: ACCENT }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Top Growing Markets
          </h3>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>
            ranked by MoM user growth
          </span>
        </div>
        <div className="space-y-2">
          {marketsData.map((m, i) => {
            const deltaColor = m.delta > 25 ? '#4caf50' : m.delta > 15 ? GOLD : ACCENT;
            return (
              <div key={m.city} className="flex items-center gap-3 p-3 rounded-lg"
                   style={{ background: 'var(--bg)' }}>
                <span
                  className="text-sm font-black w-5 text-center flex-shrink-0"
                  style={{ color: i < 3 ? RANK_COLORS[i] : 'var(--text-light)' }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    {m.city}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-light)' }}>
                    {m.users.toLocaleString()} new users this month
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: deltaColor }}>
                    +{m.delta}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-light)' }}>vs last month</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
