"use client";

import React from "react";
import {
  PieChart,
  Pie,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import formatNumber from "../../../../../../utils";

const COLORS = {
  primary: "#10B981", // Emerald
  secondary: "#EF4444", // Rose
  accent: "#3B82F6", // Blue
  warning: "#F59E0B", // Amber
  purple: "#8B5CF6", // Purple
};

const EXTENDED_COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
];

const CustomTooltip = ({ active, payload, tooltipType = "comparison" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl space-y-1">
        <p className="text-xs font-bold text-foreground mb-1">
          {payload[0].payload.name}
        </p>
        {tooltipType === "budget" ? (
          <>
            <p className="text-xs font-semibold text-emerald-500">
              Budget: Ksh.{formatNumber(payload[0].payload.amount || 0)}
            </p>
            <p className="text-xs font-semibold text-rose-500">
              Spent: Ksh.{formatNumber(payload[0].payload.totalSpend || 0)}
            </p>
          </>
        ) : (
          payload.map((entry, index) => (
            <p
              key={index}
              className="text-xs font-semibold text-foreground flex items-center justify-between gap-3"
            >
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-bold">Ksh.{formatNumber(entry.value || 0)}</span>
            </p>
          ))
        )}
      </div>
    );
  }
  return null;
};

export const EnhancedUniversalChart = ({
  type = "bar",
  data,
  dataType = "comparison",
  value1 = 0,
  value2 = 0,
  labels = ["Value 1", "Value 2"],
  title = "Analytics Chart",
}) => {
  const transformBudgetData = () => {
    if (!data) return [];
    const sortedData = [...data].sort(
      (a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0)
    );

    return [
      ...sortedData.map((item) => ({
        name: `${item.name} (Budget)`,
        value: parseFloat(item.amount) || 0,
        category: item.name,
        type: "Budget",
      })),
      ...sortedData.map((item) => ({
        name: `${item.name} (Spent)`,
        value: item.totalSpend || 0,
        category: item.name,
        type: "Spent",
      })),
    ];
  };

  const comparisonData =
    dataType === "comparison"
      ? [{ name: "Current Balances", [labels[0]]: value1, [labels[1]]: value2 }]
      : data;

  const renderChart = () => {
    switch (type) {
      case "pie":
        if (dataType === "budget") {
          const transformedData = transformBudgetData();
          const budgetData = transformedData.filter((item) => item.type === "Budget");
          const spendData = transformedData.filter((item) => item.type === "Spent");

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
              <div className="w-full flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2">
                  Budget Allocations
                </span>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={budgetData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {budgetData.map((entry, index) => (
                        <Cell
                          key={`cell-budget-${index}`}
                          fill={EXTENDED_COLORS[index % EXTENDED_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-2">
                  Spending Outflow
                </span>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={spendData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {spendData.map((entry, index) => (
                        <Cell
                          key={`cell-spend-${index}`}
                          fill={EXTENDED_COLORS[index % EXTENDED_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        } else {
          return (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={[
                    { name: labels[0], value: value1 },
                    { name: labels[1], value: value2 },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  <Cell fill={COLORS.primary} />
                  <Cell fill={COLORS.secondary} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          );
        }

      case "line":
        return (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={dataType === "budget" ? data : comparisonData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip content={<CustomTooltip tooltipType={dataType} />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey={dataType === "budget" ? "amount" : labels[0]}
                stroke={COLORS.primary}
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey={dataType === "budget" ? "totalSpend" : labels[1]}
                stroke={COLORS.secondary}
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default: // bar
        return (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={dataType === "budget" ? data : comparisonData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={11} />
              <YAxis stroke="#888888" fontSize={11} />
              <Tooltip content={<CustomTooltip tooltipType={dataType} />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar
                dataKey={dataType === "budget" ? "amount" : labels[0]}
                fill={COLORS.primary}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey={dataType === "budget" ? "totalSpend" : labels[1]}
                fill={COLORS.secondary}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
      <h3 className="text-base font-bold text-foreground text-center">
        {title}
      </h3>
      <div className="w-full flex items-center justify-center">
        {renderChart()}
      </div>
    </div>
  );
};

export default EnhancedUniversalChart;
