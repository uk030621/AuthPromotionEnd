"use client";

import { useMemo, useState } from "react";
import CountdownBadge from "./CountdownBadge";
import {
  daysUntil,
  urgencyFor,
  formatDate,
  formatCurrency,
  parseDateInput,
} from "@/lib/dueDate";

export default function CardTile({ card, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(card.name);
  const [last4, setLast4] = useState(card.last4 || "");
  const [dueDate, setDueDate] = useState(card.dueDate);
  const [amount, setAmount] = useState(card.amount ?? 0);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { targetDate, days, urgency } = useMemo(() => {
    const target = parseDateInput(card.dueDate);
    const d = daysUntil(target);
    return { targetDate: target, days: d, urgency: urgencyFor(d) };
  }, [card.dueDate]);

  function startEdit() {
    setName(card.name);
    setLast4(card.last4 || "");
    setDueDate(card.dueDate);
    setAmount(card.amount ?? 0);
    setError("");
    setIsEditing(true);
  }

  async function handleSave() {
    setError("");
    if (!name.trim()) {
      setError("Card name can’t be empty.");
      return;
    }
    if (!dueDate) {
      setError("Pick the date the promotional rate ends.");
      return;
    }
    if (last4 && !/^\d{4}$/.test(last4)) {
      setError("Last 4 digits must be exactly 4 numbers.");
      return;
    }
    if (
      amount !== "" &&
      (!Number.isFinite(Number(amount)) || Number(amount) < 0)
    ) {
      setError("Amount must be a non-negative number.");
      return;
    }

    setSaving(true);
    try {
      await onEdit(card._id, {
        name: name.trim(),
        last4: last4 || null,
        dueDate,
        amount: amount === "" ? 0 : Number(amount),
      });
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (isEditing) {
    return (
      <li className="relative overflow-hidden rounded-lg border border-ink/30 bg-surface p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr] sm:items-end">
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/50">
              Card name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/50">
              Last 4 (optional)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/50">
              Amount (£)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/50">
              Promo ends
            </label>
            <input
              type="date"
              lang="en-GB"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-due">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            disabled={saving}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink/70 transition hover:border-ink hover:text-ink disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

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
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-dashed border-line pt-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink/40">
              Promotional rate ends
            </p>
            <p className="mt-0.5 font-mono text-sm text-ink/80">
              {formatDate(targetDate)}
            </p>
          </div>
          {!!card.amount && (
            <div>
              <p className="text-xs uppercase tracking-wider text-ink/40">
                Amount borrowed
              </p>
              <p className="mt-0.5 font-mono text-sm text-ink/80">
                {formatCurrency(card.amount)}
              </p>
            </div>
          )}
        </div>
        <div className="mt-3 flex gap-3">
          <button
            onClick={startEdit}
            className="text-xs text-ink/40 underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(card._id)}
            className="text-xs text-ink/40 underline decoration-dotted underline-offset-2 hover:text-due"
          >
            Remove card
          </button>
        </div>
      </div>

      <CountdownBadge days={days} urgency={urgency} />
    </li>
  );
}
