import { Activity } from 'lucide-react';

export default function TeamMonitoring() {
  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ height: '60vh' }}>
      <div className="rounded-full flex items-center justify-center"
           style={{ width: 64, height: 64, background: 'rgba(233,69,96,0.1)' }}>
        <Activity size={28} style={{ color: '#e94560' }} />
      </div>
      <h2 className="text-xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
        Team Monitoring
      </h2>
      <p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>
        This module is under development.
      </p>
    </div>
  );
}
