import React from "react";
import EditIncome from "./EditIncome";
import DeleteIncome from "./DeleteIncome";
import formatNumber from "../../../../../../utils";

export default function IncomeItem({ incomeId, budget, refreshData }) {
  const amount = parseFloat(budget?.amount || 0);

  return (
    <div className="p-5 rounded-2xl bg-card border border-border/80 hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between h-[170px] group">
      {/* Top Details */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
            {budget?.icon || "💵"}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm md:text-base text-foreground truncate group-hover:text-emerald-500 transition-colors">
              {budget.name}
            </h4>
            <span className="text-xs text-muted-foreground font-medium">Income Source</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs text-muted-foreground font-medium block">Amount</span>
          <span className="font-bold text-sm md:text-base text-emerald-500">
            +Ksh.{formatNumber(amount)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <div className="scale-90 origin-left">
          <EditIncome incomeInfo={budget} refreshData={refreshData} />
        </div>
        <div className="scale-90 origin-right">
          <DeleteIncome incomeId={incomeId} refreshData={refreshData} />
        </div>
      </div>
    </div>
  );
}
