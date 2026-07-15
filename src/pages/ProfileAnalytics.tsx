import { useState } from 'react';
import {
  UserCheck, Heart, Network, Award, Eye, ThumbsDown, AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';

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


const ethnicityData = [
  { label: 'Black / African',    pct: 42, color: '#e94560' },
  { label: 'Hispanic / Latino',  pct: 23, color: '#c8972b' },
  { label: 'White / Caucasian',  pct: 18, color: '#4caf50' },
  { label: 'Asian',              pct: 9,  color: '#2196f3' },
  { label: 'Mixed',              pct: 6,  color: '#9c27b0' },
  { label: 'Other',              pct: 2,  color: '#607d8b' },
];

const constellationData = {
  topPerforming: [
    { initials: 'WC', name: 'The Webb Constellation', members: 4, stars: 2104, likes: 5891 },
    { initials: 'OF', name: 'The Okonkwo Family',      members: 3, stars: 1876, likes: 4203 },
    { initials: 'CD', name: 'The Cross Dynamic',        members: 5, stars: 1644, likes: 3987 },
  ],
  mostPopular: [
    { initials: 'WC', name: 'The Webb Constellation', members: 4, views: 31204 },
    { initials: 'CD', name: 'The Cross Dynamic',        members: 5, views: 24891 },
    { initials: 'SF', name: 'The Sunrise Family',       members: 3, views: 21443 },
  ],
  mostDisliked: [
    { name: 'midnight_crew', passRate: 74, passes: 1654 },
    { name: 'the_outliers',  passRate: 66, passes: 1201 },
    { name: 'nova_squad',    passRate: 59, passes: 987  },
    { name: 'anon_group_9',  passRate: 52, passes: 743  },
  ],
  mostReported: [
    { name: 'rick_d',    reports: 28, blocks: 14, severity: 'high'   as const },
    { name: 'anon_m_99', reports: 21, blocks: 9,  severity: 'high'   as const },
    { name: 'devin_k',   reports: 18, blocks: 22, severity: 'high'   as const },
    { name: 'jason_r',   reports: 12, blocks: 7,  severity: 'medium' as const },
  ],
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

function LineView({ dist, mostIdx, uid }: { dist: Dist; mostIdx: number; uid: string }) {
  const W = 100, H = 60;
  const pad = { t: 8, r: 3, b: 0, l: 3 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const max = Math.max(...dist.map(d => d.pct)) * 1.12;

  const toX = (i: number) => pad.l + (i / (dist.length - 1)) * cW;
  const toY = (v: number) => pad.t + cH - (v / max) * cH;
  const pts = dist.map((d, i) => ({ x: toX(i), y: toY(d.pct) }));

  const polyline = pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const areaPoints = [
    `${pts[0].x.toFixed(2)},${H}`,
    ...pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`),
    `${pts[pts.length - 1].x.toFixed(2)},${H}`,
  ].join(' ');
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
              <stop offset="0%"   stopColor={ACCENT} stopOpacity="0.3" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((t, i) => (
            <line key={i}
              x1={pad.l} x2={W - pad.r}
              y1={pad.t + cH * t} y2={pad.t + cH * t}
              stroke="var(--border)" strokeWidth="0.4" strokeDasharray="2,2"
            />
          ))}
          <polygon points={areaPoints} fill={`url(#${gid})`} />
          <polyline points={polyline} fill="none" stroke={ACCENT} strokeWidth="1.2"
                    strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y}
              r={i === mostIdx ? 2.2 : 1}
              fill={i === mostIdx ? ACCENT : 'var(--card)'}
              stroke={ACCENT} strokeWidth="0.8"
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

function ProfileTab({ data, gradient, tabKey }: {
  data: typeof patriarchData;
  gradient: string;
  tabKey: string;
}) {
  const [graphType, setGraphType] = useState<GraphType>('bar');

  return (
    <div className="space-y-4">
      {/* Stat pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatPill label="Avg Desired Height" value={data.avgHeight} sub="filter preference avg" />
        <StatPill label="Most Desired Height" value={data.mostHeight} sub="highest frequency" />
        <StatPill label="Avg Desired Age"    value={data.avgAge}    sub="years old average" />
        <StatPill label="Most Desired Age"   value={data.mostAge}   sub="highest frequency" />
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
            <DistChart
              dist={data.heightDist} mostIdx={data.mostHeightIdx}
              type={graphType} uid={`${tabKey}-height`}
            />
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4"
               style={{ color: 'var(--text-secondary)' }}>
              Age Distribution
            </p>
            <DistChart
              dist={data.ageDist} mostIdx={data.mostAgeIdx}
              type={graphType} uid={`${tabKey}-age`}
            />
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
          <div className="space-y-2">
            {data.topPerforming.map((p, i) => (
              <RankCard
                key={p.name} rank={i}
                initials={p.initials} name={p.name} sub={p.location}
                primary={p.stars} primaryLabel="stars"
                gradient={gradient}
              />
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={15} style={{ color: ACCENT }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Most Popular</h3>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>by profile views</span>
          </div>
          <div className="space-y-2">
            {data.mostPopular.map((p, i) => (
              <RankCard
                key={p.name} rank={i}
                initials={p.initials} name={p.name} sub={p.location}
                primary={p.views} primaryLabel="views"
                gradient={gradient}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Constellations tab ───────────────────────────────────────────────────────

function ConstellationTab() {
  const d = constellationData;
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
          <div className="space-y-2">
            {d.topPerforming.map((c, i) => (
              <RankCard key={c.name} rank={i} initials={c.initials} name={c.name}
                sub={`${c.members} members`} primary={c.stars} primaryLabel="stars" gradient={gradient} />
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={15} style={{ color: ACCENT }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Most Popular</h3>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>by profile views</span>
          </div>
          <div className="space-y-2">
            {d.mostPopular.map((c, i) => (
              <RankCard key={c.name} rank={i} initials={c.initials} name={c.name}
                sub={`${c.members} members`} primary={c.views} primaryLabel="views" gradient={gradient} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Per-type overview ────────────────────────────────────────────────────────

function TypeOverview({
  disliked,
  reported,
}: {
  disliked:  { name: string; passRate: number; passes: number }[];
  reported:  { name: string; reports: number; blocks: number; severity: 'high' | 'medium' | 'low' }[];
}) {
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
          <div className="space-y-2.5">
            {disliked.map(p => (
              <div key={p.name} className="p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>@{p.name}</span>
                  <span className="text-xs font-bold" style={{ color: '#f44336' }}>{p.passRate}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${p.passRate}%`, background: '#f44336' }} />
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
                  {p.passes.toLocaleString()} passes
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Reported */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} style={{ color: '#f44336' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Most Reported</h3>
            <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>pending review</span>
          </div>
          <div className="space-y-2">
            {reported.map(p => {
              const sevBg  = p.severity === 'high' ? 'rgba(244,67,54,0.1)' : p.severity === 'medium' ? 'rgba(255,152,0,0.1)' : 'rgba(76,175,80,0.1)';
              const sevClr = p.severity === 'high' ? '#f44336'             : p.severity === 'medium' ? '#ff9800'             : '#4caf50';
              return (
                <div key={p.name} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ background: 'rgba(244,67,54,0.12)' }}>
                    <AlertTriangle size={13} style={{ color: '#f44336' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>@{p.name}</div>
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
        </div>
      </div>

      {/* Ethnicity Distribution */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Ethnicity Distribution</h3>
        <div className="flex h-6 rounded-lg overflow-hidden gap-px mb-4">
          {ethnicityData.map(e => (
            <div key={e.label} style={{ width: `${e.pct}%`, background: e.color }}
                 title={`${e.label}: ${e.pct}%`} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {ethnicityData.map(e => (
            <div key={e.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{e.label}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{e.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfileAnalytics() {
  const [tab, setTab] = useState<Tab>('patriarchs');

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
          <ProfileTab data={patriarchData} gradient={`linear-gradient(135deg, #1a1a2e, ${ACCENT})`} tabKey="patriarch" />
          <TypeOverview disliked={patriarchData.mostDisliked} reported={patriarchData.mostReported} />
        </>
      )}
      {tab === 'muses' && (
        <>
          <ProfileTab data={museData} gradient={`linear-gradient(135deg, ${ACCENT}, ${GOLD})`} tabKey="muse" />
          <TypeOverview disliked={museData.mostDisliked} reported={museData.mostReported} />
        </>
      )}
      {tab === 'constellations' && (
        <>
          <ConstellationTab />
          <TypeOverview disliked={constellationData.mostDisliked} reported={constellationData.mostReported} />
        </>
      )}
    </div>
  );
}
