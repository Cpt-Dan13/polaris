import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  iconBg?: string;
  prefix?: string;
  suffix?: string;
}

export default function StatCard({ label, value, change, icon, iconBg = '#e94560', prefix, suffix }: StatCardProps) {
  const positive = change !== undefined && change > 0;
  const negative = change !== undefined && change < 0;
  const neutral = change === 0;

  return (
    <div className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${iconBg}20` }}>
          <span style={{ color: iconBg }}>{icon}</span>
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {positive && <TrendingUp size={13} style={{ color: '#4caf50' }} />}
          {negative && <TrendingDown size={13} style={{ color: '#f44336' }} />}
          {neutral && <Minus size={13} style={{ color: '#999' }} />}
          <span style={{ color: positive ? '#4caf50' : negative ? '#f44336' : '#999' }}>
            {positive ? '+' : ''}{change}%
          </span>
          <span style={{ color: 'var(--text-light)' }}>vs last week</span>
        </div>
      )}
    </div>
  );
}
