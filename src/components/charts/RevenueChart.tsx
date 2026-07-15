import { useState } from 'react';

interface DataPoint {
  label: string;
  revenue: number;
}

interface RevenueChartProps {
  data: DataPoint[];
  height?: number;
}

const COLOR = '#c8972b';

export default function RevenueChart({ data, height = 200 }: RevenueChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const width = 100;
  const pad = { top: 10, right: 4, bottom: 24, left: 0 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const values = data.map(d => d.revenue);
  const min = Math.min(...values) * 0.85;
  const max = Math.max(...values) * 1.05;

  const toX = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => pad.top + chartH - ((v - min) / (max - min)) * chartH;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.revenue), d }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${pad.top + chartH} L ${points[0].x} ${pad.top + chartH} Z`;

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR} stopOpacity="0.25" />
            <stop offset="100%" stopColor={COLOR} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line
            key={i}
            x1={pad.left} x2={pad.left + chartW}
            y1={pad.top + chartH * t} y2={pad.top + chartH * t}
            stroke="var(--border)" strokeWidth="0.5"
          />
        ))}

        <path d={areaD} fill="url(#grad-revenue)" />
        <path d={pathD} fill="none" stroke={COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {hovered !== null && (
          <line
            x1={points[hovered].x} x2={points[hovered].x}
            y1={pad.top} y2={pad.top + chartH}
            stroke={COLOR} strokeWidth="0.8" strokeDasharray="2,2"
          />
        )}

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y}
            r={hovered === i ? 2.5 : 1.5}
            fill={hovered === i ? COLOR : 'var(--card)'}
            stroke={COLOR} strokeWidth="1"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>

      <div
        className="absolute bottom-0 left-0 right-0 flex justify-between"
        style={{ paddingLeft: `${(pad.left / width) * 100}%`, paddingRight: `${(pad.right / width) * 100}%` }}
      >
        {data.map((d, i) => (
          <span key={i} style={{ color: 'var(--text-light)', fontSize: 10 }}>{d.label}</span>
        ))}
      </div>

      {hovered !== null && (
        <div
          className="chart-tooltip"
          style={{
            left: `${(points[hovered].x / width) * 100}%`,
            top: 0,
            transform: 'translateX(-50%)',
            zIndex: 10,
            color: 'var(--text)',
          }}
        >
          <div className="font-semibold" style={{ color: COLOR }}>{points[hovered].d.label}</div>
          <div style={{ color: 'var(--text-secondary)' }}>
            Revenue: <strong style={{ color: 'var(--text)' }}>${points[hovered].d.revenue.toLocaleString()}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
