"use client";

import {
  ComposedChart,
  Bar,
  Cell,
  LabelList,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/dueDate";

const HIGHLIGHT = "#B23B30"; // vital-few bars, in 'debt' mode
const MUTED = "#B08D57"; // everything else

export default function ParetoChart({ data, mode }) {
  const maxAmount = Math.max(1, ...data.map((d) => d.amount));
  // Below ~6 bars a normal fluid-width chart stays readable. Beyond that,
  // date labels start colliding on narrow screens, so give each bar a
  // minimum width and let the container scroll horizontally instead of
  // squeezing bars/labels into illegibility.
  const minWidth = Math.max(320, data.length * 70);

  function renderTooltip({ active, payload }) {
    if (!active || !payload || !payload.length) return null;
    const point = payload[0].payload;

    return (
      <div className="rounded-md border border-line bg-surface px-3 py-2 shadow-md">
        <p className="font-display text-sm font-medium text-ink">
          {point.name}
        </p>
        <p className="mt-1 font-mono text-xs text-ink/70">
          Due {point.label} · {formatCurrency(point.amount)}
        </p>
        {mode === "debt" ? (
          <p className="font-mono text-xs text-brass">
            Rank #{point.rank} · {point.individualPercent.toFixed(1)}% of total
            {point.isVitalFew ? " · in the vital 80%" : ""}
          </p>
        ) : (
          <p className="font-mono text-xs text-brass">
            Cumulative: {point.cumulativePercent.toFixed(1)}%
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="h-80 sm:h-96" style={{ minWidth }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 10, left: 0, bottom: 28 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#D9DCD1" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#1F2A24" }}
              tickLine={false}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#1F2A24" }}
              tickFormatter={(v) => `£${v}`}
              domain={[0, Math.ceil(maxAmount * 1.15)]}
              width={70}
            />
            {mode === "date" && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#B08D57" }}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
                width={50}
              />
            )}
            <Tooltip content={renderTooltip} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {mode === "date" && (
              <ReferenceLine
                yAxisId="right"
                y={80}
                stroke="#B23B30"
                strokeDasharray="4 4"
                label={{
                  value: "80%",
                  position: "right",
                  fill: "#B23B30",
                  fontSize: 11,
                }}
              />
            )}
            <Bar
              yAxisId="left"
              dataKey="amount"
              name="Amount borrowed"
              fill={MUTED}
              fillOpacity={0.75}
              radius={[3, 3, 0, 0]}
            >
              {mode === "debt" &&
                data.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.isVitalFew ? HIGHLIGHT : MUTED}
                    fillOpacity={entry.isVitalFew ? 0.85 : 0.35}
                  />
                ))}
              {mode === "debt" && (
                <LabelList
                  dataKey="rank"
                  position="top"
                  formatter={(v) => `#${v}`}
                  style={{ fontSize: 11, fill: "#1F2A24", fontWeight: 600 }}
                />
              )}
            </Bar>
            {mode === "date" && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativePercent"
                name="Cumulative %"
                stroke="#1F2A24"
                strokeWidth={2}
                dot={{ r: 3, fill: "#1F2A24" }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {mode === "debt" && (
        <p className="mt-2 text-xs text-ink/50">
          Darker bars are the fewest cards that add up to 80% of your total
          debt. Numbers show each card&rsquo;s rank by amount.
        </p>
      )}
    </div>
  );
}
