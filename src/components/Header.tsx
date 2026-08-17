import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Sun, Moon, Bell, PanelLeftClose, PanelLeftOpen, Search,
  ShieldAlert, Flag, DollarSign, LifeBuoy, Bot, TrendingUp, User,
  Settings, LogOut, Pencil,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { api, type AdminNotification } from '../lib/api';
import type { Page } from '../types';

// ─── Avatar config ────────────────────────────────────────────────────────────

const AVATAR_SEEDS = [
  'Nova', 'Orion', 'Lyra', 'Vega', 'Draco',
  'Atlas', 'Zephyr', 'Cosmo', 'Nebula', 'Pulsar',
  'Quasar', 'Solaris', 'Titan', 'Celeste', 'Andromeda',
];

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const GREEN  = '#4caf50';
const RED    = '#f44336';

// ─── Notifications ────────────────────────────────────────────────────────────

type NotifType = 'alert' | 'report' | 'payment' | 'ticket' | 'bot' | 'revenue' | 'user';

const NOTIF_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  alert:   { icon: ShieldAlert, color: RED,    bg: 'rgba(244,67,54,0.12)'  },
  report:  { icon: Flag,        color: ACCENT, bg: `${ACCENT}18`            },
  payment: { icon: DollarSign,  color: GOLD,   bg: `${GOLD}20`             },
  ticket:  { icon: LifeBuoy,    color: PURPLE, bg: `${PURPLE}18`            },
  bot:     { icon: Bot,         color: ACCENT, bg: `${ACCENT}18`            },
  revenue: { icon: TrendingUp,  color: GREEN,  bg: 'rgba(76,175,80,0.12)'  },
  user:    { icon: User,        color: GREEN,  bg: 'rgba(76,175,80,0.12)'  },
};

