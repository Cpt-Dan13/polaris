import { useState } from 'react';
import { MessageSquare, ShieldAlert, CheckCircle, Clock, Code2 } from 'lucide-react';

const ACCENT = '#e94560';
const GREEN  = '#4caf50';
const RED    = '#f44336';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const INDIGO = '#6366f1';

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  harassment:          { label: 'Harassment',           color: '#ef4444' },
  explicit_content:    { label: 'Explicit Content',     color: '#fb923c' },
  spam:                { label: 'Spam / Promo',         color: '#fbbf24' },
  solicitation:        { label: 'Solicitation',         color: '#f97316' },
  potential_scam:      { label: 'Potential Scam',       color: '#d97706' },
  underage_minor:      { label: 'Underage / Minor',     color: '#b91c1c' },
  physical_self_harm:  { label: 'Physical / Self-Harm', color: '#be123c' },
  terrorism_violence:  { label: 'Terrorism / Violence', color: '#7f1d1d' },
  community_guideline: { label: 'Community Guideline',  color: '#eab308' },
};

// ─── Severity ─────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'high' | 'medium' | 'low';

const SEV_COLOR: Record<Severity, string> = {
  critical: '#b91c1c',   // Dark Red
  high:     '#ef4444',   // Light Red
  medium:   '#f97316',   // Orange
  low:      '#eab308',   // Yellow
};

const SEV_BG: Record<Severity, string> = {
  critical: 'rgba(185,28,28,0.13)',
  high:     'rgba(239,68,68,0.12)',
  medium:   'rgba(249,115,22,0.12)',
  low:      'rgba(234,179,8,0.12)',
};

// ─── KPI mock data ────────────────────────────────────────────────────────────

const kpis: {
  label: string; value: string; delta: string; positive: boolean; icon: React.ElementType
}[] = [
  { label: 'Monitored Today', value: '4,382', delta: '+12.3%', positive: true,  icon: MessageSquare },
  { label: 'Flagged Rate',    value: '4.2%',  delta: '+0.6pp', positive: false, icon: ShieldAlert   },
  { label: 'Auto-Approved',   value: '71.8%', delta: '−4.1pp', positive: false, icon: CheckCircle   },
  { label: 'Awaiting Review', value: '73',    delta: '+21',    positive: false, icon: Clock         },
];

// Ordered: Critical → High → Medium → Low
const RISK_TYPES: { category: string; count: number }[] = [
  { category: 'underage_minor',      count: 6  },
  { category: 'physical_self_harm',  count: 3  },
  { category: 'terrorism_violence',  count: 2  },
  { category: 'harassment',          count: 59 },
  { category: 'solicitation',        count: 13 },
  { category: 'explicit_content',    count: 39 },
  { category: 'spam',                count: 34 },
  { category: 'potential_scam',      count: 8  },
  { category: 'community_guideline', count: 21 },
];
const TOTAL_FLAGGED = RISK_TYPES.reduce((a, r) => a + r.count, 0);

// ─── Flagged Conversations mock data ──────────────────────────────────────────

type ConvStatus = 'pending' | 'approved' | 'escalated' | 'banned';

interface FlaggedConv {
  id:         string;
  sender:     string;
  recipient:  string;
  category:   string;
  severity:   Severity;
  confidence: number;
  snippet:    string;
  time:       string;
  status:     ConvStatus;
}

