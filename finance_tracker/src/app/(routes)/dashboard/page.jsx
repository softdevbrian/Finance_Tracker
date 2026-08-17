"use client";

import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import CardInfo from "./_components/CardInfo";
import { db } from "../../../../utils/dbConfig";
import { desc, eq, getTableColumns, sql, and, inArray } from "drizzle-orm";
import { Budgets, Expenses, Incomes, Periods } from "../../../../utils/schema";
import BudgetItem from "./budgets/_components/BudgetItem";
import ExpenseListTable from "./expenses/_components/ExpenseListTable";
import { Toaster } from "@/components/ui/sonner";
import BarChartComponent from "./_components/graphs/BarChartComponent";
import LineChartComponent from "./_components/graphs/LineChartComponent";
import PieChartComponentB from "./_components/graphs/PieChartComponentB";
import PieChartComponent from "./_components/graphs/PieChartComponent";
import { ChartWrapper } from "./_components/ChartExport";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";
import { Layers } from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();
  const [userEmail, setUserEmail] = useState(null);
  const { selectedTimeFrames } = useContext(TimeFrameContext);
  const [budgetList, setBudgetList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [greeting, setGreeting] = useState(getGreeting());
  const router = useRouter();

  const charts = [
    { component: BarChartComponent, name: "Spend vs Budget Bar Chart", exportName: "Bar_Chart" },
    { component: LineChartComponent, name: "Income vs Spend Trend", exportName: "Line_Chart" },
    { component: PieChartComponent, name: "Spend Distribution", exportName: "Spend_Pie_Chart" },
    { component: PieChartComponentB, name: "Budget Allocation", exportName: "Budget_Pie_Chart" },
  ];

  useEffect(() => {
    if (user && selectedTimeFrames && selectedTimeFrames.length > 0) {
      setUserEmail(user.primaryEmailAddress?.emailAddress);
      getBudgetList();
    } else if (user && (!selectedTimeFrames || selectedTimeFrames.length === 0)) {
      router.replace("/dashboard/timeframe");
      toast("Choose A TimeFrame First", { duration: 6000 });
    }

    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, [user, selectedTimeFrames]);

  useEffect(() => {
    const chartRotationInterval = setInterval(() => {
      setCurrentChartIndex((prevIndex) => (prevIndex + 1) % charts.length);
    }, 20000);

    return () => clearInterval(chartRotationInterval);
  }, []);

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
      getAllExpenses();
      getIncomeList();
    } catch (error) {
      console.error("Error fetching budget list:", error);
    }
  };

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

  const getAllExpenses = async () => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const result = await db
        .select({
          id: Expenses.id,
          name: Expenses.name,
          amount: Expenses.amount,
          createdAt: Expenses.createdAt,
          periodId: Budgets.periodId,
        })
        .from(Budgets)
        .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(
          and(
            eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress),
            inArray(Budgets.periodId, selectedTimeFrames)
          )
        )
        .orderBy(desc(Expenses.id));

      setExpensesList(result);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const CurrentChartComponent = charts[currentChartIndex].component;

  return (
    <div className="space-y-6">
      <Toaster />

      {/* Greeting Header */}
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <span>{greeting.greeting}, {user?.firstName || user?.fullName || "there"}</span>
          <span>{greeting.emoji}</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Monitor your cash flow, track active budget categories, and optimize your monthly savings.
        </p>
      </div>

      {/* KPI Cards & Advisor Banner */}
      <CardInfo
        budgetList={budgetList}
        incomeList={incomeList}
        currentUserEmail={userEmail}
      />

      {/* Analytics & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Rotating Charts Deck + Expense Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {charts[currentChartIndex].name}
                  </h3>
                  <p className="text-xs text-muted-foreground">Auto-cycling visual analytics</p>
                </div>
              </div>

              {/* Chart Selector Dots */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/60">
                {charts.map((chart, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentChartIndex(index)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      currentChartIndex === index
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <ChartWrapper
              title={charts[currentChartIndex].exportName}
              exportable={true}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentChartIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrentChartComponent data={budgetList} />
                </motion.div>
              </AnimatePresence>
            </ChartWrapper>
          </div>

          <ExpenseListTable
            budget={budgetList}
            expensesList={expensesList}
            refreshData={() => getBudgetList()}
          />
        </div>

        {/* Right 1 Col: Latest Budgets List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Active Budgets</h3>
            <span className="text-xs font-medium text-muted-foreground">
              {budgetList?.length || 0} categories
            </span>
          </div>

          <div className="space-y-3">
            {budgetList?.length > 0 ? (
              budgetList.map((budget, index) => (
                <BudgetItem budget={budget} key={index} />
              ))
            ) : (
              <div className="space-y-3">
                {[1, 2, 3].map((item, index) => (
                  <div
                    key={index}
                    className="h-28 w-full bg-muted/60 rounded-2xl border border-border/40 animate-pulse"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hours = new Date().getHours();
  if (hours < 12) return { greeting: "Good morning", emoji: "☀️" };
  if (hours < 18) return { greeting: "Good afternoon", emoji: "🌤️" };
  return { greeting: "Good evening", emoji: "🌙" };
}