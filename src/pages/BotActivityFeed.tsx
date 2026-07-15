import { useState, useEffect } from 'react';
import { Activity, Filter } from 'lucide-react';
import { activityLogs as initialLogs } from '../data/sampleData';
import type { ActivityLog } from '../types';

const typeConfig: Record<string, { color: string; bg: string; label: string }> = {
  message: { color: '#e94560', bg: 'rgba(233,69,96,0.1)', label: 'MSG' },
  match: { color: '#4caf50', bg: 'rgba(76,175,80,0.1)', label: 'MATCH' },
  error: { color: '#f44336', bg: 'rgba(244,67,54,0.1)', label: 'ERR' },
  flag: { color: '#ff9800', bg: 'rgba(255,152,0,0.1)', label: 'FLAG' },
  login: { color: '#c8972b', bg: 'rgba(200,151,43,0.1)', label: 'SYS' },
};

const extraLogs: ActivityLog[] = [
  { id: 'lx1', bot: 'Isla Seraphin', action: 'Message delivered to @oliver_d', user: 'oliver_d', timestamp: '14:33:01', type: 'message' },
  { id: 'lx2', bot: 'Aurora Solstice', action: 'New match with @jason_r', user: 'jason_r', timestamp: '14:33:15', type: 'match' },
  { id: 'lx3', bot: 'Elena Rossi', action: 'Response time exceeded threshold', user: '—', timestamp: '14:33:28', type: 'error' },
  { id: 'lx4', bot: 'Lyra Belrose', action: 'Sent image to @brendan', user: 'brendan', timestamp: '14:33:42', type: 'message' },
];

export default function BotActivityFeed() {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const [filter, setFilter] = useState<string>('all');
  const [paused, setPaused] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setCounter(c => {
        const next = c % extraLogs.length;
        const newLog = {
          ...extraLogs[next],
          id: `live-${Date.now()}`,
          timestamp: new Date().toTimeString().slice(0, 8),
        };
        setLogs(prev => [newLog, ...prev.slice(0, 49)]);
        return c + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [paused]);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full live-dot" style={{ background: paused ? '#6b7280' : '#4caf50' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {paused ? 'Paused' : 'Live'}
          </span>
        </div>

        <button
          onClick={() => setPaused(p => !p)}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          style={{
            background: paused ? 'rgba(76,175,80,0.1)' : 'rgba(150,150,150,0.1)',
            color: paused ? '#4caf50' : 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <Filter size={13} style={{ color: 'var(--text-secondary)' }} />
          <div className="flex gap-1">
            {['all', 'message', 'match', 'error', 'flag', 'login'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-2.5 py-1 rounded text-xs font-medium transition-all capitalize"
                style={{
                  background: filter === f ? (f === 'all' ? 'rgba(233,69,96,0.12)' : `${typeConfig[f]?.bg || 'rgba(233,69,96,0.12)'}`) : 'transparent',
                  color: filter === f ? (f === 'all' ? '#e94560' : typeConfig[f]?.color || '#e94560') : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {f === 'login' ? 'SYS' : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Activity size={14} style={{ color: '#e94560' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Activity Log</span>
          <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
            {filtered.length} events
          </span>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 520 }}>
          {filtered.map((log, idx) => {
            const cfg = typeConfig[log.type];
            return (
              <div
                key={log.id}
                className="flex items-center gap-3 px-4 py-3 border-b transition-all"
                style={{
                  borderColor: 'var(--border)',
                  background: idx === 0 && !paused ? 'rgba(233,69,96,0.03)' : 'transparent',
                  animation: idx === 0 && !paused ? 'fade-in 0.4s ease' : 'none',
                }}
              >
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color, minWidth: 44, textAlign: 'center' }}
                >
                  {cfg.label}
                </span>
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#e94560', width: 120 }}>
                  {log.bot}
                </span>
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                  {log.action}
                </span>
                {log.user !== '—' && (
                  <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: 'var(--text-light)' }}>
                    @{log.user}
                  </span>
                )}
                <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-light)' }}>
                  {log.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
