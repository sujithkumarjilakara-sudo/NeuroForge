import { masteryColor } from "@/data/cmos-vlsi";

export function MasteryRing({
  value,
  label,
  size = 92,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = masteryColor(value);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">{value}%</span>
        </div>
      </div>
      {label ? (
        <p className="max-w-[8rem] text-center text-xs text-zinc-400">{label}</p>
      ) : null}
    </div>
  );
}

export function WeeklyBarChart({
  data,
}: {
  data: { day: string; minutes: number }[];
}) {
  const max = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <div className="flex h-40 items-end gap-3">
      {data.map((point) => (
        <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-32 w-full items-end rounded-lg bg-white/5">
            <div
              className="w-full rounded-lg bg-gradient-to-t from-cyan-700 to-teal-300"
              style={{ height: `${(point.minutes / max) * 100}%` }}
              title={`${point.minutes} min`}
            />
          </div>
          <span className="text-[11px] text-zinc-500">{point.day}</span>
        </div>
      ))}
    </div>
  );
}

export function AccuracyLineChart({
  data,
}: {
  data: { day: string; accuracy: number }[];
}) {
  const width = 360;
  const height = 120;
  const pad = 12;
  const points = data.map((point, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(data.length - 1, 1);
    const y = height - pad - (point.accuracy / 100) * (height - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full">
      <polyline
        fill="none"
        stroke="#5eead4"
        strokeWidth="2.5"
        points={points.join(" ")}
      />
      {data.map((point, index) => {
        const x = pad + (index * (width - pad * 2)) / Math.max(data.length - 1, 1);
        const y = height - pad - (point.accuracy / 100) * (height - pad * 2);
        return <circle key={point.day} cx={x} cy={y} r="3.5" fill="#99f6e4" />;
      })}
    </svg>
  );
}
