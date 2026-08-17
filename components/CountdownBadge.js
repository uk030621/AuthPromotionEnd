const URGENCY_STYLES = {
  safe: {
    ring: 'border-safe/40',
    text: 'text-safe',
    label: 'On track',
  },
  soon: {
    ring: 'border-soon/50',
    text: 'text-soon',
    label: 'Coming up',
  },
  due: {
    ring: 'border-due/50',
    text: 'text-due',
    label: 'Ending soon',
  },
  expired: {
    ring: 'border-ink/30',
    text: 'text-ink/50',
    label: 'Ended',
  },
};

export default function CountdownBadge({ days, urgency }) {
  const style = URGENCY_STYLES[urgency];

  const number = urgency === 'expired' ? Math.abs(days) : days;
  const unitLabel = number === 1 ? 'day' : 'days';
  const srLabel =
    urgency === 'expired'
      ? `Ended ${number} ${unitLabel} ago`
      : days === 0
      ? 'Ends today'
      : `${days} ${unitLabel} left`;

  return (
    <div className="flex flex-col items-center justify-center shrink-0">
      <div
        className={`relative flex h-24 w-24 rotate-[-3deg] items-center justify-center rounded-full border-2 border-dashed ${style.ring} sm:h-28 sm:w-28`}
      >
        <div className="flex flex-col items-center">
          <span className={`font-mono text-3xl font-semibold leading-none sm:text-4xl ${style.text}`}>
            {number}
          </span>
          <span className="mt-1 font-mono text-[0.6rem] uppercase tracking-wider text-ink/50">
            {urgency === 'expired' ? `${unitLabel} ago` : unitLabel}
          </span>
        </div>
      </div>
      <span className={`mt-2 font-mono text-[0.65rem] uppercase tracking-wider ${style.text}`}>
        {style.label}
      </span>
      <span className="sr-only">{srLabel}</span>
    </div>
  );
}
