import { useState } from 'react';
import { CreditCard as Edit2, Plus, X, Check } from 'lucide-react';
import { personas as initialPersonas } from '../data/sampleData';
import type { Persona } from '../types';
import Badge from '../components/Badge';

function EditModal({ persona, onClose, onSave }: { persona: Persona; onClose: () => void; onSave: (p: Persona) => void }) {
  const [form, setForm] = useState(persona);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !form.interests.includes(tagInput.trim())) {
      setForm(f => ({ ...f, interests: [...f.interests, tagInput.trim()] }));
      setTagInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="card w-full max-w-lg p-6 space-y-4" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base" style={{ color: 'var(--text)' }}>Edit Persona</h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Name</label>
            <input
              className="w-full mt-1 px-3 py-2 rounded-md text-sm outline-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Style</label>
              <input
                className="w-full mt-1 px-3 py-2 rounded-md text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                value={form.style}
                onChange={e => setForm(f => ({ ...f, style: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Tone</label>
              <input
                className="w-full mt-1 px-3 py-2 rounded-md text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                value={form.tone}
                onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Bio</label>
            <textarea
              className="w-full mt-1 px-3 py-2 rounded-md text-sm outline-none resize-none"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
              rows={3}
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Interests</label>
            <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
              {form.interests.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(233,69,96,0.1)', color: '#e94560' }}
                >
                  {tag}
                  <button onClick={() => setForm(f => ({ ...f, interests: f.interests.filter(t => t !== tag) }))}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-1.5 rounded-md text-sm outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                placeholder="Add interest..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
              />
              <button onClick={addTag} className="px-3 py-1.5 rounded-md text-sm" style={{ background: '#e94560', color: '#fff' }}>
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md text-sm font-medium"
            style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="flex-1 py-2 rounded-md text-sm font-medium text-white"
            style={{ background: '#e94560' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PersonaManager() {
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [editing, setEditing] = useState<Persona | null>(null);

  const handleSave = (updated: Persona) => {
    setPersonas(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          className="px-4 py-2 rounded-md text-sm font-medium text-white"
          style={{ background: '#e94560' }}
        >
          <Plus size={14} className="inline mr-1" />
          New Persona
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {personas.map(persona => (
          <div key={persona.id} className="card p-5 flex flex-col gap-3 group hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #e94560, #c8972b)' }}
                >
                  {persona.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{persona.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{persona.style} · {persona.tone.split(',')[0]}</div>
                </div>
              </div>
              <button
                onClick={() => setEditing(persona)}
                className="p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg)' }}
              >
                <Edit2 size={13} />
              </button>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {persona.bio}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {persona.interests.map(t => (
                <Badge key={t} label={t} variant="info" />
              ))}
            </div>

            <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Assigned Bots ({persona.assignedBots.length})
              </div>
              {persona.assignedBots.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {persona.assignedBots.map(b => (
                    <span
                      key={b}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    >
                      {b.split(' ')[0]}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs" style={{ color: 'var(--text-light)' }}>No bots assigned</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Check size={12} style={{ color: '#4caf50' }} />
              <span className="text-xs" style={{ color: 'var(--text-light)' }}>Active persona template</span>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditModal
          persona={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
