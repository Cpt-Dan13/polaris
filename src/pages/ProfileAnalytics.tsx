import { useState, useEffect } from 'react';
import {
  UserCheck, Heart, Network, Award, Eye, ThumbsDown, AlertTriangle,
  SlidersHorizontal, Loader,
} from 'lucide-react';
import { api } from '../lib/api';
import type { ProfileAnalyticsData, DistBucket, TopPerformingEntry, MostPopularEntry, MostDislikedEntry, MostReportedEntry, ConstellationTopEntry, ConstellationPopularEntry } from '../lib/api';

function cmToFt(cm: number | null): string {
  if (!cm) return '—';
  const totalInches = cm / 2.54;
  const feet   = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = '#e94560';
const GOLD = '#c8972b';
const RANK_COLORS = ['#c8972b', '#a0a8bb', '#cd7f32'];
const ROLE_COLORS: Record<string, string> = {
  Patriarch:    ACCENT,
  Muse:         GOLD,
  Constellation: '#9c27b0',
};
const ROLE_GRADIENTS: Record<string, string> = {
  Patriarch:    `linear-gradient(135deg, #1a1a2e, ${ACCENT})`,
  Muse:         `linear-gradient(135deg, ${ACCENT}, ${GOLD})`,
  Constellation: `linear-gradient(135deg, ${GOLD}, #9c27b0)`,
};

type Tab = 'patriarchs' | 'muses' | 'constellations';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'patriarchs',     label: 'Patriarchs',    icon: <UserCheck size={14} /> },
  { id: 'muses',          label: 'Muses',          icon: <Heart     size={14} /> },
  { id: 'constellations', label: 'Constellations', icon: <Network   size={14} /> },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const patriarchData = {
  avgHeight: "5'7\"", mostHeight: "5'8\"", avgAge: 38, mostAge: 35,
  heightDist: [
    { label: "5'5\"", pct: 8 },
    { label: "5'6\"", pct: 14 },
    { label: "5'7\"", pct: 22 },
    { label: "5'8\"", pct: 31 },
    { label: "5'9\"", pct: 15 },
    { label: "5'10\"", pct: 7 },
    { label: "6'0\"+", pct: 3 },
  ],
  mostHeightIdx: 3,
  ageDist: [
    { label: '25–30', pct: 12 },
    { label: '31–35', pct: 28 },
    { label: '36–40', pct: 31 },
    { label: '41–45', pct: 18 },
    { label: '46–50', pct: 8 },
    { label: '50+',   pct: 3 },
  ],
  mostAgeIdx: 2,
  topPerforming: [
    { initials: 'MW', name: 'Marcus Webb',   location: 'Phoenix, AZ', stars: 847, likes: 2341 },
    { initials: 'JO', name: 'James Okonkwo', location: 'Atlanta, GA', stars: 712, likes: 1988 },
    { initials: 'DR', name: 'Daniel Reyes',  location: 'Houston, TX', stars: 634, likes: 1756 },
  ],
  mostPopular: [
    { initials: 'AC', name: 'Alexander Cross',  location: 'Miami, FL',    views: 14820 },
    { initials: 'MW', name: 'Marcus Webb',       location: 'Phoenix, AZ',  views: 12340 },
    { initials: 'NB', name: 'Nathan Blackwood',  location: 'Chicago, IL',  views: 10891 },
  ],
  mostDisliked: [
    { name: 'marcus_k',  passRate: 87, passes: 2341 },
    { name: 'derek_b',   passRate: 79, passes: 1654 },
    { name: 'anon_p_11', passRate: 71, passes: 1102 },
  ],
  mostReported: [
    { name: 'rick_d',    reports: 28, blocks: 14, severity: 'high'   as const },
    { name: 'anon_m_99', reports: 21, blocks: 9,  severity: 'high'   as const },
    { name: 'devin_k',   reports: 12, blocks: 7,  severity: 'medium' as const },
  ],
};

