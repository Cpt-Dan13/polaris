import { useState } from 'react';
import { Flag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { reportFlags } from '../data/sampleData';
import type { ReportFlag } from '../types';
import Badge from '../components/Badge';

const statusBadge: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = {
  pending: 'warning',
  reviewed: 'info',
  dismissed: 'neutral',
  actioned: 'success',
};

const severityBadge: Record<string, 'neutral' | 'warning' | 'error'> = {
  low: 'neutral',
  medium: 'warning',
  high: 'error',
};

export default function ReportsFlags() {
  const [flags, setFlags] = useState<ReportFlag[]>(reportFlags);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? flags : flags.filter(f => f.status === filter);

  const updateStatus = (id: string, status: ReportFlag['status']) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, status } : f));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'pending', label: 'Pending', color: '#ff9800', icon: <AlertTriangle size={16} /> },
          { key: 'reviewed', label: 'Reviewed', color: '#e94560', icon: <Flag size={16} /> },
          { key: 'actioned', label: 'Actioned', color: '#4caf50', icon: <CheckCircle size={16} /> },
          { key: 'dismissed', label: 'Dismissed', color: '#6b7280', icon: <XCircle size={16} /> },
        ].map(s => {
          const count = flags.filter(f => f.status === s.key).length;
          return (
            <div key={s.key} className="card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: s.color }}>{count}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'reviewed', 'actioned', 'dismissed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(233,69,96,0.1)' : 'var(--card)',
              color: filter === f ? '#e94560' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? '#e9456040' : 'var(--border)'}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(flag => (
          <div key={flag.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>{flag.id}</span>
                <Badge label={flag.severity} variant={severityBadge[flag.severity]} />
                <Badge label={flag.status} variant={statusBadge[flag.status]} dot />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-light)' }}>{flag.date}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Reporter</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{flag.reporter}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Reported</div>
                <div className="text-sm font-medium" style={{ color: '#e94560' }}>{flag.reported}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Reason</div>
                <div className="text-sm" style={{ color: 'var(--text)' }}>{flag.reason}</div>
              </div>
            </div>

            {(flag.status === 'pending' || flag.status === 'reviewed') && (
              <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => updateStatus(flag.id, 'actioned')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium"
                  style={{ background: 'rgba(244,67,54,0.1)', color: '#f44336' }}
                >
                  Take Action
                </button>
                <button
                  onClick={() => updateStatus(flag.id, 'reviewed')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium"
                  style={{ background: 'rgba(233,69,96,0.1)', color: '#e94560' }}
                >
                  Mark Reviewed
                </button>
                <button
                  onClick={() => updateStatus(flag.id, 'dismissed')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium"
                  style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card p-12 text-center" style={{ color: 'var(--text-light)' }}>
            No reports in this category
          </div>
        )}
      </div>
    </div>
  );
}
