"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import formatNumber from "../../../../../../utils";
import { PieChart as PieIcon } from "lucide-react";

const PALETTE = [
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#64748B", // Slate
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2.5 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-xl text-xs space-y-0.5">
        <p className="font-bold text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
          {data.name}
        </p>
        <p className="text-neutral-300 font-medium">
          Amount: <span className="font-bold text-white">KSh {formatNumber(data.value)}</span> ({data.perc}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryDonutChart({ budgetList = [] }) {
  const { totalAmount, chartData, mode } = useMemo(() => {
    if (!budgetList || budgetList.length === 0) {
      return { totalAmount: 0, chartData: [], mode: "empty" };
    }

    const totalSpend = budgetList.reduce((sum, b) => sum + parseFloat(b.totalSpend || 0), 0);

    // If there is actual spend, display spend distribution
    if (totalSpend > 0) {
      const items = budgetList
        .filter((b) => Number(b.totalSpend || 0) > 0)
        .map((b, idx) => {
          const val = Number(b.totalSpend || 0);
          const perc = Math.round((val / totalSpend) * 100);
          return {
            name: b.name,
            value: val,
            perc: perc,
            color: PALETTE[idx % PALETTE.length],
          };
        });
      return { totalAmount: totalSpend, chartData: items, mode: "spend" };
    }

    // Otherwise display allocated budget distribution
    const totalBudget = budgetList.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
    const items = budgetList.map((b, idx) => {
      const val = Number(b.amount || 0);
      const perc = totalBudget > 0 ? Math.round((val / totalBudget) * 100) : 0;
      return {
        name: b.name,
        value: val,
        perc: perc,
        color: PALETTE[idx % PALETTE.length],
      };
    });

    return { totalAmount: totalBudget, chartData: items, mode: "budget" };
  }, [budgetList]);

  return (
    <div className="p-5 rounded-2xl bg-card/95 border border-border/80 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-base font-bold text-foreground">
          {mode === "spend" ? "Spending by Category" : "Allocated Budgets"}
        </h3>
        <span className="text-[11px] text-muted-foreground font-medium">
          {mode === "spend" ? "Actual Spend" : "Budget Spread"}
        </span>
      </div>

      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1">
          {/* Donut Chart with Center Cutout Total */}
          <div className="sm:col-span-6 relative w-full h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Absolute Center Cutout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Total
              </span>
              <span className="text-xs sm:text-sm font-black text-foreground">
                KSh {formatNumber(totalAmount)}
              </span>
            </div>
          </div>

          {/* Right Side Category Legend List */}
          <div className="sm:col-span-6 space-y-2 overflow-y-auto max-h-[220px] pr-1">
            {chartData.slice(0, 6).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-foreground truncate max-w-[90px]">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground font-bold">
                    {item.perc}%
                  </span>
                  <span className="text-[11px] font-bold text-foreground">
                    KSh {formatNumber(item.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
          No categories found for this period.
        </div>
      )}
    </div>
  );
}
