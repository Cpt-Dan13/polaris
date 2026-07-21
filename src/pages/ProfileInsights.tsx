import { useState, useEffect } from 'react';
import {
  Shield, TrendingUp, Star, FileText,
  ChevronDown, Loader, Globe, Landmark, Wine,
  Ruler, Baby, MessageSquare,
} from 'lucide-react';
import { api } from '../lib/api';
import type { ProfileInsightsData, ProfileInsightsFunnel, CorrelationLifts, ProfileHealthData, HealthSignal } from '../lib/api';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';

type Tab = 'patriarchs' | 'muses' | 'constellations';

const TABS: { id: Tab; label: string }[] = [
  { id: 'patriarchs',     label: 'Patriarchs'    },
  { id: 'muses',          label: 'Muses'          },
  { id: 'constellations', label: 'Constellations' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type FunnelStage = ProfileInsightsFunnel;
type ImpactLevel = 'high' | 'medium' | 'low';

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


const IMPACT_STYLES: Record<ImpactLevel, { bg: string; color: string; label: string }> = {
  high:   { bg: 'rgba(244,67,54,0.12)',  color: '#f44336', label: 'High Impact'   },
  medium: { bg: `${GOLD}22`,             color: GOLD,       label: 'Medium Impact' },
  low:    { bg: 'rgba(96,125,139,0.12)', color: '#607d8b',  label: 'Low Impact'    },
};

const correlations: {
  key:       keyof CorrelationLifts | null;
  icon:      React.ElementType;
  label:     string;
  mockStat:  string;
  statLabel: string;
  impact:    ImpactLevel;
  detail:    string;
  mock?:     boolean;
}[] = [
  {
    key: null, icon: Shield, label: 'Verified Account',
    mockStat: '+34%', statLabel: 'trust score', impact: 'high', mock: true,
    detail: 'Verification badge increases user trust and drives higher engagement from matched users.',
  },
  {
    key: 'prompt_answers', icon: MessageSquare, label: 'Detailed Prompt Answers',
    mockStat: '+38%', statLabel: 'more likes', impact: 'high',
    detail: 'Profiles averaging 60%+ of the 250-char prompt limit get significantly more likes than those giving minimal answers.',
  },
  {
    key: 'bio_length', icon: FileText, label: 'Bio Over 80 Characters',
    mockStat: '+18%', statLabel: 'more likes', impact: 'high',
    detail: 'Profiles with detailed bios convert profile views to likes at a meaningfully higher rate.',
  },
  {
    key: 'premium', icon: Star, label: 'Premium Subscription',
    mockStat: '3.1×', statLabel: 'more matches', impact: 'high',
    detail: 'Premium members benefit from visibility boosts and advanced filters, resulting in far higher match rates.',
  },
  {
    key: 'religion_politics', icon: Landmark, label: 'Religion & Politics',
    mockStat: '2.3×', statLabel: 'more matches', impact: 'high',
    detail: 'Aligned values on religion and politics are the strongest predictors of conversation longevity and mutual intent.',
  },
  {
    key: 'active_30d', icon: TrendingUp, label: 'Active in Last 30 Days',
    mockStat: '1.8×', statLabel: 'more likes', impact: 'medium',
    detail: 'Recently active profiles rank higher in discovery feeds, driving significantly more profile impressions.',
  },
  {
    key: 'ethnicity', icon: Globe, label: 'Ethnicity Preference',
    mockStat: '+27%', statLabel: 'more likes', impact: 'medium',
    detail: 'Profiles that specify ethnicity preferences see higher compatibility alignment and more meaningful matches.',
  },
  {
    key: 'has_children', icon: Baby, label: 'Has Children',
    mockStat: '+23%', statLabel: 'more matches', impact: 'medium',
    detail: 'Disclosing children status and preferences reduces mismatch significantly and improves long-term match quality.',
  },
  {
    key: 'vices', icon: Wine, label: 'Vices (Drink, Smoke, Drugs)',
    mockStat: '+31%', statLabel: 'more matches', impact: 'medium',
    detail: 'Shared lifestyle habits around drinking, smoking, and drug use significantly reduce early unmatch rates.',
  },
  {
    key: 'height', icon: Ruler, label: 'Height Preference',
    mockStat: '+19%', statLabel: 'more likes', impact: 'medium',
    detail: 'Profiles within a matched height preference range receive more likes and are more likely to convert to active matches.',
  },
];

// ─── Funnel Chart ─────────────────────────────────────────────────────────────

const STAGE_COLORS = [ACCENT, '#ff6b35', GOLD, '#4caf50', '#2196f3'];

function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const max = stages[0].count;

  return (
    <div className="space-y-0.5">
      {stages.map((stage, i) => {
        const pct     = (stage.count / max) * 100;
        const convPct = pct.toFixed(1);
        const dropPct = i > 0
          ? (((stages[i - 1].count - stage.count) / stages[i - 1].count) * 100).toFixed(1)
          : null;
        const color   = STAGE_COLORS[i];
        const hovered = hoveredIdx === i;
        const dimmed  = hoveredIdx !== null && !hovered;

        return (
          <div
            key={stage.label}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ transition: 'opacity 200ms ease', opacity: dimmed ? 0.45 : 1 }}
          >
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
              <div
                className="flex-1 rounded-lg overflow-hidden"
                style={{ background: 'var(--bg)', height: hovered ? 44 : 40, transition: 'height 200ms ease' }}
              >
                <div
                  className="h-full rounded-lg flex items-center px-3"
                  style={{
                    width: `${pct}%`,
                    background: color,
                    minWidth: 52,
                    transition: 'width 700ms ease, filter 200ms ease',
                    filter: hovered ? 'brightness(1.2)' : 'brightness(1)',
                  }}
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

function HealthGauge({ score: rawScore }: { score: number }) {
  const score = Math.min(100, Math.max(0, rawScore));
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
  const [tab, setTab]               = useState<Tab>('patriarchs');
  const [hoveredTab, setHoveredTab] = useState<Tab | null>(null);
  const [insights, setInsights] = useState<ProfileInsightsData | null>(null);
  const [health, setHealth]     = useState<ProfileHealthData | null>(null);
  const [lifts, setLifts]       = useState<CorrelationLifts | null>(null);

  useEffect(() => {
    api.analytics.insights().then(setInsights).catch(() => {});
    api.analytics.health().then(setHealth).catch(() => {});
    api.analytics.correlations().then(setLifts).catch(() => {});
  }, []);

  function formatLift(lift: number): string {
    if (lift >= 2) return `${lift.toFixed(1)}×`;
    const pct = Math.round((lift - 1) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  const liveFunnel: Record<Tab, FunnelStage[] | null> = {
    patriarchs:     insights?.patriarch.funnel     ?? null,
    muses:          insights?.muse.funnel          ?? null,
    constellations: insights?.constellation.funnel ?? null,
  };

  const funnel      = liveFunnel[tab] ?? funnelData[tab];
  const healthKey   = tab === 'patriarchs' ? 'patriarch' : tab === 'muses' ? 'muse' : 'constellation';
  const liveHealth  = health?.[healthKey] ?? null;
  const endToEnd = funnel[0].count > 0
    ? ((funnel[funnel.length - 1].count / funnel[0].count) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-5">

      {/* Tab nav */}
      <div className="flex gap-7">
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
                background: 'none',
                border:     'none',
                cursor:     'pointer',
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
                background:      ACCENT,
                borderRadius:    1,
                transform:       active || isHover ? 'scaleX(1)' : 'scaleX(0)',
                opacity:         active ? 1 : 0.35,
                transition:      'transform 0.2s ease, opacity 0.2s ease',
                transformOrigin: 'left',
              }} />
            </button>
          );
        })}
      </div>

      {/* Conversion Funnel */}
      <div className="card card-static p-5">
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
        {!liveHealth ? (
          <div className="flex items-center justify-center py-8">
            <Loader size={20} className="animate-spin" style={{ color: 'var(--text-light)' }} />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-center">
          <div className="flex justify-center">
            <HealthGauge score={liveHealth.overall} />
          </div>
          <div className="space-y-4">
            {liveHealth.signals.map((sig: HealthSignal) => {
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
        )}
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
            const imp      = IMPACT_STYLES[c.impact];
            const Icon     = c.icon;
            const liftVal  = c.key && lifts ? lifts[c.key] : null;
            const stat     = liftVal != null ? formatLift(liftVal) : c.mockStat;
            const isLive   = liftVal != null;
            return (
              <div key={c.label} className="card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${ACCENT}15` }}
                  >
                    <Icon size={15} style={{ color: ACCENT }} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: imp.bg, color: imp.color }}
                    >
                      {imp.label}
                    </span>
                    {c.mock && (
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                            style={{ background: 'var(--bg)', color: 'var(--text-light)', fontSize: 9 }}>
                        mock
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
                    {c.label}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    {lifts === null && c.key
                      ? <Loader size={18} className="animate-spin" style={{ color: 'var(--text-light)' }} />
                      : <span className="text-2xl font-black" style={{ color: 'var(--text)' }}>{stat}</span>
                    }
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
