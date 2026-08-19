"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import CardForm from "@/components/CardForm";
import CardTile from "@/components/CardTile";
import AuthButton from "@/components/AuthButton";
import { formatDate, formatCurrency } from "@/lib/dueDate";

export default function Home() {
  const { data: session, status } = useSession();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [, forceTick] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/cards");
      if (res.status === 401) {
        setCards([]);
        return;
      }
      if (!res.ok) throw new Error("Could not load cards.");
      const data = await res.json();
      setCards(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      loadCards();
    } else if (status === "unauthenticated") {
      setCards([]);
      setLoading(false);
    }
  }, [status, loadCards]);

  // Recompute days-left at local midnight so the countdown stays accurate
  // without requiring a page refresh.
  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      5,
    );
    const timeout = setTimeout(() => {
      forceTick((t) => t + 1);
    }, nextMidnight - now);
    return () => clearTimeout(timeout);
  }, [cards]);

  async function handleAdd(card) {
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not add card.");
    setCards((prev) =>
      [...prev, data].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    );
  }

  async function handleEdit(id, updates) {
    const res = await fetch(`/api/cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not save changes.");
    setCards((prev) =>
      prev
        .map((card) => (card._id === id ? { ...card, ...updates } : card))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    );
  }

  async function handleDelete(id) {
    const prev = cards;
    setCards((c) => c.filter((card) => card._id !== id));
    const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
    if (!res.ok) setCards(prev); // roll back on failure
  }

  const totalBorrowed = cards.reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0,
  );

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brass">
            Pay-By Ledger
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Days until your promo rate ends
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            Add each card&rsquo;s promotional end date and watch the countdown
            update on its own.
          </p>
        </div>
        <AuthButton />
      </header>

      {status === "authenticated" && (
        <div className="mb-6">
          <Link
            href="/insights"
            className="text-xs uppercase tracking-wider text-brass hover:underline"
          >
            View debt Pareto chart →
          </Link>
        </div>
      )}

      {status === "loading" && (
        <p className="text-sm text-ink/50">Checking your session…</p>
      )}

      {status === "unauthenticated" && (
        <div className="rounded-lg border border-dashed border-line p-8 text-center">
          <p className="font-display text-lg text-ink/70">
            Sign in to see your cards
          </p>
          <p className="mt-1 text-sm text-ink/50">
            Your cards are private to your Google account.
          </p>
          <button
            onClick={() => signIn("google")}
            className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/90"
          >
            Sign in with Google
          </button>
        </div>
      )}

      {status === "authenticated" && (
        <>
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              aria-expanded={showAddForm}
              className="flex w-full items-center justify-between rounded-lg border border-brass/40 bg-surface px-4 py-3 text-left shadow-sm transition hover:border-brass sm:px-5"
            >
              <span className="font-display text-lg font-medium text-ink">
                {showAddForm ? "Hide form" : "+ Add a card"}
              </span>
              <span
                className={`font-mono text-xs text-brass transition-transform ${showAddForm ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {showAddForm && (
              <div className="mt-3">
                <CardForm onAdd={handleAdd} />
              </div>
            )}
          </div>

          {loading && (
            <p className="text-sm text-ink/50">Loading your cards…</p>
          )}

          {loadError && <p className="text-sm text-due">{loadError}</p>}

          {!loading && !loadError && cards.length === 0 && (
            <div className="rounded-lg border border-dashed border-line p-8 text-center">
              <p className="font-display text-lg text-ink/70">No cards yet</p>
              <p className="mt-1 text-sm text-ink/50">
                Add your first card above to start tracking its promo end date.
              </p>
            </div>
          )}

          {!loading && !loadError && cards.length > 0 && (
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 text-xs uppercase tracking-wider text-ink/40">
              <span>
                Tracking {cards.length} {cards.length === 1 ? "card" : "cards"}{" "}
                · Today {formatDate(new Date())}
              </span>
              <span className="font-mono text-sm normal-case tracking-normal text-ink/70">
                Total borrowed: {formatCurrency(totalBorrowed)}
              </span>
            </div>
          )}

          <ul className="flex flex-col gap-3">
            {cards.map((card) => (
              <CardTile
                key={card._id}
                card={card}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
