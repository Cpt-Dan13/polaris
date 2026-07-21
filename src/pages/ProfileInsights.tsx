import { useState, useEffect } from 'react';
import {
  UserCheck, Heart, Network, Camera, MessageCircle,
  Shield, TrendingUp, Star, MapPin, Users, FileText,
  ChevronDown, Loader,
} from 'lucide-react';
import { api } from '../lib/api';
import type { ProfileInsightsData, ProfileInsightsFunnel } from '../lib/api';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';

type Tab = 'patriarchs' | 'muses' | 'constellations';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'patriarchs',     label: 'Patriarchs',    icon: <UserCheck size={14} /> },
  { id: 'muses',          label: 'Muses',          icon: <Heart     size={14} /> },
  { id: 'constellations', label: 'Constellations', icon: <Network   size={14} /> },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type FunnelStage  = ProfileInsightsFunnel;
type HealthSignal = { label: string; score: number; detail: string };
type ImpactLevel  = 'high' | 'medium' | 'low';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const funnelData: Record<Tab, FunnelStage[]> = {
  patriarchs: [
    { label: 'Profile Views',  count: 45200 },
    { label: 'Likes Received', count: 12840 },
    { label: 'Mutual Matches', count:  4230 },
    { label: 'First Message',  count:  2890 },
    { label: 'Active Conv.',   count:  1340 },
  ],
  muses: [
    { label: 'Profile Views',  count: 89400 },
    { label: 'Likes Received', count: 31290 },
    { label: 'Mutual Matches', count: 14200 },
    { label: 'First Message',  count: 11340 },
    { label: 'Active Conv.',   count:  6840 },
  ],
  constellations: [
    { label: 'Profile Views',  count: 23100 },
    { label: 'Likes Received', count:  5890 },
    { label: 'Mutual Matches', count:  1980 },
    { label: 'First Message',  count:  1240 },
    { label: 'Active Conv.',   count:   420 },
  ],
};

const healthData: Record<Tab, { overall: number; signals: HealthSignal[] }> = {
  patriarchs: {
    overall: 71,
    signals: [
      { label: 'Photo Coverage',   score: 68, detail: 'avg 2.4 photos per profile' },
      { label: 'Bio Completeness', score: 74, detail: '74% have a filled bio' },
      { label: 'Response Rate',    score: 82, detail: 'avg 82% message reply rate' },
      { label: 'Match Quality',    score: 61, detail: '61% of matches start a conversation' },
    ],
  },
  muses: {
    overall: 84,
    signals: [
      { label: 'Photo Coverage',   score: 89, detail: 'avg 3.8 photos per profile' },
      { label: 'Bio Completeness', score: 81, detail: '81% have a filled bio' },
      { label: 'Response Rate',    score: 91, detail: 'avg 91% message reply rate' },
      { label: 'Match Quality',    score: 77, detail: '77% of matches start a conversation' },
    ],
  },
  constellations: {
    overall: 63,
    signals: [
      { label: 'Photo Coverage',   score: 72, detail: 'avg 2.1 photos per member' },
      { label: 'Bio Completeness', score: 58, detail: '58% have a group bio' },
      { label: 'Response Rate',    score: 69, detail: 'avg 69% message reply rate' },
      { label: 'Match Quality',    score: 54, detail: '54% of matches start a conversation' },
    ],
  },
};

const IMPACT_STYLES: Record<ImpactLevel, { bg: string; color: string; label: string }> = {
  high:   { bg: 'rgba(244,67,54,0.12)',  color: '#f44336', label: 'High Impact'   },
  medium: { bg: `${GOLD}22`,             color: GOLD,       label: 'Medium Impact' },
  low:    { bg: 'rgba(96,125,139,0.12)', color: '#607d8b',  label: 'Low Impact'    },
};

