"use client";

import React from "react";
import Link from "next/link";
import formatNumber from "../../../../../../utils";

export default function BudgetProgressWidget({ budgetList = [] }) {
  const displayBudgets = budgetList.slice(0, 4);

  return (
    <div className="p-5 rounded-2xl bg-card/95 border border-border/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-base font-bold text-foreground">Budgets</h3>
          <span className="text-xs text-muted-foreground font-medium">
            {budgetList.length} total
          </span>
        </div>

        {displayBudgets.length > 0 ? (
          <div className="space-y-3.5">
            {displayBudgets.map((budget, index) => {
              const amount = Number(budget.amount || 0);
              const spent = Number(budget.totalSpend || 0);
              const perc = amount > 0 ? Math.round((spent / amount) * 100) : 0;
              const clampedPerc = Math.min(100, perc);

              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground truncate max-w-[140px] flex items-center gap-1.5">
                      <span>{budget.icon || "🏷️"}</span>
                      <span>{budget.name}</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-muted-foreground text-[11px]">
                        KSh {formatNumber(spent)} / {formatNumber(amount)}
                      </span>
                      <span className="font-bold text-foreground">{perc}%</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-muted/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        perc >= 90
                          ? "bg-rose-500"
                          : perc >= 70
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${clampedPerc}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-xl my-auto">
            No budget categories in this timeframe yet.
          </div>
        )}
      </div>

      <div className="pt-4">
        <Link href="/dashboard/budgets">
          <button className="w-full py-2.5 rounded-xl bg-muted/60 hover:bg-accent text-foreground text-xs font-bold border border-border/80 transition-all hover:scale-[1.01] active:scale-95 shadow-xs text-center">
            View All Budgets
          </button>
        </Link>
      </div>
    </div>
  );
}
