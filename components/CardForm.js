"use client";

import { useState } from "react";

export default function CardForm({ onAdd }) {
  const [name, setName] = useState("");
  const [last4, setLast4] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function isValidNonNegative(value) {
    return Number.isFinite(Number(value)) && Number(value) >= 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Give the card a name.");
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
    if (amount && !isValidNonNegative(amount)) {
      setError("Amount must be a non-negative number.");
      return;
    }
    if (creditLimit && !isValidNonNegative(creditLimit)) {
      setError("Credit limit must be a non-negative number.");
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        last4: last4 || null,
        dueDate,
        amount: amount ? Number(amount) : 0,
        creditLimit: creditLimit ? Number(creditLimit) : null,
      });
      setName("");
      setLast4("");
      setDueDate("");
      setAmount("");
      setCreditLimit("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-line bg-surface p-4 shadow-sm sm:p-5"
    >
      <p className="mb-4 font-display text-lg font-medium text-ink">
        Add a card
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink/50">
            Card name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chase Sapphire"
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
            placeholder="4321"
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

        <div>
          <label className="block text-xs uppercase tracking-wider text-ink/50">
            Amount borrowed (£)
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="2500.00"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-ink/50">
            Credit limit (£, optional)
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
            placeholder="5000.00"
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90 disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Add card"}
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-due">{error}</p>}
    </form>
  );
}
