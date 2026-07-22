import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { ActiveUserKPIs, TrendData, TopActiveUser, AcquisitionKPIs, AcquisitionSignups } from '../lib/api';
import {
  Users, TrendingUp, Activity, UserMinus, MapPin,
  Clock, Zap,
} from 'lucide-react';

const ACCENT      = '#e94560';
const GOLD        = '#c8972b';
const PURPLE      = '#9c27b0';
const RANK_COLORS = ['#c8972b', '#a0a8bb', '#cd7f32'];

type Tab    = 'active-users' | 'acquisition';
type Period = 'week' | 'month' | 'year';

const TABS: { id: Tab; label: string }[] = [
  { id: 'active-users', label: 'Active Users'             },
  { id: 'acquisition',  label: 'Acquisition & Retention'  },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

function arrAvg(arr: number[]) {
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function fmtDuration(seconds: number): string {
  if (seconds < 60)  return `${seconds}s`;
  const mins = seconds / 60;
  return `${mins % 1 === 0 ? mins : mins.toFixed(1)}m`;
}

function fmtTotalTime(seconds: number): string {
  if (seconds < 60)   return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60)      return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtPeakTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// ─── Active Users constants ───────────────────────────────────────────────────

const X_HOUR_LABELS = [
  { i: 0,  label: '12am' }, { i: 3,  label: '3am'  },
  { i: 6,  label: '6am'  }, { i: 9,  label: '9am'  },
  { i: 12, label: '12pm' }, { i: 15, label: '3pm'  },
  { i: 18, label: '6pm'  }, { i: 21, label: '9pm'  },
];

const PERIOD_LABELS: Record<Period, string> = { week: 'This Week', month: 'This Month', year: 'This Year' };


const TYPE_COLORS: Record<string, string> = { Patriarch: ACCENT, Muse: GOLD, Constellation: PURPLE };

// ─── Acquisition & Retention mock data ───────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];



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
  { city: 'Phoenix, AZ',  users:  387, delta: 31.2 },
  { city: 'Atlanta, GA',  users:  892, delta: 24.1 },
  { city: 'Dallas, TX',   users:  445, delta: 22.8 },
  { city: 'Houston, TX',  users:  741, delta: 18.7 },
  { city: 'Miami, FL',    users:  623, delta: 16.4 },
  { city: 'Chicago, IL',  users:  598, delta: 14.2 },
  { city: 'New York, NY', users: 1204, delta: 11.8 },
];

const ACQ_COLORS: Record<string, string> = { patriarchs: ACCENT, muses: GOLD, constellations: PURPLE };
const ACQ_LABELS: Record<string, string> = { patriarchs: 'Patriarchs', muses: 'Muses', constellations: 'Constellations' };

// ─── Charts ───────────────────────────────────────────────────────────────────

function HourlyChart({ data }: { data?: number[] }) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const chartData = data ?? new Array(24).fill(0);
  const hasData   = chartData.some(v => v > 0);

  const W = 520, H = 160;
  const pad = { t: 20, r: 20, b: 32, l: 44 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
  const maxVal  = Math.max(...chartData, 1);
  const n       = chartData.length;
  const barW    = cW / n, gap = 2;
  const peakIdx = chartData.indexOf(Math.max(...chartData));
  const bottomY = pad.t + cH;

  function bX(i: number)  { return pad.l + i * barW + gap / 2; }
  function bCx(i: number) { return bX(i) + (barW - gap) / 2; }
  function bH(v: number)  { return Math.max(2, (v / maxVal) * cH); }
  function bY(v: number)  { return bottomY - bH(v); }
  function baseOpacity(v: number) {
    const r = v / maxVal;
    return r > 0.85 ? 1 : r > 0.65 ? 0.62 : r > 0.45 ? 0.42 : r > 0.25 ? 0.26 : 0.14;
  }

  const yTicks = hasData
    ? [0, Math.round(maxVal / 3), Math.round(maxVal * 2 / 3), maxVal].filter((v, i, a) => a.indexOf(v) === i)
    : [0];

  const anyHovered = hoveredBar !== null;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 420, width: '100%', height: 'auto', display: 'block' }}>
        {yTicks.map(t => {
          const y = bottomY - (t / maxVal) * cH;
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={pad.l - 6} y={y + 4} textAnchor="end" style={{ fill: 'var(--text-light)', fontSize: 9 }}>
                {fmt(t)}
              </text>
            </g>
          );
        })}

        {!hasData && (
          <text x={W / 2} y={pad.t + cH / 2} textAnchor="middle" dominantBaseline="middle"
                style={{ fill: 'var(--text-light)', fontSize: 11, fontStyle: 'italic' }}>
            No activity recorded today
          </text>
        )}

        {chartData.map((v, i) => {
          const isHovered = hoveredBar === i;
          const isPeak    = i === peakIdx && v > 0;
          const opacity   = anyHovered
            ? (isHovered ? 1 : 0.3)
            : (isPeak ? 1 : hasData ? baseOpacity(v) : 0.07);
          const scaleY    = isHovered ? 1.08 : 1;
          const barHeight = bH(v);
          const barTop    = bY(v);

          return (
            <rect
              key={i}
              x={bX(i)}
              y={barTop}
              width={barW - gap}
              height={barHeight}
              rx="2"
              fill={ACCENT}
              fillOpacity={opacity}
              onMouseEnter={() => hasData && setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
              style={{
                cursor:          hasData ? 'pointer' : 'default',
                transformOrigin: `${bCx(i)}px ${bottomY}px`,
                transform:       `scaleY(${scaleY})`,
                transition:      'transform 0.18s ease, fill-opacity 0.15s ease, filter 0.15s ease',
                filter:          isHovered ? 'brightness(1.25)' : 'brightness(1)',
              }}
            />
          );
        })}

        {/* Tooltip */}
        {hoveredBar !== null && chartData[hoveredBar] > 0 && (() => {
          const i   = hoveredBar;
          const v   = chartData[i];
          const cx  = bCx(i);
          const ty  = bY(v) - 8;
          const lbl = `${v} session${v !== 1 ? 's' : ''}`;
          const tw  = lbl.length * 5.5 + 14;
          const tx  = Math.min(Math.max(cx - tw / 2, pad.l), W - pad.r - tw);
          return (
            <g>
              <rect x={tx} y={ty - 14} width={tw} height={18} rx="4"
                    fill="var(--card)" stroke="var(--border)" strokeWidth="0.8" />
              <text x={tx + tw / 2} y={ty - 2} textAnchor="middle"
                    style={{ fill: 'var(--text)', fontSize: 9, fontWeight: 600 }}>
                {lbl}
              </text>
            </g>
          );
        })()}

        {X_HOUR_LABELS.map(({ i, label }) => (
          <text key={label} x={bCx(i)} y={H - 8} textAnchor="middle"
                style={{ fill: hoveredBar === i ? ACCENT : 'var(--text-light)', fontSize: 9, transition: 'fill 0.15s ease' }}>
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function TrendChart({ period, data, loading }: { period: Period; data: TrendData | null; loading: boolean }) {
  const W = 520, H = 160;
  const pad = { t: 20, r: 16, b: 32, l: 52 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
  const bottom = pad.t + cH;
  const gid    = `tg-${period}`;

  if (loading) {
    return (
      <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-light)', fontSize: 12 }}>Loading…</span>
      </div>
    );
  }

  const total      = data?.total      ?? new Array(7).fill(0);
  const labels     = data?.labels     ?? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const monthlyAvg = data?.monthly_avg ?? 0;
  const yearlyAvg  = data?.yearly_avg  ?? 0;
  const showRefs   = period !== 'year';
  const hasData    = total.some(v => v > 0);
  const n          = labels.length;

  let maxVal: number;
  let yTicks: number[];
  if (!hasData) {
    maxVal = 10;
    yTicks = [0, 5, 10];
  } else {
    const ceiling = Math.max(...total, showRefs ? Math.max(monthlyAvg, yearlyAvg) : 0) * 1.15;
    const yStep   = Math.pow(10, Math.floor(Math.log10(ceiling / 4)));
    maxVal = Math.ceil(ceiling / yStep) * yStep;
    yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i));
  }

  function toX(i: number) { return pad.l + (i / Math.max(n - 1, 1)) * cW; }
  function toY(v: number) { return pad.t + cH - (v / maxVal) * cH; }

  const pts      = total.map((v, i) => ({ x: toX(i), y: toY(v) }));
  const linePath = smoothCurve(pts);
  const areaPath = `${linePath} L ${pts[pts.length-1].x.toFixed(2)} ${bottom} L ${pts[0].x.toFixed(2)} ${bottom} Z`;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 420, width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={ACCENT} stopOpacity="0.25" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map(t => {
          const y = toY(t);
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={pad.l - 6} y={y + 4} textAnchor="end" style={{ fill: 'var(--text-light)', fontSize: 9 }}>
                {fmt(t)}
              </text>
            </g>
          );
        })}
        {showRefs && hasData && (
          <>
            <line x1={pad.l} x2={W - pad.r} y1={toY(monthlyAvg)} y2={toY(monthlyAvg)} stroke={GOLD}   strokeWidth="1" strokeDasharray="5,3" />
            <line x1={pad.l} x2={W - pad.r} y1={toY(yearlyAvg)}  y2={toY(yearlyAvg)}  stroke={PURPLE} strokeWidth="1" strokeDasharray="5,3" />
          </>
        )}
        <path d={areaPath} fill={`url(#${gid})`} opacity={hasData ? 1 : 0.15} />
        <path d={linePath} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={hasData ? 1 : 0.15} />
        {hasData && pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={ACCENT} opacity="0.85" />)}
        {hasData && <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="5" fill={ACCENT} />}
        {!hasData && (
          <text x={W / 2} y={pad.t + cH / 2} textAnchor="middle" dominantBaseline="middle"
                style={{ fill: 'var(--text-light)', fontSize: 11, fontStyle: 'italic' }}>
            No sessions recorded for this period
          </text>
        )}
        {labels.map((l, i) => (
          <text key={l} x={toX(i)} y={H - 8} textAnchor="middle" style={{ fill: 'var(--text-light)', fontSize: 9 }}>
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}

function AcquisitionChart({ data, loading }: { data: AcquisitionSignups | null; loading: boolean }) {
  const W = 520, H = 180;
  const pad = { t: 16, r: 16, b: 36, l: 44 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
  const bottom = pad.t + cH;
  const series = ['patriarchs', 'muses', 'constellations'] as const;

  if (loading) {
    return <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--text-light)', fontSize: 12 }}>Loading…</span>
    </div>;
  }

  const labels     = data?.labels         ?? [];
  const seriesData = {
    patriarchs:     data?.patriarchs     ?? [],
    muses:          data?.muses          ?? [],
    constellations: data?.constellations ?? [],
  };
  const n       = labels.length;
  const allVals = [...seriesData.patriarchs, ...seriesData.muses, ...seriesData.constellations];
  const hasData = allVals.some(v => v > 0);
  const dataMax = Math.max(...allVals, 1);
  const maxVal  = hasData ? Math.ceil(dataMax * 1.2 / 10) * 10 : 10;
  const yTicks  = [0, Math.round(maxVal / 3), Math.round(maxVal * 2 / 3), maxVal];

  function toX(i: number) { return pad.l + (i / Math.max(n - 1, 1)) * cW; }
  function toY(v: number) { return pad.t + cH - (v / maxVal) * cH; }
  function getPoints(arr: number[]) { return arr.map((v, i) => ({ x: toX(i), y: toY(v) })); }

  return (
    <div>
      <div className="flex gap-5 mb-4 flex-wrap">
        {series.map(key => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-6 h-0.5 rounded-full" style={{ background: ACQ_COLORS[key] }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{ACQ_LABELS[key]}</span>
          </div>
        ))}
      </div>
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 420, width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            {series.map(key => (
              <linearGradient key={key} id={`acq-grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={ACQ_COLORS[key]} stopOpacity="0.22" />
                <stop offset="100%" stopColor={ACQ_COLORS[key]} stopOpacity="0.01" />
              </linearGradient>
            ))}
          </defs>
          {yTicks.map(t => (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={toY(t)} y2={toY(t)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={pad.l - 6} y={toY(t) + 4} textAnchor="end" style={{ fill: 'var(--text-light)', fontSize: 9 }}>
                {fmt(t)}
              </text>
            </g>
          ))}
          {labels.map((m, i) => (
            <text key={m} x={toX(i)} y={H - 7} textAnchor="middle" style={{ fill: 'var(--text-light)', fontSize: 9 }}>{m}</text>
          ))}
          {!hasData && (
            <text x={W / 2} y={pad.t + cH / 2} textAnchor="middle" dominantBaseline="middle"
                  style={{ fill: 'var(--text-light)', fontSize: 11, fontStyle: 'italic' }}>
              No signups recorded yet
            </text>
          )}
          {series.map(key => (
            <path key={`area-${key}`} d={smoothArea(getPoints(seriesData[key]), bottom)} fill={`url(#acq-grad-${key})`} opacity={hasData ? 1 : 0.15} />
          ))}
          {series.map(key => {
            const pts  = getPoints(seriesData[key]);
            const last = pts[pts.length - 1];
            return (
              <g key={key} opacity={hasData ? 1 : 0.15}>
                <path d={smoothCurve(pts)} fill="none" stroke={ACQ_COLORS[key]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {hasData && pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={ACQ_COLORS[key]} opacity="0.85" />)}
                {hasData && <circle cx={last.x} cy={last.y} r="5" fill={ACQ_COLORS[key]} />}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Tab: Active Users ────────────────────────────────────────────────────────

function ActiveUsersTab() {
  const [period, setPeriod]             = useState<Period>('week');
  const [kpis, setKpis]                 = useState<ActiveUserKPIs | null>(null);
  const [kpisLoading, setKpisLoading]   = useState(true);
  const [liveTrend, setLiveTrend]         = useState<TrendData | null>(null);
  const [trendLoading, setTrendLoading]   = useState(true);
  const [topUsers, setTopUsers]               = useState<TopActiveUser[]>([]);
  const [topUsersLoading, setTopUsersLoading] = useState(true);
  const [hoveredRow, setHoveredRow]           = useState<number | null>(null);

  useEffect(() => {
    api.analytics.activeUserKPIs()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setKpisLoading(false));
  }, []);

  useEffect(() => {
    setTrendLoading(true);
    api.analytics.activeUserTrend(period)
      .then(setLiveTrend)
      .catch(() => {})
      .finally(() => setTrendLoading(false));
  }, [period]);

  useEffect(() => {
    api.analytics.activeUserTopUsers(10)
      .then(setTopUsers)
      .catch(() => {})
      .finally(() => setTopUsersLoading(false));
  }, []);

  const periodAvg  = arrAvg(liveTrend?.total          ?? [0]);
  const pAvg       = arrAvg(liveTrend?.patriarchs     ?? [0]);
  const mAvg       = arrAvg(liveTrend?.muses          ?? [0]);
  const cAvg       = arrAvg(liveTrend?.constellations ?? [0]);
  const showRefs   = period !== 'year';
  const monthlyAvg = liveTrend?.monthly_avg ?? 0;
  const yearlyAvg  = liveTrend?.yearly_avg  ?? 0;

  const liveCards: { label: string; value: string; sub: string; icon: React.ElementType }[] = [
    {
      label: 'Online Now',
      value: kpisLoading ? '—' : fmt(kpis?.online_now ?? 0),
      sub:   'active sessions',
      icon:  Zap,
    },
    {
      label: 'Peak Today',
      value: kpisLoading ? '—' : fmt(kpis?.peak_today ?? 0),
      sub:   kpis?.peak_today_at ? `at ${fmtPeakTime(kpis.peak_today_at)}` : 'no data yet',
      icon:  TrendingUp,
    },
    {
      label: 'Avg Session',
      value: kpisLoading ? '—' : fmtDuration(kpis?.avg_session_seconds ?? 0),
      sub:   'per user today',
      icon:  Clock,
    },
    {
      label: 'Sessions Today',
      value: kpisLoading ? '—' : fmt(kpis?.sessions_today ?? 0),
      sub:   'across all types',
      icon:  Users,
    },
  ];

  return (
    <div className="space-y-5">

      {/* KPI pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {liveCards.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4">
              <div className="mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
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
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Activity by Hour</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>Concurrent sessions throughout the day · today</p>
          </div>
        </div>
        <HourlyChart data={kpis?.hourly} />
      </div>

      {/* Engagement Trend */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Engagement Trend</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
              Daily active users · {PERIOD_LABELS[period].toLowerCase()}
            </p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg)' }}>
            {(['week', 'month', 'year'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize"
                style={{ background: period === p ? ACCENT : 'transparent', color: period === p ? '#fff' : 'var(--text-secondary)' }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <TrendChart period={period} data={liveTrend} loading={trendLoading} />
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: `${PERIOD_LABELS[period]} Avg`, value: periodAvg,  color: ACCENT                              },
            { label: 'Monthly Avg',                  value: monthlyAvg, color: showRefs ? GOLD   : 'var(--text-light)' },
            { label: 'Yearly Avg',                   value: yearlyAvg,  color: showRefs ? PURPLE : 'var(--text-light)' },
          ].map(row => (
            <div key={row.label} className="p-3 rounded-lg text-center" style={{ background: 'var(--bg)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--text-light)' }}>{row.label}</div>
              <div className="text-lg font-black" style={{ color: row.color }}>{fmt(row.value)}</div>
              <div className="text-xs" style={{ color: 'var(--text-light)' }}>DAU / day</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: 'Patriarchs',     value: pAvg, color: ACCENT  },
            { label: 'Muses',          value: mAvg, color: GOLD    },
            { label: 'Constellations', value: cAvg, color: PURPLE  },
          ].map(row => (
            <div key={row.label} className="p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
              <div className="text-xs font-bold truncate" style={{ color: row.color }}>{fmt(row.value)}</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-light)', fontSize: 10 }}>{row.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Active Users */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={15} style={{ color: ACCENT }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Top Active Users</h3>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>by sessions this week</span>
        </div>
        <div className="space-y-2">
          {topUsersLoading ? (
            <div className="py-5 text-center text-xs" style={{ color: 'var(--text-light)' }}>Loading…</div>
          ) : topUsers.length === 0 ? (
            <div className="py-5 text-center text-xs" style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>
              No sessions recorded this week
            </div>
          ) : topUsers.map((u, i) => {
            const typeColor = TYPE_COLORS[u.type] ?? 'var(--text-secondary)';
            return (
              <div key={u.user_id} className="flex items-center gap-3 p-3 rounded-lg"
                   onMouseEnter={() => setHoveredRow(i)}
                   onMouseLeave={() => setHoveredRow(null)}
                   style={{
                     background:  'var(--bg)',
                     transform:   hoveredRow === i ? 'scale(1.02)' : 'scale(1)',
                     boxShadow:   hoveredRow === i ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
                     transition:  'transform 0.18s ease, box-shadow 0.18s ease',
                     cursor:      'pointer',
                   }}>
                <span className="text-sm font-black w-5 text-center flex-shrink-0"
                      style={{ color: i < 3 ? RANK_COLORS[i] : 'var(--text-light)' }}>
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
                     style={{ background: `${typeColor}20` }}>
                  {u.photo_url
                    ? <img src={u.photo_url} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 10, fontWeight: 700, color: typeColor }}>{u.initials}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{u.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-light)' }}>
                    {u.sessions} session{u.sessions !== 1 ? 's' : ''} · {fmtDuration(u.avg_duration_seconds)} avg
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{fmtTotalTime(u.total_seconds)}</div>
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

// ─── Tab: Acquisition & Retention ────────────────────────────────────────────

function AcquisitionTab() {
  const [kpis, setKpis]                   = useState<AcquisitionKPIs | null>(null);
  const [kpisLoading, setKpisLoading]     = useState(true);
  const [signups, setSignups]             = useState<AcquisitionSignups | null>(null);
  const [signupsLoading, setSignupsLoading] = useState(true);

  useEffect(() => {
    api.analytics.acquisitionKPIs()
      .then(setKpis)
      .catch(() => {})
      .finally(() => setKpisLoading(false));
    api.analytics.acquisitionSignups()
      .then(setSignups)
      .catch(() => {})
      .finally(() => setSignupsLoading(false));
  }, []);

  function fmtDelta(v: number, pp = false): string {
    const sign = v >= 0 ? '+' : '−';
    return `${sign}${Math.abs(v).toFixed(1)}${pp ? 'pp' : '%'}`;
  }

  const liveCards = [
    {
      label:    'New Users (Month)',
      value:    kpisLoading ? '—' : fmt(kpis?.new_users_month ?? 0),
      delta:    fmtDelta(kpis?.new_users_delta ?? 0),
      positive: (kpis?.new_users_delta ?? 0) >= 0,
      icon:     Users,
    },
    {
      label:    'MoM Growth Rate',
      value:    kpisLoading ? '—' : `${(kpis?.mom_growth_rate ?? 0).toFixed(1)}%`,
      delta:    fmtDelta(kpis?.mom_growth_delta ?? 0, true),
      positive: (kpis?.mom_growth_delta ?? 0) >= 0,
      icon:     TrendingUp,
    },
    {
      label:    'DAU / MAU Ratio',
      value:    kpisLoading ? '—' : `${(kpis?.dau_mau_ratio ?? 0).toFixed(1)}%`,
      delta:    fmtDelta(kpis?.dau_mau_delta ?? 0, true),
      positive: (kpis?.dau_mau_delta ?? 0) >= 0,
      icon:     Activity,
    },
    {
      label:    'Monthly Churn',
      value:    kpisLoading ? '—' : `${(kpis?.monthly_churn ?? 0).toFixed(1)}%`,
      delta:    fmtDelta(kpis?.monthly_churn_delta ?? 0, true),
      positive: (kpis?.monthly_churn_delta ?? 0) <= 0,
      icon:     UserMinus,
    },
  ];

  return (
    <div className="space-y-5">

      {/* KPI pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {liveCards.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                  <Icon size={15} style={{ color: ACCENT }} />
                </div>
                {!kpisLoading && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: k.positive ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)', color: k.positive ? '#4caf50' : '#f44336' }}>
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

      {/* New User Acquisition */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>New User Acquisition</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
              {(() => {
                const now   = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
                return `Monthly signups by profile type · ${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
              })()}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-black" style={{ color: ACCENT }}>
              {signupsLoading ? '—' : fmt(signups?.this_month_total ?? 0)}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-light)' }}>this month</div>
          </div>
        </div>
        <AcquisitionChart data={signups} loading={signupsLoading} />
      </div>

      {/* Retention + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Retention Snapshot</h3>
          <div className="grid pb-2 mb-1" style={{ gridTemplateColumns: '1fr repeat(3, 56px)', borderBottom: '1px solid var(--border)' }}>
            <span />
            {['D1', 'D7', 'D30'].map(d => (
              <span key={d} className="text-xs font-semibold text-center" style={{ color: 'var(--text-secondary)' }}>{d}</span>
            ))}
          </div>
          {retentionData.map(row => (
            <div key={row.label} className="grid py-2.5 items-center" style={{ gridTemplateColumns: '1fr repeat(3, 56px)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
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

        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>Signup Sources</h3>
          <div className="space-y-4">
            {sourcesData.map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-px mt-6">
            {sourcesData.map(s => (
              <div key={s.label} style={{ width: `${s.pct}%`, background: s.color }} title={`${s.label}: ${s.pct}%`} />
            ))}
          </div>
        </div>

      </div>

      {/* Top Growing Markets */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={15} style={{ color: ACCENT }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Top Growing Markets</h3>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>ranked by MoM user growth</span>
        </div>
        <div className="space-y-2">
          {marketsData.map((m, i) => {
            const deltaColor = m.delta > 25 ? '#4caf50' : m.delta > 15 ? GOLD : ACCENT;
            return (
              <div key={m.city} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
                <span className="text-sm font-black w-5 text-center flex-shrink-0"
                      style={{ color: i < 3 ? RANK_COLORS[i] : 'var(--text-light)' }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.city}</div>
                  <div className="text-xs" style={{ color: 'var(--text-light)' }}>{m.users.toLocaleString()} new users this month</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: deltaColor }}>+{m.delta}%</div>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Growth() {
  const [tab, setTab]           = useState<Tab>('active-users');
  const [hoveredTab, setHoveredTab] = useState<Tab | null>(null);

  return (
    <div className="space-y-5">

      {/* Underline tab nav */}
      <div className="flex gap-7" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => {
          const active  = tab === t.id;
          const isHover = hoveredTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              onMouseEnter={() => setHoveredTab(t.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className="relative pb-3 text-sm font-semibold"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color:      active ? ACCENT : isHover ? 'var(--text)' : 'var(--text-secondary)',
                transition: 'color 0.18s ease',
              }}
            >
              {t.label}
              <span style={{
                position:        'absolute',
                bottom:          -1,
                left:            0,
                right:           0,
                height:          2,
                borderRadius:    2,
                background:      ACCENT,
                transformOrigin: 'left',
                transform:       `scaleX(${active ? 1 : isHover ? 0.35 : 0})`,
                transition:      'transform 0.2s ease, opacity 0.2s ease',
                opacity:         active ? 1 : 0.5,
                display:         'block',
              }} />
            </button>
          );
        })}
      </div>

      {tab === 'active-users' ? <ActiveUsersTab /> : <AcquisitionTab />}

    </div>
  );
}