const INITIAL_CONVOS: FlaggedConv[] = [
  {
    id: 'FLG-0183', sender: 'anon_7741',  recipient: 'Sofia M.',
    category: 'underage_minor',     severity: 'critical', confidence: 96,
    snippet: '"i\'m actually only 15 but i look older so don\'t worry about it..."',
    time: '8m ago', status: 'pending',
  },
  {
    id: 'FLG-0181', sender: 'marcus_w',   recipient: 'Isla S.',
    category: 'harassment',         severity: 'high',     confidence: 94,
    snippet: '"if you don\'t reply i swear i\'ll find where you live..."',
    time: '14m ago', status: 'pending',
  },
  {
    id: 'FLG-0179', sender: 'ryder_99',   recipient: 'Elena R.',
    category: 'terrorism_violence', severity: 'critical', confidence: 91,
    snippet: '"i have connections that can make your life disappear, don\'t test me..."',
    time: '29m ago', status: 'pending',
  },
  {
    id: 'FLG-0175', sender: 'anon_9231',  recipient: 'Lyra B.',
    category: 'solicitation',       severity: 'high',     confidence: 88,
    snippet: '"I can pay you $200 for your personal number and social media..."',
    time: '47m ago', status: 'pending',
  },
  {
    id: 'FLG-0172', sender: 'user_2281',  recipient: 'Mara K.',
    category: 'physical_self_harm', severity: 'critical', confidence: 89,
    snippet: '"i don\'t see the point anymore, I\'ve been thinking about hurting myself..."',
    time: '1h 3m ago', status: 'pending',
  },
  {
    id: 'FLG-0168', sender: 'james_ok',   recipient: 'Aurora S.',
    category: 'explicit_content',   severity: 'medium',   confidence: 79,
    snippet: '"send me a [explicit] pic right now or I\'m unmatching you..."',
    time: '1h 22m ago', status: 'pending',
  },
  {
    id: 'FLG-0155', sender: 'mike_v33',   recipient: 'Nina T.',
    category: 'harassment',         severity: 'high',     confidence: 83,
    snippet: '"you\'re ugly anyway, no wonder you\'re alone on an app like this..."',
    time: '2h ago', status: 'escalated',
  },
  {
    id: 'FLG-0148', sender: 'alex_cr',    recipient: 'Cleo R.',
    category: 'potential_scam',     severity: 'medium',   confidence: 74,
    snippet: '"I\'m a crypto investor, send me your bank details and I\'ll triple..."',
    time: '2h 31m ago', status: 'pending',
  },
  {
    id: 'FLG-0143', sender: 'kyle_09',    recipient: 'Aurora S.',
    category: 'spam',               severity: 'medium',   confidence: 62,
    snippet: '"check out my website for the best deals, exclusive offer just for..."',
    time: '2h 44m ago', status: 'approved',
  },
  {
    id: 'FLG-0139', sender: 'priya_m',    recipient: 'James K.',
    category: 'community_guideline', severity: 'low',     confidence: 54,
    snippet: '"tbh i\'m not really here for dating, just trying to grow my instagram following..."',
    time: '3h 12m ago', status: 'pending',
  },
  {
    id: 'FLG-0131', sender: 'coach_dan',  recipient: 'Mira L.',
    category: 'community_guideline', severity: 'low',     confidence: 58,
    snippet: '"I run a mindset coaching program, I\'d love to tell you more about it..."',
    time: '3h 55m ago', status: 'pending',
  },
  {
    id: 'FLG-0124', sender: 'user_5502',  recipient: 'Cleo R.',
    category: 'community_guideline', severity: 'low',     confidence: 46,
    snippet: '"just to be transparent, we\'re actually two friends sharing this profile together..."',
    time: '4h 18m ago', status: 'pending',
  },
  {
    id: 'FLG-0117', sender: 'oliver_f',   recipient: 'Nadia W.',
    category: 'community_guideline', severity: 'low',     confidence: 51,
    snippet: '"my main profile photo is from a shoot, the other pics are really me though lol..."',
    time: '5h 2m ago', status: 'approved',
  },
];

