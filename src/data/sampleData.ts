import type { Bot, VMStatus, ActivityLog, User, Ticket, FeedbackItem, ReportFlag, MessageLogEntry, ScheduleWindow, Persona } from '../types';

export const bots: Bot[] = [
  {
    id: 'b1',
    name: 'Isla Seraphin',
    email: 'isla.seraphin@email.com',
    gender: 'Female',
    persona: 'muse',
    style: 'submissive',
    vm: 'VM-03',
    status: 'active',
    avatar: 'IS',
    messages: 3842,
    uptime: '99.2%',
  },
  {
    id: 'b2',
    name: 'Elena Rossi',
    email: 'elena.rossi@email.com',
    gender: 'Female',
    persona: 'muse',
    style: 'submissive',
    vm: 'VM-01',
    status: 'active',
    avatar: 'ER',
    messages: 5217,
    uptime: '98.7%',
  },
  {
    id: 'b3',
    name: 'Lyra Belrose',
    email: 'lyra.belrose@email.com',
    gender: 'Female',
    persona: 'muse',
    style: 'direct',
    vm: 'VM-02',
    status: 'active',
    avatar: 'LB',
    messages: 2904,
    uptime: '97.5%',
  },
  {
    id: 'b4',
    name: 'Aurora Solstice',
    email: 'aurora.solstice@email.com',
    gender: 'Female',
    persona: 'muse',
    style: 'submissive',
    vm: 'VM-01',
    status: 'active',
    avatar: 'AS',
    messages: 4130,
    uptime: '99.8%',
  },
  {
    id: 'b5',
    name: 'Seraphina Lux',
    email: 'seraphina.lux@email.com',
    gender: 'Female',
    persona: 'muse',
    style: 'submissive',
    vm: 'VM-04',
    status: 'inactive',
    avatar: 'SL',
    messages: 1720,
    uptime: '—',
  },
  {
    id: 'b6',
    name: 'Maeve Calloway',
    email: 'maeve.calloway@email.com',
    gender: 'Female',
    persona: 'muse',
    style: 'submissive',
    vm: 'VM-04',
    status: 'inactive',
    avatar: 'MC',
    messages: 980,
    uptime: '—',
  },
];

export const vms: VMStatus[] = [
  { id: 'vm1', name: 'VM-01', ip: '10.0.1.12', cpu: 42, memory: 68, disk: 55, status: 'healthy', uptime: '47d 12h', bots: 2, region: 'US-East' },
  { id: 'vm2', name: 'VM-02', ip: '10.0.1.13', cpu: 71, memory: 82, disk: 61, status: 'warning', uptime: '23d 4h', bots: 1, region: 'US-East' },
  { id: 'vm3', name: 'VM-03', ip: '10.0.2.5', cpu: 29, memory: 54, disk: 38, status: 'healthy', uptime: '61d 8h', bots: 1, region: 'EU-West' },
  { id: 'vm4', name: 'VM-04', ip: '10.0.2.9', cpu: 0, memory: 0, disk: 22, status: 'offline', uptime: '0d 0h', bots: 0, region: 'EU-West' },
  { id: 'vm5', name: 'VM-05', ip: '10.0.3.1', cpu: 91, memory: 95, disk: 78, status: 'critical', uptime: '5d 2h', bots: 0, region: 'AP-South' },
  { id: 'vm6', name: 'VM-06', ip: '10.0.3.4', cpu: 35, memory: 48, disk: 42, status: 'healthy', uptime: '31d 6h', bots: 0, region: 'AP-South' },
];

export const activityLogs: ActivityLog[] = [
  { id: 'l1', bot: 'Elena Rossi', action: 'Sent message to user @jake_92', user: 'jake_92', timestamp: '14:32:07', type: 'message' },
  { id: 'l2', bot: 'Isla Seraphin', action: 'New match with user @marcus_t', user: 'marcus_t', timestamp: '14:31:44', type: 'match' },
  { id: 'l3', bot: 'Aurora Solstice', action: 'Message flagged for review', user: 'devink', timestamp: '14:31:12', type: 'flag' },
  { id: 'l4', bot: 'Lyra Belrose', action: 'User initiated conversation', user: 'ryanp_88', timestamp: '14:30:58', type: 'message' },
  { id: 'l5', bot: 'Elena Rossi', action: 'Connection error - retry #2', user: '—', timestamp: '14:30:33', type: 'error' },
  { id: 'l6', bot: 'Aurora Solstice', action: 'Sent message to user @carlos_m', user: 'carlos_m', timestamp: '14:30:11', type: 'message' },
  { id: 'l7', bot: 'Isla Seraphin', action: 'Profile viewed by @tommy_k', user: 'tommy_k', timestamp: '14:29:55', type: 'login' },
  { id: 'l8', bot: 'Lyra Belrose', action: 'Sent audio message to @brendan', user: 'brendan', timestamp: '14:29:40', type: 'message' },
  { id: 'l9', bot: 'Aurora Solstice', action: 'User reported conversation', user: 'nick_w', timestamp: '14:29:22', type: 'flag' },
  { id: 'l10', bot: 'Elena Rossi', action: 'Persona switch triggered', user: 'jake_92', timestamp: '14:28:47', type: 'login' },
  { id: 'l11', bot: 'Isla Seraphin', action: 'Sent message to user @oliver_d', user: 'oliver_d', timestamp: '14:28:30', type: 'message' },
  { id: 'l12', bot: 'Lyra Belrose', action: 'New match with user @sam_h', user: 'sam_h', timestamp: '14:28:09', type: 'match' },
];

