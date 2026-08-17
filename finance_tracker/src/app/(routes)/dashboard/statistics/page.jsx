"use client";

import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../../../utils/dbConfig";
import { desc, eq, getTableColumns, sql, and, inArray } from "drizzle-orm";
import { Budgets, Expenses, Incomes, Periods } from "../../../../../utils/schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  FileDown,
  Layers,
  PieChart as PieIcon,
  Activity,
  Table as TableIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import formatNumber from "../../../../../utils";
import { generateThemedExecutivePDF } from "../_components/ChartExport";

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl space-y-1 text-xs">
        <p className="font-semibold text-neutral-400 mb-1">{label || payload[0]?.payload?.name}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
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

export default function StatisticsPage() {
  const { user } = useUser();
  const router = useRouter();
  const { selectedTimeFrames } = useContext(TimeFrameContext);
  const chartCaptureRef = useRef(null);

  const [budgetList, setBudgetList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [activePeriodName, setActivePeriodName] = useState("Active Window");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (user && selectedTimeFrames && selectedTimeFrames.length > 0) {
      fetchAnalyticsData();
    } else if (user && (!selectedTimeFrames || selectedTimeFrames.length === 0)) {
      router.replace("/dashboard/timeframe");
      toast("Choose A TimeFrame First", { duration: 6000 });
    }
  }, [user, selectedTimeFrames]);

  const fetchAnalyticsData = async () => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress) return;
      const userEmail = user.primaryEmailAddress.emailAddress;

      // 1. Fetch Income
      const incomeRes = await db
        .select({
          ...getTableColumns(Incomes),
          periodId: Incomes.periodId,
          totalAmount: sql`SUM(CAST(${Incomes.amount} AS NUMERIC))`.mapWith(Number),
        })
        .from(Incomes)
        .where(
          and(
            eq(Incomes.createdBy, userEmail),
            inArray(Incomes.periodId, selectedTimeFrames)
          )
        )
        .groupBy(Incomes.id, Incomes.periodId);

      setIncomeList(incomeRes);
      const incTotal = incomeRes.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      setTotalIncome(incTotal);

      // 2. Fetch Budgets
      const budgetRes = await db
        .select({
          ...getTableColumns(Budgets),
          periodId: Budgets.periodId,
          totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(
          and(
            eq(Budgets.createdBy, userEmail),
            inArray(Budgets.periodId, selectedTimeFrames)
          )
        )
        .groupBy(Budgets.id, Budgets.periodId)
        .orderBy(desc(Budgets.id));

      setBudgetList(budgetRes);

      const bTotal = budgetRes.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const spTotal = budgetRes.reduce((sum, item) => sum + (parseFloat(item.totalSpend) || 0), 0);
      setTotalBudget(bTotal);
      setTotalSpend(spTotal);

      // 3. Fetch Period Name
      const periodRes = await db
        .select({ name: Periods.name })
        .from(Periods)
        .where(inArray(Periods.id, selectedTimeFrames))
        .limit(1);

      if (periodRes && periodRes[0]) {
        setActivePeriodName(periodRes[0].name);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  const actualSavings = totalIncome - totalSpend;
  const savingsRate = totalIncome > 0 ? ((actualSavings / totalIncome) * 100).toFixed(1) : 0;
  const budgetUtilization = totalBudget > 0 ? ((totalSpend / totalBudget) * 100).toFixed(1) : 0;

  // Chart Data preparation
  const categoryBarData = useMemo(() => {
    return budgetList.map((b) => ({
      name: b.name,
      Budget: Number(b.amount || 0),
      Spend: Number(b.totalSpend || 0),
    }));
  }, [budgetList]);

  const categoryDonutData = useMemo(() => {
    const total = budgetList.reduce((sum, b) => sum + parseFloat(b.totalSpend || 0), 0);
    if (total > 0) {
      return budgetList
        .filter((b) => Number(b.totalSpend || 0) > 0)
        .map((b, idx) => ({
          name: b.name,
          value: Number(b.totalSpend || 0),
          perc: Math.round((Number(b.totalSpend || 0) / total) * 100),
          color: PALETTE[idx % PALETTE.length],
        }));
    }
    const bTotal = budgetList.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
    return budgetList.map((b, idx) => ({
      name: b.name,
      value: Number(b.amount || 0),
      perc: bTotal > 0 ? Math.round((Number(b.amount || 0) / bTotal) * 100) : 0,
      color: PALETTE[idx % PALETTE.length],
    }));
  }, [budgetList]);

  const trendAreaData = useMemo(() => {
    if (budgetList.length === 0) return [];
    return budgetList.map((b) => ({
      name: b.name,
      BudgetLimit: Number(b.amount || 0),
      SpendOutflow: Number(b.totalSpend || 0),
    }));
  }, [budgetList]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await generateThemedExecutivePDF({
        budgetList,
        totalIncome,
        totalBudget,
        totalSpend,
        actualSavings,
        periodName: activePeriodName,
        userEmail: user?.primaryEmailAddress?.emailAddress || "User",
        chartRef: chartCaptureRef,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const statCards = [
    {
      label: "Total Income",
      value: `KSh ${formatNumber(totalIncome)}`,
      badge: "Total Inflows",
      icon: TrendingUp,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Target Budget",
      value: `KSh ${formatNumber(totalBudget)}`,
      badge: `${budgetUtilization}% Allocated`,
      icon: Target,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Total Expenditures",
      value: `KSh ${formatNumber(totalSpend)}`,
      badge: totalSpend > totalBudget && totalBudget > 0 ? "Over Budget" : "Spend Outflow",
      icon: TrendingDown,
      color:
        totalSpend > totalBudget && totalBudget > 0
          ? "text-rose-500 bg-rose-500/10 border-rose-500/30"
          : "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Net Savings",
      value: `KSh ${formatNumber(actualSavings)}`,
      badge: `${savingsRate}% Savings Rate`,
      icon: PiggyBank,
      color:
        actualSavings >= 0
          ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          : "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1550px] mx-auto pb-8">
      {/* Top Header with PDF Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Executive Analytics & Reports
          </h2>
          <p className="text-sm text-muted-foreground">
            Financial health diagnostics, category limits, and spending distribution for{" "}
            <span className="font-semibold text-foreground">{activePeriodName}</span>
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0"
        >
          <FileDown className="w-4 h-4" />
          <span>{isExporting ? "Generating PDF..." : "Export Executive Report PDF"}</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-2">
                <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium text-[11px]">
                  {stat.badge}
                </span>
                <span className="text-[11px] text-muted-foreground">Active Period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Capture Area for PDF embedding */}
      <div ref={chartCaptureRef} className="space-y-6">
        {/* Tier 2: 2-Column Analytics Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 60%: Spend vs Budget Bar Chart with maxBarSize and clean spacing */}
          <div className="lg:col-span-7 xl:col-span-8 p-6 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Category Budget vs. Outflow</h3>
                  <p className="text-xs text-muted-foreground">Target limits compared against actual expenditure</p>
                </div>
              </div>
            </div>

            {categoryBarData.length > 0 ? (
              <div className="w-full h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryBarData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    barGap={6}
                  >
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
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Bar
                      dataKey="Budget"
                      name="Budget Target"
                      fill="#10B981"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="Spend"
                      name="Actual Outflow"
                      fill="#3B82F6"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl my-4">
                No budget categories in this timeframe yet.
              </div>
            )}
          </div>

          {/* Right 40%: Spending Distribution Donut Chart with clean layout & legend spacing */}
          <div className="lg:col-span-5 xl:col-span-4 p-6 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Spending Distribution</h3>
                  <p className="text-xs text-muted-foreground">Category percentage of total outflow</p>
                </div>
              </div>
            </div>

            {categoryDonutData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1 pt-2">
                <div className="sm:col-span-6 relative w-full h-[220px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDonutData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {categoryDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      TOTAL
                    </span>
                    <span className="text-xs sm:text-sm font-black text-foreground">
                      KSh {formatNumber(totalSpend > 0 ? totalSpend : totalBudget)}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-6 space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
                  {categoryDonutData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 text-xs py-1 border-b border-border/40 last:border-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-foreground truncate max-w-[80px]">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold">
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
              <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl my-4">
                No categories found.
              </div>
            )}
          </div>
        </div>

        {/* Tier 3: Full-Width Comparison Area Chart with proper X-Axis insets */}
        {trendAreaData.length > 0 && (
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Cash-Flow Distribution Trajectory</h3>
                  <p className="text-xs text-muted-foreground">Comparative cross-category curve of budget limit versus actual spend</p>
                </div>
              </div>
            </div>

            <div className="w-full h-[260px] pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendAreaData}
                  margin={{ top: 10, right: 30, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="budgetArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="spendArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 40, right: 40 }}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area
                    type="monotone"
                    dataKey="BudgetLimit"
                    name="Target Limit"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#budgetArea)"
                  />
                  <Area
                    type="monotone"
                    dataKey="SpendOutflow"
                    name="Actual Outflow"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#spendArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Tier 4: Budget Category Breakdown Data Table */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <TableIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Detailed Budget Allocation Table</h3>
              <p className="text-xs text-muted-foreground">{budgetList.length} categories active</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs text-muted-foreground uppercase">
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold text-right">Target Limit</th>
                <th className="py-3 px-3 font-semibold text-right">Actual Spend</th>
                <th className="py-3 px-3 font-semibold text-right">Remaining</th>
                <th className="py-3 px-3 font-semibold text-center">Utilization</th>
                <th className="py-3 px-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {budgetList.length > 0 ? (
                budgetList.map((b) => {
                  const budget = Number(b.amount || 0);
                  const spent = Number(b.totalSpend || 0);
                  const remaining = budget - spent;
                  const usage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
                  const isOver = spent > budget;
                  const isWarning = usage >= 80 && !isOver;

                  return (
                    <tr key={b.id} className="hover:bg-muted/40 transition-colors text-xs sm:text-sm">
                      <td className="py-3.5 px-3 font-bold text-foreground flex items-center gap-2">
                        <span>{b.icon || "🏷️"}</span>
                        <span>{b.name}</span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-foreground">
                        KSh {formatNumber(budget)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-foreground">
                        KSh {formatNumber(spent)}
                      </td>
                      <td
                        className={`py-3.5 px-3 text-right font-semibold ${
                          remaining >= 0 ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        KSh {formatNumber(remaining)}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="w-28 mx-auto space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                            <span>{usage}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted/80 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, usage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isOver
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : isWarning
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}
                        >
                          {isOver ? "Over Budget" : isWarning ? "Caution" : "On Track"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                    No budget categories found for the active timeframe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}