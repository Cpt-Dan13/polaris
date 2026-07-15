import { useState } from 'react';
import { LifeBuoy, AlertOctagon, Clock, CheckCircle, Bot, ArrowUpCircle } from 'lucide-react';
import { tickets } from '../data/sampleData';
import type { Ticket } from '../types';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const GREEN  = '#4caf50';
const RED    = '#f44336';
const SLATE  = '#78909c';

// ─── Meta maps ────────────────────────────────────────────────────────────────

const PRIORITY_META: Record<Ticket['priority'], { color: string; bg: string; order: number }> = {
  urgent: { color: RED,    bg: 'rgba(244,67,54,0.12)',   order: 0 },
  high:   { color: ACCENT, bg: `${ACCENT}18`,             order: 1 },
  medium: { color: GOLD,   bg: `${GOLD}20`,              order: 2 },
  low:    { color: GREEN,  bg: 'rgba(76,175,80,0.12)',   order: 3 },
};

const STATUS_META: Record<Ticket['status'], { label: string; color: string; bg: string }> = {
  'open':        { label: 'Open',        color: GOLD,   bg: `${GOLD}20`              },
  'in-progress': { label: 'In Progress', color: PURPLE, bg: `${PURPLE}18`            },
  'resolved':    { label: 'Resolved',    color: GREEN,  bg: 'rgba(76,175,80,0.12)'  },
  'closed':      { label: 'Closed',      color: SLATE,  bg: 'rgba(120,144,156,0.12)' },
};

