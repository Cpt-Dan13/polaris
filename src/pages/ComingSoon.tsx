export default function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      gap: 12,
    }}>
      <div style={{ fontSize: 40 }}>🚧</div>
      <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2>
      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>This module is coming soon.</p>
    </div>
  );
}