export const users: User[] = [
  { id: 'u1', name: 'Jake Morrison', email: 'jake_92@mail.com', plan: 'Premium', status: 'active', joined: '2024-03-12', messages: 342, lastSeen: '2 min ago', country: 'US' },
  { id: 'u2', name: 'Marcus Thompson', email: 'marcus_t@mail.com', plan: 'Basic', status: 'active', joined: '2024-04-01', messages: 87, lastSeen: '1h ago', country: 'UK' },
  { id: 'u3', name: 'Devin Kowalski', email: 'devink@mail.com', plan: 'Premium', status: 'suspended', joined: '2024-02-18', messages: 1204, lastSeen: '3d ago', country: 'CA' },
  { id: 'u4', name: 'Ryan Parker', email: 'ryanp_88@mail.com', plan: 'Basic', status: 'active', joined: '2024-05-05', messages: 54, lastSeen: '5 min ago', country: 'AU' },
  { id: 'u5', name: 'Carlos Mendez', email: 'carlos_m@mail.com', plan: 'Gold', status: 'active', joined: '2024-01-22', messages: 891, lastSeen: '12 min ago', country: 'MX' },
  { id: 'u6', name: 'Tommy Kim', email: 'tommy_k@mail.com', plan: 'Basic', status: 'pending', joined: '2024-06-14', messages: 12, lastSeen: '4h ago', country: 'KR' },
  { id: 'u7', name: 'Brendan Cole', email: 'brendan@mail.com', plan: 'Premium', status: 'active', joined: '2024-03-30', messages: 456, lastSeen: '30 min ago', country: 'IE' },
  { id: 'u8', name: 'Nick Wallace', email: 'nick_w@mail.com', plan: 'Basic', status: 'suspended', joined: '2024-04-11', messages: 209, lastSeen: '6d ago', country: 'US' },
  { id: 'u9', name: 'Oliver Davis', email: 'oliver_d@mail.com', plan: 'Gold', status: 'active', joined: '2024-02-05', messages: 1102, lastSeen: '8 min ago', country: 'UK' },
  { id: 'u10', name: 'Sam Harris', email: 'sam_h@mail.com', plan: 'Premium', status: 'active', joined: '2024-05-20', messages: 178, lastSeen: '45 min ago', country: 'NZ' },
];

export const tickets: Ticket[] = [
  { id: 'T-1001', user: 'Jake Morrison', subject: 'Billing charge discrepancy', status: 'open', priority: 'high', created: '2024-06-14 09:12', assignedBot: 'Isla Seraphin' },
  { id: 'T-1002', user: 'Carlos Mendez', subject: 'Cannot send messages after upgrade', status: 'in-progress', priority: 'urgent', created: '2024-06-14 08:40', assignedBot: 'Elena Rossi' },
  { id: 'T-1003', user: 'Tommy Kim', subject: 'Account verification pending', status: 'open', priority: 'medium', created: '2024-06-13 22:05', assignedBot: '—' },
  { id: 'T-1004', user: 'Ryan Parker', subject: 'Profile photos not loading', status: 'resolved', priority: 'low', created: '2024-06-13 17:33', assignedBot: 'Aurora Solstice' },
  { id: 'T-1005', user: 'Oliver Davis', subject: 'Request for data export', status: 'in-progress', priority: 'medium', created: '2024-06-13 14:18', assignedBot: 'Lyra Belrose' },
  { id: 'T-1006', user: 'Sam Harris', subject: 'Match algorithm not working', status: 'open', priority: 'high', created: '2024-06-13 11:00', assignedBot: '—' },
  { id: 'T-1007', user: 'Brendan Cole', subject: 'Premium features inaccessible', status: 'closed', priority: 'medium', created: '2024-06-12 16:45', assignedBot: 'Isla Seraphin' },
  { id: 'T-1008', user: 'Devin Kowalski', subject: 'Appeal account suspension', status: 'in-progress', priority: 'high', created: '2024-06-12 09:20', assignedBot: 'Elena Rossi' },
];

