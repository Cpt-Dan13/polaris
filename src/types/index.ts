export type Page =
  | 'overview'
  // Analytics
  | 'swipe-analytics'
  | 'profile-analytics'
  | 'profile-insights'
  | 'growth'
  | 'active-users'
  // Finance
  | 'subscriptions'
  | 'revenue'
  // Moderation
  | 'chat-assessment'
  | 'report-evaluation'
  | 'reports-flags'
  // Support
  | 'customer-service'
  | 'support-tickets'
  | 'feedback'
  // Content
  | 'message-log'
  | 'announcements'
  // Users
  | 'user-management'
  // Bots
  | 'bot-management'
  | 'vm-health'
  | 'activity-feed'
  | 'persona-manager'
  | 'scheduler'
  // System
  | 'iris'
  | 'settings';

export interface Bot {
  id: string;
  name: string;
  email: string;
  gender: string;
  persona: string;
  style: 'direct' | 'submissive';
  vm: string;
  status: 'active' | 'inactive';
  avatar: string;
  messages: number;
  uptime: string;
}

export interface VMStatus {
  id: string;
  name: string;
  ip: string;
  cpu: number;
  memory: number;
  disk: number;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  uptime: string;
  bots: number;
  region: string;
}

export interface ActivityLog {
  id: string;
  bot: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'message' | 'login' | 'error' | 'match' | 'flag';
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'suspended' | 'pending';
  joined: string;
  messages: number;
  lastSeen: string;
  country: string;
}

export interface Ticket {
  id: string;
  user: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created: string;
  assignedBot: string;
}

export interface FeedbackItem {
  id: string;
  user: string;
  bot: string;
  rating: number;
  comment: string;
  date: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ReportFlag {
  id: string;
  reporter: string;
  reported: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  date: string;
  severity: 'low' | 'medium' | 'high';
}

export interface MessageLogEntry {
  id: string;
  from: string;
  to: string;
  preview: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio';
  flagged: boolean;
}

export interface ScheduleWindow {
  id: string;
  bot: string;
  days: string[];
  startTime: string;
  endTime: string;
  timezone: string;
  active: boolean;
}

export interface Persona {
  id: string;
  name: string;
  style: string;
  tone: string;
  interests: string[];
  bio: string;
  assignedBots: string[];
  avatar: string;
}
