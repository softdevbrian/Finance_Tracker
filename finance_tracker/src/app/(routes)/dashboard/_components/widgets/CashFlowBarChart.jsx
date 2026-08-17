"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import formatNumber from "../../../../../../utils";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2.5 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-semibold text-neutral-400">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="flex items-center justify-between gap-3 text-white">
            <span className="capitalize" style={{ color: entry.fill }}>{entry.name}:</span>
            <span className="font-bold">KSh {formatNumber(entry.value)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CashFlowBarChart({ totalIncome = 0, totalSpend = 0, totalBudget = 0 }) {
  const chartData = [
    { name: "Inflow", Amount: totalIncome, fill: "#10B981" },
    { name: "Budget", Amount: totalBudget, fill: "#3B82F6" },
    { name: "Spend", Amount: totalSpend, fill: totalSpend > totalIncome && totalIncome > 0 ? "#EF4444" : "#F59E0B" },
  ];

  return (
    <div className="p-5 rounded-2xl bg-card/95 border border-border/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h3 className="text-base font-bold text-foreground">Cash Flow Balance</h3>
          <p className="text-xs text-muted-foreground">Inflow vs. Allocation vs. Outflow</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-[180px] pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="Amount"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