function deriveCategory(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes('billing') || s.includes('charge') || s.includes('payment')) return 'Billing';
  if (s.includes('verif') || s.includes('suspend') || s.includes('appeal') || s.includes('account')) return 'Account';
  if (s.includes('data') || s.includes('export')) return 'Data & Privacy';
  return 'Technical';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SupportTickets() {
  const [items, setItems] = useState<Ticket[]>(tickets);
  const [statusFilter,   setStatusFilter]   = useState<Ticket['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Ticket['priority'] | 'all'>('all');

  const updateStatus = (id: string, status: Ticket['status']) =>
    setItems(prev => prev.map(t => t.id === id ? { ...t, status } : t));

  // Sort by priority then created (newest first within same priority)
  const sorted = [...items].sort((a, b) =>
    PRIORITY_META[a.priority].order - PRIORITY_META[b.priority].order
  );

  const visible = sorted.filter(t => {
    const matchStatus   = statusFilter   === 'all' || t.status   === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  // KPI counts
  const openCount     = items.filter(t => t.status === 'open').length;
  const inProgCount   = items.filter(t => t.status === 'in-progress').length;
  const resolvedCount = items.filter(t => t.status === 'resolved').length;
  const urgentCount   = items.filter(t => t.priority === 'urgent' && t.status !== 'closed' && t.status !== 'resolved').length;

  const kpis: { label: string; value: string | number; color: string; bg: string; icon: React.ElementType }[] = [
    { label: 'Open',          value: openCount,   color: GOLD,   bg: `${GOLD}20`,              icon: LifeBuoy    },
    { label: 'In Progress',   value: inProgCount, color: PURPLE, bg: `${PURPLE}18`,            icon: Clock       },
    { label: 'Resolved',      value: resolvedCount, color: GREEN, bg: 'rgba(76,175,80,0.12)',  icon: CheckCircle },
    { label: 'Urgent',        value: urgentCount, color: RED,    bg: 'rgba(244,67,54,0.12)',   icon: AlertOctagon },
  ];

  // Priority distribution
  const priCounts = {
    urgent: items.filter(t => t.priority === 'urgent').length,
    high:   items.filter(t => t.priority === 'high').length,
    medium: items.filter(t => t.priority === 'medium').length,
    low:    items.filter(t => t.priority === 'low').length,
  };

  return (
    <div className="space-y-5">

      {/* KPI Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: k.bg }}>
                  <Icon size={15} style={{ color: k.color }} />
                </div>
              </div>
              <div className="text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Priority Distribution */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          Priority Breakdown —{' '}
          <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>{items.length} total tickets</span>
        </h3>

        <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-4">
          {(['urgent', 'high', 'medium', 'low'] as const).map(p => (
            <div key={p}
                 style={{ width: `${(priCounts[p] / items.length * 100).toFixed(1)}%`, background: PRIORITY_META[p].color }}
                 title={`${p}: ${priCounts[p]}`} />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['urgent', 'high', 'medium', 'low'] as const).map(p => (
            <div key={p} className="p-3 rounded-lg flex items-center gap-2.5"
                 style={{ background: 'var(--bg)' }}>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                   style={{ background: PRIORITY_META[p].color }} />
              <div>
                <div className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{p}</div>
                <div className="text-lg font-black" style={{ color: PRIORITY_META[p].color }}>
                  {priCounts[p]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {/* Status filter */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--card)' }}>
          {(['all', 'open', 'in-progress', 'resolved', 'closed'] as const).map(s => {
            const active = statusFilter === s;
            const meta   = s !== 'all' ? STATUS_META[s] : null;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize"
                style={{
                  background: active ? (meta?.color ?? ACCENT) : 'transparent',
                  color:      active ? '#fff' : 'var(--text-secondary)',
                }}>
                {s === 'in-progress' ? 'In Progress' : s}
              </button>
            );
          })}
        </div>

        {/* Priority filter */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--card)' }}>
          {(['all', 'urgent', 'high', 'medium', 'low'] as const).map(p => {
            const active = priorityFilter === p;
            const color  = p === 'all' ? ACCENT : PRIORITY_META[p].color;
            return (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize"
                style={{
                  background: active ? color : 'transparent',
                  color:      active ? '#fff' : 'var(--text-secondary)',
                }}>
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket Cards */}
      <div className="space-y-3">
        {visible.map(ticket => {
          const pm      = PRIORITY_META[ticket.priority];
          const sm      = STATUS_META[ticket.status];
          const cat     = deriveCategory(ticket.subject);
          const isOpen  = ticket.status === 'open';
          const isInProg = ticket.status === 'in-progress';
          const assigned = ticket.assignedBot !== '—';

          return (
            <div key={ticket.id} className="card overflow-hidden"
                 style={{ borderLeft: `4px solid ${pm.color}` }}>
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold"
                          style={{ color: 'var(--text-secondary)' }}>
                      {ticket.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: pm.bg, color: pm.color }}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: sm.bg, color: sm.color }}>
                      {sm.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      {cat}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>
                    {ticket.created}
                  </span>
                </div>

                {/* Subject */}
                <div className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
                  {ticket.subject}
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>User</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {ticket.user}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>Assigned to</div>
                    <div className="flex items-center gap-1.5">
                      {assigned ? (
                        <>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                               style={{ background: `${ACCENT}20` }}>
                            <Bot size={11} style={{ color: ACCENT }} />
                          </div>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                            {ticket.assignedBot}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--text-light)' }}>Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {(isOpen || isInProg) && (
                  <div className="flex gap-2 pt-3 flex-wrap"
                       style={{ borderTop: '1px solid var(--border)' }}>
                    {isOpen && (
                      <button onClick={() => updateStatus(ticket.id, 'in-progress')}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold"
                        style={{ background: `${PURPLE}18`, color: PURPLE }}>
                        Start
                      </button>
                    )}
                    {isInProg && (
                      <button onClick={() => updateStatus(ticket.id, 'resolved')}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold"
                        style={{ background: 'rgba(76,175,80,0.12)', color: GREEN }}>
                        Resolve
                      </button>
                    )}
                    {isInProg && (
                      <button onClick={() => updateStatus(ticket.id, 'open')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold"
                        style={{ background: `${GOLD}20`, color: GOLD }}>
                        <ArrowUpCircle size={11} /> Escalate
                      </button>
                    )}
                    <button onClick={() => updateStatus(ticket.id, 'closed')}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold"
                      style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="card p-12 text-center" style={{ color: 'var(--text-light)' }}>
            No tickets match the current filters
          </div>
        )}
      </div>

    </div>
  );
}
