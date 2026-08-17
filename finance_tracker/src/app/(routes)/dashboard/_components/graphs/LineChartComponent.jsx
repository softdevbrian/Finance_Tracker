"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import formatNumber from "../../../../../../utils";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, totalSpend, amount, icon } = payload[0].payload;
    return (
      <div className="p-3 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl space-y-1">
        <p className="text-xs font-bold text-foreground mb-1">
          {icon} {name}
        </p>
        <p className="text-xs font-semibold text-emerald-500">
          Budget: Ksh.{formatNumber(amount)}
        </p>
        <p className="text-xs font-semibold text-rose-500">
          Spent: Ksh.{formatNumber(totalSpend)}
        </p>
      </div>
    );
  }
  return null;
};

export default function LineChartComponent({ data = [] }) {
  return (
    <div className="w-full pt-2">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#888888" fontSize={11} />
          <YAxis stroke="#888888" fontSize={11} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
          <Line
            type="monotone"
            name="Allocated Budget"
            dataKey="amount"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            name="Actual Spend"
            dataKey="totalSpend"
            stroke="#EF4444"
            strokeWidth={2.5}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