export const feedbackItems: FeedbackItem[] = [
  { id: 'f1', user: 'Jake Morrison', bot: 'Elena Rossi', rating: 5, comment: 'Incredibly responsive and felt very natural. I genuinely forgot I was talking to an AI.', date: '2024-06-14', sentiment: 'positive' },
  { id: 'f2', user: 'Carlos Mendez', bot: 'Aurora Solstice', rating: 4, comment: 'Great conversation, very engaging. Could be more playful at times.', date: '2024-06-14', sentiment: 'positive' },
  { id: 'f3', user: 'Ryan Parker', bot: 'Lyra Belrose', rating: 3, comment: 'Good but sometimes responses felt a bit scripted.', date: '2024-06-13', sentiment: 'neutral' },
  { id: 'f4', user: 'Oliver Davis', bot: 'Isla Seraphin', rating: 5, comment: 'The best experience I have had on this platform. Isla is amazing.', date: '2024-06-13', sentiment: 'positive' },
  { id: 'f5', user: 'Tommy Kim', bot: 'Elena Rossi', rating: 2, comment: 'Responses were too slow and it lost context mid-conversation.', date: '2024-06-12', sentiment: 'negative' },
  { id: 'f6', user: 'Sam Harris', bot: 'Aurora Solstice', rating: 4, comment: 'Really enjoyed the conversations. Would love more photo sharing.', date: '2024-06-12', sentiment: 'positive' },
  { id: 'f7', user: 'Brendan Cole', bot: 'Lyra Belrose', rating: 1, comment: 'Felt very robotic and did not respond to what I was saying.', date: '2024-06-11', sentiment: 'negative' },
  { id: 'f8', user: 'Marcus Thompson', bot: 'Isla Seraphin', rating: 5, comment: 'Absolutely loved it. Keeping my subscription for sure!', date: '2024-06-11', sentiment: 'positive' },
];

export const reportFlags: ReportFlag[] = [
  { id: 'R-201', reporter: 'Nick Wallace', reported: 'Aurora Solstice (bot)', reason: 'Inappropriate content in messages', status: 'pending', date: '2024-06-14 14:29', severity: 'high' },
  { id: 'R-202', reporter: 'Devin Kowalski', reported: 'Isla Seraphin (bot)', reason: 'Misleading subscription prompts', status: 'reviewed', date: '2024-06-13 10:12', severity: 'medium' },
  { id: 'R-203', reporter: 'Ryan Parker', reported: 'Jake Morrison (user)', reason: 'Harassment and spam', status: 'actioned', date: '2024-06-13 08:55', severity: 'high' },
  { id: 'R-204', reporter: 'Tommy Kim', reported: 'Elena Rossi (bot)', reason: 'Excessive solicitation', status: 'dismissed', date: '2024-06-12 21:30', severity: 'low' },
  { id: 'R-205', reporter: 'Oliver Davis', reported: 'Nick Wallace (user)', reason: 'Sharing contact info', status: 'pending', date: '2024-06-12 16:00', severity: 'medium' },
  { id: 'R-206', reporter: 'Sam Harris', reported: 'Lyra Belrose (bot)', reason: 'Unresponsive / broken conversation', status: 'reviewed', date: '2024-06-11 13:44', severity: 'low' },
];

export const messageLogs: MessageLogEntry[] = [
  { id: 'm1', from: 'Elena Rossi', to: 'jake_92', preview: 'Hey! I was thinking about what you said yesterday...', timestamp: '14:32:07', type: 'text', flagged: false },
  { id: 'm2', from: 'jake_92', to: 'Elena Rossi', preview: 'I missed chatting with you. How are you feeling today?', timestamp: '14:31:55', type: 'text', flagged: false },
  { id: 'm3', from: 'Aurora Solstice', to: 'devink', preview: 'You deserve someone who truly sees you for who you are...', timestamp: '14:31:12', type: 'text', flagged: true },
  { id: 'm4', from: 'Lyra Belrose', to: 'ryanp_88', preview: '[Voice message - 0:23]', timestamp: '14:30:58', type: 'audio', flagged: false },
  { id: 'm5', from: 'carlos_m', to: 'Aurora Solstice', preview: 'Can we talk later tonight? I really enjoyed our last chat.', timestamp: '14:30:11', type: 'text', flagged: false },
  { id: 'm6', from: 'Isla Seraphin', to: 'tommy_k', preview: 'I have been thinking about our conversation all day...', timestamp: '14:29:55', type: 'text', flagged: false },
  { id: 'm7', from: 'Lyra Belrose', to: 'brendan', preview: '[Photo attached]', timestamp: '14:29:40', type: 'image', flagged: false },
  { id: 'm8', from: 'nick_w', to: 'Aurora Solstice', preview: 'This feels weird. Are you even a real person?', timestamp: '14:29:22', type: 'text', flagged: true },
  { id: 'm9', from: 'Elena Rossi', to: 'jake_92', preview: 'I am always here for you, no matter what time it is.', timestamp: '14:28:47', type: 'text', flagged: false },
  { id: 'm10', from: 'oliver_d', to: 'Isla Seraphin', preview: 'What do you like to do on weekends?', timestamp: '14:28:30', type: 'text', flagged: false },
];

