"use client";

import { db } from "../../../../../../utils/dbConfig";
import { Expenses } from "../../../../../../utils/schema";
import { eq } from "drizzle-orm";
import { Trash2, FileDown, ReceiptText } from "lucide-react";
import React, { useMemo } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import formatNumber from "../../../../../../utils";

export default function ExpenseListTable({ budget, expensesList = [], refreshData }) {
  const budgetName = budget?.name || (Array.isArray(budget) ? "Recent" : "Combined");

  // Sort expenses by date (latest to earliest)
  const sortedExpenses = useMemo(() => {
    return [...expensesList].sort((a, b) => {
      try {
        const [dayA, monthA, yearA] = (a.createdAt || "").split("/");
        const [dayB, monthB, yearB] = (b.createdAt || "").split("/");
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateB - dateA;
      } catch (e) {
        return (b.id || 0) - (a.id || 0);
      }
    });
  }, [expensesList]);

  const deleteExpense = async (expense) => {
    try {
      const result = await db
        .delete(Expenses)
        .where(eq(Expenses.id, expense.id))
        .returning();

      if (result) {
        toast.success("Expense deleted");
        if (refreshData) await refreshData();
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(`${budgetName} Expense Report`, 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

      const tableRows = sortedExpenses.map((expense) => [
        expense.name,
        `Ksh. ${parseFloat(expense.amount || 0).toLocaleString()}`,
        expense.createdAt,
      ]);

      doc.autoTable({
        startY: 36,
        head: [["Expense Description", "Amount", "Date Logged"]],
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
        },
      });

      const total = sortedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      const finalY = doc.previousAutoTable.finalY || 36;
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`Total Expenditures: Ksh. ${total.toLocaleString()}`, 14, finalY + 10);

      doc.save(`${budgetName}_Expenses_Report.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const totalSpent = sortedExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
            <ReceiptText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{budgetName} Expenses</h3>
            <p className="text-xs text-muted-foreground">{sortedExpenses.length} transactions recorded</p>
          </div>
        </div>

        {sortedExpenses.length > 0 && (
          <button
            onClick={exportToPDF}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-muted hover:bg-accent text-foreground text-xs font-semibold border border-border transition-all hover:scale-105 active:scale-95 shadow-xs"
          >
            <FileDown className="w-4 h-4 text-primary" />
            <span>Export PDF</span>
          </button>
        )}
      </div>

      {/* Table Rows */}
      {sortedExpenses.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="min-w-[480px]">
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 rounded-xl bg-muted/60 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span className="col-span-5">Description</span>
              <span className="col-span-3 text-right">Amount</span>
              <span className="col-span-3 text-center">Date</span>
              <span className="col-span-1 text-center">Action</span>
            </div>

            <div className="divide-y divide-border/60">
              {sortedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm hover:bg-muted/30 transition-colors"
                >
                  <span className="col-span-5 font-medium text-foreground truncate">
                    {expense.name}
                  </span>
                  <span className="col-span-3 text-right font-semibold text-rose-500">
                    Ksh.{formatNumber(expense.amount)}
                  </span>
                  <span className="col-span-3 text-center text-xs text-muted-foreground">
                    {expense.createdAt}
                  </span>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => deleteExpense(expense)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Bar */}
          <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between px-2">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Total Logged Spend
            </span>
            <span className="text-base font-extrabold text-rose-500">
              Ksh.{formatNumber(totalSpent)}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl bg-muted/20 border border-dashed border-border/60 text-xs text-muted-foreground">
          No expenses logged yet.
        </div>
      )}
    </div>
  );
}