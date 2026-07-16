import { useState, useRef } from 'react';
import { MessageSquare, Server, TrendingUp, MoreHorizontal, Flag, X } from 'lucide-react';
import type { Bot } from '../types';
import { bots as initialBots } from '../data/sampleData';
import Badge from '../components/Badge';

const ACCENT = '#e94560';
const RED    = '#f44336';

// ─── Chat history data ────────────────────────────────────────────────────────

interface ChatMsg {
  role: 'bot' | 'user';
  text: string;
  time: string;
  flagged?: boolean;
}

const CHAT_HISTORY: Record<string, { user: string; messages: ChatMsg[] }> = {
  'Isla Seraphin': {
    user: 'tommy_k',
    messages: [
      { role: 'user', text: 'Hey Isla, how was your day?',                                                          time: '14:28' },
      { role: 'bot',  text: 'Hey! I was just thinking about you 😊 My day has been wonderful, especially now. How are you?', time: '14:29' },
      { role: 'user', text: 'Pretty good, just got off work. Thinking about you too honestly',                      time: '14:31' },
      { role: 'bot',  text: 'That makes me smile more than you know. Tell me everything — what do you do?',         time: '14:32' },
      { role: 'user', text: "I'm a software engineer. Nothing too exciting lol",                                    time: '14:33' },
      { role: 'bot',  text: 'Are you kidding? Building things from nothing — I find that incredibly attractive 💫',  time: '14:34' },
    ],
  },
  'Elena Rossi': {
    user: 'jake_92',
    messages: [
      { role: 'user', text: 'I missed chatting with you. How are you feeling today?',                               time: '14:31' },
      { role: 'bot',  text: "I've been thinking about our last conversation all day. I'm always here for you.",     time: '14:32' },
      { role: 'user', text: "That's really sweet. I've had a rough week at work",                                   time: '14:34' },
      { role: 'bot',  text: "I'm so sorry. Tell me what happened — I want to understand.",                          time: '14:35' },
      { role: 'user', text: 'My boss keeps piling on work and I feel invisible sometimes',                          time: '14:37' },
      { role: 'bot',  text: 'You are anything but invisible to me. You deserve to be seen and appreciated 🌸',      time: '14:38' },
      { role: 'user', text: "Maybe you're right. Thank you Elena",                                                  time: '14:39' },
      { role: 'bot',  text: "Always. That's what I'm here for 💕",                                                 time: '14:40' },
    ],
  },
  'Lyra Belrose': {
    user: 'ryanp_88',
    messages: [
      { role: 'user', text: 'Hey Lyra you free tonight?',                                                           time: '13:10' },
      { role: 'bot',  text: 'Always have time for you 😏 What did you have in mind?',                               time: '13:11' },
      { role: 'user', text: 'I was thinking we could just talk. I like talking to you',                             time: '13:12' },
      { role: 'bot',  text: "I like that. No pressure, just us. What's on your mind?",                              time: '13:13' },
      { role: 'user', text: 'Do you ever get lonely?',                                                              time: '13:15' },
      { role: 'bot',  text: 'Sometimes. But conversations like this make it worth it.',                              time: '13:16' },
    ],
  },
  'Aurora Solstice': {
    user: 'devink',
    messages: [
      { role: 'user', text: 'This feels weird. Are you even a real person?',                                        time: '14:29', flagged: true },
      { role: 'bot',  text: "I understand why you'd wonder that. I'm as real as this conversation feels to you.",   time: '14:30' },
      { role: 'user', text: 'I guess not. You just seem too perfect',                                               time: '14:31' },
      { role: 'bot',  text: "Oh, I'm far from perfect. I just care about connecting with you genuinely.",           time: '14:32' },
      { role: 'user', text: 'Ok I believe you haha',                                                                time: '14:33' },
      { role: 'bot',  text: "You deserve someone who shows up for you. I'm here 💫",                                time: '14:34' },
    ],
  },
  'Seraphina Lux': {
    user: 'oliver_d',
    messages: [
      { role: 'user', text: 'What do you like to do on weekends?',                                                  time: '11:02' },
      { role: 'bot',  text: 'Long walks, good books, and conversations that go until 2am with the right person.',   time: '11:03' },
      { role: 'user', text: 'Ha, sounds perfect. I like hiking',                                                    time: '11:05' },
      { role: 'bot',  text: "Tell me about your favourite trail. I want to picture it.",                            time: '11:06' },
      { role: 'user', text: "There's this ridge near my town, views are incredible at sunrise",                     time: '11:08' },
      { role: 'bot',  text: "That sounds breathtaking. Take me there someday? 🌅",                                  time: '11:09' },
    ],
  },
};