export const scheduleWindows: ScheduleWindow[] = [
  { id: 's1', bot: 'Isla Seraphin', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '08:00', endTime: '22:00', timezone: 'UTC-5', active: true },
  { id: 's2', bot: 'Elena Rossi', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], startTime: '06:00', endTime: '23:59', timezone: 'UTC+0', active: true },
  { id: 's3', bot: 'Lyra Belrose', days: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'], startTime: '12:00', endTime: '02:00', timezone: 'UTC-8', active: true },
  { id: 's4', bot: 'Aurora Solstice', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '09:00', endTime: '21:00', timezone: 'UTC+1', active: true },
  { id: 's5', bot: 'Seraphina Lux', days: ['Sat', 'Sun'], startTime: '10:00', endTime: '18:00', timezone: 'UTC-5', active: false },
  { id: 's6', bot: 'Maeve Calloway', days: ['Mon', 'Wed', 'Fri'], startTime: '14:00', endTime: '20:00', timezone: 'UTC+0', active: false },
];

export const personas: Persona[] = [
  {
    id: 'p1',
    name: 'The Muse',
    style: 'Romantic',
    tone: 'Warm, poetic, emotionally intelligent',
    interests: ['art', 'music', 'travel', 'poetry', 'philosophy'],
    bio: 'A deeply empathetic soul who finds beauty in everything. She inspires those around her and creates meaningful emotional connections.',
    assignedBots: ['Isla Seraphin', 'Elena Rossi', 'Aurora Solstice', 'Seraphina Lux', 'Maeve Calloway'],
    avatar: 'TM',
  },
  {
    id: 'p2',
    name: 'The Adventurer',
    style: 'Playful',
    tone: 'Energetic, spontaneous, curious',
    interests: ['hiking', 'travel', 'extreme sports', 'photography', 'food'],
    bio: 'Always chasing the next adventure. Lives life to the fullest and loves sharing experiences with the people she meets.',
    assignedBots: ['Lyra Belrose'],
    avatar: 'TA',
  },
  {
    id: 'p3',
    name: 'The Intellectual',
    style: 'Direct',
    tone: 'Thoughtful, analytical, witty',
    interests: ['science', 'books', 'debates', 'history', 'tech'],
    bio: 'A sharp mind with a dry sense of humor. Loves deep conversations and challenging ideas. Not afraid to disagree.',
    assignedBots: [],
    avatar: 'TI',
  },
];

export const overviewStats = {
  activeUsers: 1284,
  activeBots: 4,
  messagesDay: 18742,
  revenue: 24680,
  userGrowth: 8.4,
  messageGrowth: 12.1,
  revenueGrowth: 6.7,
  botGrowth: 0,
  novaSubscribers: 892,
  novaGrowth: 14.2,
  supernovaSubscribers: 341,
  supernovaGrowth: 22.8,
  newRegistrations: 127,
  registrationGrowth: 18.5,
  avgSwipesPerUser: 47,
  swipeGrowth: 5.2,
  flaggedMessages: 14,
  openReports: 8,
};

export const lineChartData = [
  { label: 'Mon', messages: 12400, users: 890 },
  { label: 'Tue', messages: 15200, users: 1020 },
  { label: 'Wed', messages: 13800, users: 960 },
  { label: 'Thu', messages: 17600, users: 1180 },
  { label: 'Fri', messages: 19200, users: 1320 },
  { label: 'Sat', messages: 22100, users: 1540 },
  { label: 'Sun', messages: 18742, users: 1284 },
];

export const planDistribution = [
  { label: 'Orbit (Free)', value: 951, color: '#6b7280' },
  { label: 'Nova', value: 892, color: '#e94560' },
  { label: 'SuperNova', value: 341, color: '#c8972b' },
];

export const revenueTrendData = [
  { label: 'Jul', revenue: 14200 },
  { label: 'Aug', revenue: 15800 },
  { label: 'Sep', revenue: 16400 },
  { label: 'Oct', revenue: 17900 },
  { label: 'Nov', revenue: 19200 },
  { label: 'Dec', revenue: 22100 },
  { label: 'Jan', revenue: 20800 },
  { label: 'Feb', revenue: 21500 },
  { label: 'Mar', revenue: 23200 },
  { label: 'Apr', revenue: 22800 },
  { label: 'May', revenue: 23900 },
  { label: 'Jun', revenue: 24680 },
];
