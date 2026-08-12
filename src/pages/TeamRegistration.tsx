import { useState } from 'react';
import { Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import { api } from '../lib/api';
import { ROLE_LABEL, type AdminRole } from '../lib/rbac';

const AVATAR_SEEDS = [
  'Nova', 'Orion', 'Lyra', 'Vega', 'Draco',
  'Atlas', 'Zephyr', 'Cosmo', 'Nebula', 'Pulsar',
  'Quasar', 'Solaris', 'Titan', 'Celeste', 'Andromeda',
];

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}

const ACCENT = '#e94560';
const GOLD   = '#c8972b';
const PURPLE = '#9c27b0';
const BLUE   = '#1565c0';
const SLATE  = '#78909c';

const ROLE_COLOR: Record<AdminRole, { color: string; bg: string }> = {
  super_admin: { color: ACCENT,  bg: 'rgba(233,69,96,0.12)'  },
  admin:       { color: GOLD,    bg: `${GOLD}20`             },
  moderator:   { color: PURPLE,  bg: `${PURPLE}18`           },
  support:     { color: BLUE,    bg: 'rgba(21,101,192,0.12)' },
  viewer:      { color: SLATE,   bg: 'rgba(120,144,156,0.12)'},
};

const ROLES: AdminRole[] = ['viewer', 'support', 'moderator', 'admin', 'super_admin'];

export default function TeamRegistration() {
  const [email,      setEmail]      = useState('');
  const [fullName,   setFullName]   = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [role,       setRole]       = useState<AdminRole>('viewer');
  const [avatarSeed, setAvatarSeed] = useState('Nova');
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [formError,  setFormError]  = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await api.team.create({
        email:       email.trim(),
        password,
        full_name:   fullName.trim(),
        role,
        avatar_seed: avatarSeed,
      });
      setEmail('');
      setFullName('');
      setPassword('');
      setRole('viewer');
      setAvatarSeed('Nova');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create member');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
    background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', outline: 'none',
  };

  return (
    <div className="p-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus size={17} style={{ color: ACCENT }} />
          <h2 className="text-sm font-bold m-0" style={{ color: 'var(--text-primary)' }}>
            Register Member
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Avatar picker */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Avatar
            </label>
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
              {AVATAR_SEEDS.map(seed => {
                const selected = avatarSeed === seed;
                return (
                  <button
                    key={seed}
                    type="button"
                    title={seed}
                    onClick={() => setAvatarSeed(seed)}
                    className="relative rounded-lg overflow-hidden transition-all hover:brightness-90 active:scale-95"
                    style={{
                      padding: 4,
                      background: selected ? `${ACCENT}15` : 'var(--bg)',
                      border: `2px solid ${selected ? ACCENT : 'var(--border)'}`,
                    }}>
                    <img src={avatarUrl(seed)} alt={seed} style={{ width: '100%', aspectRatio: '1', borderRadius: 6 }} />
                    {selected && (
                      <div className="absolute inset-0 flex items-end justify-end p-0.5">
                        <div className="rounded-full flex items-center justify-center"
                             style={{ width: 14, height: 14, background: ACCENT }}>
                          <Check size={9} color="#fff" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-light)' }}>
              Selected: <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{avatarSeed}</span>
            </p>
          </div>

          {/* Fields row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@constell8tion.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  style={{ ...inputStyle, paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--text-light)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              Role
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => {
                const active = role === r;
                const meta   = ROLE_COLOR[r];
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all hover:brightness-90"
                    style={{
                      background: active ? meta.color : 'var(--bg)',
                      color:      active ? '#fff'     : 'var(--text-secondary)',
                      border:     `1px solid ${active ? meta.color : 'var(--border)'}`,
                    }}>
                    {ROLE_LABEL[r]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback + submit */}
          <div className="flex flex-col gap-3">
            {formError && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ color: '#f44336', background: 'rgba(244,67,54,0.08)' }}>
                {formError}
              </p>
            )}
            {success && (
              <p className="text-xs px-3 py-2 rounded-lg flex items-center gap-1.5"
                 style={{ color: '#4caf50', background: 'rgba(76,175,80,0.08)' }}>
                <Check size={12} /> Member registered successfully.
              </p>
            )}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-90 active:scale-[0.98] disabled:opacity-50"
                style={{ background: ACCENT }}>
                {submitting ? 'Registering…' : 'Register Member'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
