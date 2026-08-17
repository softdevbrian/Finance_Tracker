"use client";

import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import formatNumber from "../../../../../../utils";

const EXTENDED_COLORS = [
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, amount, icon, totalSpend } = payload[0].payload;
    return (
      <div className="p-3 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl space-y-1">
        <p className="text-xs font-bold text-foreground mb-1">
          {icon} {name}
        </p>
        <p className="text-xs font-semibold text-blue-500">
          Allocated Budget: Ksh.{formatNumber(amount)}
        </p>
        <p className="text-xs font-semibold text-rose-500">
          Spent: Ksh.{formatNumber(totalSpend || 0)}
        </p>
      </div>
    );
  }
  return null;
};

export default function PieChartComponentB({ data = [] }) {
  const transformedData = data.map((item) => ({
    ...item,
    amount: parseFloat(
      typeof item.amount === "string"
        ? item.amount.replace(/,/g, "")
        : item.amount || 0
    ),
  }));

  return (
    <div className="w-full pt-2">
      <ResponsiveContainer width="100%" height={340}>
        <PieChart>
          <Pie
            data={transformedData}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={95}
            innerRadius={50}
            paddingAngle={4}
          >
            {transformedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={EXTENDED_COLORS[index % EXTENDED_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            formatter={(value, entry) => {
              const { payload } = entry;
              return `${payload.icon || ""} ${value} (Ksh.${formatNumber(payload.amount)})`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
