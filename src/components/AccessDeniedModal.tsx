import { ShieldOff } from 'lucide-react';
import { createPortal } from 'react-dom';
import { type AdminRole, ROLE_LABEL } from '../lib/rbac';

interface Props {
  requiredRole: AdminRole;
  userRole:     string | null | undefined;
  onClose:      () => void;
}

export default function AccessDeniedModal({ requiredRole, userRole, onClose }: Props) {
  const required = ROLE_LABEL[requiredRole];
  const current  = userRole ? (ROLE_LABEL[userRole as AdminRole] ?? userRole) : 'Unknown';

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}>
      <div
        className="card p-8 flex flex-col items-center gap-3 rounded-2xl"
        style={{ maxWidth: 360, width: '90%', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}>

        <div className="rounded-full flex items-center justify-center"
             style={{ width: 52, height: 52, background: 'rgba(233,69,96,0.12)' }}>
          <ShieldOff size={26} style={{ color: '#e94560' }} />
        </div>

        <h2 className="text-base font-bold text-center" style={{ color: 'var(--text-primary)' }}>
          Access Restricted
        </h2>

        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You don't have the right access for this action.
        </p>

        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left py-2 pr-4 font-medium" style={{ color: 'var(--text-light)' }}></th>
              <th className="text-right py-2 font-medium"      style={{ color: 'var(--text-light)' }}>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <td className="py-2.5 pr-4" style={{ color: 'var(--text-secondary)' }}>Your role</td>
              <td className="py-2.5 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>{current}</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4" style={{ color: 'var(--text-secondary)' }}>Required</td>
              <td className="py-2.5 text-right font-semibold" style={{ color: '#e94560' }}>{required}+</td>
            </tr>
          </tbody>
        </table>

        <button
          onClick={onClose}
          className="mt-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:brightness-90 active:scale-[0.97]"
          style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
          Got it
        </button>
      </div>
    </div>,
    document.body,
  );
}
