import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Save, Shield, Bell, Palette, Database, Globe, Pencil, User } from 'lucide-react';
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

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <span style={{ color: '#e94560' }}>{icon}</span>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</div>
        {description && <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{description}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex h-5 w-9 rounded-full transition-colors"
      style={{ background: checked ? '#e94560' : 'var(--border)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  );
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { adminUser, updateAvatar } = useAuth();
  const [saved,        setSaved]        = useState(false);
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
  const [settings, setSettings] = useState({
    emailNotifs: true,
    flagAlerts: true,
    dailyReport: false,
    maintenanceAlerts: true,
    twoFactor: false,
    sessionTimeout: '30',
    defaultTimezone: 'UTC',
    language: 'en',
    autoAssign: true,
    dataRetention: '90',
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(s => ({ ...s, [key]: !s[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
    <div className="space-y-5 max-w-2xl">

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

      <Section title="Appearance" icon={<Palette size={15} />}>
        <Field label="Theme" description="Toggle between light and dark interface modes">
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? 'Dark' : 'Light'} Mode
            </span>
            <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
          </div>
        </Field>
      </Section>

      <Section title="Notifications" icon={<Bell size={15} />}>
        <Field label="Email Notifications" description="Receive system alerts via email">
          <Toggle checked={settings.emailNotifs} onChange={() => toggle('emailNotifs')} />
        </Field>
        <Field label="Flag Alerts" description="Immediate alerts when content is flagged">
          <Toggle checked={settings.flagAlerts} onChange={() => toggle('flagAlerts')} />
        </Field>
        <Field label="Daily Summary Report" description="Receive a daily activity digest">
          <Toggle checked={settings.dailyReport} onChange={() => toggle('dailyReport')} />
        </Field>
        <Field label="Maintenance Alerts" description="Notifications for scheduled maintenance">
          <Toggle checked={settings.maintenanceAlerts} onChange={() => toggle('maintenanceAlerts')} />
        </Field>
      </Section>

      <Section title="Security" icon={<Shield size={15} />}>
        <Field label="Two-Factor Authentication" description="Require 2FA for all admin logins">
          <Toggle checked={settings.twoFactor} onChange={() => toggle('twoFactor')} />
        </Field>
        <Field label="Session Timeout" description="Auto-logout inactive sessions after N minutes">
          <select
            value={settings.sessionTimeout}
            onChange={e => setSettings(s => ({ ...s, sessionTimeout: e.target.value }))}
            className="text-xs px-3 py-1.5 rounded-md outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            {['15', '30', '60', '120'].map(v => (
              <option key={v} value={v}>{v} minutes</option>
            ))}
          </select>
        </Field>
        <Field label="API Key" description="Your admin API access key">
          <div className="flex items-center gap-2">
            <code className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              •••••••••••••••••
            </code>
            <button className="text-xs px-2 py-1 rounded" style={{ color: '#e94560', border: '1px solid rgba(233,69,96,0.3)' }}>
              Rotate
            </button>
          </div>
        </Field>
      </Section>

      <Section title="Regional" icon={<Globe size={15} />}>
        <Field label="Default Timezone" description="Timezone used for all timestamps and schedules">
          <select
            value={settings.defaultTimezone}
            onChange={e => setSettings(s => ({ ...s, defaultTimezone: e.target.value }))}
            className="text-xs px-3 py-1.5 rounded-md outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            {['UTC', 'UTC-5', 'UTC-8', 'UTC+0', 'UTC+1'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Language" description="Dashboard display language">
          <select
            value={settings.language}
            onChange={e => setSettings(s => ({ ...s, language: e.target.value }))}
            className="text-xs px-3 py-1.5 rounded-md outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </Field>
      </Section>

      <Section title="Data Management" icon={<Database size={15} />}>
        <Field label="Auto-Assign Tickets" description="Automatically assign new tickets to available bots">
          <Toggle checked={settings.autoAssign} onChange={() => toggle('autoAssign')} />
        </Field>
        <Field label="Data Retention Period" description="How long to keep message and activity logs">
          <select
            value={settings.dataRetention}
            onChange={e => setSettings(s => ({ ...s, dataRetention: e.target.value }))}
            className="text-xs px-3 py-1.5 rounded-md outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            {['30', '60', '90', '180', '365'].map(v => (
              <option key={v} value={v}>{v} days</option>
            ))}
          </select>
        </Field>
      </Section>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium text-white transition-all"
          style={{ background: saved ? '#4caf50' : '#e94560' }}
        >
          <Save size={14} />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
        <button
          className="px-5 py-2.5 rounded-md text-sm font-medium transition-all"
          style={{ background: 'var(--card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          Reset Defaults
        </button>
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
