import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import type { Page } from './types';

import Overview from './pages/Overview';
import BotManagement from './pages/BotManagement';
import VMHealthMonitor from './pages/VMHealthMonitor';
import Scheduler from './pages/Scheduler';
import UserManagement from './pages/UserManagement';
import CustomerService from './pages/CustomerService';
import Feedback from './pages/Feedback';
import ReportsFlags from './pages/ReportsFlags';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import SwipeAnalytics from './pages/SwipeAnalytics';
import ProfileAnalytics from './pages/ProfileAnalytics';
import ProfileInsights from './pages/ProfileInsights';
import Growth from './pages/Growth';
import ActiveUsers from './pages/ActiveUsers';
import Subscriptions from './pages/Subscriptions';
import Revenue from './pages/Revenue';
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
    case 'active-users':        return <ActiveUsers />;
    // Finance
    case 'subscriptions':       return <Subscriptions />;
    case 'revenue':             return <Revenue />;
    // Moderation
    case 'chat-assessment':     return <ChatAssessment />;
    case 'report-evaluation':   return <ReportEvaluation />;
    case 'reports-flags':       return <ReportsFlags />;
    // Support
    case 'customer-service':    return <CustomerService />;
    case 'support-tickets':     return <SupportTickets />;
    case 'feedback':            return <Feedback />;
    // Content
    case 'announcements':       return <Announcements />;
    // Users
    case 'user-management':     return <UserManagement />;
    // Bots
    case 'bot-management':      return <BotManagement />;
    case 'vm-health':           return <VMHealthMonitor />;
    case 'scheduler':           return <Scheduler />;
    // System
    case 'settings':            return <Settings />;
    default:                    return <Overview />;
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('overview');

  return (
    <ThemeProvider>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        <PageRenderer page={currentPage} key={currentPage} />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
