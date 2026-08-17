import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Megaphone, Send, Users, Globe, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { api, type Announcement } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { canAct } from '../lib/rbac';
import AccessDeniedModal from '../components/AccessDeniedModal';

const ACCENT  = '#e94560';
const INDIGO  = '#6366f1';

const TITLE_SUGGESTIONS = [
  // Maintenance & Technical
  'Scheduled Maintenance Window',
  'Emergency Maintenance Notice',
  'Service Interruption Update',
  'App Update Available',
  // Community & Policy
  'Community Guidelines Update',
  'Terms of Service Update',
  'Privacy Policy Update',
  'Important Safety Notice',
  // Features & Product
  'New Feature Alert',
  'Constellation Mode Update',
  'Exciting New Features Are Live',
  'App Improvements & Bug Fixes',
  // Subscriptions & Offers
  'Exclusive Offer for Orbit Members',
  'Exclusive Offer for Nova Members',
  'Exclusive Offer for Supernova Members',
  'Subscription Renewal Reminder',
  'Limited Time Upgrade Offer',
  // Engagement
  'Complete Your Profile',
  'Your Constellation Is Growing',
  'New Matches Are Waiting',
  'Tips to Improve Your Experience',
  // Account & Security
  'Important Account Notice',
  'Account Security Update',
  'Verify Your Profile',
  // General
  'Welcome to Constell8tion',
  'A Message from the Team',
  "We'd Love Your Feedback",
];

const AUDIENCE_OPTIONS = [
  { value: 'all',       label: 'All Users',  icon: <Globe  size={13} /> },
  { value: 'orbit',     label: 'Orbit',      icon: <Users  size={13} /> },
  { value: 'nova',      label: 'Nova',       icon: <Users  size={13} /> },
  { value: 'supernova', label: 'Supernova',  icon: <Users  size={13} /> },
] as const;

