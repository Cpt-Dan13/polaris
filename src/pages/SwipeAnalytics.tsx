import { useState } from 'react';
import { Zap, Heart, Link2, Star, ChevronDown } from 'lucide-react';

const ACCENT  = '#e94560';
const GOLD    = '#c8972b';
const PURPLE  = '#9c27b0';
const GREEN   = '#4caf50';
const PASS_C  = '#6b7280';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const kpis: { label: string; value: string; delta: string; positive: boolean; icon: React.ElementType }[] = [
  { label: 'Total Swipes Today', value: '47.3k', delta: '+8.2%',  positive: true, icon: Zap   },
  { label: 'Like Rate',          value: '62.4%', delta: '+1.4pp', positive: true, icon: Heart },
  { label: 'Match Rate',         value: '18.7%', delta: '+0.6pp', positive: true, icon: Link2 },
  { label: 'Super Likes',        value: '1,247', delta: '+14.2%', positive: true, icon: Star  },
];

type Period = 'week' | 'month' | 'year';
const PERIOD_LABELS: Record<Period, string> = { week: 'Week', month: 'Month', year: 'Year' };

const volumeData: Record<Period, { labels: string[]; likes: number[]; passes: number[] }> = {
  week: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    likes:  [18420, 19840, 18960, 21340, 24820, 31240, 27560],
    passes: [11080, 11940, 11400, 12840, 14940, 18800, 16580],
  },
  month: {
    labels: ['Jul 1', 'Jul 8', 'Jul 15', 'Jul 22', 'Jul 29'],
    likes:  [128400, 134200, 141800, 148400, 162000],
    passes: [77200,  80720,  85320,  89240,  97520],
  },
  year: {
    labels: ['Jan',  'Feb',  'Mar',  'Apr',  'May',  'Jun',  'Jul',  'Aug',  'Sep',  'Oct',  'Nov',  'Dec'],
    likes:  [382000, 421000, 462000, 514000, 583000, 648000, 721000, 784000, 831000, 892000, 948000, 1024000],
    passes: [229000, 253000, 278000, 309000, 351000, 390000, 434000, 471000, 499000, 536000, 570000, 616000],
  },
};

const funnelStages = [
  { label: 'Total Swipes',  count: 47280, color: ACCENT  },
  { label: 'Likes Sent',    count: 29487, color: GREEN   },
  { label: 'Mutual Likes',  count: 8412,  color: GOLD    },
  { label: 'Conversations', count: 6190,  color: PURPLE  },
  { label: 'Active Chats',  count: 3847,  color: '#00bcd4' },
];

const decisions = [
  { label: 'Like',       pct: 62.4, color: GREEN  },
  { label: 'Pass',       pct: 35.8, color: PASS_C },
  { label: 'Super Like', pct: 1.8,  color: GOLD   },
];

// 24 hourly data points (index 0 = midnight)
const hourlySwipes = [
  220, 140,  95,  70,  60,  90,
  210, 580, 1240, 1820, 2140, 2380,
  2100, 1960, 1780, 1820, 2240, 2980,
  3840, 4120, 3980, 3420, 2640, 1480,
];
const X_HOUR_LABELS = [
  { i: 0,  label: '12am' }, { i: 3,  label: '3am'  },
  { i: 6,  label: '6am'  }, { i: 9,  label: '9am'  },
  { i: 12, label: '12pm' }, { i: 15, label: '3pm'  },
  { i: 18, label: '6pm'  }, { i: 21, label: '9pm'  },
];

const userTypeStats: { type: string; swipes: number; likeRate: string; matchRate: string; avgDaily: number; color: string }[] = [
  { type: 'Patriarchs',     swipes: 31240, likeRate: '71.2%', matchRate: '22.4%', avgDaily: 52, color: ACCENT  },
  { type: 'Muses',          swipes: 9840,  likeRate: '48.3%', matchRate: '12.1%', avgDaily: 18, color: GOLD    },
  { type: 'Constellations', swipes: 6200,  likeRate: '54.8%', matchRate: '16.7%', avgDaily: 38, color: PURPLE  },
];

const topLiked: { name: string; likes: number; pct: number }[] = [
  { name: 'Isla Seraphin',   likes: 4820, pct: 100 },
  { name: 'Elena Rossi',     likes: 4240, pct: 88  },
  { name: 'Aurora Solstice', likes: 3980, pct: 83  },
  { name: 'Lyra Belrose',    likes: 3120, pct: 65  },
  { name: 'Seraphina Lux',   likes: 2840, pct: 59  },
];

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

