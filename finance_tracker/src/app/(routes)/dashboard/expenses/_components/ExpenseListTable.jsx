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
import { THEME_PDF_PALETTES } from "../../_components/ChartExport";

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
      const activeThemeKey = (typeof window !== "undefined" && localStorage.getItem("ft_user_theme")) || "emerald";
      const palette = THEME_PDF_PALETTES[activeThemeKey] || THEME_PDF_PALETTES.emerald;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Top Themed Banner
      doc.setFillColor(...palette.primary);
      doc.rect(0, 0, pageWidth, 16, "F");

      doc.setFillColor(...palette.darkHeader);
      doc.rect(0, 16, pageWidth, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text("FINANCE TRACKER", 14, 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("EXPENSE AUDIT LOG", pageWidth - 14, 11, { align: "right" });

      // Header Info
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text(`${budgetName} Expenditures`, 14, 28);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total Transactions: ${sortedExpenses.length}`, 14, 34);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 14, 34, { align: "right" });

      const tableRows = sortedExpenses.map((expense, idx) => [
        `#${idx + 1}`,
        expense.name,
        `KSh ${formatNumber(expense.amount || 0)}`,
        expense.createdAt || "N/A",
      ]);

      const total = sortedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

      doc.autoTable({
        startY: 40,
        head: [["Item", "Expense Description", "Amount", "Date Recorded"]],
        body: tableRows,
        theme: "striped",
        headStyles: {
          fillColor: palette.darkHeader,
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3.5,
        },
        columnStyles: {
          0: { halign: "center", width: 14 },
          1: { fontStyle: "bold" },
          2: { halign: "right", fontStyle: "bold" },
          3: { halign: "center" },
        },
      });

      const finalY = doc.previousAutoTable.finalY || 40;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, finalY + 6, pageWidth - 28, 12, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text("Total Outflow Sum:", 18, finalY + 14);

      doc.setTextColor(...palette.primary);
      doc.text(`KSh ${formatNumber(total)}`, pageWidth - 18, finalY + 14, { align: "right" });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.text(
          `Finance Tracker  •  Confidential  •  Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        );
      }

      doc.save(`${budgetName}_Expenses_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Expense PDF exported successfully");
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

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-muted-foreground">Total Spent:</span>
            <p className="text-sm font-bold text-foreground">KSh {formatNumber(totalSpent)}</p>
          </div>
          {sortedExpenses.length > 0 && (
            <button
              onClick={exportToPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-accent text-foreground text-xs font-semibold border border-border/80 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs"
              title="Export to PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-primary" />
              <span>Export PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 text-xs text-muted-foreground uppercase">
              <th className="py-3 px-3 font-semibold">Name</th>
              <th className="py-3 px-3 font-semibold">Amount</th>
              <th className="py-3 px-3 font-semibold">Date</th>
              <th className="py-3 px-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sortedExpenses.length > 0 ? (
              sortedExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-muted/40 transition-colors group text-xs sm:text-sm"
                >
                  <td className="py-3 px-3 font-medium text-foreground">
                    {expense.name}
                  </td>
                  <td className="py-3 px-3 font-semibold text-rose-500">
                    KSh {formatNumber(expense.amount)}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground text-xs">
                    {expense.createdAt}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => deleteExpense(expense)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-80 group-hover:opacity-100"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">
                  No expenses found for this selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}