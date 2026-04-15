import { useState } from 'react';

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: Segment[];
  size?: number;
  title?: string;
}

export default function DonutChart({ data, size = 140, title }: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const ir = size * 0.24;

  let cumulative = 0;
  const segments = data.map((d, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const expanded = hovered === i;
    const outerR = expanded ? r + 4 : r;

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const ix1 = cx + ir * Math.cos(startAngle);
    const iy1 = cy + ir * Math.sin(startAngle);
    const ix2 = cx + ir * Math.cos(endAngle);
    const iy2 = cy + ir * Math.sin(endAngle);

    const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;

    const pathD = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${ir} ${ir} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    return { ...d, pathD, i, pct: Math.round((d.value / total) * 100) };
  });

  const hov = hovered !== null ? segments[hovered] : null;

  return (
    <div className="flex flex-col items-center gap-4">
      {title && <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</div>}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {segments.map(seg => (
            <path
              key={seg.i}
              d={seg.pathD}
              fill={seg.color}
              stroke="var(--card)"
              strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'd 0.2s' }}
              onMouseEnter={() => setHovered(seg.i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          {hov ? (
            <>
              <div className="text-xl font-bold" style={{ color: hov.color }}>{hov.pct}%</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{hov.label}</div>
            </>
          ) : (
            <>
              <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>{total}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>total</div>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        {segments.map(seg => (
          <div key={seg.i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: seg.color }} />
              <span style={{ color: 'var(--text-secondary)' }}>{seg.label}</span>
            </div>
            <span className="font-semibold" style={{ color: 'var(--text)' }}>{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
