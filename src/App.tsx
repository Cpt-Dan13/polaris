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

function PageRenderer({ page }: { page: Page }) {
  switch (page) {
    case 'overview': return <Overview />;
    case 'bot-management': return <BotManagement />;
    case 'vm-health': return <VMHealthMonitor />;
    case 'activity-feed': return <BotActivityFeed />;
    case 'persona-manager': return <PersonaManager />;
    case 'scheduler': return <Scheduler />;
    case 'message-log': return <MessageLog />;
    case 'user-management': return <UserManagement />;
    case 'customer-service': return <CustomerService />;
    case 'feedback': return <Feedback />;
    case 'reports-flags': return <ReportsFlags />;
    case 'announcements': return <Announcements />;
    case 'iris': return <IRIS />;
    case 'settings': return <Settings />;
    default: return <Overview />;
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
