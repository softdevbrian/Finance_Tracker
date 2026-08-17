import React from "react";
import IncomeList from "./_components/IncomeList";

export default function IncomePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Income Streams
          </h2>
          <p className="text-sm text-muted-foreground">
            Track revenue inflows, salaries, and recurring cash sources
          </p>
        </div>
      </div>
      <IncomeList />
    </div>
  );
}
