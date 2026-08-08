import { useState } from 'react';
import { Headphones, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { tickets, POLARIS_ADMIN_USERS } from '../data/sampleData';
import type { Ticket } from '../types';
import Badge from '../components/Badge';

const statusBadge: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = {
  'open': 'warning',
  'in-progress': 'info',
  'resolved': 'success',
  'closed': 'neutral',
};

const priorityBadge: Record<string, 'neutral' | 'warning' | 'error' | 'gold'> = {
  low: 'neutral',
  medium: 'warning',
  high: 'error',
  urgent: 'error',
};

const SAMPLE = tickets.slice(0, 3);

function formatDate(raw: string): string {
  const d = new Date(raw.replace(' ', 'T'));
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  const [expanded,   setExpanded]   = useState(false);
  const [assigneeId, setAssigneeId] = useState<string | null>(ticket.assigned_to ?? null);
  const [copied,     setCopied]     = useState(false);

  function copyEmail(e: React.MouseEvent) {
    e.stopPropagation();
    if (!ticket.contact_email) return;
    navigator.clipboard.writeText(ticket.contact_email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card mb-3 overflow-hidden transition-all">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(233,69,96,0.1)' }}>
          <Headphones size={14} style={{ color: '#e94560' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>{ticket.id}</span>
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{ticket.subject}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--text-light)' }}>by {ticket.user}</span>
            {ticket.contact_email && (
              <span className="flex items-center gap-1">
                <span className="text-xs" style={{ color: 'var(--text-light)' }}>{ticket.contact_email}</span>
                <button
                  onClick={copyEmail}
                  title="Copy email"
                  className="flex items-center justify-center transition-colors"
                  style={{ color: copied ? '#4caf50' : 'var(--text-light)', lineHeight: 1 }}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                </button>
              </span>
            )}
            <span className="text-xs" style={{ color: 'var(--text-light)' }}>
              {formatDate(ticket.created)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge label={ticket.priority} variant={priorityBadge[ticket.priority]} />
          <Badge label={ticket.status} variant={statusBadge[ticket.status]} dot />
          {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="mb-1.5" style={{ color: 'var(--text-secondary)' }}>Assigned to</div>
              <div className="relative">
                <select
                  value={assigneeId ?? ''}
                  onChange={(e) => setAssigneeId(e.target.value || null)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full appearance-none text-[12px] px-2.5 pr-6 py-1.5 rounded-md"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: assigneeId ? 'var(--text)' : 'var(--text-secondary)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Unassigned</option>
                  {POLARIS_ADMIN_USERS.map(a => (
                    <option key={a.id} value={a.id}>{a.full_name}</option>
                  ))}
                </select>
                <ChevronDown
                  size={10}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-light)' }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1" style={{ color: 'var(--text-secondary)' }}>Ticket ID</div>
              <div className="font-mono font-medium" style={{ color: 'var(--text)' }}>{ticket.id}</div>
            </div>
            <div>
              <div className="mb-1" style={{ color: 'var(--text-secondary)' }}>Created</div>
              <div className="font-medium" style={{ color: 'var(--text)' }}>{formatDate(ticket.created)}</div>
            </div>
          </div>

          {ticket.message && (
            <div className="mt-4 px-3 pt-2.5 pb-3 rounded-lg"
                 style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5"
                   style={{ color: 'var(--text-light)' }}>Message</div>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {ticket.message}
              </p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button className="px-4 py-1.5 rounded-md text-xs font-medium text-white" style={{ background: '#e94560' }}>
              Respond
            </button>
            <button className="px-4 py-1.5 rounded-md text-xs font-medium" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Mark Resolved
            </button>
            <button className="px-4 py-1.5 rounded-md text-xs font-medium" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Escalate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerService() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? SAMPLE : SAMPLE.filter(t => t.status === filter);
  const counts = {
    open:          SAMPLE.filter(t => t.status === 'open').length,
    'in-progress': SAMPLE.filter(t => t.status === 'in-progress').length,
    resolved:      SAMPLE.filter(t => t.status === 'resolved').length,
    closed:        SAMPLE.filter(t => t.status === 'closed').length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key === filter ? 'all' : key)}
            className="card p-4 text-left transition-all hover:shadow-md"
            style={{ border: filter === key ? '2px solid #e94560' : undefined }}
          >
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>{count}</div>
            <Badge label={key} variant={statusBadge[key]} dot />
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'open', 'in-progress', 'resolved', 'closed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(233,69,96,0.1)' : 'var(--card)',
              color:      filter === f ? '#e94560' : 'var(--text-secondary)',
              border:     `1px solid ${filter === f ? '#e9456040' : 'var(--border)'}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div>
        {filtered.map(ticket => (
          <TicketRow key={ticket.id} ticket={ticket} />
        ))}
        {filtered.length === 0 && (
          <div className="card p-12 text-center" style={{ color: 'var(--text-light)' }}>
            No tickets in this category
          </div>
        )}
      </div>
    </div>
  );
}
