import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LifeBuoy, AlertOctagon, Clock, CheckCircle, ChevronDown, ArrowUpCircle, Copy, Check } from 'lucide-react';
import { POLARIS_ADMIN_USERS } from '../data/sampleData';
import { api, type SupportTicket } from '../lib/api';

const ACCENT  = '#e94560';
const GOLD    = '#c8972b';
const PURPLE  = '#9c27b0';
const GREEN   = '#4caf50';
const RED     = '#f44336';
const SLATE   = '#78909c';
const INDIGO  = '#6366f1';

function formatDate(raw: string): string {
  const d = new Date(raw.replace(' ', 'T'));
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

const PRIORITY_META: Record<SupportTicket['priority'], { color: string; bg: string; order: number }> = {
  urgent: { color: RED,    bg: 'rgba(244,67,54,0.12)',   order: 0 },
  high:   { color: ACCENT, bg: `${ACCENT}18`,             order: 1 },
  medium: { color: GOLD,   bg: `${GOLD}20`,              order: 2 },
  low:    { color: GREEN,  bg: 'rgba(76,175,80,0.12)',   order: 3 },
};

const STATUS_META: Record<SupportTicket['status'], { label: string; color: string; bg: string }> = {
  'open':        { label: 'Open',        color: GOLD,   bg: `${GOLD}20`               },
  'in-progress': { label: 'In Progress', color: PURPLE, bg: `${PURPLE}18`             },
  'resolved':    { label: 'Resolved',    color: GREEN,  bg: 'rgba(76,175,80,0.12)'   },
  'closed':      { label: 'Closed',      color: SLATE,  bg: 'rgba(120,144,156,0.12)' },
};

export default function SupportTickets() {
  const [items,        setItems]        = useState<SupportTicket[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<SupportTicket['status'] | 'all'>('all');
  const [assignees,    setAssignees]    = useState<Record<string, string | null>>({});
  const [assessmentDrafts, setAssessmentDrafts] = useState<Record<string, string>>({});
  const [savingNotes,      setSavingNotes]      = useState<Record<string, boolean>>({});
  const [noteErrors,       setNoteErrors]       = useState<Record<string, string | null>>({});
  const [copiedId,     setCopiedId]     = useState<string | null>(null);
  const [showWip,      setShowWip]      = useState(false);

  useEffect(() => {
    api.support.list({ limit: 100 })
      .then(({ data }) => {
        setItems(data);
        setAssignees(Object.fromEntries(data.map(t => [t.id, t.assigned_to])));
        setAssessmentDrafts(Object.fromEntries(data.map(t => [t.id, t.assessment_note ?? ''])));
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load tickets'))
      .finally(() => setLoading(false));
  }, []);

  function copyEmail(id: string, email: string) {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function saveAssessmentNote(ticketId: string) {
    const draft = assessmentDrafts[ticketId] ?? '';

    setSavingNotes(prev => ({ ...prev, [ticketId]: true }));
    setNoteErrors(prev => ({ ...prev, [ticketId]: null }));

    try {
      const { data } = await api.support.update(ticketId, {
        assessment_note: draft.trim() || null,
      });

      setItems(prev => prev.map(ticket => ticket.id === ticketId ? data : ticket));
      setAssessmentDrafts(prev => ({ ...prev, [ticketId]: data.assessment_note ?? '' }));
    } catch (err) {
      setNoteErrors(prev => ({
        ...prev,
        [ticketId]: err instanceof Error ? err.message : 'Failed to save assessment note',
      }));
    } finally {
      setSavingNotes(prev => ({ ...prev, [ticketId]: false }));
    }
  }

  const sorted = [...items].sort((a, b) =>
    PRIORITY_META[a.priority].order - PRIORITY_META[b.priority].order,
  );

  const visible = sorted.filter(t =>
    statusFilter === 'all' || t.status === statusFilter,
  );

  const openCount     = items.filter(t => t.status === 'open').length;
  const inProgCount   = items.filter(t => t.status === 'in-progress').length;
  const resolvedCount = items.filter(t => t.status === 'resolved').length;
  const urgentCount   = items.filter(t => t.priority === 'urgent' && t.status !== 'closed' && t.status !== 'resolved').length;

  const kpis: { label: string; value: string | number; color: string; bg: string; icon: React.ElementType }[] = [
    { label: 'Open',        value: openCount,     color: GOLD,   bg: `${GOLD}20`,             icon: LifeBuoy    },
    { label: 'In Progress', value: inProgCount,   color: PURPLE, bg: `${PURPLE}18`,           icon: Clock       },
    { label: 'Resolved',    value: resolvedCount, color: GREEN,  bg: 'rgba(76,175,80,0.12)', icon: CheckCircle },
    { label: 'Urgent',      value: urgentCount,   color: RED,    bg: 'rgba(244,67,54,0.12)', icon: AlertOctagon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" style={{ color: 'var(--text-light)' }}>
        Loading tickets…
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center" style={{ color: RED }}>
        {error}
      </div>
    );
  }

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


      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
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
      </div>

      {/* Ticket Cards */}
      <div className="space-y-3">
        {visible.map(ticket => {
          const pm       = PRIORITY_META[ticket.priority];
          const sm       = STATUS_META[ticket.status];
          const isOpen   = ticket.status === 'open';
          const isInProg = ticket.status === 'in-progress';
          const assigneeId = assignees[ticket.id] ?? null;
          const assignee   = assigneeId ? POLARIS_ADMIN_USERS.find(a => a.id === assigneeId) : null;
          const assessmentDraft = assessmentDrafts[ticket.id] ?? '';
          const savedAssessment  = ticket.assessment_note ?? '';
          const isSavingNote     = savingNotes[ticket.id] ?? false;
          const noteError        = noteErrors[ticket.id] ?? null;
          const noteIsDirty      = assessmentDraft !== savedAssessment;

          return (
            <div key={ticket.id} className="card overflow-hidden"
                 style={{ borderLeft: `4px solid ${pm.color}` }}>
              <div className="p-5">

                {/* Header row — ref + badges + timestamp */}
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold"
                          style={{ color: 'var(--text-secondary)' }}>
                      #{ticket.ref}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: sm.bg, color: sm.color }}>
                      {sm.label}
                    </span>
                    {ticket.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        {ticket.category}
                      </span>
                    )}
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-light)' }}>
                    {formatDate(ticket.created_at)}
                  </span>
                </div>


                {/* Message + assessment note */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                  <div className="px-3 pt-2.5 pb-3 rounded"
                       style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-1.5"
                         style={{ color: 'var(--text-light)' }}>
                      Message
                    </div>
                    <p className="text-[13px] leading-relaxed"
                       style={{ color: 'var(--text-secondary)' }}>
                      {ticket.message ?? '—'}
                    </p>
                  </div>

                  <div className="px-3 pt-2.5 pb-3 rounded"
                       style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="text-[10px] font-semibold tracking-[0.12em] uppercase"
                           style={{ color: 'var(--text-light)' }}>
                        Assessment Note
                      </div>
                      <button
                        onClick={() => saveAssessmentNote(ticket.id)}
                        disabled={isSavingNote || !noteIsDirty}
                        className="flex-shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
                        style={{
                          background: isSavingNote || !noteIsDirty ? 'var(--border)' : INDIGO,
                          color: isSavingNote || !noteIsDirty ? 'var(--text-light)' : '#fff',
                          cursor: isSavingNote || !noteIsDirty ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isSavingNote ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                    <textarea
                      value={assessmentDraft}
                      onChange={(event) => {
                        setAssessmentDrafts(prev => ({ ...prev, [ticket.id]: event.target.value }));
                        if (noteError) {
                          setNoteErrors(prev => ({ ...prev, [ticket.id]: null }));
                        }
                      }}
                      placeholder="Add an internal assessment note…"
                      rows={3}
                      className="w-full resize-y rounded-md px-2.5 py-2 text-[13px] leading-relaxed"
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        outline: 'none',
                      }}
                    />
                    {noteError && (
                      <div className="mt-1.5 text-[11px]" style={{ color: RED }}>
                        {noteError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta row — Submitted by + Assigned to */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: 'var(--text-light)' }}>Submitted by</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {ticket.name ?? '—'}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[11px]" style={{ color: 'var(--text-light)' }}>
                        {ticket.contact_email}
                      </span>
                      <button
                        onClick={() => copyEmail(ticket.id, ticket.contact_email)}
                        title="Copy email"
                        className="flex items-center justify-center transition-colors"
                        style={{ color: copiedId === ticket.id ? GREEN : 'var(--text-light)', lineHeight: 1 }}
                      >
                        {copiedId === ticket.id ? <Check size={11} /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-light)' }}>Assigned to</div>
                    <div className="relative">
                      <select
                        value={assigneeId ?? ''}
                        onChange={(e) =>
                          setAssignees(prev => ({ ...prev, [ticket.id]: e.target.value || null }))
                        }
                        className="w-full appearance-none text-[13px] px-2.5 pr-7 py-1.5 rounded-md"
                        style={{
                          background: 'var(--bg)',
                          border:     '1px solid var(--border)',
                          color:      assignee ? 'var(--text)' : 'var(--text-secondary)',
                          outline:    'none',
                          cursor:     'pointer',
                        }}
                      >
                        <option value="">Unassigned</option>
                        {POLARIS_ADMIN_USERS.map(a => (
                          <option key={a.id} value={a.id}>{a.full_name}</option>
                        ))}
                      </select>
                      <ChevronDown
                        size={11}
                        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--text-light)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {(isOpen || isInProg) && (
                  <div className="flex gap-2 pt-3 flex-wrap"
                       style={{ borderTop: '1px solid var(--border)' }}>
                    {isOpen && (
                      <button onClick={() => setShowWip(true)}
                        className="px-3 py-1.5 rounded text-xs font-semibold"
                        style={{ background: PURPLE, color: '#fff' }}>
                        Start
                      </button>
                    )}
                    {isInProg && (
                      <button onClick={() => setShowWip(true)}
                        className="px-3 py-1.5 rounded text-xs font-semibold"
                        style={{ background: GREEN, color: '#fff' }}>
                        Resolve
                      </button>
                    )}
                    {isInProg && (
                      <button onClick={() => setShowWip(true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold"
                        style={{ background: GOLD, color: '#fff' }}>
                        <ArrowUpCircle size={11} /> Escalate
                      </button>
                    )}
                    <button onClick={() => setShowWip(true)}
                      className="px-3 py-1.5 rounded text-xs font-semibold"
                      style={{ background: SLATE, color: '#fff' }}>
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

      {/* WIP modal */}
      {showWip && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={() => setShowWip(false)}>
          <div
            className="card p-8 flex flex-col items-center gap-3 rounded-2xl"
            style={{ maxWidth: 340, width: '90%', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: 48, lineHeight: 1 }}>🚧</span>
            <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Work in Progress</h3>
            <p className="text-sm text-center" style={{ color: 'var(--text-light)' }}>
              This feature is under active development.
            </p>
            <button
              onClick={() => setShowWip(false)}
              className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97]"
              style={{ background: INDIGO }}>
              Got it
            </button>
          </div>
        </div>,
        document.body,
      )}

    </div>
  );
}
