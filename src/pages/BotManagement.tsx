import { useState, useRef } from 'react';
import { MessageSquare, Server, TrendingUp, MoreHorizontal } from 'lucide-react';
import type { Bot } from '../types';
import { bots as initialBots } from '../data/sampleData';
import Badge from '../components/Badge';

function BotCard({
  bot,
  onDragStart,
  onDragEnd,
}: {
  bot: Bot;
  onDragStart: (e: React.DragEvent, bot: Bot) => void;
  onDragEnd: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, bot)}
      onDragEnd={onDragEnd}
      className="card p-4 cursor-grab active:cursor-grabbing select-none hover:shadow-md transition-all duration-200 group"
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
            onClick={() => setMenuOpen(m => !m)}
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
                  onClick={() => setMenuOpen(false)}
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

function Column({
  title,
  bots,
  status,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onDragLeave,
  isDragOver,
}: {
  title: string;
  bots: Bot[];
  status: 'active' | 'inactive';
  onDragStart: (e: React.DragEvent, bot: Bot) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, target: 'active' | 'inactive') => void;
  onDragOver: (e: React.DragEvent, target: 'active' | 'inactive') => void;
  onDragLeave: () => void;
  isDragOver: boolean;
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
        <span
          className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(150,150,150,0.1)', color: 'var(--text-secondary)' }}
        >
          {bots.length}
        </span>
      </div>
      <div className="flex-1">
        {bots.map(bot => (
          <BotCard key={bot.id} bot={bot} onDragStart={onDragStart} onDragEnd={onDragEnd} />
        ))}
        {bots.length === 0 && (
          <div
            className="flex items-center justify-center h-24 rounded-md text-xs"
            style={{ color: 'var(--text-light)', border: '1px dashed var(--border)' }}
          >
            Drop bots here
          </div>
        )}
      </div>
    </div>
  );
}

export default function BotManagement() {
  const [bots, setBots] = useState<Bot[]>(initialBots);
  const [dragOver, setDragOver] = useState<'active' | 'inactive' | null>(null);
  const dragBot = useRef<Bot | null>(null);

  const active = bots.filter(b => b.status === 'active');
  const inactive = bots.filter(b => b.status === 'inactive');

  const handleDragStart = (e: React.DragEvent, bot: Bot) => {
    dragBot.current = bot;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    dragBot.current = null;
    setDragOver(null);
  };

  const handleDragOver = (e: React.DragEvent, target: 'active' | 'inactive') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(target);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, target: 'active' | 'inactive') => {
    e.preventDefault();
    setDragOver(null);
    if (!dragBot.current) return;
    const id = dragBot.current.id;
    setBots(prev => prev.map(b => b.id === id ? { ...b, status: target, uptime: target === 'active' ? '0.0%' : '—' } : b));
    dragBot.current = null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Drag and drop bots between columns to activate or deactivate them.
        </p>
        <button
          className="px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: '#e94560' }}
        >
          + Add Bot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Column
          title="Active Bots"
          bots={active}
          status="active"
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          isDragOver={dragOver === 'active'}
        />
        <Column
          title="Inactive Bots"
          bots={inactive}
          status="inactive"
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          isDragOver={dragOver === 'inactive'}
        />
      </div>
    </div>
  );
}
