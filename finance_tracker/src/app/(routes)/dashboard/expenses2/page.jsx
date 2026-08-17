"use client";

import { db } from "../../../../../utils/dbConfig";
import { Budgets, Expenses } from "../../../../../utils/schema";
import { desc, eq, and, inArray } from "drizzle-orm";
import React, { useEffect, useState, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import BudgetList from "./_components/ExpenseCategories";
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";
import { ShoppingBag, ArrowRight } from "lucide-react";
import formatNumber from "../../../../../utils";

export default function ExpensesScreen() {
  const [expensesList, setExpensesList] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [noItems, setNoItems] = useState(0);

  const { user } = useUser();
  const router = useRouter();
  const { selectedTimeFrames } = useContext(TimeFrameContext);

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
      const total = result.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      setTotalSpend(total);
      setNoItems(result.length);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    if (user && selectedTimeFrames && selectedTimeFrames.length > 0) {
      getAllExpenses();
    } else if (user && (!selectedTimeFrames || selectedTimeFrames.length === 0)) {
      router.replace("/dashboard/timeframe");
      toast("Choose A TimeFrame First", { duration: 6000 });
    }
  }, [user, selectedTimeFrames]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Expense Breakdown
          </h2>
          <p className="text-sm text-muted-foreground">
            Track categorized spending and review logged receipts
          </p>
        </div>
      </div>

      {/* Summary Highlight Card */}
      <Link href="/dashboard/expenses">
        <div className="p-6 rounded-2xl bg-card border border-border/80 hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                  Consolidated Summary
                </span>
                <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  All Active Expenses
                </h3>
                <p className="text-xs text-muted-foreground">{noItems} transactions logged across all categories</p>
              </div>
            </div>

            <div className="text-right flex items-center gap-4">
              <div>
                <span className="text-xs text-muted-foreground font-medium block">Total Outflow</span>
                <span className="text-xl md:text-2xl font-black text-rose-500">
                  Ksh.{formatNumber(totalSpend)}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </Link>

      {/* Category Breakdowns */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Expenses By Budget Category</h3>
        <BudgetList />
      </div>
    </div>
  );
}