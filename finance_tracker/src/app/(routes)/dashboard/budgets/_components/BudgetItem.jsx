import Link from "next/link";
import React from "react";
import formatNumber from "../../../../../../utils";

export default function BudgetItem({ budget }) {
  const amount = parseFloat(budget?.amount || 0);
  const totalSpend = parseFloat(budget?.totalSpend || 0);
  const remaining = amount - totalSpend;
  const perc = amount > 0 ? (totalSpend / amount) * 100 : 0;
  const clampedPerc = Math.min(100, Math.max(0, perc));

  const getStatusColor = () => {
    if (perc >= 90) return { bar: "bg-rose-500", text: "text-rose-500", badge: "bg-rose-500/10 text-rose-500" };
    if (perc >= 65) return { bar: "bg-amber-500", text: "text-amber-500", badge: "bg-amber-500/10 text-amber-500" };
    return { bar: "bg-primary", text: "text-primary", badge: "bg-primary/10 text-primary" };
  };

  const status = getStatusColor();

  return (
    <Link href={"/dashboard/expenses/" + budget?.id}>
      <div className="p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer group space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-muted/80 border border-border/60 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
              {budget?.icon || "🏷️"}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm md:text-base text-foreground truncate group-hover:text-primary transition-colors">
                {budget.name}
              </h4>
              <p className="text-xs text-muted-foreground font-medium">
                {budget.totalItem || 0} expenses logged
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-muted-foreground font-medium block">Allocated</span>
            <span className="font-bold text-sm md:text-base text-foreground">
              Ksh.{formatNumber(amount)}
            </span>
          </div>
        </div>

        {/* Progress Bar & Spend Metrics */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className={status.text}>
              Ksh.{formatNumber(totalSpend)} ({clampedPerc.toFixed(0)}%)
            </span>
            <span className="text-muted-foreground">
              Ksh.{formatNumber(remaining >= 0 ? remaining : 0)} left
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
              style={{ width: `${clampedPerc}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
