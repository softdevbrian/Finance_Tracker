import React from "react";
import BudgetList from "./_components/BudgetList";

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Budget Categories
          </h2>
          <p className="text-sm text-muted-foreground">
            Set target spend thresholds and monitor remaining allocation in real time
          </p>
        </div>
      </div>
      <BudgetList />
    </div>
  );
}