const museData = {
  avgHeight: "5'5\"", mostHeight: "5'6\"", avgAge: 27, mostAge: 25,
  heightDist: [
    { label: "5'2\"", pct: 5 },
    { label: "5'3\"", pct: 9 },
    { label: "5'4\"", pct: 18 },
    { label: "5'5\"", pct: 24 },
    { label: "5'6\"", pct: 28 },
    { label: "5'7\"", pct: 12 },
    { label: "5'8\"+", pct: 4 },
  ],
  mostHeightIdx: 4,
  ageDist: [
    { label: '21–24', pct: 22 },
    { label: '25–28', pct: 35 },
    { label: '29–32', pct: 24 },
    { label: '33–36', pct: 13 },
    { label: '37–40', pct: 4 },
    { label: '40+',   pct: 2 },
  ],
  mostAgeIdx: 1,
  topPerforming: [
    { initials: 'SL', name: 'Sophia Laurent',  location: 'New York, NY',    stars: 1204, likes: 3892 },
    { initials: 'IC', name: 'Isabella Chen',   location: 'Los Angeles, CA', stars: 987,  likes: 3241 },
    { initials: 'AO', name: 'Amara Osei',      location: 'London, UK',      stars: 876,  likes: 2987 },
  ],
  mostPopular: [
    { initials: 'IC', name: 'Isabella Chen',  location: 'Los Angeles, CA', views: 22841 },
    { initials: 'SL', name: 'Sophia Laurent', location: 'New York, NY',    views: 19204 },
    { initials: 'LR', name: 'Luna Rodriguez', location: 'Miami, FL',       views: 17893 },
  ],
  mostDisliked: [
    { name: 'anon_user_7', passRate: 82, passes: 1987 },
    { name: 'tiffany_w',   passRate: 74, passes: 1201 },
    { name: 'jade_p',      passRate: 68, passes: 987  },
  ],
  mostReported: [
    { name: 'vera_w',    reports: 19, blocks: 8,  severity: 'high'   as const },
    { name: 'tiffany_w', reports: 11, blocks: 5,  severity: 'medium' as const },
    { name: 'jade_p',    reports: 8,  blocks: 3,  severity: 'medium' as const },
  ],
};


const ETHNICITY_COLORS: Record<string, string> = {
  'Black / African Descent': '#e94560',
  'Hispanic / Latino':       '#c8972b',
  'White / Caucasian':       '#4caf50',
  'East Asian':              '#2196f3',
  'Southeast Asian':         '#ff5722',
  'South Asian':             '#9c27b0',
  'Middle Eastern':          '#00bcd4',
  'Native American':         '#795548',
  'Pacific Islander':        '#607d8b',
  'Other':                   '#9e9e9e',
};


type Dist = { label: string; pct: number }[];

// ─── Graph type toggle ────────────────────────────────────────────────────────

type GraphType = 'bar' | 'line' | 'scorecard';

const GRAPH_ORDER: GraphType[] = ['bar', 'line', 'scorecard'];