const correlations: {
  icon: React.ElementType;
  label: string;
  stat: string;
  statLabel: string;
  impact: ImpactLevel;
  detail: string;
}[] = [
  {
    icon: Camera, label: '3+ Profile Photos',
    stat: '2.4×', statLabel: 'more matches', impact: 'high',
    detail: 'Profiles with 3 or more photos receive significantly more likes and matches across all profile types.',
  },
  {
    icon: Shield, label: 'Verified Account',
    stat: '+34%', statLabel: 'trust score', impact: 'high',
    detail: 'Verification badge increases user trust and drives higher engagement from matched users.',
  },
  {
    icon: MessageCircle, label: 'Response Under 2 Hrs',
    stat: '+41%', statLabel: 'retention', impact: 'high',
    detail: 'Fast responders retain matched conversations at substantially higher rates than slow responders.',
  },
  {
    icon: FileText, label: 'Bio Over 80 Characters',
    stat: '+18%', statLabel: 'conversion rate', impact: 'high',
    detail: 'Profiles with detailed bios convert profile views to likes at a meaningfully higher rate.',
  },
  {
    icon: Star, label: 'Premium Subscription',
    stat: '3.1×', statLabel: 'match rate', impact: 'high',
    detail: 'Premium members benefit from visibility boosts and advanced filters, resulting in far higher match rates.',
  },
  {
    icon: TrendingUp, label: 'Active in Last 30 Days',
    stat: '1.8×', statLabel: 'more views', impact: 'medium',
    detail: 'Recently active profiles rank higher in discovery feeds, driving significantly more profile impressions.',
  },
  {
    icon: Users, label: 'Constellation 3+ Members',
    stat: '2.1×', statLabel: 'more likes', impact: 'medium',
    detail: 'Larger constellation groups signal stability and social proof, attracting more interaction.',
  },
  {
    icon: MapPin, label: 'Location Enabled',
    stat: '+22%', statLabel: 'local views', impact: 'low',
    detail: 'Enabling location increases visibility to nearby users, but the effect is modest vs. other factors.',
  },
];

// ─── Funnel Chart ─────────────────────────────────────────────────────────────

const STAGE_COLORS = [ACCENT, '#ff6b35', GOLD, '#4caf50', '#2196f3'];