// Maps server notification types → UI display type
const SERVER_TYPE_MAP: Record<string, NotifType> = {
  ticket_urgent:         'ticket',
  ticket_assigned:       'ticket',
  flag_high:             'alert',
  flag_escalated:        'report',
  report_critical:       'report',
  announcement_sent:     'alert',
  subscription_new:      'revenue',
  subscription_cancelled:'payment',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Page titles ──────────────────────────────────────────────────────────────

const pageTitles: Record<string, string> = {
  'overview':          'Overview',
  'swipe-analytics':   'Swipe Analytics',
  'profile-analytics': 'Profile Analytics',
  'profile-insights':  'Profile Insights',
  'growth':            'Growth',
  'active-users':      'Active Users',
  'subscriptions':     'Subscriptions',
  'revenue':           'Revenue',
  'cancellations':     'Cancellations',
  'chat-assessment':   'Chat Assessment',
  'report-evaluation': 'Report Evaluation',
  'customer-service':  'Customer Service',
  'support-tickets':   'Support Tickets',
  'feedback':          'Feedback',
  'announcements':     'Announcements',
  'user-management':   'User Management',
  'team-registration': 'Team Registration',
  'team-monitoring':   'Team Monitoring',
  'settings':          'Settings',
  'admin-profile':     'Profile',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface HeaderProps {
  page: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onNavigate: (page: Page) => void;
}

export default function Header({ page, sidebarCollapsed, onToggleSidebar, onNavigate }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { adminUser, signOut, updateAvatar } = useAuth();
  const { setNavState } = useNavigation();

  const [notifOpen,    setNotifOpen]    = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [signingOut,   setSigningOut]   = useState(false);
  const [showPicker,   setShowPicker]   = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [notifs,       setNotifs]       = useState<AdminNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  const fetchNotifs = useCallback(async () => {
    try {
      const { data } = await api.notifications.list({ limit: 20 });
      setNotifs(data);
    } catch {
      // silently fail — stale notifs stay visible
    }
  }, []);

  // Initial fetch + 30s polling
  useEffect(() => {
    setNotifLoading(true);
    fetchNotifs().finally(() => setNotifLoading(false));
    const id = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  // Avatar initials fallback
  const initials = adminUser?.full_name
    ? adminUser.full_name.charAt(0).toUpperCase()
    : (adminUser?.email?.charAt(0).toUpperCase() ?? 'A');

  async function handlePickAvatar(seed: string) {
    setSavingAvatar(true);
    try {
      await updateAvatar(seed);
      setShowPicker(false);
    } finally {
      setSavingAvatar(false);
    }
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    if (profileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    try { await api.notifications.markAllRead(); } catch { /* optimistic, ignore */ }
  };

  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await api.notifications.markRead(id); } catch { /* optimistic, ignore */ }
  };

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <>
    <header
      className="fixed top-0 right-0 z-20 flex items-center justify-between px-6 border-b transition-all duration-300"
      style={{
        left: sidebarCollapsed ? 64 : 240,
        height: 64,
        background: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Left: toggle + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <h1 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
          {pageTitles[page] || page}
        </h1>
      </div>

      {/* Right: search + bell + theme + profile */}
      <div className="flex items-center gap-2">
        <div className="relative hidden sm:flex items-center">
          <Search size={14} className="absolute left-3" style={{ color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-4 py-1.5 rounded-md text-sm outline-none transition-all"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', width: 200 }}
          />
        </div>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className="relative p-2 rounded-md transition-colors"
            style={{ color: notifOpen ? ACCENT : 'var(--text-secondary)' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-white"
                style={{ background: ACCENT, fontSize: 9, fontWeight: 700, lineHeight: 1 }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 rounded-xl shadow-2xl overflow-hidden"
              style={{ top: 'calc(100% + 8px)', width: 380, background: 'var(--card)', border: '1px solid var(--border)', zIndex: 50 }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${ACCENT}18`, color: ACCENT }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs font-medium" style={{ color: 'var(--text-light)' }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
                {notifLoading && notifs.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-light)' }}>
                    Loading…
                  </div>
                ) : notifs.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-light)' }}>
                    No notifications yet
                  </div>
                ) : notifs.map((n, idx) => {
                  const uiType = SERVER_TYPE_MAP[n.type] ?? 'alert';
                  const meta   = NOTIF_META[uiType];
                  const Icon   = meta.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        if (n.type === 'ticket_assigned' && n.metadata?.ticket_id) {
                          setNavState({ highlightTicketId: n.metadata.ticket_id as string });
                          onNavigate('support-tickets');
                          setNotifOpen(false);
                        }
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                      style={{
                        background:   n.read ? 'transparent' : `${ACCENT}08`,
                        borderBottom: idx < notifs.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: meta.bg }}>
                        <Icon size={14} style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs truncate" style={{ color: 'var(--text)', fontWeight: n.read ? 500 : 700 }}>
                            {n.title}
                          </span>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ACCENT }} />}
                        </div>
                        <div className="text-xs italic" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.body}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>{timeAgo(n.created_at)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-4 py-2.5 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                <button className="text-xs font-semibold" style={{ color: ACCENT }}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Profile avatar + dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold transition-opacity flex-shrink-0"
            style={{
              background: adminUser?.avatar_seed ? 'var(--bg)' : ACCENT,
              color: '#fff',
              opacity: profileOpen ? 0.8 : 1,
              border: adminUser?.avatar_seed ? '2px solid var(--border)' : 'none',
            }}
            title={adminUser?.full_name ?? 'Profile'}
          >
            {adminUser?.avatar_seed ? (
              <img src={avatarUrl(adminUser.avatar_seed)} alt="avatar" className="w-full h-full" />
            ) : initials}
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 rounded-xl shadow-2xl overflow-hidden"
              style={{ top: 'calc(100% + 8px)', width: 210, background: 'var(--card)', border: '1px solid var(--border)', zIndex: 50 }}
            >
              {/* Identity */}
              <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
                {/* Avatar with pencil overlay */}
                <div className="relative flex-shrink-0 group">
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold"
                    style={{
                      background: adminUser?.avatar_seed ? 'var(--bg)' : ACCENT,
                      color: '#fff',
                      border: adminUser?.avatar_seed ? '2px solid var(--border)' : 'none',
                    }}
                  >
                    {adminUser?.avatar_seed ? (
                      <img src={avatarUrl(adminUser.avatar_seed)} alt="avatar" className="w-full h-full" />
                    ) : initials}
                  </div>
                  <button
                    onClick={() => { setShowPicker(true); setProfileOpen(false); }}
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ background: ACCENT }}
                    title="Change avatar"
                  >
                    <Pencil size={8} color="#fff" />
                  </button>
                </div>

                <div className="min-w-0">
                  <button
                    onClick={() => {
                      setNavState({ profileUserId: adminUser?.id, fromPage: page as import('../types').Page });
                      onNavigate('admin-profile');
                      setProfileOpen(false);
                    }}
                    className="text-sm font-semibold truncate block text-left transition-opacity hover:opacity-70"
                    style={{ color: 'var(--text)' }}
                  >
                    {adminUser?.full_name ?? 'Admin'}
                  </button>
                  <div className="text-xs mt-0.5 truncate capitalize" style={{ color: 'var(--text-secondary)' }}>
                    {adminUser?.role?.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className="p-1.5">
                <button
                  onClick={() => { onNavigate('settings'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors hover:bg-[var(--bg)]"
                  style={{ color: 'var(--text)' }}
                >
                  <Settings size={14} style={{ color: 'var(--text-secondary)' }} />
                  Settings
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors hover:bg-[var(--bg)]"
                  style={{ color: ACCENT, opacity: signingOut ? 0.6 : 1, cursor: signingOut ? 'not-allowed' : 'pointer' }}
                >
                  <LogOut size={14} />
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Avatar picker modal */}
    {showPicker && createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={() => !savingAvatar && setShowPicker(false)}
      >
        <div
          className="card rounded-2xl p-6"
          style={{ width: 360, boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>Choose your droid</h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-light)' }}>
            Pick a robot avatar for your Polaris profile.
          </p>

          <div className="grid grid-cols-5 gap-3 mb-5">
            {AVATAR_SEEDS.map(seed => {
              const selected = adminUser?.avatar_seed === seed;
              return (
                <button
                  key={seed}
                  disabled={savingAvatar}
                  onClick={() => handlePickAvatar(seed)}
                  title={seed}
                  className="rounded-xl p-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{
                    background: selected ? `${ACCENT}18` : 'var(--bg)',
                    border: `2px solid ${selected ? ACCENT : 'var(--border)'}`,
                  }}
                >
                  <img
                    src={avatarUrl(seed)}
                    alt={seed}
                    className="w-full aspect-square"
                  />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              disabled={savingAvatar || !adminUser?.avatar_seed}
              onClick={() => handlePickAvatar('')}
              className="text-xs font-medium transition-opacity disabled:opacity-30"
              style={{ color: 'var(--text-light)' }}
            >
              Remove avatar
            </button>
            <button
              disabled={savingAvatar}
              onClick={() => setShowPicker(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-90"
              style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              {savingAvatar ? 'Saving…' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )}
    </>
  );
}
