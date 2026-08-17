"use client";

import React, { useEffect, useState, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../../../utils/dbConfig";
import { desc, eq, getTableColumns, sql, and, inArray } from "drizzle-orm";
import { Budgets, Expenses, Incomes, Periods } from "../../../../../utils/schema";
import EnhancedUniversalChart from "../_components/graphs/ChartContainer";
import { useRouter } from "next/navigation";
import { ChartWrapper } from "../_components/ChartExport";
import { toast } from "sonner";
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";
import { BarChart3, TrendingUp, TrendingDown, PiggyBank, Target } from "lucide-react";
import formatNumber from "../../../../../utils";

export default function StatisticsPage() {
  const { user } = useUser();
  const router = useRouter();
  const { selectedTimeFrames } = useContext(TimeFrameContext);
  const [userEmail, setUserEmail] = useState(null);
  const [selectedComparison, setSelectedComparison] = useState("income-spend");
  const [budgetList, setBudgetList] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [expectedSavings, setExpectedSavings] = useState(0);
  const [actualSavings, setActualSavings] = useState(0);
  const [selectedGraph, setSelectedGraph] = useState("bar");
  const [incomeList, setIncomeList] = useState([]);

  useEffect(() => {
    if (user && selectedTimeFrames && selectedTimeFrames.length > 0) {
      setUserEmail(user.primaryEmailAddress?.emailAddress);
      getBudgetList();
      getIncomeList();
    } else if (user && (!selectedTimeFrames || selectedTimeFrames.length === 0)) {
      router.replace("/dashboard/timeframe");
      toast("Choose A TimeFrame First", { duration: 6000 });
    }
  }, [user, selectedTimeFrames]);

  useEffect(() => {
    if (incomeList.length > 0 && userEmail) {
      const userIncome = incomeList
        .filter((income) => income.createdBy === userEmail)
        .reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
      setTotalIncome(userIncome);
    }
  }, [incomeList, userEmail]);

  const getIncomeList = async () => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const result = await db
        .select({
          ...getTableColumns(Incomes),
          periodId: Incomes.periodId,
          totalAmount: sql`SUM(CAST(${Incomes.amount} AS NUMERIC))`.mapWith(Number),
        })
        .from(Incomes)
        .where(
          and(
            eq(Incomes.createdBy, user.primaryEmailAddress.emailAddress),
            inArray(Incomes.periodId, selectedTimeFrames)
          )
        )
        .groupBy(Incomes.id, Incomes.periodId);

      setIncomeList(result);
    } catch (error) {
      console.error("Error fetching income list:", error);
    }
  };

  const getBudgetList = async () => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const result = await db
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
            eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress),
            inArray(Budgets.periodId, selectedTimeFrames)
          )
        )
        .groupBy(Budgets.id, Budgets.periodId)
        .orderBy(desc(Budgets.id));

      setBudgetList(result);
    } catch (error) {
      console.error("Error fetching budget list:", error);
    }
  };

  useEffect(() => {
    if (totalIncome > 0 || budgetList.length > 0) {
      calculateCardInfo(totalIncome);
    }
  }, [totalIncome, budgetList]);

  const calculateCardInfo = (income) => {
    let totalBudget_ = 0;
    let totalSpend_ = 0;

    budgetList.forEach((element) => {
      totalBudget_ += parseFloat(element.amount || 0);
      totalSpend_ += element.totalSpend || 0;
    });

    const expectedSavings_ = income - totalBudget_;
    const actualSavings_ = income - totalSpend_;

    setTotalBudget(totalBudget_);
    setTotalSpend(totalSpend_);
    setExpectedSavings(expectedSavings_);
    setActualSavings(actualSavings_);
  };

  const comparisonOptions = [
    {
      value: "income-spend",
      label: "Income vs. Total Spending",
      value1: totalIncome,
      value2: totalSpend,
      labels: ["Income Inflow", "Spending Outflow"],
    },
    {
      value: "savings",
      label: "Projected vs. Actual Savings",
      value1: expectedSavings,
      value2: actualSavings,
      labels: ["Projected Savings", "Actual Net Savings"],
    },
    {
      value: "income-savings",
      label: "Income vs. Actual Savings",
      value1: totalIncome,
      value2: actualSavings,
      labels: ["Total Income", "Net Retained Savings"],
    },
    {
      value: "income-budget",
      label: "Income vs. Target Budget",
      value1: totalIncome,
      value2: totalBudget,
      labels: ["Total Income", "Allocated Budget"],
    },
    {
      value: "budget-list",
      label: "Category Breakdown: Target vs. Actual",
    },
  ];

  const currentComparison =
    comparisonOptions.find((opt) => opt.value === selectedComparison) ||
    comparisonOptions[0];

  const statCards = [
    {
      label: "Total Income",
      value: `Ksh.${formatNumber(totalIncome)}`,
      icon: TrendingUp,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Target Budget",
      value: `Ksh.${formatNumber(totalBudget)}`,
      icon: Target,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Total Spent",
      value: `Ksh.${formatNumber(totalSpend)}`,
      icon: TrendingDown,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    },
    {
      label: "Actual Savings",
      value: `Ksh.${formatNumber(actualSavings)}`,
      icon: PiggyBank,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Analytics & Comparative Statistics
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore cash-flow ratios, category spreads, and long-term savings projections
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-3"
            >
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {stat.label}
                </span>
                <span className="text-lg md:text-xl font-bold text-foreground">
                  {stat.value}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls Card */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Chart Configuration
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="graphType"
              className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5"
            >
              Visualization Style
            </label>
            <select
              id="graphType"
              value={selectedGraph}
              onChange={(e) => setSelectedGraph(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="comparison"
              className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5"
            >
              Comparison Metric
            </label>
            <select
              id="comparison"
              value={selectedComparison}
              onChange={(e) => setSelectedComparison(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            >
              {comparisonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart Render Canvas */}
      <ChartWrapper
        title={`Analytics_${selectedComparison}_${selectedGraph}`}
        exportable={true}
      >
        <EnhancedUniversalChart
          type={selectedGraph}
          dataType={selectedComparison === "budget-list" ? "budget" : "comparison"}
          data={budgetList}
          value1={currentComparison.value1}
          value2={currentComparison.value2}
          labels={currentComparison.labels}
          title={currentComparison.label}
        />
      </ChartWrapper>
    </div>
  );
}