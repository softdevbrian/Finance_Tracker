"use client";

import React, { useState, useEffect, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../../utils/dbConfig";
import { desc, eq, getTableColumns, sql, and, inArray } from "drizzle-orm";
import { Budgets, Expenses, Incomes } from "../../../../utils/schema";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";

import AdvisorBanner from "./_components/widgets/AdvisorBanner";
import MetricCardsRow from "./_components/widgets/MetricCardsRow";
import IncomeExpenseAreaChart from "./_components/widgets/IncomeExpenseAreaChart";
import CategoryDonutChart from "./_components/widgets/CategoryDonutChart";
import BudgetProgressWidget from "./_components/widgets/BudgetProgressWidget";
import CashFlowBarChart from "./_components/widgets/CashFlowBarChart";
import RecentTransactionsWidget from "./_components/widgets/RecentTransactionsWidget";

export default function Dashboard() {
  const { user } = useUser();
  const { selectedTimeFrames } = useContext(TimeFrameContext);
  const [budgetList, setBudgetList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (user && selectedTimeFrames && selectedTimeFrames.length > 0) {
      getDashboardData();
    } else if (user && (!selectedTimeFrames || selectedTimeFrames.length === 0)) {
      router.replace("/dashboard/timeframe");
      toast("Choose A TimeFrame First", { duration: 6000 });
    }
  }, [user, selectedTimeFrames]);

  const getDashboardData = async () => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress) return;
      const userEmail = user.primaryEmailAddress.emailAddress;

      // 1. Fetch Incomes strictly for the selected timeframe
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
      const incTotal = incomeRes.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );
      setTotalIncome(incTotal);

      // 2. Fetch Budgets with totalSpend strictly for the selected timeframe
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

      const bTotal = budgetRes.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0
      );
      const spTotal = budgetRes.reduce(
        (sum, item) => sum + (parseFloat(item.totalSpend) || 0),
        0
      );
      setTotalBudget(bTotal);
      setTotalSpend(spTotal);

      // 3. Fetch Recent Expenses strictly for the selected timeframe
      const expRes = await db
        .select({
          id: Expenses.id,
          name: Expenses.name,
          amount: Expenses.amount,
          createdAt: Expenses.createdAt,
          budgetId: Expenses.budgetId,
        })
        .from(Budgets)
        .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(
          and(
            eq(Budgets.createdBy, userEmail),
            inArray(Budgets.periodId, selectedTimeFrames)
          )
        )
        .orderBy(desc(Expenses.id))
        .limit(10);

      setExpensesList(expRes);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  return (
    <div className="space-y-4 max-w-[1550px] mx-auto pb-6">
      <Toaster />

      {/* Top Banner: Dynamic Scenario Financial Advisor */}
      <AdvisorBanner
        totalBudget={totalBudget}
        totalSpend={totalSpend}
        totalIncome={totalIncome}
      />

      {/* Tier 1: 4 Real KPI Metric Cards */}
      <MetricCardsRow
        totalBudget={totalBudget}
        totalIncome={totalIncome}
        totalSpend={totalSpend}
      />

      {/* Tier 2: Visual Analytics (Spend vs Budget + Category Spending Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 xl:col-span-8">
          <IncomeExpenseAreaChart budgetList={budgetList} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <CategoryDonutChart budgetList={budgetList} />
        </div>
      </div>

      {/* Tier 3: Operational Cockpit (Budgets Progress + Cash Flow + Recent Transactions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BudgetProgressWidget budgetList={budgetList} />
        <CashFlowBarChart
          totalIncome={totalIncome}
          totalSpend={totalSpend}
          totalBudget={totalBudget}
        />
        <RecentTransactionsWidget expensesList={expensesList} />
      </div>
    </div>
  );
}