function GraphToggle({ value, onChange }: { value: GraphType; onChange: (v: GraphType) => void }) {
  const labels: Record<GraphType, string> = { bar: 'Bar', line: 'Line', scorecard: 'Scorecard' };
  function cycle() {
    const next = GRAPH_ORDER[(GRAPH_ORDER.indexOf(value) + 1) % GRAPH_ORDER.length];
    onChange(next);
  }
  return (
    <button
      onClick={cycle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      title={`Chart: ${labels[value]} — click to switch`}
      style={{
        background: ACCENT,
        color: '#fff',
        boxShadow: `0 2px 8px ${ACCENT}55`,
      }}
    >
      <SlidersHorizontal size={13} />
      {labels[value]}
    </button>
  );
}

// ─── Chart: Bar (horizontal) ──────────────────────────────────────────────────

function BarView({ dist, mostIdx }: { dist: Dist; mostIdx: number }) {
  return (
    <div className="space-y-2.5">
      {dist.map((row, i) => {
        const hi = i === mostIdx;
        return (
          <div key={row.label} className="flex items-center gap-3">
            <span className="text-xs w-12 text-right flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
              {row.label}
            </span>
            <div className="flex-1 h-6 rounded overflow-hidden" style={{ background: 'var(--bg)' }}>
              <div
                className="h-full rounded flex items-center justify-end pr-2 transition-all duration-500"
                style={{ width: `${row.pct}%`, background: hi ? ACCENT : ACCENT + '35', minWidth: 8 }}
              >
                {hi && <span className="text-white font-bold" style={{ fontSize: 9 }}>TOP</span>}
              </div>
            </div>
            <span className="text-xs font-semibold w-8 flex-shrink-0"
                  style={{ color: hi ? ACCENT : 'var(--text-secondary)' }}>
              {row.pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Chart: Line (frequency polygon) ─────────────────────────────────────────

function lineSmoothCurve(pts: { x: number; y: number }[]): string {
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

function LineView({ dist, mostIdx, uid }: { dist: Dist; mostIdx: number; uid: string }) {
  const W = 100, H = 60;
  const pad = { t: 8, r: 3, b: 0, l: 3 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const max = Math.max(...dist.map(d => d.pct)) * 1.12;

  const toX = (i: number) => pad.l + (i / (dist.length - 1)) * cW;
  const toY = (v: number) => pad.t + cH - (v / max) * cH;
  const pts = dist.map((d, i) => ({ x: toX(i), y: toY(d.pct) }));

  const linePath = lineSmoothCurve(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(2)} ${H} L ${pts[0].x.toFixed(2)} ${H} Z`;
  const gid = `line-${uid}`;

  return (
    <div>
      <div className="relative" style={{ height: 140 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={ACCENT} stopOpacity="0.28" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((t, i) => (
            <line key={i}
              x1={pad.l} x2={W - pad.r}
              y1={pad.t + cH * t} y2={pad.t + cH * t}
              stroke="var(--border)" strokeWidth="0.4" strokeDasharray="2,2"
            />
          ))}
          <path d={areaPath} fill={`url(#${gid})`} />
          <path d={linePath} fill="none" stroke={ACCENT} strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y}
              r={i === mostIdx ? 4 : 2.2}
              fill={i === mostIdx ? ACCENT : `${ACCENT}55`}
            />
          ))}
        </svg>
      </div>
      <div className="flex justify-between mt-2">
        {dist.map((d, i) => (
          <span key={i} className="text-center flex-1" style={{
            fontSize: 9,
            color: i === mostIdx ? ACCENT : 'var(--text-light)',
            fontWeight: i === mostIdx ? 700 : 400,
          }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Chart: Scorecard (KPI summary) ──────────────────────────────────────────

function ScoreView({ dist, mostIdx }: { dist: Dist; mostIdx: number }) {
  const peak = dist[mostIdx];
  const sorted = [...dist].sort((a, b) => b.pct - a.pct);
  const top2 = sorted[0].pct + sorted[1].pct;
  const spread = dist.filter(d => d.pct >= 10).length;
  const range = `${dist[0].label} – ${dist[dist.length - 1].label}`;

  return (
    <div className="grid grid-cols-2 gap-2.5 py-1">
      <div className="col-span-2 rounded-xl p-4 text-center"
           style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}30` }}>
        <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: ACCENT }}>
          Peak Preference
        </div>
        <div className="text-3xl font-black" style={{ color: 'var(--text)' }}>{peak.label}</div>
        <div className="text-sm font-semibold mt-0.5" style={{ color: ACCENT }}>{peak.pct}% of users</div>
      </div>
      <div className="rounded-lg p-3" style={{ background: 'var(--bg)' }}>
        <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-light)', fontSize: 9 }}>
          Top 2 Combined
        </div>
        <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{top2}%</div>
        <div style={{ color: 'var(--text-light)', fontSize: 9 }}>of all preferences</div>
      </div>
      <div className="rounded-lg p-3" style={{ background: 'var(--bg)' }}>
        <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-light)', fontSize: 9 }}>
          Spread
        </div>
        <div className="text-2xl font-black" style={{ color: 'var(--text)' }}>{spread}</div>
        <div style={{ color: 'var(--text-light)', fontSize: 9 }}>buckets ≥ 10%</div>
      </div>
      <div className="col-span-2 rounded-lg p-3 flex items-center justify-between"
           style={{ background: 'var(--bg)' }}>
        <span style={{ color: 'var(--text-light)', fontSize: 10 }}>Full Range</span>
        <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{range}</span>
      </div>
    </div>
  );
}

// ─── Chart dispatcher ─────────────────────────────────────────────────────────

function DistChart({ dist, mostIdx, type, uid }: {
  dist: Dist; mostIdx: number; type: GraphType; uid: string;
}) {
  if (type === 'bar')      return <BarView   dist={dist} mostIdx={mostIdx} />;
  if (type === 'line')     return <LineView  dist={dist} mostIdx={mostIdx} uid={uid} />;
  return                          <ScoreView dist={dist} mostIdx={mostIdx} />;
}

// ─── Shared StatPill ──────────────────────────────────────────────────────────

function StatPill({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card p-4 text-center flex flex-col gap-1 hover:shadow-md transition-shadow">
      <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: 'var(--text-light)' }}>{sub}</div>}
    </div>
  );
}

// ─── Shared RankCard ──────────────────────────────────────────────────────────

function RankCard({ rank, initials, name, sub, primary, primaryLabel, gradient }: {
  rank: number; initials: string; name: string; sub: string;
  primary: number; primaryLabel: string; gradient: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
      <div className="text-base font-black w-5 text-center flex-shrink-0"
           style={{ color: RANK_COLORS[rank] ?? 'var(--text-light)' }}>
        {rank + 1}
      </div>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
           style={{ background: gradient }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{name}</div>
        <div className="text-xs truncate" style={{ color: 'var(--text-light)' }}>{sub}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{primary.toLocaleString()}</div>
        <div className="text-xs" style={{ color: 'var(--text-light)' }}>{primaryLabel}</div>
      </div>
    </div>
  );
}

// ─── Patriarch / Muse tab ─────────────────────────────────────────────────────

function ProfileTab({ data, gradient, tabKey, avgHeightCm, modeHeightCm, avgAge, modeAge, heightDistData, ageDistData, topPerforming, mostPopular }: {
  data: typeof patriarchData;
  gradient: string;
  tabKey: string;
  avgHeightCm:    number | null;
  modeHeightCm:   number | null;
  avgAge:         number | null;
  modeAge:        number | null;
  heightDistData: { dist: DistBucket[]; mostIdx: number } | null;
  ageDistData:    { dist: DistBucket[]; mostIdx: number } | null;
  topPerforming:  TopPerformingEntry[] | null;
  mostPopular:    MostPopularEntry[]   | null;
}) {
  const [graphType, setGraphType] = useState<GraphType>('bar');

  return (
    <div className="space-y-4">
      {/* Stat pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatPill label="Avg Desired Height"  value={cmToFt(avgHeightCm)}       sub="weighted by likes received" />
        <StatPill label="Most Desired Height" value={cmToFt(modeHeightCm)}      sub="height with most likes" />
        <StatPill label="Avg Desired Age"     value={avgAge  ?? '—'}            sub="weighted by likes received" />
        <StatPill label="Most Desired Age"    value={modeAge != null ? `${modeAge} yrs` : '—'} sub="age with most likes" />
      </div>

      {/* Distribution charts + toggle */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Preference Distributions
          </h3>
          <GraphToggle value={graphType} onChange={setGraphType} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4"
               style={{ color: 'var(--text-secondary)' }}>
              Height Distribution
            </p>
            {heightDistData
              ? <DistChart dist={heightDistData.dist} mostIdx={heightDistData.mostIdx} type={graphType} uid={`${tabKey}-height`} />
              : <div className="flex justify-center py-6"><Loader size={18} className="animate-spin" style={{ color: 'var(--text-light)' }} /></div>
            }
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4"
               style={{ color: 'var(--text-secondary)' }}>
              Age Distribution
            </p>
            {ageDistData
              ? <DistChart dist={ageDistData.dist} mostIdx={ageDistData.mostIdx} type={graphType} uid={`${tabKey}-age`} />
              : <div className="flex justify-center py-6"><Loader size={18} className="animate-spin" style={{ color: 'var(--text-light)' }} /></div>
            }
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={15} style={{ color: GOLD }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Top Performing</h3>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>by stars &amp; likes</span>
          </div>
          {topPerforming === null
            ? <div className="flex justify-center py-6"><Loader size={18} className="animate-spin" style={{ color: 'var(--text-light)' }} /></div>
            : topPerforming.length === 0
              ? <p className="text-xs text-center py-4" style={{ color: 'var(--text-light)' }}>No data yet</p>
              : <div className="space-y-2">
                  {topPerforming.map((p, i) => (
                    <RankCard
                      key={p.id} rank={i}
                      initials={p.initials} name={p.name}
                      sub={`${p.likes.toLocaleString()} likes`}
                      primary={p.stars} primaryLabel="stars"
                      gradient={gradient}
                    />
                  ))}
                </div>
          }
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={15} style={{ color: ACCENT }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Most Popular</h3>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>by profile views</span>
          </div>
          {mostPopular === null
            ? <div className="flex justify-center py-6"><Loader size={18} className="animate-spin" style={{ color: 'var(--text-light)' }} /></div>
            : mostPopular.length === 0
              ? <p className="text-xs text-center py-4" style={{ color: 'var(--text-light)' }}>No data yet</p>
              : <div className="space-y-2">
                  {mostPopular.map((p, i) => (
                    <RankCard
                      key={p.id} rank={i}
                      initials={p.initials} name={p.name}
                      sub="unique profile visits"
                      primary={p.views} primaryLabel="views"
                      gradient={gradient}
                    />
                  ))}
                </div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Constellations tab ───────────────────────────────────────────────────────

function ConstellationTab({
  topPerforming,
  mostPopular,
}: {
  topPerforming: ConstellationTopEntry[]   | null;
  mostPopular:   ConstellationPopularEntry[] | null;
}) {
  const gradient = `linear-gradient(135deg, ${ACCENT}, ${GOLD})`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={15} style={{ color: GOLD }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Top Performing</h3>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>by stars &amp; likes</span>
          </div>
          {topPerforming === null
            ? <div className="flex justify-center py-6"><Loader size={18} className="animate-spin" style={{ color: 'var(--text-light)' }} /></div>
            : topPerforming.length === 0
              ? <p className="text-xs text-center py-4" style={{ color: 'var(--text-light)' }}>No data yet</p>
              : <div className="space-y-2">
                  {topPerforming.map((c, i) => (
                    <RankCard key={c.id} rank={i} initials={c.initials} name={c.name}
                      sub={`${c.member_count} member${c.member_count === 1 ? '' : 's'}`}
                      primary={c.stars} primaryLabel="stars" gradient={gradient} />
                  ))}
                </div>
          }
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={15} style={{ color: ACCENT }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Most Popular</h3>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>by constellation views</span>
          </div>
          {mostPopular === null
            ? <div className="flex justify-center py-6"><Loader size={18} className="animate-spin" style={{ color: 'var(--text-light)' }} /></div>
            : mostPopular.length === 0
              ? <p className="text-xs text-center py-4" style={{ color: 'var(--text-light)' }}>No data yet</p>
              : <div className="space-y-2">
                  {mostPopular.map((c, i) => (
                    <RankCard key={c.id} rank={i} initials={c.initials} name={c.name}
                      sub={`${c.member_count} member${c.member_count === 1 ? '' : 's'}`}
                      primary={c.views} primaryLabel="views" gradient={gradient} />
                  ))}
                </div>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Per-type overview ────────────────────────────────────────────────────────

function TypeOverview({
  disliked,
  reported,
  ethnicityDist,
}: {
  disliked:      MostDislikedEntry[] | null;
  reported:      MostReportedEntry[] | null;
  ethnicityDist?: DistBucket[]       | null;
}) {
  const [hoveredEthnicity, setHoveredEthnicity] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Disliked */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsDown size={15} style={{ color: '#ff9800' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Most Disliked</h3>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>by pass rate</span>
          </div>
          {disliked === null
            ? <div className="flex justify-center py-6"><Loader size={18} className="animate-spin" style={{ color: 'var(--text-light)' }} /></div>
            : disliked.length === 0
              ? <p className="text-xs text-center py-4" style={{ color: 'var(--text-light)' }}>No data yet</p>
              : <div className="space-y-2">
                  {disliked.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
                      <div className="text-base font-black w-5 text-center flex-shrink-0"
                           style={{ color: RANK_COLORS[i] ?? 'var(--text-light)' }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{p.name}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold" style={{ color: '#f44336' }}>{p.passes.toLocaleString()}</div>
                        <div className="text-xs" style={{ color: 'var(--text-light)' }}>passes</div>
                      </div>
                    </div>
                  ))}
                </div>
          }
        </div>

        {/* Most Reported */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} style={{ color: '#f44336' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Most Reported</h3>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>pending review</span>
          </div>
          {reported === null
            ? <div className="flex justify-center py-6"><Loader size={18} className="animate-spin" style={{ color: 'var(--text-light)' }} /></div>
            : reported.length === 0
              ? <p className="text-xs text-center py-4" style={{ color: 'var(--text-light)' }}>No data yet</p>
              : <div className="space-y-2">
                  {reported.map(p => {
                    const sevBg  = p.severity === 'high' ? 'rgba(244,67,54,0.1)' : p.severity === 'medium' ? 'rgba(255,152,0,0.1)' : 'rgba(76,175,80,0.1)';
                    const sevClr = p.severity === 'high' ? '#f44336'             : p.severity === 'medium' ? '#ff9800'             : '#4caf50';
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                             style={{ background: 'rgba(244,67,54,0.12)' }}>
                          <AlertTriangle size={13} style={{ color: '#f44336' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{p.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
                            {p.reports} reports · {p.blocks} blocks
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize flex-shrink-0"
                              style={{ background: sevBg, color: sevClr }}>
                          {p.severity}
                        </span>
                      </div>
                    );
                  })}
                </div>
          }
        </div>
      </div>

      {/* Ethnicity Distribution */}
      {ethnicityDist !== undefined && <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Ethnicity Distribution</h3>
        {ethnicityDist === null
          ? <div className="flex justify-center py-6"><Loader size={18} className="animate-spin" style={{ color: 'var(--text-light)' }} /></div>
          : ethnicityDist.length === 0
            ? <p className="text-xs text-center py-4" style={{ color: 'var(--text-light)' }}>No data yet</p>
            : <>
                <div className="flex h-6 gap-px mb-5">
                  {ethnicityDist.map((e, i, arr) => {
                    const color    = ETHNICITY_COLORS[e.label] ?? '#9e9e9e';
                    const isHot    = hoveredEthnicity === e.label;
                    const isDim    = hoveredEthnicity !== null && !isHot;
                    const isFirst  = i === 0;
                    const isLast   = i === arr.length - 1;
                    return (
                      <div
                        key={e.label}
                        title={`${e.label}: ${e.pct}%`}
                        onMouseEnter={() => setHoveredEthnicity(e.label)}
                        onMouseLeave={() => setHoveredEthnicity(null)}
                        style={{
                          width:        `${e.pct}%`,
                          background:   color,
                          minWidth:     e.pct > 0 ? 2 : 0,
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
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {ethnicityDist.map(e => {
                    const color   = ETHNICITY_COLORS[e.label] ?? '#9e9e9e';
                    const isHot   = hoveredEthnicity === e.label;
                    const isDim   = hoveredEthnicity !== null && !isHot;
                    return (
                      <div
                        key={e.label}
                        className="flex items-center gap-2 cursor-default"
                        onMouseEnter={() => setHoveredEthnicity(e.label)}
                        onMouseLeave={() => setHoveredEthnicity(null)}
                        style={{ opacity: isDim ? 0.35 : 1, transition: 'opacity 0.18s ease' }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            background:  color,
                            transform:   isHot ? 'scale(1.4)' : 'scale(1)',
                            transition:  'transform 0.18s ease',
                          }}
                        />
                        <span className="text-xs font-medium" style={{ color: isHot ? 'var(--text)' : 'var(--text-secondary)', transition: 'color 0.18s ease' }}>{e.label}</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{e.pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
        }
      </div>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfileAnalytics() {
  const [tab, setTab] = useState<Tab>('patriarchs');
  const [profileStats, setProfileStats] = useState<ProfileAnalyticsData | null>(null);

  useEffect(() => {
    api.analytics.profiles().then(setProfileStats).catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      {/* Pill nav */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? ACCENT : 'var(--card)',
                color:      active ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${active ? ACCENT : 'var(--border)'}`,
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'patriarchs' && (
        <>
          <ProfileTab
            data={patriarchData} gradient={`linear-gradient(135deg, #1a1a2e, ${ACCENT})`} tabKey="patriarch"
            avgHeightCm={profileStats?.patriarch.avg_cm        ?? null}
            modeHeightCm={profileStats?.patriarch.mode_cm      ?? null}
            avgAge={profileStats?.patriarch.avg_age            ?? null}
            modeAge={profileStats?.patriarch.mode_age          ?? null}
            heightDistData={profileStats?.patriarch.height_dist ?? null}
            ageDistData={profileStats?.patriarch.age_dist       ?? null}
            topPerforming={profileStats?.patriarch.top_performing ?? null}
            mostPopular={profileStats?.patriarch.most_popular     ?? null}
          />
          <TypeOverview
            disliked={profileStats?.patriarch.most_disliked  ?? null}
            reported={profileStats?.patriarch.most_reported  ?? null}
            ethnicityDist={profileStats?.patriarch.ethnicity_dist ?? null}
          />
        </>
      )}
      {tab === 'muses' && (
        <>
          <ProfileTab
            data={museData} gradient={`linear-gradient(135deg, ${ACCENT}, ${GOLD})`} tabKey="muse"
            avgHeightCm={profileStats?.muse.avg_cm        ?? null}
            modeHeightCm={profileStats?.muse.mode_cm      ?? null}
            avgAge={profileStats?.muse.avg_age            ?? null}
            modeAge={profileStats?.muse.mode_age          ?? null}
            heightDistData={profileStats?.muse.height_dist ?? null}
            ageDistData={profileStats?.muse.age_dist       ?? null}
            topPerforming={profileStats?.muse.top_performing ?? null}
            mostPopular={profileStats?.muse.most_popular     ?? null}
          />
          <TypeOverview
            disliked={profileStats?.muse.most_disliked  ?? null}
            reported={profileStats?.muse.most_reported  ?? null}
            ethnicityDist={profileStats?.muse.ethnicity_dist ?? null}
          />
        </>
      )}
      {tab === 'constellations' && (
        <>
          <ConstellationTab
            topPerforming={profileStats?.constellation.top_performing ?? null}
            mostPopular={profileStats?.constellation.most_popular     ?? null}
          />
          <TypeOverview disliked={null} reported={null} />
        </>
      )}
    </div>
  );
}