function fmtK(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k`;
  return String(n);
}

function fmtAxis(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
  if (n >= 1000)    return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

// ─── Swipe Volume Chart ───────────────────────────────────────────────────────

function VolumeChart({ period }: { period: Period }) {
  const data   = volumeData[period];
  const W = 520, H = 160;
  const pad = { t: 18, r: 16, b: 32, l: 52 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const bottom = pad.t + cH;
  const n = data.labels.length;

  const maxVal = Math.max(...data.likes) * 1.18;
  function toX(i: number) { return pad.l + (i / (n - 1)) * cW; }
  function toY(v: number) { return pad.t + cH - (v / maxVal) * cH; }
  function pts(arr: number[]) { return arr.map((v, i) => ({ x: toX(i), y: toY(v) })); }

  const likePts  = pts(data.likes);
  const passPts  = pts(data.passes);
  const likeLine = smoothCurve(likePts);
  const passLine = smoothCurve(passPts);
  const likeArea = `${likeLine} L ${likePts[likePts.length-1].x.toFixed(2)} ${bottom} L ${likePts[0].x.toFixed(2)} ${bottom} Z`;
  const passArea = `${passLine} L ${passPts[passPts.length-1].x.toFixed(2)} ${bottom} L ${passPts[0].x.toFixed(2)} ${bottom} Z`;

  const step   = Math.pow(10, Math.floor(Math.log10(maxVal / 4)));
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i / step) * step);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 420, width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="sw-likes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={GREEN} stopOpacity="0.22" />
            <stop offset="100%" stopColor={GREEN} stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="sw-passes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={PASS_C} stopOpacity="0.15" />
            <stop offset="100%" stopColor={PASS_C} stopOpacity="0.01" />
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

        <path d={passArea} fill="url(#sw-passes)" />
        <path d={likeArea} fill="url(#sw-likes)"  />
        <path d={passLine} fill="none" stroke={PASS_C} strokeWidth="1.8" strokeLinecap="round" />
        <path d={likeLine} fill="none" stroke={GREEN}  strokeWidth="2"   strokeLinecap="round" />

        {passPts.map((p, i) => <circle key={`p${i}`} cx={p.x} cy={p.y} r="3" fill={PASS_C} opacity="0.85" />)}
        <circle cx={passPts[passPts.length-1].x} cy={passPts[passPts.length-1].y} r="5" fill={PASS_C} />

        {likePts.map((p, i) => <circle key={`l${i}`} cx={p.x} cy={p.y} r="3" fill={GREEN} opacity="0.85" />)}
        <circle cx={likePts[likePts.length-1].x} cy={likePts[likePts.length-1].y} r="5" fill={GREEN} />

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

// ─── Decision Donut ───────────────────────────────────────────────────────────

function DecisionDonut() {
  const cx = 75, cy = 75, r = 52;
  const circumference = 2 * Math.PI * r;
  const gapDash = 3;
  let cumPct = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 150 150" style={{ width: 150, height: 150 }}>
        {decisions.map(d => {
          const dash = (d.pct / 100) * circumference - gapDash;
          const gap  = circumference - dash;
          const rot  = -90 + cumPct * 3.6;
          cumPct += d.pct;
          return (
            <circle key={d.label}
              cx={cx} cy={cy} r={r}
              fill="none" stroke={d.color} strokeWidth="20"
              strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
              transform={`rotate(${rot.toFixed(2)} ${cx} ${cy})`}
            />
          );
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" fontWeight="900" fontSize="20"
              style={{ fill: 'var(--text)' }}>
          62.4%
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9"
              style={{ fill: 'var(--text-light)' }}>
          Like Rate
        </text>
      </svg>

      <div className="space-y-2 w-full">
        {decisions.map(d => (
          <div key={d.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
            </div>
            <span className="text-sm font-bold" style={{ color: d.color }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Match Funnel ─────────────────────────────────────────────────────────────

function MatchFunnel() {
  const maxCount = funnelStages[0].count;
  return (
    <div className="space-y-0.5">
      {funnelStages.map((stage, i) => {
        const widthPct  = (stage.count / maxCount * 100).toFixed(1);
        const convRate  = i > 0
          ? ((stage.count / funnelStages[i - 1].count) * 100).toFixed(1)
          : null;
        const dropRate  = convRate ? (100 - parseFloat(convRate)).toFixed(1) : null;
        return (
          <div key={stage.label}>
            {convRate && (
              <div className="flex items-center gap-2 py-1.5">
                <ChevronDown size={12} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                  <span className="font-semibold" style={{ color: stage.color }}>{convRate}%</span>
                  {' '}converted · {dropRate}% dropped
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {stage.label}
                </span>
                <span className="text-sm font-black" style={{ color: stage.color }}>
                  {fmtK(stage.count)}
                </span>
              </div>
              <div className="h-7 rounded-lg overflow-hidden" style={{ background: 'var(--bg)' }}>
                <div className="h-full rounded-lg flex items-center"
                     style={{
                       width: `${widthPct}%`,
                       background: `${stage.color}22`,
                       borderLeft: `3px solid ${stage.color}`,
                     }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Hourly Swipe Activity ────────────────────────────────────────────────────

function HourlyChart() {
  const W = 520, H = 130;
  const pad = { t: 12, r: 16, b: 28, l: 44 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const bottom = pad.t + cH;
  const n = 24;
  const barW = (cW / n) * 0.6;
  const maxVal = Math.max(...hourlySwipes);
  const peakIdx = hourlySwipes.indexOf(maxVal);

  function toX(i: number) { return pad.l + (i + 0.5) * (cW / n); }
  function toH(v: number) { return (v / maxVal) * cH; }

  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 420, width: '100%', height: 'auto', display: 'block' }}>
        {yTicks.map((t, ti) => {
          const y = pad.t + cH - (t / maxVal) * cH;
          return (
            <g key={ti}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y}
                    stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={pad.l - 6} y={y + 4} textAnchor="end"
                    style={{ fill: 'var(--text-light)', fontSize: 9 }}>
                {fmtAxis(t)}
              </text>
            </g>
          );
        })}

        {hourlySwipes.map((v, i) => {
          const x    = toX(i);
          const h    = toH(v);
          const isPeak = i === peakIdx;
          const intensity = v / maxVal;
          const fill = isPeak ? ACCENT : `${ACCENT}${Math.round(intensity * 180 + 40).toString(16).padStart(2, '0')}`;
          return (
            <rect key={i}
              x={x - barW / 2} y={bottom - h}
              width={barW} height={h}
              rx="2" fill={fill}
            />
          );
        })}

        {X_HOUR_LABELS.map(({ i, label }) => (
          <text key={label} x={toX(i)} y={H - 6} textAnchor="middle"
                style={{ fill: 'var(--text-light)', fontSize: 9 }}>
            {label}
          </text>
        ))}

        {/* Peak label */}
        <text x={toX(peakIdx)} y={bottom - toH(maxVal) - 4} textAnchor="middle"
              style={{ fill: ACCENT, fontSize: 9, fontWeight: 700 }}>
          peak
        </text>
      </svg>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SwipeAnalytics() {
  const [period, setPeriod] = useState<Period>('week');
  const data = volumeData[period];
  const totalLikes  = data.likes[data.likes.length - 1];
  const totalPasses = data.passes[data.passes.length - 1];

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
                      style={{ background: 'rgba(76,175,80,0.12)', color: GREEN }}>
                  {k.delta}
                </span>
              </div>
              <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Swipe Volume Chart */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Swipe Volume</h3>
            <div className="flex items-center gap-4 mt-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 rounded-full" style={{ background: GREEN }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Likes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 rounded-full" style={{ background: PASS_C }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Passes</span>
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

        <VolumeChart period={period} />

        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Likes',        value: fmtK(totalLikes),  color: GREEN   },
            { label: 'Passes',       value: fmtK(totalPasses), color: PASS_C  },
            { label: 'Like Rate',    value: `${(totalLikes / (totalLikes + totalPasses) * 100).toFixed(1)}%`, color: ACCENT },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-lg text-center" style={{ background: 'var(--bg)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-light)' }}>{s.label}</div>
              <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Funnel + Decision Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Match Funnel */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>
            Match Conversion Funnel
          </h3>
          <MatchFunnel />
        </div>

        {/* Decision Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>
            Swipe Decision Breakdown
          </h3>
          <DecisionDonut />
        </div>

      </div>

      {/* Hourly Swipe Activity */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Swipe Activity by Hour
          </h3>
          <span className="text-xs" style={{ color: 'var(--text-light)' }}>
            Peak at 7pm · {fmtK(Math.max(...hourlySwipes))} swipes
          </span>
        </div>
        <HourlyChart />
      </div>

      {/* User Type Stats + Top Liked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* User Type Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Swipe Behaviour by Type
          </h3>

          {/* Stacked bar for swipe share */}
          <div className="flex h-2 rounded-full overflow-hidden gap-px mb-5">
            {userTypeStats.map(u => (
              <div key={u.type}
                   style={{ width: `${(u.swipes / userTypeStats.reduce((a, x) => a + x.swipes, 0) * 100).toFixed(1)}%`, background: u.color }}
                   title={u.type} />
            ))}
          </div>

          <div className="space-y-4">
            {userTypeStats.map(u => (
              <div key={u.type} className="p-4 rounded-xl" style={{ background: 'var(--bg)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: u.color }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {u.type}
                    </span>
                  </div>
                  <span className="text-sm font-black" style={{ color: u.color }}>
                    {fmtK(u.swipes)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Like Rate',   value: u.likeRate  },
                    { label: 'Match Rate',  value: u.matchRate },
                    { label: 'Avg/Day',     value: u.avgDaily  },
                  ].map(s => (
                    <div key={s.label} className="p-2 rounded-lg" style={{ background: 'var(--card)' }}>
                      <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)', fontSize: 9 }}>
                        {s.label}
                      </div>
                      <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Liked Profiles */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Most Liked Profiles Today
          </h3>
          <div className="space-y-4">
            {topLiked.map((p, i) => {
              const rankColors = ['#c8972b', '#a0a8bb', '#cd7f32', 'var(--text-light)', 'var(--text-light)'];
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black w-5 text-center"
                            style={{ color: rankColors[i] }}>
                        {i + 1}
                      </span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                           style={{ background: `${ACCENT}20`, color: ACCENT }}>
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {p.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart size={11} style={{ color: GREEN }} />
                      <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                        {p.likes.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden ml-8"
                       style={{ background: 'var(--bg)' }}>
                    <div className="h-full rounded-full"
                         style={{ width: `${p.pct}%`, background: `${ACCENT}80` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
