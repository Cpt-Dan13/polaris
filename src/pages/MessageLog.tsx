import { useState } from 'react';
import { Search, AlertTriangle, MessageSquare, Image, Mic } from 'lucide-react';
import { messageLogs } from '../data/sampleData';
import Badge from '../components/Badge';

const typeIcon: Record<string, React.ReactNode> = {
  text: <MessageSquare size={12} />,
  image: <Image size={12} />,
  audio: <Mic size={12} />,
};

export default function MessageLog() {
  const [search, setSearch] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const filtered = messageLogs.filter(m => {
    if (flaggedOnly && !m.flagged) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.from.toLowerCase().includes(q) || m.to.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md text-sm outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
        <button
          onClick={() => setFlaggedOnly(f => !f)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all"
          style={{
            background: flaggedOnly ? 'rgba(255,152,0,0.12)' : 'var(--card)',
            color: flaggedOnly ? '#ff9800' : 'var(--text-secondary)',
            border: `1px solid ${flaggedOnly ? '#ff980040' : 'var(--border)'}`,
          }}
        >
          <AlertTriangle size={13} />
          Flagged Only
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">From</th>
                <th className="text-left">To</th>
                <th className="text-left">Preview</th>
                <th className="text-left">Type</th>
                <th className="text-left">Time</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(msg => (
                <tr key={msg.id}>
                  <td>
                    <span className="font-medium text-sm" style={{ color: '#e94560' }}>{msg.from}</span>
                  </td>
                  <td>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{msg.to}</span>
                  </td>
                  <td style={{ maxWidth: 280 }}>
                    <span className="text-sm truncate block" style={{ color: 'var(--text)', maxWidth: 260 }}>
                      {msg.preview}
                    </span>
                  </td>
                  <td>
                    <span
                      className="flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {typeIcon[msg.type]}
                      {msg.type}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-light)' }}>{msg.timestamp}</span>
                  </td>
                  <td>
                    {msg.flagged ? (
                      <Badge label="Flagged" variant="warning" dot />
                    ) : (
                      <Badge label="Clean" variant="success" dot />
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-light)' }}>
                    No messages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
