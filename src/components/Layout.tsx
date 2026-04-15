import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { Page } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} collapsed={collapsed} />
      <Header page={currentPage} sidebarCollapsed={collapsed} onToggleSidebar={() => setCollapsed(c => !c)} />
      <main
        className="transition-all duration-300"
        style={{
          marginLeft: collapsed ? 64 : 240,
          paddingTop: 64,
          minHeight: '100vh',
        }}
      >
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
