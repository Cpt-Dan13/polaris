import { useState, useEffect } from 'react';
import { api } from './lib/api';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import type { Page } from './types';

import Overview from './pages/Overview';
import VMHealthMonitor from './pages/VMHealthMonitor';
import TeamRegistration from './pages/TeamRegistration';
import TeamMonitoring from './pages/TeamMonitoring';
import UserManagement from './pages/UserManagement';
import CustomerService from './pages/CustomerService';
import Feedback from './pages/Feedback';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import SwipeAnalytics from './pages/SwipeAnalytics';
import ProfileAnalytics from './pages/ProfileAnalytics';
import ProfileInsights from './pages/ProfileInsights';
import Growth from './pages/Growth';
import Subscriptions from './pages/Subscriptions';
import Revenue from './pages/Revenue';
import Cancellations from './pages/Cancellations';
import ChatAssessment from './pages/ChatAssessment';
import ReportEvaluation from './pages/ReportEvaluation';
import SupportTickets from './pages/SupportTickets';
import ComingSoon from './pages/ComingSoon';

function PageRenderer({ page }: { page: Page }) {
  switch (page) {
    case 'overview':            return <Overview />;
    // Analytics
    case 'swipe-analytics':     return <SwipeAnalytics />;
    case 'profile-analytics':   return <ProfileAnalytics />;
    case 'profile-insights':    return <ProfileInsights />;
    case 'growth':              return <Growth />;
    // Finance
    case 'subscriptions':       return <Subscriptions />;
    case 'revenue':             return <Revenue />;
    case 'cancellations':       return <Cancellations />;
    // Moderation
    case 'chat-assessment':     return <ChatAssessment />;
    case 'report-evaluation':   return <ReportEvaluation />;
    // Support
    case 'customer-service':    return <CustomerService />;
    case 'support-tickets':     return <SupportTickets />;
    case 'feedback':            return <Feedback />;
    // Content
    case 'announcements':       return <Announcements />;
    // Users
    case 'user-management':     return <UserManagement />;
    // Developer
    case 'team-registration':   return <TeamRegistration />;
    case 'vm-health':           return <VMHealthMonitor />;
    case 'team-monitoring':     return <TeamMonitoring />;
    // System
    case 'settings':            return <Settings />;
    default:                    return <Overview />;
  }
}

function AppShell() {
  const { session, loading, verifying } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('overview');

  useEffect(() => {
    if (!session) return;
    const ping = () => api.presence().catch(() => {});
    ping();
    const id = setInterval(ping, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [session]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        color: 'var(--text-secondary)',
        fontSize: 14,
      }}>
        Loading…
      </div>
    );
  }

  // While verifying admin status after sign-in, stay on Login so the button
  // keeps its loading state — no dashboard flash, no separate "verifying" page.
  if (!session || verifying) return <Login />;

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <PageRenderer page={currentPage} key={currentPage} />
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
