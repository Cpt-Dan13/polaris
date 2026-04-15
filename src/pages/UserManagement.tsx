import { useState } from 'react';
import { Search, Filter, UserX, UserCheck, Mail } from 'lucide-react';
import { users } from '../data/sampleData';
import Badge from '../components/Badge';

const statusBadge: Record<string, 'success' | 'error' | 'warning'> = {
  active: 'success',
  suspended: 'error',
  pending: 'warning',
};

const planBadge: Record<string, 'neutral' | 'info' | 'gold'> = {
  Basic: 'neutral',
  Premium: 'info',
  Gold: 'gold',
};

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const filtered = users.filter(u => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (planFilter !== 'all' && u.plan !== planFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md text-sm outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter size={13} style={{ color: 'var(--text-secondary)' }} />
          {['all', 'active', 'suspended', 'pending'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all"
              style={{
                background: statusFilter === s ? 'rgba(233,69,96,0.1)' : 'transparent',
                color: statusFilter === s ? '#e94560' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {['all', 'Basic', 'Premium', 'Gold'].map(p => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background: planFilter === p ? 'rgba(200,151,43,0.12)' : 'transparent',
                color: planFilter === p ? '#c8972b' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            Showing {filtered.length} of {users.length} users
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">User</th>
                <th className="text-left">Plan</th>
                <th className="text-left">Status</th>
                <th className="text-left">Country</th>
                <th className="text-right">Messages</th>
                <th className="text-left">Joined</th>
                <th className="text-left">Last Seen</th>
                <th className="text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #1a1a2e, #e94560)' }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{user.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-light)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge label={user.plan} variant={planBadge[user.plan]} /></td>
                  <td><Badge label={user.status} variant={statusBadge[user.status]} dot /></td>
                  <td><span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{user.country}</span></td>
                  <td className="text-right">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{user.messages.toLocaleString()}</span>
                  </td>
                  <td><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.joined}</span></td>
                  <td><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.lastSeen}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded transition-colors" style={{ color: 'var(--text-secondary)' }} title="Email">
                        <Mail size={13} />
                      </button>
                      {user.status === 'active' ? (
                        <button className="p-1.5 rounded transition-colors" style={{ color: '#f44336' }} title="Suspend">
                          <UserX size={13} />
                        </button>
                      ) : (
                        <button className="p-1.5 rounded transition-colors" style={{ color: '#4caf50' }} title="Activate">
                          <UserCheck size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8" style={{ color: 'var(--text-light)' }}>
                    No users match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
