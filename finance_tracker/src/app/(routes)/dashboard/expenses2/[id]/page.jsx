"use client";

import { db } from "../../../../../../utils/dbConfig";
import { Budgets, Expenses } from "../../../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import React, { useEffect, useState, use } from "react";
import ExpenseListTable from "../../expenses/_components/ExpenseListTable";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExpensesScreen({ params }) {
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  const budgetId = unwrappedParams?.id;

  const { user } = useUser();
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const router = useRouter();

  const getBudgetInfo = async (id) => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress || !id) return;

      const result = await db
        .select({
          ...getTableColumns(Budgets),
          totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
        .where(eq(Budgets.id, id))
        .groupBy(Budgets.id);

      if (result && result.length > 0) {
        setBudgetInfo(result[0]);
      }
    } catch (error) {
      console.error("Error fetching budget info:", error);
    }
  };

  const getExpensesList = async (id) => {
    try {
      if (!id) return;

      const result = await db
        .select()
        .from(Expenses)
        .where(eq(Expenses.budgetId, id))
        .orderBy(desc(Expenses.id));

      setExpensesList(result);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    if (user && budgetId) {
      getBudgetInfo(budgetId);
      getExpensesList(budgetId);
    }
  }, [user, budgetId]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border/80">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-all duration-200 active:scale-95 shadow-xs"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {budgetInfo?.name ? `${budgetInfo.name} Expenses` : "Category Expenses"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Transaction log for this specific category
          </p>
        </div>
      </div>

      <ExpenseListTable
        budget={budgetInfo}
        expensesList={expensesList}
        refreshData={() => {
          getBudgetInfo(budgetId);
          getExpensesList(budgetId);
        }}
      />
    </div>
  );
}
