import { useState, useEffect } from 'react';
import {
  ChevronLeft, Mail, Calendar, LifeBuoy, Flag, ShieldAlert,
  Megaphone, Users, Loader2,
} from 'lucide-react';
import { api, type SupportTicket, type ModerationReport, type ChatFlag, type Announcement, type TeamMember } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { ROLE_LABEL, type AdminRole } from '../lib/rbac';
import Badge from '../components/Badge';

const ACCENT  = '#e94560';
const PURPLE  = '#9c27b0';
const GREEN   = '#4caf50';
const GOLD    = '#c8972b';
const SLATE   = '#78909c';
const RED     = '#f44336';

const ROLE_COLOR: Record<string, { color: string; bg: string }> = {
  viewer:      { color: SLATE,  bg: 'rgba(120,144,156,0.12)' },
  support:     { color: PURPLE, bg: `${PURPLE}18`            },
  moderator:   { color: ACCENT, bg: `${ACCENT}18`            },
  admin:       { color: GREEN,  bg: 'rgba(76,175,80,0.12)'   },
  super_admin: { color: GOLD,   bg: `${GOLD}20`              },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  open:        { label: 'Open',        color: GOLD   },
  'in-progress':{ label: 'In Progress', color: PURPLE },
  in_progress: { label: 'In Progress', color: PURPLE  },
  closed:      { label: 'Closed',      color: SLATE   },
};

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Support tasks ────────────────────────────────────────────────────────────