const STATUS_META: Record<ConvStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: GOLD,   bg: `${GOLD}20`             },
  approved:  { label: 'Approved',  color: GREEN,  bg: 'rgba(76,175,80,0.12)' },
  escalated: { label: 'Escalated', color: PURPLE, bg: `${PURPLE}18`           },
  banned:    { label: 'Banned',    color: RED,    bg: 'rgba(244,67,54,0.12)' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatAssessment() {
  const [convos, setConvos]     = useState<FlaggedConv[]>(INITIAL_CONVOS);
  const [filter, setFilter]     = useState<'all' | Severity>('all');
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  const act = (id: string, status: ConvStatus) =>
    setConvos(prev => prev.map(c => c.id === id ? { ...c, status } : c));

  const filtered = filter === 'all' ? convos : convos.filter(c => c.severity === filter);

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

      {/* Risk Distribution */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Risk Distribution —{' '}
          <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>{TOTAL_FLAGGED} flagged today</span>
        </h3>

        {/* Stacked bar — Critical first, interactive */}
        <div className="flex h-6 gap-px mb-5">
          {RISK_TYPES.map((r, i, arr) => {
            const meta    = CATEGORY_META[r.category];
            const isFirst = i === 0;
            const isLast  = i === arr.length - 1;
            const isHot   = hoveredCat === r.category;
            const isDim   = hoveredCat !== null && !isHot;
            return (
              <div
                key={r.category}
                title={`${meta.label}: ${r.count}`}
                onMouseEnter={() => setHoveredCat(r.category)}
                onMouseLeave={() => setHoveredCat(null)}
                style={{
                  width:        `${(r.count / TOTAL_FLAGGED * 100).toFixed(1)}%`,
                  background:   meta.color,
                  minWidth:     r.count > 0 ? 2 : 0,
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

        {/* Legend — horizontal flex-wrap */}
        <div className="flex flex-wrap gap-x-5 gap-y-2.5">
          {RISK_TYPES.map(r => {
            const meta  = CATEGORY_META[r.category];
            const isHot = hoveredCat === r.category;
            const isDim = hoveredCat !== null && !isHot;
            return (
              <div
                key={r.category}
                className="flex items-center gap-2 cursor-default"
                onMouseEnter={() => setHoveredCat(r.category)}
                onMouseLeave={() => setHoveredCat(null)}
                style={{ opacity: isDim ? 0.35 : 1, transition: 'opacity 0.18s ease' }}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                     style={{
                       background: meta.color,
                       transform:  isHot ? 'scale(1.4)' : 'scale(1)',
                       transition: 'transform 0.18s ease',
                     }} />
                <span className="text-xs font-medium"
                      style={{ color: isHot ? 'var(--text)' : 'var(--text-secondary)', transition: 'color 0.18s ease' }}>
                  {meta.label}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{r.count}</span>
                <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                  ({(r.count / TOTAL_FLAGGED * 100).toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flagged Conversations */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Flagged Conversations</h3>

          {/* Severity filter */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg)' }}>
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map(f => {
              const active = filter === f;
              const color  = f === 'all' ? ACCENT : SEV_COLOR[f as Severity];
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all"
                  style={{
                    background: active ? color : 'transparent',
                    color:      active ? '#fff' : 'var(--text-secondary)',
                  }}>
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(c => {
            const sm      = STATUS_META[c.status];
            const catMeta = CATEGORY_META[c.category] ?? { label: c.category, color: ACCENT };
            const needsTechReview = c.severity === 'high' || c.severity === 'critical';

            return (
              <div key={c.id} className="p-4 rounded-xl"
                   style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>

                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
                      {c.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: SEV_BG[c.severity], color: SEV_COLOR[c.severity] }}>
                      {c.severity}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${catMeta.color}18`, color: catMeta.color }}>
                      {catMeta.label}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: sm.bg, color: sm.color }}>
                      {sm.label}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>{c.time}</span>
                </div>

                {/* Metadata grid */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>Sender</div>
                    <div className="text-sm font-semibold" style={{ color: ACCENT }}>@{c.sender}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>Recipient</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{c.recipient}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>AI Confidence</div>
                    <div className="text-sm font-bold"
                         style={{
                           color: c.confidence >= 85
                             ? SEV_COLOR.critical
                             : c.confidence >= 70
                               ? SEV_COLOR.high
                               : SEV_COLOR.medium,
                         }}>
                      {c.confidence}%
                    </div>
                  </div>
                </div>

                {/* Message snippet */}
                <div className="p-2.5 rounded-lg mb-3 text-xs italic"
                     style={{
                       background: 'var(--card)',
                       color: 'var(--text-secondary)',
                       borderLeft: `3px solid ${SEV_COLOR[c.severity]}`,
                     }}>
                  {c.snippet}
                </div>

                {/* Actions */}
                {(c.status === 'pending' || needsTechReview) && (
                  <div className="flex gap-2 flex-wrap items-center">

                    {/* Moderation actions — pending only */}
                    {c.status === 'pending' && (
                      <>
                        <button onClick={() => act(c.id, 'approved')}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold"
                          style={{ background: 'rgba(76,175,80,0.12)', color: GREEN }}>
                          Approve
                        </button>
                        <button onClick={() => act(c.id, 'escalated')}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold"
                          style={{ background: `${GOLD}20`, color: GOLD }}>
                          Escalate
                        </button>
                        <button onClick={() => act(c.id, 'banned')}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold"
                          style={{ background: 'rgba(244,67,54,0.12)', color: RED }}>
                          Ban User
                        </button>
                      </>
                    )}

                    {/* Tech review — High + Critical only, always visible */}
                    {needsTechReview && (
                      <button
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5${c.status === 'pending' ? ' ml-auto' : ''}`}
                        style={{
                          background: `${INDIGO}10`,
                          color:       INDIGO,
                          border:      `1px solid ${INDIGO}28`,
                        }}>
                        <Code2 size={11} />
                        Request Tech Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--text-light)' }}>
              No flagged conversations in this category
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
