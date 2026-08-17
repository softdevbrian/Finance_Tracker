"use client";

import React from "react";
import Link from "next/link";
import { Receipt, ArrowRight } from "lucide-react";
import formatNumber from "../../../../../../utils";

export default function RecentTransactionsWidget({ expensesList = [] }) {
  const displayExpenses = expensesList.slice(0, 4);

  return (
    <div className="p-5 rounded-2xl bg-card/95 border border-border/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-base font-bold text-foreground">Recent Transactions</h3>
          <Link
            href="/dashboard/expenses2"
            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {displayExpenses.length > 0 ? (
          <div className="space-y-2.5">
            {displayExpenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-foreground truncate">{exp.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{exp.createdAt || "Recent"}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-rose-500">
                    -KSh {formatNumber(exp.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl my-auto">
            No expenses logged in this timeframe yet.
          </div>
        )}
      </div>

      <div className="pt-4">
        <Link href="/dashboard/expenses">
          <button className="w-full py-2.5 rounded-xl bg-muted/60 hover:bg-accent text-foreground text-xs font-bold border border-border/80 transition-all hover:scale-[1.01] active:scale-95 shadow-xs text-center">
            Combined Expense Log
          </button>
        </Link>
      </div>
    </div>
  );
}