function SupportTasks({ tickets, loading, onTicketClick }: {
  tickets:       SupportTicket[];
  loading:       boolean;
  onTicketClick: (id: string) => void;
}) {
  const open   = tickets.filter(t => t.status === 'open').length;
  const inProg = tickets.filter(t => t.status === 'in-progress' || t.status === 'in_progress').length;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <LifeBuoy size={15} style={{ color: PURPLE }} />
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Assigned Tickets</h2>
        <span className="ml-auto text-xs" style={{ color: 'var(--text-light)' }}>
          {open} open · {inProg} in progress
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
        </div>
      ) : tickets.length === 0 ? (
        <p className="text-xs py-4 text-center" style={{ color: 'var(--text-light)' }}>No assigned tickets</p>
      ) : (
        <div className="space-y-2">
          {tickets.map(t => {
            const sm = STATUS_META[t.status] ?? STATUS_META.open;
            return (
              <button
                key={t.id}
                onClick={() => onTicketClick(t.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:brightness-110"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <span className="font-mono text-xs font-bold flex-shrink-0" style={{ color: sm.color }}>
                  #{t.ref}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${sm.color}20`, color: sm.color }}>
                  {sm.label}
                </span>
                {t.category && (
                  <span className="text-xs flex-shrink-0 hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
                    {t.category}
                  </span>
                )}
                {t.is_urgent && (
                  <span className="text-xs font-semibold flex-shrink-0" style={{ color: RED }}>Urgent</span>
                )}
                <span className="ml-auto text-xs flex-shrink-0" style={{ color: 'var(--text-light)' }}>
                  {formatDate(t.created_at)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Moderator tasks ──────────────────────────────────────────────────────────

function ModeratorTasks({ flags, reports, loading }: {
  flags:   ChatFlag[];
  reports: ModerationReport[];
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Chat flags */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <ShieldAlert size={15} style={{ color: RED }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Team Chat Flag Queue</h2>
          {!loading && (
            <span className="ml-auto text-xs" style={{ color: 'var(--text-light)' }}>
              {flags.length} pending
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
          </div>
        ) : flags.length === 0 ? (
          <p className="text-xs py-4 text-center" style={{ color: 'var(--text-light)' }}>Queue is clear</p>
        ) : (
          <div className="space-y-2">
            {flags.map(f => (
              <div key={f.id} className="px-3 py-2.5 rounded-lg text-xs"
                   style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>
                    {f.sender?.first_name ?? 'User'} → {f.receiver?.first_name ?? 'User'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ml-auto"
                        style={{ background: `${RED}18`, color: RED }}>
                    {f.severity}
                  </span>
                </div>
                <p className="truncate" style={{ color: 'var(--text-secondary)' }}>{f.snippet}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reports */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Flag size={15} style={{ color: ACCENT }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Team Report Queue</h2>
          {!loading && (
            <span className="ml-auto text-xs" style={{ color: 'var(--text-light)' }}>
              {reports.length} open
            </span>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
          </div>
        ) : reports.length === 0 ? (
          <p className="text-xs py-4 text-center" style={{ color: 'var(--text-light)' }}>No open reports</p>
        ) : (
          <div className="space-y-2">
            {reports.map(r => (
              <div key={r.id} className="px-3 py-2.5 rounded-lg text-xs"
                   style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize" style={{ color: 'var(--text)' }}>
                    {r.category?.replace(/_/g, ' ')}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ml-auto"
                        style={{ background: `${ACCENT}18`, color: ACCENT }}>
                    {r.priority}
                  </span>
                  <span className="flex-shrink-0" style={{ color: 'var(--text-light)' }}>
                    {formatDate(r.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin/Super Admin tasks ──────────────────────────────────────────────────

function AdminTasks({ announcements, loading }: { announcements: Announcement[]; loading: boolean }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <Megaphone size={15} style={{ color: GOLD }} />
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Announcements Sent</h2>
        {!loading && (
          <span className="ml-auto text-xs" style={{ color: 'var(--text-light)' }}>{announcements.length} total</span>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={18} className="animate-spin" style={{ color: 'var(--text-secondary)' }} />
        </div>
      ) : announcements.length === 0 ? (
        <p className="text-xs py-4 text-center" style={{ color: 'var(--text-light)' }}>No announcements sent yet</p>
      ) : (
        <div className="space-y-2">
          {announcements.map(a => (
            <div key={a.id} className="px-3 py-2.5 rounded-lg text-xs"
                 style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold truncate" style={{ color: 'var(--text)' }}>{a.title}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] capitalize flex-shrink-0"
                      style={{ background: `${ACCENT}1a`, color: ACCENT }}>
                  {a.audience === 'all' ? 'All Users' : a.audience}
                </span>
              </div>
              <div className="flex items-center gap-3" style={{ color: 'var(--text-light)' }}>
                <span className="flex items-center gap-1"><Users size={10} /> {a.sent_count.toLocaleString()} delivered</span>
                <span>{formatDate(a.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminProfile() {
  const { navState, setNavState, navigate } = useNavigation();
  const { adminUser: currentAdmin } = useAuth();

  const profileId = navState?.profileUserId ?? currentAdmin?.id ?? '';
  const fromPage  = navState?.fromPage;
  const isSelf    = profileId === currentAdmin?.id;

  const [profile,        setProfile]        = useState<TeamMember | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [tickets,        setTickets]        = useState<SupportTicket[]>([]);
  const [reports,        setReports]        = useState<ModerationReport[]>([]);
  const [flags,          setFlags]          = useState<ChatFlag[]>([]);
  const [announcements,  setAnnouncements]  = useState<Announcement[]>([]);
  const [tasksLoading,   setTasksLoading]   = useState(false);

  useEffect(() => {
    if (!profileId) return;
    setProfileLoading(true);
    api.team.getById(profileId)
      .then(res => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [profileId]);

  useEffect(() => {
    if (!profile) return;
    setTasksLoading(true);
    const load = async () => {
      if (profile.role === 'support') {
        const res = await api.support.list({ assigned_to: profile.id, limit: 50 });
        setTickets(res.data ?? []);
      } else if (profile.role === 'moderator') {
        const [fr, rr] = await Promise.all([
          api.moderation.chat.flags({ status: 'pending', limit: 10 }),
          api.moderation.reports({ status: 'open', limit: 10 }),
        ]);
        setFlags(fr.data ?? []);
        setReports(rr.data ?? []);
      } else if (profile.role === 'admin' || profile.role === 'super_admin') {
        const res = await api.email.announcements({ sent_by: profile.id, limit: 20 });
        setAnnouncements(res.data ?? []);
      }
    };
    load().finally(() => setTasksLoading(false));
  }, [profile]);

  function handleBack() {
    setNavState(null);
    navigate(fromPage ?? 'overview');
  }

  function goToTicket(ticketId: string) {
    navigate('support-tickets', { highlightTicketId: ticketId, fromPage: 'admin-profile' });
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-24" style={{ color: 'var(--text-light)' }}>
        <Loader2 size={20} className="animate-spin mr-2" /> Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card p-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        Admin user not found.
      </div>
    );
  }

  const roleColors = ROLE_COLOR[profile.role] ?? ROLE_COLOR.viewer;
  const initials   = (profile.full_name ?? profile.email)
    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5">

      {/* Back */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ChevronLeft size={15} />
        Back
      </button>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 text-xl font-bold"
            style={{
              background: profile.avatar_seed ? 'var(--bg)' : ACCENT,
              color: '#fff',
              border: profile.avatar_seed ? '2px solid var(--border)' : 'none',
            }}
          >
            {profile.avatar_seed
              ? <img src={avatarUrl(profile.avatar_seed)} alt="avatar" className="w-full h-full" />
              : initials
            }
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-base font-bold" style={{ color: 'var(--text)' }}>
                {profile.full_name ?? '—'}
              </span>
              {isSelf && (
                <span className="text-xs" style={{ color: 'var(--text-light)' }}>(you)</span>
              )}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: roleColors.bg, color: roleColors.color }}>
                {ROLE_LABEL[profile.role as AdminRole] ?? profile.role}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              <Mail size={11} /> {profile.email}
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-light)' }}>
              <Calendar size={11} /> Member since {formatDate(profile.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific tasks */}
      {profile.role === 'support' && (
        <SupportTasks tickets={tickets} loading={tasksLoading} onTicketClick={goToTicket} />
      )}
      {profile.role === 'moderator' && (
        <ModeratorTasks flags={flags} reports={reports} loading={tasksLoading} />
      )}
      {(profile.role === 'admin' || profile.role === 'super_admin') && (
        <AdminTasks announcements={announcements} loading={tasksLoading} />
      )}
      {profile.role === 'viewer' && (
        <div className="card p-6 text-center text-xs" style={{ color: 'var(--text-light)' }}>
          No tasks assigned to this role.
        </div>
      )}

    </div>
  );
}