function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const max = stages[0].count;

  return (
    <div className="space-y-0.5">
      {stages.map((stage, i) => {
        const pct     = (stage.count / max) * 100;
        const convPct = pct.toFixed(1);
        const dropPct = i > 0
          ? (((stages[i - 1].count - stage.count) / stages[i - 1].count) * 100).toFixed(1)
          : null;
        const color = STAGE_COLORS[i];

        return (
          <div key={stage.label}>
            {dropPct !== null && (
              <div className="flex items-center gap-1.5 py-1" style={{ paddingLeft: 128 }}>
                <ChevronDown size={11} style={{ color: 'var(--text-light)' }} />
                <span style={{ fontSize: 10, color: '#f44336', fontWeight: 600 }}>
                  −{dropPct}% drop-off
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <span
                className="text-xs font-medium text-right flex-shrink-0"
                style={{ width: 120, color: 'var(--text-secondary)' }}
              >
                {stage.label}
              </span>
              <div className="flex-1 h-10 rounded-lg overflow-hidden" style={{ background: 'var(--bg)' }}>
                <div
                  className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                  style={{ width: `${pct}%`, background: color, minWidth: 52 }}
                >
                  <span className="text-white font-bold" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {stage.count.toLocaleString()}
                  </span>
                </div>
              </div>
              <span
                className="font-bold text-right flex-shrink-0"
                style={{
                  width: 44, fontSize: 12,
                  color: i === 0                      ? 'var(--text-secondary)'
                       : parseFloat(convPct) > 50    ? '#4caf50'
                       : parseFloat(convPct) > 15    ? GOLD
                       : ACCENT,
                }}
              >
                {convPct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Health Gauge ─────────────────────────────────────────────────────────────

function HealthGauge({ score }: { score: number }) {
  const cx = 60, cy = 60, r = 44;
  const startDeg = 135, sweep = 270;

  function polarToXY(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcD(fromDeg: number, toDeg: number) {
    if (Math.abs(toDeg - fromDeg) < 0.01) return '';
    const s = polarToXY(fromDeg);
    const e = polarToXY(toDeg);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
  }

  const fillEnd = startDeg + (score / 100) * sweep;
  const color   = score >= 80 ? '#4caf50' : score >= 65 ? GOLD : ACCENT;
  const label   = score >= 80 ? 'Excellent' : score >= 70 ? 'Good' : score >= 60 ? 'Fair' : 'Needs Work';

  return (
    <svg viewBox="0 0 120 110" style={{ width: '100%', maxWidth: 180 }}>
      <path
        d={arcD(startDeg, startDeg + sweep)}
        fill="none" stroke="var(--border)" strokeWidth="10" strokeLinecap="round"
      />
      {score > 0 && (
        <path
          d={arcD(startDeg, fillEnd)}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        />
      )}
      <text x={cx} y={cy + 8}  textAnchor="middle"
            style={{ fill: 'var(--text)', fontSize: 24, fontWeight: 800 }}>
        {score}
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle"
            style={{ fill: color, fontSize: 9, fontWeight: 700 }}>
        {label}
      </text>
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfileInsights() {
  const [tab, setTab]           = useState<Tab>('patriarchs');
  const [insights, setInsights] = useState<ProfileInsightsData | null>(null);

  useEffect(() => {
    api.analytics.insights().then(setInsights).catch(() => {});
  }, []);

  const liveFunnel: Record<Tab, FunnelStage[] | null> = {
    patriarchs:     insights?.patriarch.funnel     ?? null,
    muses:          insights?.muse.funnel          ?? null,
    constellations: insights?.constellation.funnel ?? null,
  };

  const funnel   = liveFunnel[tab] ?? funnelData[tab];
  const health   = healthData[tab];
  const endToEnd = funnel[0].count > 0
    ? ((funnel[funnel.length - 1].count / funnel[0].count) * 100).toFixed(1)
    : '0.0';

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

      {/* Conversion Funnel */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Conversion Funnel
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
              View → active conversation · all time
            </p>
          </div>
          <div className="text-right">
            {insights === null
              ? <Loader size={18} className="animate-spin" style={{ color: 'var(--text-light)' }} />
              : <>
                  <div className="text-2xl font-black" style={{ color: ACCENT }}>{endToEnd}%</div>
                  <div className="text-xs" style={{ color: 'var(--text-light)' }}>end-to-end</div>
                </>
            }
          </div>
        </div>
        {insights === null
          ? <div className="flex justify-center py-10">
              <Loader size={22} className="animate-spin" style={{ color: 'var(--text-light)' }} />
            </div>
          : <FunnelChart stages={funnel} />
        }
      </div>

      {/* Profile Health */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text)' }}>
          Profile Health Score
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-center">
          <div className="flex justify-center">
            <HealthGauge score={health.overall} />
          </div>
          <div className="space-y-4">
            {health.signals.map(sig => {
              const color = sig.score >= 80 ? '#4caf50' : sig.score >= 65 ? GOLD : ACCENT;
              return (
                <div key={sig.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {sig.label}
                    </span>
                    <span className="text-xs font-bold" style={{ color }}>{sig.score}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${sig.score}%`, background: color }}
                    />
                  </div>
                  <div className="mt-0.5" style={{ fontSize: 10, color: 'var(--text-light)' }}>
                    {sig.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Attribute Correlations */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Attribute Correlations
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
            Profile characteristics and their measured impact on match outcomes · platform-wide
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {correlations.map(c => {
            const imp  = IMPACT_STYLES[c.impact];
            const Icon = c.icon;
            return (
              <div key={c.label} className="card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${ACCENT}15` }}
                  >
                    <Icon size={15} style={{ color: ACCENT }} />
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: imp.bg, color: imp.color }}
                  >
                    {imp.label}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
                    {c.label}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black" style={{ color: 'var(--text)' }}>
                      {c.stat}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                      {c.statLabel}
                    </span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-light)', marginTop: 'auto' }}>
                  {c.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
