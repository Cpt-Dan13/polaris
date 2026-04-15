interface BadgeProps {
  label: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'gold';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variants = {
  success: { bg: 'rgba(76,175,80,0.12)', color: '#4caf50' },
  error: { bg: 'rgba(244,67,54,0.12)', color: '#f44336' },
  warning: { bg: 'rgba(255,152,0,0.12)', color: '#ff9800' },
  info: { bg: 'rgba(233,69,96,0.12)', color: '#e94560' },
  neutral: { bg: 'rgba(150,150,150,0.12)', color: 'var(--text-secondary)' },
  gold: { bg: 'rgba(200,151,43,0.15)', color: '#c8972b' },
};

export default function Badge({ label, variant = 'neutral', size = 'sm', dot = false }: BadgeProps) {
  const style = variants[variant];
  return (
    <span
      className="inline-flex items-center gap-1.5 font-medium rounded-full"
      style={{
        background: style.bg,
        color: style.color,
        fontSize: size === 'sm' ? 11 : 12,
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
      }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.color }} />}
      {label}
    </span>
  );
}
