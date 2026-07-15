import {
  DollarSign, Star, Zap, Users, UserPlus, MousePointerClick,
  AlertTriangle, Flag, Activity, TrendingUp,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import DonutChart from '../components/charts/DonutChart';
import RevenueChart from '../components/charts/RevenueChart';
import { overviewStats, planDistribution, revenueTrendData, activityLogs } from '../data/sampleData';

const typeColors: Record<string, string> = {
  message: '#e94560',
  match: '#4caf50',
  error: '#f44336',
  flag: '#ff9800',
  login: '#c8972b',
};

const typeLabels: Record<string, string> = {
  message: 'MSG',
  match: 'MATCH',
  error: 'ERR',
  flag: 'FLAG',
  login: 'SYS',
};

export default function Overview() {
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
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} style={{ color: '#e94560' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent Activity</h2>
            <span className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-light)' }}>
              <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: '#4caf50' }} />
              Live
            </span>
          </div>
          <div className="space-y-2">
            {activityLogs.slice(0, 7).map(log => (
              <div
                key={log.id}
                className="flex items-center gap-3 p-2.5 rounded-md"
                style={{ background: 'rgba(150,150,150,0.04)' }}
              >
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: `${typeColors[log.type]}18`,
                    color: typeColors[log.type],
                    minWidth: 40,
                    textAlign: 'center',
                  }}
                >
                  {typeLabels[log.type]}
                </span>
                <span className="text-xs font-medium flex-shrink-0" style={{ color: '#e94560', minWidth: 100 }}>
                  {log.bot}
                </span>
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                  {log.action}
                </span>
                <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-light)' }}>
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
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
                  style={{ background: bot.status === 'active' ? '#4caf50' : '#6b7280' }}
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
