interface BreakdownItem {
  category: string;
  required: string[];
  candidate_has: string[];
  score: number;
}

interface TechnicalRadarProps {
  items: BreakdownItem[];
  size?: number;
}

// A polished SVG radar chart for the technical breakdown. Pure SVG, no deps.
export function TechnicalRadar({ items, size = 320 }: TechnicalRadarProps) {
  const filtered = items.slice(0, 8);
  const n = filtered.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, value: number) => {
    const a = angleFor(i);
    const r = (value / 100) * radius;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  };

  const ringValues = [25, 50, 75, 100];

  const polygonPoints = filtered
    .map((it, i) => {
      const [x, y] = point(i, it.score);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      style={{ maxWidth: size }}
    >
      {/* Grid rings */}
      {ringValues.map((v) => {
        const pts = filtered
          .map((_, i) => {
            const [x, y] = point(i, v);
            return `${x.toFixed(2)},${y.toFixed(2)}`;
          })
          .join(" ");
        return (
          <polygon
            key={v}
            points={pts}
            fill="none"
            stroke="var(--arc-border-default)"
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines */}
      {filtered.map((_, i) => {
        const [x, y] = point(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--arc-border-subtle)"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="rgba(220, 38, 38, 0.18)"
        stroke="#DC2626"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Vertex dots */}
      {filtered.map((it, i) => {
        const [x, y] = point(i, it.score);
        return (
          <circle key={`dot-${i}`} cx={x} cy={y} r={3.5} fill="#DC2626" />
        );
      })}

      {/* Axis labels */}
      {filtered.map((it, i) => {
        const a = angleFor(i);
        const lx = cx + Math.cos(a) * (radius + 20);
        const ly = cy + Math.sin(a) * (radius + 20);
        const anchor =
          Math.abs(Math.cos(a)) < 0.2
            ? "middle"
            : Math.cos(a) > 0
            ? "start"
            : "end";
        return (
          <text
            key={`label-${i}`}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill="var(--arc-text-secondary)"
            fontSize={11}
          >
            {it.category}
          </text>
        );
      })}
    </svg>
  );
}
