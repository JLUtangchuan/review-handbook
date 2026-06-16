/**
 * Progress indicators — circular and linear variants
 */

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const color =
    percentage >= 100
      ? "stroke-success"
      : percentage >= 50
        ? "stroke-primary"
        : percentage > 0
          ? "stroke-warning"
          : "stroke-border";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} transition-all duration-700 ease-out`}
        />
      </svg>
      {label && (
        <span className="text-xl font-bold tabular-nums">{label}</span>
      )}
      {sublabel && <span className="text-xs text-muted">{sublabel}</span>}
    </div>
  );
}

interface LinearProgressProps {
  percentage: number;
  showLabel?: boolean;
  height?: number;
}

export function LinearProgress({
  percentage,
  showLabel = true,
  height = 6,
}: LinearProgressProps) {
  const color =
    percentage >= 100
      ? "bg-success"
      : percentage >= 50
        ? "bg-primary"
        : percentage > 0
          ? "bg-warning"
          : "bg-border";

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 bg-border rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted w-10 text-right tabular-nums">
          {percentage}%
        </span>
      )}
    </div>
  );
}
