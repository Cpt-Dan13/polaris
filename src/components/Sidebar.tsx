import { LayoutDashboard, Bot, Server, Activity, CircleUser as UserCircle, Clock, MessageSquare, Users, Headphones, Star, Flag, Megaphone, Sparkles, Settings, ChevronRight } from 'lucide-react';
import type { Page } from '../types';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  group?: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Main' },
  { id: 'bot-management', label: 'Bot Management', icon: Bot, group: 'Bots' },
  { id: 'vm-health', label: 'VM Health Monitor', icon: Server, group: 'Bots' },
  { id: 'activity-feed', label: 'Activity Feed', icon: Activity, group: 'Bots' },
  { id: 'persona-manager', label: 'Persona Manager', icon: UserCircle, group: 'Bots' },
  { id: 'scheduler', label: 'Scheduler', icon: Clock, group: 'Bots' },
  { id: 'message-log', label: 'Message Log', icon: MessageSquare, group: 'Content' },
  { id: 'user-management', label: 'User Management', icon: Users, group: 'Content' },
  { id: 'customer-service', label: 'Customer Service', icon: Headphones, group: 'Content' },
  { id: 'feedback', label: 'Feedback', icon: Star, group: 'Content' },
  { id: 'reports-flags', label: 'Reports & Flags', icon: Flag, group: 'Content' },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, group: 'System' },
  { id: 'iris', label: 'IRIS', icon: Sparkles, group: 'System' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'System' },
];

const groups = ['Main', 'Bots', 'Content', 'System'];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
}

export default function Sidebar({ currentPage, onNavigate, collapsed }: SidebarProps) {
  return (
    <aside
      className="sidebar flex flex-col h-screen fixed left-0 top-0 z-30 transition-all duration-300"
      style={{ width: collapsed ? 64 : 240 }}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', minHeight: 64 }}>
        <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: '#e94560' }}>
          <Sparkles size={16} color="#fff" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-white font-semibold text-sm leading-tight truncate">Constellation</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin Dashboard</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {groups.map(group => {
          const items = navItems.filter(i => i.group === group);
          return (
            <div key={group} className="mb-1">
              {!collapsed && (
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {group}
                </div>
              )}
              {collapsed && group !== 'Main' && <div className="my-2 mx-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
              {items.map(item => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md mb-0.5 transition-all duration-150 group"
                    style={{
                      background: active ? 'var(--sidebar-active)' : 'transparent',
                      color: active ? '#e94560' : 'var(--sidebar-text)',
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
                    {!collapsed && (
                      <span className="text-sm font-medium truncate flex-1 text-left" style={{ color: active ? '#fff' : 'inherit' }}>
                        {item.label}
                      </span>
                    )}
                    {!collapsed && active && <ChevronRight size={14} style={{ color: '#e94560' }} />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-md" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: '#e94560', color: '#fff' }}>
            A
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-white truncate">Admin</div>
              <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>Super Admin</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
