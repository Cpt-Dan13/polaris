import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import type { Page } from './types';

import Overview from './pages/Overview';
import BotManagement from './pages/BotManagement';
import VMHealthMonitor from './pages/VMHealthMonitor';
import BotActivityFeed from './pages/BotActivityFeed';
import PersonaManager from './pages/PersonaManager';
import Scheduler from './pages/Scheduler';
import MessageLog from './pages/MessageLog';
import UserManagement from './pages/UserManagement';
import CustomerService from './pages/CustomerService';
import Feedback from './pages/Feedback';
import ReportsFlags from './pages/ReportsFlags';
import Announcements from './pages/Announcements';
import IRIS from './pages/IRIS';
import Settings from './pages/Settings';
import ProfileAnalytics from './pages/ProfileAnalytics';
import ComingSoon from './pages/ComingSoon';

function PageRenderer({ page }: { page: Page }) {
  switch (page) {
    case 'overview':            return <Overview />;
    // Analytics
    case 'swipe-analytics':     return <ComingSoon title="Swipe Analytics" />;
    case 'profile-analytics':   return <ProfileAnalytics />;
    case 'profile-insights':    return <ComingSoon title="Profile Insights" />;
    case 'demographics':        return <ComingSoon title="Demographics" />;
    case 'growth':              return <ComingSoon title="Growth" />;
    case 'active-users':        return <ComingSoon title="Active Users" />;
    // Finance
    case 'subscriptions':       return <ComingSoon title="Subscriptions" />;
    case 'revenue':             return <ComingSoon title="Revenue" />;
    // Moderation
    case 'chat-assessment':     return <ComingSoon title="Chat Assessment" />;
    case 'report-evaluation':   return <ComingSoon title="Report Evaluation" />;
    case 'reports-flags':       return <ReportsFlags />;
    // Support
    case 'customer-service':    return <CustomerService />;
    case 'support-tickets':     return <ComingSoon title="Support Tickets" />;
    case 'feedback':            return <Feedback />;
    // Content
    case 'message-log':         return <MessageLog />;
    case 'announcements':       return <Announcements />;
    // Users
    case 'user-management':     return <UserManagement />;
    // Bots
    case 'bot-management':      return <BotManagement />;
    case 'vm-health':           return <VMHealthMonitor />;
    case 'activity-feed':       return <BotActivityFeed />;
    case 'persona-manager':     return <PersonaManager />;
    case 'scheduler':           return <Scheduler />;
    // System
    case 'iris':                return <IRIS />;
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