type AudienceValue = typeof AUDIENCE_OPTIONS[number]['value'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Announcements() {
  const { adminUser } = useAuth();
  const isAuthorized = canAct(adminUser?.role, 'admin');

  const [title,        setTitle]        = useState('');
  const [body,         setBody]         = useState('');
  const [audience,     setAudience]     = useState<AudienceValue>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sending,         setSending]         = useState(false);
  const [sentResult,   setSentResult]   = useState<{ sent_count: number; failed_count: number } | null>(null);
  const [sendError,    setSendError]    = useState<string | null>(null);
  const [showWipModal, setShowWipModal] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  const [history,        setHistory]        = useState<Announcement[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    api.email.announcements({ limit: 20 })
      .then(res => setHistory(res.data ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleSend = async () => {
    if (!isAuthorized) { setShowAccessDenied(true); return; }
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setSendError(null);
    setSentResult(null);
    try {
      const res = await api.email.sendAnnouncement(title, body, audience);
      setSentResult(res);
      // Prepend to history
      setHistory(prev => [{
        id:            crypto.randomUUID(),
        title,
        body,
        audience,
        sent_count:    res.sent_count,
        failed_count:  res.failed_count,
        sent_by:       null,
        sent_by_admin: null,
        created_at:    new Date().toISOString(),
      }, ...prev]);
      setTitle('');
      setBody('');
      setAudience('all');
      setTimeout(() => setSentResult(null), 5000);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send announcement');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
    <div className="space-y-6 max-w-3xl">

      {/* ── Compose card ── */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone size={16} style={{ color: ACCENT }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Compose Announcement</h2>
        </div>

        <div className="relative">
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title</label>
          <div className="relative">
            <input
              className="w-full pl-3 pr-9 py-2.5 rounded-md text-sm outline-none transition-all"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              placeholder="Announcement title…"
              value={title}
              onChange={e => { setTitle(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              onKeyDown={e => { if (e.key === 'Escape') setShowSuggestions(false); }}
              autoComplete="off"
            />
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); setShowSuggestions(v => !v); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-transform"
              style={{
                color: 'var(--text-light)',
                transform: `translateY(-50%) rotate(${showSuggestions ? 180 : 0}deg)`,
              }}
              tabIndex={-1}
            >
              <ChevronDown size={15} />
            </button>
          </div>
          {showSuggestions && (() => {
            const matches = TITLE_SUGGESTIONS.filter(s =>
              title.trim() === '' || s.toLowerCase().includes(title.toLowerCase())
            );
            return matches.length > 0 ? (
              <div
                className="absolute left-0 right-0 z-20 rounded-md overflow-hidden"
                style={{
                  top: 'calc(100% + 4px)',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  maxHeight: 220,
                  overflowY: 'auto',
                }}
              >
                {matches.map(s => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); setTitle(s); setShowSuggestions(false); }}
                    className="w-full text-left px-3 py-2 text-sm transition-colors hover:brightness-110"
                    style={{
                      color: title === s ? ACCENT : 'var(--text)',
                      background: title === s ? `${ACCENT}12` : 'transparent',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null;
          })()}
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Message</label>
          <textarea
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none resize-none transition-all"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
            placeholder="Write your announcement…"
            rows={5}
            maxLength={500}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
          <div className="text-xs mt-1 text-right" style={{ color: body.length >= 480 ? ACCENT : 'var(--text-light)' }}>
            {body.length} / 500
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Target Audience</label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setAudience(opt.value)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all"
                style={{
                  background: audience === opt.value ? `${ACCENT}1a` : 'var(--bg)',
                  color:      audience === opt.value ? ACCENT : 'var(--text-secondary)',
                  border:     `1px solid ${audience === opt.value ? `${ACCENT}40` : 'var(--border)'}`,
                }}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {sendError && (
          <p className="text-xs px-3 py-2 rounded-md" style={{ background: `${ACCENT}15`, color: ACCENT }}>
            {sendError}
          </p>
        )}

        {/* Success */}
        {sentResult && (
          <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-md" style={{ background: '#4caf5015', color: '#4caf50' }}>
            <CheckCircle2 size={13} />
            Sent to {sentResult.sent_count.toLocaleString()} users
            {sentResult.failed_count > 0 && ` · ${sentResult.failed_count} failed`}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSend}
            disabled={!title.trim() || !body.trim() || sending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{ background: ACCENT }}
          >
            {sending
              ? <Loader2 size={14} className="animate-spin" />
              : <Send size={14} />
            }
            {sending ? 'Sending…' : 'Send Announcement'}
          </button>
          <button
            onClick={() => isAuthorized ? setShowWipModal(true) : setShowAccessDenied(true)}
            className="px-5 py-2.5 rounded-md text-sm font-medium transition-all"
            style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            Save Draft
          </button>
        </div>
      </div>

      {/* ── Past Announcements ── */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Past Announcements</h3>

        {historyLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--text-light)' }}>
            No announcements sent yet
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(ann => (
              <div key={ann.id} className="card p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{ann.title}</div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${ACCENT}1a`, color: ACCENT }}>
                      {ann.audience === 'all' ? 'All Users' : ann.audience}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-light)' }}>{formatDate(ann.created_at)}</span>
                  </div>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{ann.body}</p>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-light)' }}>
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    Delivered to {ann.sent_count.toLocaleString()} users
                  </span>
                  {ann.failed_count > 0 && (
                    <span style={{ color: ACCENT }}>{ann.failed_count} failed</span>
                  )}
                  {ann.sent_by_admin?.full_name && (
                    <span>· by {ann.sent_by_admin.full_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>

    {showAccessDenied && (
      <AccessDeniedModal
        requiredRole="admin"
        userRole={adminUser?.role}
        onClose={() => setShowAccessDenied(false)}
      />
    )}

    {/* WIP modal — Save Draft */}
    {showWipModal && createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={() => setShowWipModal(false)}
      >
        <div
          className="card p-8 flex flex-col items-center gap-3 rounded-2xl"
          style={{ maxWidth: 340, width: '90%', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
          onClick={e => e.stopPropagation()}
        >
          <span style={{ fontSize: 48, lineHeight: 1 }}>🚧</span>
          <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Work in Progress</h3>
          <p className="text-sm text-center" style={{ color: 'var(--text-light)' }}>
            Draft saving is under active development.
          </p>
          <button
            onClick={() => setShowWipModal(false)}
            className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-90 active:scale-[0.97]"
            style={{ background: INDIGO }}
          >
            Got it
          </button>
        </div>
      </div>,
      document.body,
    )}
    </>
  );
}
