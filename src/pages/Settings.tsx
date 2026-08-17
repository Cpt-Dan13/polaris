import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Palette, Pencil, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ACCENT = '#e94560';

const AVATAR_SEEDS = [
  'Nova', 'Orion', 'Lyra', 'Vega', 'Draco',
  'Atlas', 'Zephyr', 'Cosmo', 'Nebula', 'Pulsar',
  'Quasar', 'Solaris', 'Titan', 'Celeste', 'Andromeda',
];

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
}


export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { adminUser, updateAvatar } = useAuth();
  const [showPicker,   setShowPicker]   = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const initials = adminUser?.full_name
    ? adminUser.full_name.charAt(0).toUpperCase()
    : (adminUser?.email?.charAt(0).toUpperCase() ?? 'A');

  async function handlePickAvatar(seed: string) {
    setSavingAvatar(true);
    try {
      await updateAvatar(seed || null);
      setShowPicker(false);
    } finally {
      setSavingAvatar(false);
    }
  }
  return (
    <>
    <div className="space-y-5">

      {/* ── Profile card ── */}
      <div className="card p-5">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span style={{ color: ACCENT }}><User size={15} /></span>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>My Profile</h2>
        </div>

        <div className="flex items-center gap-5">
          {/* Avatar with pencil */}
          <div className="relative flex-shrink-0">
            <div
              className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-bold"
              style={{
                background: adminUser?.avatar_seed ? 'var(--bg)' : ACCENT,
                color: '#fff',
                border: adminUser?.avatar_seed ? '2px solid var(--border)' : 'none',
              }}
            >
              {adminUser?.avatar_seed
                ? <img src={avatarUrl(adminUser.avatar_seed)} alt="avatar" className="w-full h-full" />
                : initials
              }
            </div>
            <button
              onClick={() => setShowPicker(true)}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              style={{ background: ACCENT }}
              title="Change avatar"
            >
              <Pencil size={9} color="#fff" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold truncate" style={{ color: 'var(--text)' }}>
              {adminUser?.full_name ?? 'Admin'}
            </div>
            <div className="text-xs capitalize mt-0.5" style={{ color: ACCENT }}>
              {adminUser?.role?.replace(/_/g, ' ')}
            </div>
            <div className="text-xs mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>
              {adminUser?.email}
            </div>
          </div>

          {/* Edit avatar CTA */}
          <button
            onClick={() => setShowPicker(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-90"
            style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
          >
            <Pencil size={11} />
            Change Avatar
          </button>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <span style={{ color: ACCENT }}><Palette size={15} /></span>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Appearance</h2>
        </div>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>Theme</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Toggle between light and dark interface modes</div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? 'Dark' : 'Light'} Mode
            </span>
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-5 w-9 rounded-full transition-colors"
              style={{ background: theme === 'dark' ? ACCENT : 'var(--border)' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: theme === 'dark' ? 'translateX(16px)' : 'translateX(0)' }}
              />
            </button>
          </div>
        </div>
      </div>

    </div>

    {/* Avatar picker modal */}
    {showPicker && createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={() => !savingAvatar && setShowPicker(false)}
      >
        <div
          className="card rounded-2xl p-6"
          style={{ width: 360, boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>Choose your droid</h3>
          <p className="text-xs mb-5" style={{ color: 'var(--text-light)' }}>
            Pick a robot avatar for your Polaris profile.
          </p>

          <div className="grid grid-cols-5 gap-3 mb-5">
            {AVATAR_SEEDS.map(seed => {
              const selected = adminUser?.avatar_seed === seed;
              return (
                <button
                  key={seed}
                  disabled={savingAvatar}
                  onClick={() => handlePickAvatar(seed)}
                  title={seed}
                  className="rounded-xl p-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{
                    background: selected ? `${ACCENT}18` : 'var(--bg)',
                    border: `2px solid ${selected ? ACCENT : 'var(--border)'}`,
                  }}
                >
                  <img src={avatarUrl(seed)} alt={seed} className="w-full aspect-square" />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              disabled={savingAvatar || !adminUser?.avatar_seed}
              onClick={() => handlePickAvatar('')}
              className="text-xs font-medium transition-opacity disabled:opacity-30"
              style={{ color: 'var(--text-light)' }}
            >
              Remove avatar
            </button>
            <button
              disabled={savingAvatar}
              onClick={() => setShowPicker(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-90"
              style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              {savingAvatar ? 'Saving…' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )}
    </>
  );
}
