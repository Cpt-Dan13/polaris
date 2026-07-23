import { useState, useEffect } from 'react';
import {
  DollarSign, Star, Zap, Users, UserPlus, MousePointerClick,
  AlertTriangle, Flag, Activity, TrendingUp,
  Plus, ArrowUp, ArrowDown, X, RefreshCw, RotateCcw,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import DonutChart from '../components/charts/DonutChart';
import RevenueChart from '../components/charts/RevenueChart';
import { overviewStats, planDistribution, revenueTrendData } from '../data/sampleData';
import { api } from '../lib/api';
import type { SubEvent, SubEventType } from '../lib/api';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const GREEN  = '#4caf50';
const RED    = '#f44336';
const TEAL   = '#009688';

const PLAN_LABEL: Record<string, string> = {
  orbit: 'Orbit', nova: 'Nova', supernova: 'Supernova',
};

const PLAN_COLOR: Record<string, string> = {
  orbit: ACCENT, nova: GOLD, supernova: PURPLE,
};

const EVENT_META: Record<SubEventType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  subscribed:  { label: 'Subscribed',  color: GREEN,  bg: 'rgba(76,175,80,0.12)',  icon: Plus      },
  upgraded:    { label: 'Upgraded',    color: ACCENT, bg: `${ACCENT}18`,           icon: ArrowUp   },
  cancelled:   { label: 'Cancelled',   color: RED,    bg: 'rgba(244,67,54,0.12)',  icon: X         },
  downgraded:  { label: 'Downgraded',  color: GOLD,   bg: `${GOLD}20`,            icon: ArrowDown },
  renewed:     { label: 'Renewed',     color: PURPLE, bg: `${PURPLE}18`,          icon: RefreshCw },
  reactivated: { label: 'Reactivated', color: TEAL,   bg: 'rgba(0,150,136,0.14)', icon: RotateCcw },
};

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours < 2 ? `${hours}h ${mins % 60}m ago` : `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Overview() {
  const [events,       setEvents]   = useState<SubEvent[]>([]);
  const [eventsLoading, setEventsL] = useState(true);

  useEffect(() => {
    api.finance.subscriptionEvents()
      .then(setEvents).catch(() => {}).finally(() => setEventsL(false));
  }, []);

  return (
    <div className="space-y-6">

      {/* Row 1 — Revenue, Subscriptions, Active Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          label="Revenue (MTD)"
          value={overviewStats.revenue}
          change={overviewStats.revenueGrowth}
          icon={<DollarSign size={18} />}
          iconBg="#c8972b"
          prefix="$"
        />

        {/* Combined Subscribers card */}
        <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Subscribers
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(200,151,43,0.2)' }}>
              <Users size={18} style={{ color: '#c8972b' }} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={14} style={{ color: '#e94560' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nova</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {overviewStats.novaSubscribers.toLocaleString()}
              </div>
              <div className="flex items-center justify-end gap-1 text-xs font-medium" style={{ color: '#4caf50' }}>
                <TrendingUp size={11} />
                +{overviewStats.novaGrowth}%
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)' }} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: '#c8972b' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>SuperNova</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {overviewStats.supernovaSubscribers.toLocaleString()}
              </div>
              <div className="flex items-center justify-end gap-1 text-xs font-medium" style={{ color: '#4caf50' }}>
                <TrendingUp size={11} />
                +{overviewStats.supernovaGrowth}%
              </div>
            </div>
          </div>
        </div>

        <StatCard
          label="Active Users Today"
          value={overviewStats.activeUsers}
          change={overviewStats.userGrowth}
          icon={<Users size={18} />}
          iconBg="#4caf50"
        />
      </div>

      {/* Row 2 — Growth & Moderation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="New Registrations"
          value={overviewStats.newRegistrations}
          change={overviewStats.registrationGrowth}
          icon={<UserPlus size={18} />}
          iconBg="#2196f3"
        />
        <StatCard
          label="Avg Swipes / User"
          value={overviewStats.avgSwipesPerUser}
          change={overviewStats.swipeGrowth}
          icon={<MousePointerClick size={18} />}
          iconBg="#e94560"
        />
        <StatCard
          label="Flagged Messages"
          value={overviewStats.flaggedMessages}
          icon={<AlertTriangle size={18} />}
          iconBg="#ff9800"
        />
        <StatCard
          label="Open Reports"
          value={overviewStats.openReports}
          icon={<Flag size={18} />}
          iconBg="#f44336"
        />
      </div>

      {/* Row 3 — Revenue Trend + Subscription Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Revenue Trend</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>12-month history</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(200,151,43,0.1)', color: '#c8972b' }}>
              $24,680 this month
            </span>
          </div>
          <RevenueChart data={revenueTrendData} height={220} />
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Subscription Split</h2>
          <DonutChart data={planDistribution} size={150} />
        </div>
      </div>

      {/* Row 4 — Recent Activity + Bot Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Activity — live Nova / Supernova events */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} style={{ color: ACCENT }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent Activity</h2>
            <span className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-light)' }}>
              <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: GREEN }} />
              Live
            </span>
          </div>

          {eventsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                   style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
            </div>
          ) : (() => {
            const paidEvents = events
              .filter(item => {
                const effectiveTier = (item.event_type === 'upgraded' || item.event_type === 'downgraded')
                  ? item.to_tier
                  : item.tier;
                return effectiveTier !== 'orbit';
              })
              .slice(0, 7);

            if (paidEvents.length === 0) {
              return (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-light)' }}>
                  No Nova or Supernova activity yet
                </p>
              );
            }

            return (
              <div className="space-y-2">
                {paidEvents.map(item => {
                  const meta      = EVENT_META[item.event_type];
                  const Icon      = meta.icon;
                  const isMove    = item.event_type === 'upgraded' || item.event_type === 'downgraded';
                  const detail    = isMove
                    ? `${PLAN_LABEL[item.from_tier ?? ''] ?? item.from_tier} → ${PLAN_LABEL[item.to_tier ?? ''] ?? item.to_tier}`
                    : PLAN_LABEL[item.tier ?? ''] ?? item.tier ?? '';
                  const detailColor = PLAN_COLOR[isMove ? (item.to_tier ?? '') : (item.tier ?? '')] ?? 'var(--text-secondary)';

                  return (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg"
                         style={{ background: 'rgba(150,150,150,0.04)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                           style={{ background: meta.bg }}>
                        <Icon size={13} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                            {item.name}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                          {detail && (
                            <span className="text-xs font-medium" style={{ color: detailColor }}>
                              {detail}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-light)' }}>
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Bot Status</h2>
          <div className="space-y-3">
            {[
              { name: 'Isla Seraphin',    vm: 'VM-03', status: 'active',   msgs: 3842 },
              { name: 'Elena Rossi',      vm: 'VM-01', status: 'active',   msgs: 5217 },
              { name: 'Lyra Belrose',     vm: 'VM-02', status: 'active',   msgs: 2904 },
              { name: 'Aurora Solstice',  vm: 'VM-01', status: 'active',   msgs: 4130 },
              { name: 'Seraphina Lux',    vm: 'VM-04', status: 'inactive', msgs: 1720 },
              { name: 'Maeve Calloway',   vm: 'VM-04', status: 'inactive', msgs: 980  },
            ].map(bot => (
              <div key={bot.name} className="flex items-center gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: bot.status === 'active' ? GREEN : '#6b7280' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{bot.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-light)' }}>{bot.vm}</div>
                </div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {bot.msgs.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
