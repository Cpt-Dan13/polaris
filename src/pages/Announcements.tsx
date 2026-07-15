import { useState } from 'react';
import { Megaphone, Send, Users, Globe } from 'lucide-react';

const pastAnnouncements = [
  { id: 1, title: 'Platform Maintenance Window', body: 'We will be performing scheduled maintenance on June 16th from 2:00–4:00 AM UTC. Expect brief service interruptions.', audience: 'All Users', date: '2024-06-10', sent: 1284 },
  { id: 2, title: 'New Premium Features Live', body: 'Gold and Premium subscribers now have access to unlimited voice messages and priority matching. Enjoy!', audience: 'Premium + Gold', date: '2024-06-05', sent: 728 },
  { id: 3, title: 'Community Guidelines Update', body: 'We have updated our community guidelines to better reflect our commitment to a safe environment. Please review.', audience: 'All Users', date: '2024-05-28', sent: 1102 },
];

export default function Announcements() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!title.trim() || !body.trim()) return;
    setSent(true);
    setTimeout(() => {
      setTitle('');
      setBody('');
      setSent(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone size={16} style={{ color: '#e94560' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Compose Announcement</h2>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title</label>
          <input
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none transition-all"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
            placeholder="Announcement title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Message</label>
          <textarea
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none resize-none transition-all"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
            placeholder="Write your announcement..."
            rows={5}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
          <div className="text-xs mt-1 text-right" style={{ color: 'var(--text-light)' }}>{body.length} / 500</div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>Target Audience</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Users', icon: <Globe size={13} /> },
              { value: 'premium', label: 'Premium', icon: <Users size={13} /> },
              { value: 'gold', label: 'Gold', icon: <Users size={13} /> },
              { value: 'basic', label: 'Basic', icon: <Users size={13} /> },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setAudience(opt.value)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all"
                style={{
                  background: audience === opt.value ? 'rgba(233,69,96,0.12)' : 'var(--bg)',
                  color: audience === opt.value ? '#e94560' : 'var(--text-secondary)',
                  border: `1px solid ${audience === opt.value ? '#e9456040' : 'var(--border)'}`,
                }}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSend}
            disabled={!title.trim() || !body.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{ background: sent ? '#4caf50' : '#e94560' }}
          >
            <Send size={14} />
            {sent ? 'Sent!' : 'Send Announcement'}
          </button>
          <button
            className="px-5 py-2.5 rounded-md text-sm font-medium transition-all"
            style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            Save Draft
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Past Announcements</h3>
        <div className="space-y-3">
          {pastAnnouncements.map(ann => (
            <div key={ann.id} className="card p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{ann.title}</div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(233,69,96,0.1)', color: '#e94560' }}>
                    {ann.audience}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>{ann.date}</span>
                </div>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{ann.body}</p>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-light)' }}>
                <Users size={11} />
                <span>Delivered to {ann.sent.toLocaleString()} users</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
