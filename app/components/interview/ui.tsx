import type { InterviewBand, InterviewScores } from "@/lib/interview/types";

export function ReadinessRing({
  value,
  label,
  size = 132,
}: {
  value: number | null;
  label: string;
  size?: number;
}) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = value === null ? 0 : Math.max(0, Math.min(100, value));
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={10}
          stroke="var(--exp-container-highest)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={10}
          strokeLinecap="round"
          stroke="var(--exp-primary)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold leading-none text-exp-on-surface">
          {value === null ? "—" : value}
        </span>
        <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wide text-exp-outline">
          {label}
        </span>
      </div>
    </div>
  );
}

export function BandPill({
  band,
  label,
}: {
  band: InterviewBand | string | null;
  label: string;
}) {
  const tone =
    band === "excellent" || band === "strong"
      ? "bg-exp-primary-container text-exp-on-primary-container"
      : band === "interview_ready"
        ? "bg-exp-secondary-container text-exp-on-secondary-container"
        : band === "foundation"
          ? "bg-exp-container-high text-exp-on-surface"
          : "bg-exp-container text-exp-on-surface-variant";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${tone}`}>
      {label}
    </span>
  );
}

const DIMENSION_ORDER = [
  "content",
  "structure",
  "evidence",
  "language",
  "delivery",
] as const;

export function ScoreBars({
  scores,
  labels,
}: {
  scores: InterviewScores;
  labels: Record<(typeof DIMENSION_ORDER)[number], string>;
}) {
  return (
    <dl className="flex flex-col gap-2">
      {DIMENSION_ORDER.map((dimension) => {
        const score = scores[dimension];
        return (
          <div key={dimension} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
            <dt className="truncate text-[11px] font-bold text-exp-on-surface-variant">
              {labels[dimension]}
            </dt>
            <dd className="text-[11px] font-extrabold tabular-nums text-exp-on-surface">
              {score}/5
            </dd>
            <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-exp-container-highest">
              <div
                className="h-full rounded-full bg-exp-primary"
                style={{ width: `${(score / 5) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </dl>
  );
}
