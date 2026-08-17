"use client";

import { db } from "../../../../../../utils/dbConfig";
import { Budgets, Expenses } from "../../../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import React, { useEffect, useState, use } from "react";
import BudgetItem from "../../budgets/_components/BudgetItem";
import AddExpense from "../_components/AddExpense";
import ExpenseListTable from "../_components/ExpenseListTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EditBudget from "../_components/EditBudget";

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

  const deleteBudget = async () => {
    try {
      await db.delete(Expenses).where(eq(Expenses.budgetId, budgetId));
      await db.delete(Budgets).where(eq(Budgets.id, budgetId));

      toast.success("Budget category deleted");
      router.replace("/dashboard/budgets");
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-all duration-200 active:scale-95 shadow-xs"
            aria-label="Back to budgets"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {budgetInfo?.name || "Budget Details"}
            </h2>
            <p className="text-xs text-muted-foreground">Manage logged transactions for this category</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {budgetInfo && (
            <EditBudget
              budgetInfo={budgetInfo}
              refreshData={() => getBudgetInfo(budgetId)}
            />
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2 rounded-xl shadow-xs font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Budget</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Delete this budget?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-xs">
                  This will permanently delete this budget category and all associated expense records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteBudget}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
                >
                  Confirm Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Overview & Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgetInfo ? (
          <BudgetItem budget={budgetInfo} />
        ) : (
          <div className="h-44 w-full bg-muted/60 rounded-2xl border border-border/40 animate-pulse" />
        )}

        <AddExpense
          budgetId={budgetId}
          refreshData={() => {
            getBudgetInfo(budgetId);
            getExpensesList(budgetId);
          }}
        />
      </div>

      {/* Expense List Table */}
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
