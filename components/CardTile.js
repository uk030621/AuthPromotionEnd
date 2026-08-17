'use client';

import { useMemo } from 'react';
import CountdownBadge from './CountdownBadge';
import { daysUntil, urgencyFor, formatDate, parseDateInput } from '@/lib/dueDate';

export default function CardTile({ card, onDelete }) {
  const { targetDate, days, urgency } = useMemo(() => {
    const target = parseDateInput(card.dueDate);
    const d = daysUntil(target);
    return { targetDate: target, days: d, urgency: urgencyFor(d) };
  }, [card.dueDate]);

  return (
    <li className="relative flex items-center gap-4 overflow-hidden rounded-lg border border-line bg-surface p-4 shadow-sm sm:gap-5 sm:p-5">
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-medium text-ink sm:text-xl">
          {card.name}
        </p>
        {card.last4 && (
          <p className="mt-0.5 font-mono text-xs tracking-wider text-ink/50">
            •••• {card.last4}
          </p>
        )}
        <div className="mt-3 border-t border-dashed border-line pt-3">
          <p className="text-xs uppercase tracking-wider text-ink/40">
            Promotional rate ends
          </p>
          <p className="mt-0.5 font-mono text-sm text-ink/80">
            {formatDate(targetDate)}
          </p>
        </div>
        <button
          onClick={() => onDelete(card._id)}
          className="mt-3 text-xs text-ink/40 underline decoration-dotted underline-offset-2 hover:text-due"
        >
          Remove card
        </button>
      </div>

      <CountdownBadge days={days} urgency={urgency} />
    </li>
  );
}