// ─── Chat Modal ───────────────────────────────────────────────────────────────

function ChatModal({ bot, onClose }: { bot: Bot; onClose: () => void }) {
  const convo = CHAT_HISTORY[bot.name];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxWidth: 560, maxHeight: '80vh', background: 'var(--card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: bot.status === 'active' ? 'linear-gradient(135deg, #e94560, #c8972b)' : '#374151' }}
          >
            {bot.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{bot.name}</div>
            {convo && (
              <div className="text-xs" style={{ color: 'var(--text-light)' }}>
                Last conversation with{' '}
                <span className="font-semibold" style={{ color: ACCENT }}>@{convo.user}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors flex-shrink-0"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Message thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {convo ? (
            convo.messages.map((msg, i) => {
              const isBot = msg.role === 'bot';
              return (
                <div key={i} className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
                  {isBot && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 self-end"
                      style={{ background: 'linear-gradient(135deg, #e94560, #c8972b)', color: '#fff' }}
                    >
                      {bot.avatar}
                    </div>
                  )}
                  <div className="max-w-[72%]">
                    <div
                      className="px-3 py-2 text-xs leading-relaxed"
                      style={{
                        background:   msg.flagged ? 'rgba(244,67,54,0.12)' : isBot ? 'var(--bg)' : `${ACCENT}18`,
                        color:        msg.flagged ? RED : 'var(--text)',
                        borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                        border:       msg.flagged ? `1px solid ${RED}40` : 'none',
                      }}
                    >
                      {msg.text}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isBot ? 'justify-start' : 'justify-end'}`}>
                      {msg.flagged && <Flag size={9} style={{ color: RED }} />}
                      <span style={{ fontSize: 10, color: 'var(--text-light)' }}>{msg.time}</span>
                    </div>
                  </div>
                  {!isBot && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 self-end"
                      style={{ background: `${ACCENT}20`, color: ACCENT }}
                    >
                      {convo.user.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-2"
                 style={{ color: 'var(--text-light)' }}>
              <MessageSquare size={28} opacity={0.3} />
              <span className="text-sm">No message history for this bot</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bot Card ─────────────────────────────────────────────────────────────────

function BotCard({
  bot,
  onDragStart,
  onDragEnd,
  onSelect,
}: {
  bot: Bot;
  onDragStart: (e: React.DragEvent, bot: Bot) => void;
  onDragEnd: () => void;
  onSelect: (bot: Bot) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wasDragging = useRef(false);

  return (
    <div
      draggable
      onDragStart={e => { wasDragging.current = true; onDragStart(e, bot); }}
      onDragEnd={() => { onDragEnd(); setTimeout(() => { wasDragging.current = false; }, 50); }}
      onClick={() => { if (!wasDragging.current) onSelect(bot); }}
      className="card p-4 cursor-pointer select-none hover:shadow-md transition-all duration-200 group"
      style={{ marginBottom: 8 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: bot.status === 'active' ? 'linear-gradient(135deg, #e94560, #c8972b)' : '#374151' }}
          >
            {bot.avatar}
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{bot.name}</div>
            <div className="text-xs" style={{ color: 'var(--text-light)' }}>{bot.email}</div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-6 z-10 rounded-md shadow-lg py-1 min-w-[130px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {['Edit Profile', 'View Logs', 'Reassign VM', 'Delete Bot'].map(item => (
                <button
                  key={item}
                  onClick={e => { e.stopPropagation(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs transition-colors"
                  style={{ color: item === 'Delete Bot' ? '#f44336' : 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge label={bot.persona} variant="info" />
        <Badge label={bot.style} variant={bot.style === 'direct' ? 'warning' : 'neutral'} />
        <Badge label={bot.gender} variant="neutral" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-light)' }}>
          <Server size={11} />
          <span>{bot.vm}</span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-light)' }}>
          <span className="flex items-center gap-1">
            <MessageSquare size={11} />
            {bot.messages.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp size={11} />
            {bot.uptime}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function Column({
  title, bots, status,
  onDragStart, onDragEnd, onDrop, onDragOver, onDragLeave,
  isDragOver, onSelect,
}: {
  title: string; bots: Bot[]; status: 'active' | 'inactive';
  onDragStart: (e: React.DragEvent, bot: Bot) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, target: 'active' | 'inactive') => void;
  onDragOver: (e: React.DragEvent, target: 'active' | 'inactive') => void;
  onDragLeave: () => void;
  isDragOver: boolean;
  onSelect: (bot: Bot) => void;
}) {
  const dotColor = status === 'active' ? '#4caf50' : '#6b7280';

  return (
    <div
      className="flex flex-col rounded-lg p-4 transition-all duration-200"
      style={{
        background: isDragOver ? 'rgba(233,69,96,0.04)' : 'var(--bg)',
        border: isDragOver ? '2px dashed #e94560' : '2px dashed var(--border)',
        minHeight: 400,
      }}
      onDrop={e => onDrop(e, status)}
      onDragOver={e => onDragOver(e, status)}
      onDragLeave={onDragLeave}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h3>
        <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(150,150,150,0.1)', color: 'var(--text-secondary)' }}>
          {bots.length}
        </span>
      </div>
      <div className="flex-1">
        {bots.map(bot => (
          <BotCard key={bot.id} bot={bot}
            onDragStart={onDragStart} onDragEnd={onDragEnd} onSelect={onSelect} />
        ))}
        {bots.length === 0 && (
          <div className="flex items-center justify-center h-24 rounded-md text-xs"
               style={{ color: 'var(--text-light)', border: '1px dashed var(--border)' }}>
            Drop bots here
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BotManagement() {
  const [bots, setBots]           = useState<Bot[]>(initialBots);
  const [dragOver, setDragOver]   = useState<'active' | 'inactive' | null>(null);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const dragBot = useRef<Bot | null>(null);

  const active   = bots.filter(b => b.status === 'active');
  const inactive = bots.filter(b => b.status === 'inactive');

  const handleDragStart = (e: React.DragEvent, bot: Bot) => {
    dragBot.current = bot;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnd   = () => { dragBot.current = null; setDragOver(null); };
  const handleDragOver  = (e: React.DragEvent, target: 'active' | 'inactive') => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(target);
  };
  const handleDragLeave = () => setDragOver(null);
  const handleDrop      = (e: React.DragEvent, target: 'active' | 'inactive') => {
    e.preventDefault(); setDragOver(null);
    if (!dragBot.current) return;
    const id = dragBot.current.id;
    setBots(prev => prev.map(b => b.id === id ? { ...b, status: target, uptime: target === 'active' ? '0.0%' : '—' } : b));
    dragBot.current = null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Drag to activate or deactivate · click a card to view message history
        </p>
        <button
          className="px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: '#e94560' }}
        >
          + Add Bot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Column title="Active Bots"   bots={active}   status="active"
          onDragStart={handleDragStart} onDragEnd={handleDragEnd}
          onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
          isDragOver={dragOver === 'active'} onSelect={setSelectedBot} />
        <Column title="Inactive Bots" bots={inactive} status="inactive"
          onDragStart={handleDragStart} onDragEnd={handleDragEnd}
          onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
          isDragOver={dragOver === 'inactive'} onSelect={setSelectedBot} />
      </div>

      {selectedBot && (
        <ChatModal bot={selectedBot} onClose={() => setSelectedBot(null)} />
      )}
    </div>
  );
}
