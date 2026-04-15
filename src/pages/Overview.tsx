import { Users, MessageSquare, Bot, DollarSign, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import LineChart from '../components/charts/LineChart';
import DonutChart from '../components/charts/DonutChart';
import { overviewStats, lineChartData, planDistribution, activityLogs } from '../data/sampleData';

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Users"
          value={overviewStats.activeUsers}
          change={overviewStats.userGrowth}
          icon={<Users size={18} />}
          iconBg="#e94560"
        />
        <StatCard
          label="Messages Today"
          value={overviewStats.messagesDay}
          change={overviewStats.messageGrowth}
          icon={<MessageSquare size={18} />}
          iconBg="#c8972b"
        />
        <StatCard
          label="Active Bots"
          value={overviewStats.activeBots}
          change={overviewStats.botGrowth}
          icon={<Bot size={18} />}
          iconBg="#4caf50"
        />
        <StatCard
          label="Revenue (MTD)"
          value={overviewStats.revenue}
          change={overviewStats.revenueGrowth}
          icon={<DollarSign size={18} />}
          iconBg="#c8972b"
          prefix="$"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Weekly Activity</h2>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(233,69,96,0.1)', color: '#e94560' }}>
              Last 7 days
            </span>
          </div>
          <LineChart data={lineChartData} height={220} />
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Plan Distribution</h2>
          <DonutChart data={planDistribution} size={150} />
        </div>
      </div>

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
                className="flex items-center gap-3 p-2.5 rounded-md transition-colors"
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
                <span className="text-xs font-medium" style={{ color: '#e94560', minWidth: 100, flexShrink: 0 }}>
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
              { name: 'Isla Seraphin', vm: 'VM-03', status: 'active', msgs: 3842 },
              { name: 'Elena Rossi', vm: 'VM-01', status: 'active', msgs: 5217 },
              { name: 'Lyra Belrose', vm: 'VM-02', status: 'active', msgs: 2904 },
              { name: 'Aurora Solstice', vm: 'VM-01', status: 'active', msgs: 4130 },
              { name: 'Seraphina Lux', vm: 'VM-04', status: 'inactive', msgs: 1720 },
              { name: 'Maeve Calloway', vm: 'VM-04', status: 'inactive', msgs: 980 },
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
