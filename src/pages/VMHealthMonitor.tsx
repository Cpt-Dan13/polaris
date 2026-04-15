import { RefreshCw, Server } from 'lucide-react';
import { vms } from '../data/sampleData';
import Badge from '../components/Badge';

function MeterBar({ value, warn = 70, crit = 90 }: { value: number; warn?: number; crit?: number }) {
  const color = value >= crit ? '#f44336' : value >= warn ? '#ff9800' : '#4caf50';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

const statusBadge: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  healthy: 'success',
  warning: 'warning',
  critical: 'error',
  offline: 'neutral',
};

export default function VMHealthMonitor() {
  const healthy = vms.filter(v => v.status === 'healthy').length;
  const warning = vms.filter(v => v.status === 'warning').length;
  const critical = vms.filter(v => v.status === 'critical').length;
  const offline = vms.filter(v => v.status === 'offline').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Healthy', count: healthy, color: '#4caf50' },
          { label: 'Warning', count: warning, color: '#ff9800' },
          { label: 'Critical', count: critical, color: '#f44336' },
          { label: 'Offline', count: offline, color: '#6b7280' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
              <Server size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.count}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Virtual Machine Status</h2>
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">VM</th>
                <th className="text-left">IP Address</th>
                <th className="text-left">Status</th>
                <th className="text-left">Region</th>
                <th>CPU</th>
                <th>Memory</th>
                <th>Disk</th>
                <th className="text-left">Uptime</th>
                <th className="text-left">Bots</th>
              </tr>
            </thead>
            <tbody>
              {vms.map(vm => (
                <tr key={vm.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ background: 'rgba(233,69,96,0.1)' }}
                      >
                        <Server size={12} style={{ color: '#e94560' }} />
                      </div>
                      <span className="font-medium text-sm">{vm.name}</span>
                    </div>
                  </td>
                  <td><span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{vm.ip}</span></td>
                  <td><Badge label={vm.status} variant={statusBadge[vm.status]} dot /></td>
                  <td><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{vm.region}</span></td>
                  <td style={{ minWidth: 120 }}><MeterBar value={vm.cpu} /></td>
                  <td style={{ minWidth: 120 }}><MeterBar value={vm.memory} /></td>
                  <td style={{ minWidth: 120 }}><MeterBar value={vm.disk} warn={75} crit={90} /></td>
                  <td><span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{vm.uptime}</span></td>
                  <td>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ background: vm.bots > 0 ? 'rgba(233,69,96,0.1)' : 'var(--bg)', color: vm.bots > 0 ? '#e94560' : 'var(--text-light)' }}
                    >
                      {vm.bots}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
