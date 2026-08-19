"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import ParetoChart from "@/components/ParetoChart";
import { formatDate, formatCurrency, parseDateInput } from "@/lib/dueDate";

export default function InsightsPage() {
  const { status } = useSession();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [order, setOrder] = useState("debt"); // 'debt' | 'date'

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

  // Bars always sit at their card's due date (fixed x-axis order).
  // - 'date' mode: cumulative % line, accumulated in date order - a clean
  //   staircase since accumulation order matches the x-axis order.
  // - 'debt' mode: no line (accumulating by debt rank but plotting by date
  //   produces a misleading, non-monotonic line). Instead each bar is
  //   labelled with its rank by amount, and the fewest bars that make up
  //   80% of total debt are highlighted - the classic Pareto "vital few",
  //   shown without needing a second axis or a confusing line.
  const chartData = useMemo(() => {
    const withDate = cards.map((c) => ({
      ...c,
      dateObj: parseDateInput(c.dueDate),
      amount: Number(c.amount) || 0,
    }));

    const chronological = [...withDate].sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate),
    );

    const total = withDate.reduce((sum, c) => sum + c.amount, 0);

    // Date-order cumulative % (used only in 'date' mode).
    let runningByDate = 0;
    const cumulativeByDate = new Map();
    for (const card of chronological) {
      runningByDate += card.amount;
      cumulativeByDate.set(
        card._id,
        total > 0 ? (runningByDate / total) * 100 : 0,
      );
    }

    // Debt-order rank, individual share, and vital-few flag (used only in
    // 'debt' mode).
    const byDebtDesc = [...withDate].sort((a, b) => b.amount - a.amount);
    const rankById = new Map();
    const individualPercentById = new Map();
    const vitalFewById = new Map();
    let runningByDebt = 0;
    byDebtDesc.forEach((card, i) => {
      rankById.set(card._id, i + 1);
      individualPercentById.set(
        card._id,
        total > 0 ? (card.amount / total) * 100 : 0,
      );
      const cumulativeBefore = total > 0 ? (runningByDebt / total) * 100 : 0;
      vitalFewById.set(card._id, cumulativeBefore < 80);
      runningByDebt += card.amount;
    });

    return chronological.map((c) => ({
      id: c._id,
      label: formatDate(c.dateObj),
      name: c.name,
      amount: c.amount,
      cumulativePercent: cumulativeByDate.get(c._id) ?? 0,
      rank: rankById.get(c._id),
      individualPercent: individualPercentById.get(c._id) ?? 0,
      isVitalFew: vitalFewById.get(c._id) ?? false,
    }));
  }, [cards, order]);

  const totalAmount = chartData.reduce((sum, c) => sum + c.amount, 0);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-brass hover:underline"
          >
            ← Back to cards
          </Link>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Debt Pareto view
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            Bars sit at each card&rsquo;s promo end date. The line shows
            cumulative share of total debt.
          </p>
        </div>
        <AuthButton />
      </header>

      {status === "loading" && (
        <p className="text-sm text-ink/50">Checking your session…</p>
      )}

      {status === "unauthenticated" && (
        <div className="rounded-lg border border-dashed border-line p-8 text-center">
          <p className="font-display text-lg text-ink/70">
            Sign in to see your chart
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
          {loading && (
            <p className="text-sm text-ink/50">Loading your cards…</p>
          )}
          {loadError && <p className="text-sm text-due">{loadError}</p>}

          {!loading && !loadError && cards.length === 0 && (
            <div className="rounded-lg border border-dashed border-line p-8 text-center">
              <p className="font-display text-lg text-ink/70">No cards yet</p>
              <p className="mt-1 text-sm text-ink/50">
                Add a card on the main page to see it charted here.
              </p>
            </div>
          )}

          {!loading && !loadError && cards.length > 0 && (
            <div className="rounded-lg border border-line bg-surface p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex overflow-hidden rounded-md border border-line">
                  <button
                    onClick={() => setOrder("debt")}
                    className={`px-3 py-1.5 text-xs font-medium transition ${
                      order === "debt"
                        ? "bg-ink text-paper"
                        : "bg-surface text-ink/60 hover:text-ink"
                    }`}
                  >
                    Order by debt (high → low)
                  </button>
                  <button
                    onClick={() => setOrder("date")}
                    className={`border-l border-line px-3 py-1.5 text-xs font-medium transition ${
                      order === "date"
                        ? "bg-ink text-paper"
                        : "bg-surface text-ink/60 hover:text-ink"
                    }`}
                  >
                    Order by date (earliest → latest)
                  </button>
                </div>
                <span className="font-mono text-sm text-ink/70">
                  Total: {formatCurrency(totalAmount)}
                </span>
              </div>

              <ParetoChart data={chartData} mode={order} />
            </div>
          )}
        </>
      )}
    </main>
  );
}
