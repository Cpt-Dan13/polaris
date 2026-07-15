import { useState } from 'react';
import { Clock, ToggleLeft as Toggle } from 'lucide-react';
import { scheduleWindows as initialWindows } from '../data/sampleData';
import type { ScheduleWindow } from '../types';

const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function ToggleSwitch({ active, onChange }: { active: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex h-5 w-9 rounded-full transition-colors flex-shrink-0"
      style={{ background: active ? '#e94560' : 'var(--border)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: active ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  );
}

function TimeBar({ start, end }: { start: string; end: string }) {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const startM = toMinutes(start);
  let endM = toMinutes(end);
  if (endM <= startM) endM += 24 * 60;
  const left = (startM / (24 * 60)) * 100;
  const width = ((endM - startM) / (24 * 60)) * 100;

  return (
    <div className="relative h-5 rounded overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div
        className="absolute h-full rounded"
        style={{
          left: `${left}%`,
          width: `${Math.min(width, 100 - left)}%`,
          background: 'linear-gradient(90deg, rgba(233,69,96,0.6), rgba(200,151,43,0.6))',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-between px-1">
        {[0, 6, 12, 18, 24].map(h => (
          <span key={h} className="text-xs" style={{ color: 'var(--text-light)', fontSize: 9 }}>{h === 24 ? '' : `${h}:00`}</span>
        ))}
      </div>
    </div>
  );
}

export default function Scheduler() {
  const [windows, setWindows] = useState<ScheduleWindow[]>(initialWindows);

  const toggleActive = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  const toggleDay = (id: string, day: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      const days = w.days.includes(day)
        ? w.days.filter(d => d !== day)
        : [...w.days, day];
      return { ...w, days };
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Configure active time windows for each bot. Bots will only respond during scheduled hours.
        </p>
        <button
          className="px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ background: '#e94560' }}
        >
          + Add Window
        </button>
      </div>

      <div className="space-y-3">
        {windows.map(w => (
          <div
            key={w.id}
            className="card p-5 transition-all"
            style={{ opacity: w.active ? 1 : 0.65 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: w.active ? 'rgba(233,69,96,0.1)' : 'var(--bg)' }}>
                  <Clock size={16} style={{ color: w.active ? '#e94560' : 'var(--text-secondary)' }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{w.bot}</div>
                  <div className="text-xs" style={{ color: 'var(--text-light)' }}>{w.timezone}</div>
                </div>
              </div>
              <ToggleSwitch active={w.active} onChange={() => toggleActive(w.id)} />
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {allDays.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(w.id, day)}
                  className="w-9 h-7 rounded text-xs font-medium transition-all"
                  style={{
                    background: w.days.includes(day) ? 'rgba(233,69,96,0.15)' : 'var(--bg)',
                    color: w.days.includes(day) ? '#e94560' : 'var(--text-secondary)',
                    border: `1px solid ${w.days.includes(day) ? '#e9456040' : 'var(--border)'}`,
                  }}
                >
                  {day.slice(0, 2)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Start:</span>
                <input
                  type="time"
                  value={w.startTime}
                  onChange={e => setWindows(prev => prev.map(sw => sw.id === w.id ? { ...sw, startTime: e.target.value } : sw))}
                  className="text-xs px-2 py-1 rounded-md outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>End:</span>
                <input
                  type="time"
                  value={w.endTime}
                  onChange={e => setWindows(prev => prev.map(sw => sw.id === w.id ? { ...sw, endTime: e.target.value } : sw))}
                  className="text-xs px-2 py-1 rounded-md outline-none"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
              </div>
            </div>

            <TimeBar start={w.startTime} end={w.endTime} />
          </div>
        ))}
      </div>
    </div>
  );
}
