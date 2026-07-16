import { useState, useRef, useEffect } from 'react';
import {
  Sun, Moon, Bell, PanelLeftClose, PanelLeftOpen, Search,
  ShieldAlert, Flag, DollarSign, LifeBuoy, Bot, TrendingUp, User,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const GREEN  = '#4caf50';
const RED    = '#f44336';

// ─── Notifications ────────────────────────────────────────────────────────────

type NotifType = 'alert' | 'report' | 'payment' | 'ticket' | 'bot' | 'revenue' | 'user';

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const NOTIF_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  alert:   { icon: ShieldAlert, color: RED,    bg: 'rgba(244,67,54,0.12)'  },
  report:  { icon: Flag,        color: ACCENT, bg: `${ACCENT}18`            },
  payment: { icon: DollarSign,  color: GOLD,   bg: `${GOLD}20`             },
  ticket:  { icon: LifeBuoy,    color: PURPLE, bg: `${PURPLE}18`            },
  bot:     { icon: Bot,         color: ACCENT, bg: `${ACCENT}18`            },
  revenue: { icon: TrendingUp,  color: GREEN,  bg: 'rgba(76,175,80,0.12)'  },
  user:    { icon: User,        color: GREEN,  bg: 'rgba(76,175,80,0.12)'  },
};

const INITIAL_NOTIFS: Notification[] = [
  { id: 1, type: 'alert',   title: 'High-severity flag',       body: 'CHT-4821 flagged for harassment — 94% AI confidence',     time: '4m ago',  read: false },
  { id: 2, type: 'report',  title: 'New critical report',      body: 'RPT-0921 filed against user_8821 — Fake Profile',          time: '18m ago', read: false },
  { id: 3, type: 'payment', title: 'Chargeback received',      body: '$39.99 dispute opened by anon_4821 — Supernova plan',      time: '41m ago', read: false },
  { id: 4, type: 'ticket',  title: 'Urgent support ticket',    body: 'T-1002: Cannot send messages after upgrade — Carlos M.',   time: '1h ago',  read: false },
  { id: 5, type: 'bot',     title: 'Bot response delay',       body: 'Aurora Solstice avg response time exceeded 8s threshold',  time: '2h ago',  read: false },
  { id: 6, type: 'revenue', title: 'Revenue milestone hit',    body: 'MTD revenue crossed $180k — highest month on record',      time: '3h ago',  read: true  },
  { id: 7, type: 'user',    title: 'New Supernova subscriber', body: 'luna_r upgraded to Supernova — $39.99/mo',                 time: '4h ago',  read: true  },
  { id: 8, type: 'alert',   title: 'Swipe pass rate spike',    body: 'Pass rate up 4.2pp in the last 2 hours — check Growth',   time: '5h ago',  read: true  },
];

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
  'chat-assessment':   'Chat Assessment',
  'report-evaluation': 'Report Evaluation',
  'reports-flags':     'Reports & Flags',
  'customer-service':  'Customer Service',
  'support-tickets':   'Support Tickets',
  'feedback':          'Feedback',
  'announcements':     'Announcements',
  'user-management':   'User Management',
  'activity-feed':     'Activity Feed',
  'bot-management':    'Bot Management',
  'scheduler':         'Scheduler',
  'settings':          'Settings',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface HeaderProps {
  page: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ page, sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs]       = useState<Notification[]>(INITIAL_NOTIFS);
  const notifRef                  = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [notifOpen]);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
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

      {/* Right: search + bell + theme */}
      <div className="flex items-center gap-2">
        <div className="relative hidden sm:flex items-center">
          <Search size={14} className="absolute left-3" style={{ color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-8 pr-4 py-1.5 rounded-md text-sm outline-none transition-all"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              width: 200,
            }}
          />
        </div>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(o => !o)}
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
              style={{
                top: 'calc(100% + 8px)',
                width: 380,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                zIndex: 50,
              }}
            >
              {/* Tray header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${ACCENT}18`, color: ACCENT }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium transition-colors"
                    style={{ color: 'var(--text-light)' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification items */}
              <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
                {notifs.map((n, idx) => {
                  const meta = NOTIF_META[n.type];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                      style={{
                        background: n.read ? 'transparent' : `${ACCENT}08`,
                        borderBottom: idx < notifs.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: meta.bg }}
                      >
                        <Icon size={14} style={{ color: meta.color }} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="text-xs truncate"
                            style={{ color: 'var(--text)', fontWeight: n.read ? 500 : 700 }}
                          >
                            {n.title}
                          </span>
                          {!n.read && (
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: ACCENT }}
                            />
                          )}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {n.body}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
                          {n.time}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Tray footer */}
              <div
                className="px-4 py-2.5 text-center"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <button className="text-xs font-semibold" style={{ color: ACCENT }}>
                  View all notifications
                </button>
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
      </div>
    </header>
  );
}
