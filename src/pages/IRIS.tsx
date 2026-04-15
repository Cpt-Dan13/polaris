import { Sparkles } from 'lucide-react';

export default function IRIS() {
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'linear-gradient(135deg, rgba(233,69,96,0.15), rgba(200,151,43,0.15))' }}
      >
        <Sparkles size={40} style={{ color: '#e94560' }} />
      </div>
      <h1
        className="text-4xl font-bold mb-3 tracking-wide"
        style={{
          background: 'linear-gradient(135deg, #e94560, #c8972b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        IRIS
      </h1>
      <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
        Work In Progress
      </p>
      <p className="text-sm mt-2 text-center max-w-sm" style={{ color: 'var(--text-light)' }}>
        The IRIS intelligence module is currently under development and will be available in a future release.
      </p>
    </div>
  );
}
