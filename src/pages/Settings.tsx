import { useState } from 'react';
import { Save, Shield, Bell, Palette, Database, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const [saved, setSaved] = useState(false);
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
    <div className="space-y-5 max-w-2xl">
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
  );
}
