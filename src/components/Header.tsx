import { Sun, Moon, Bell, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const pageTitles: Record<string, string> = {
  'overview': 'Overview',
  // Analytics
  'swipe-analytics': 'Swipe Analytics',
  'profile-analytics': 'Profile Analytics',
  'profile-insights': 'Profile Insights',
  'growth': 'Growth',
  'active-users': 'Active Users',
  // Finance
  'subscriptions': 'Subscriptions',
  'revenue': 'Revenue',
  // Moderation
  'chat-assessment': 'Chat Assessment',
  'report-evaluation': 'Report Evaluation',
  'reports-flags': 'Reports & Flags',
  // Support
  'customer-service': 'Customer Service',
  'support-tickets': 'Support Tickets',
  'feedback': 'Feedback',
  // Content
  'message-log': 'Message Log',
  'announcements': 'Announcements',
  // Users
  'user-management': 'User Management',
  // Bots
  'bot-management': 'Bot Management',
  'vm-health': 'VM Health Monitor',
  'activity-feed': 'Bot Activity Feed',
  'persona-manager': 'Persona Manager',
  'scheduler': 'Scheduler',
  // System
  'iris': 'IRIS',
  'settings': 'Settings',
};

interface HeaderProps {
  page: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ page, sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

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
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md transition-colors hover:bg-opacity-10"
          style={{ color: 'var(--text-secondary)' }}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <h1 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
          {pageTitles[page] || page}
        </h1>
      </div>

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

        <button
          className="relative p-2 rounded-md transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#e94560' }} />
        </button>

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
