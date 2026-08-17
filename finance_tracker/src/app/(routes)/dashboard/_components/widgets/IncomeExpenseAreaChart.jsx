"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import formatNumber from "../../../../../../utils";
import { Layers } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl space-y-1 text-xs">
        <p className="font-semibold text-neutral-400 mb-1.5">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize text-neutral-300 font-medium">{entry.name}:</span>
            </div>
            <span className="font-bold text-white">
              KSh {formatNumber(entry.value || 0)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncomeExpenseAreaChart({ budgetList = [] }) {
  const chartData = useMemo(() => {
    if (!budgetList || budgetList.length === 0) return [];
    return budgetList.map((b) => ({
      name: b.name,
      Budget: Number(b.amount || 0),
      Spend: Number(b.totalSpend || 0),
    }));
  }, [budgetList]);

  return (
    <div className="p-5 rounded-2xl bg-card/95 border border-border/80 shadow-xs flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Spend vs. Budget Allocation</h3>
            <p className="text-xs text-muted-foreground">Category comparison for active period</p>
          </div>
        </div>
      </div>

      {/* Bar / Comparison Chart */}
      {chartData.length > 0 ? (
        <div className="w-full h-[240px] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
              <Bar
                dataKey="Budget"
                name="Budget Limit"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Spend"
                name="Actual Spend"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl">
          No budget categories in this timeframe yet.
        </div>
      )}
    </div>
  );
}
