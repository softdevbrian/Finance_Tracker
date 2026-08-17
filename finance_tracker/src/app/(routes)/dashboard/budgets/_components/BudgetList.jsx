"use client";

import React, { useEffect, useState, useContext } from "react";
import CreateBudget from "./CreateBudget";
import { db } from "../../../../../../utils/dbConfig";
import { desc, eq, getTableColumns, sql, and, inArray } from "drizzle-orm";
import { Budgets, Expenses, Periods } from "../../../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import BudgetItem from "./BudgetItem";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";
import { Calendar, WalletCards } from "lucide-react";

export default function BudgetList() {
  const [periodNames, setPeriodNames] = useState({});
  const [budgetList, setBudgetList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const router = useRouter();
  const { selectedTimeFrames } = useContext(TimeFrameContext);

  useEffect(() => {
    const fetchPeriodNames = async () => {
      if (selectedTimeFrames && selectedTimeFrames.length > 0) {
        const periodNamesResult = await db
          .select({
            id: Periods.id,
            name: Periods.name,
          })
          .from(Periods)
          .where(inArray(Periods.id, selectedTimeFrames));

        const namesMap = periodNamesResult.reduce((acc, period) => {
          acc[period.id] = period.name;
          return acc;
        }, {});

        setPeriodNames(namesMap);
      }
    };

    if (user) {
      fetchPeriodNames();
    }
  }, [user, selectedTimeFrames]);

  useEffect(() => {
    if (user && selectedTimeFrames && selectedTimeFrames.length > 0) {
      getBudgetList();
    } else if (user && (!selectedTimeFrames || selectedTimeFrames.length === 0)) {
      router.replace("/dashboard/timeframe");
      toast("Choose A TimeFrame First", { duration: 6000 });
    }
  }, [user, selectedTimeFrames]);

  const getBudgetList = async () => {
    try {
      setIsLoading(true);
      if (!selectedTimeFrames || selectedTimeFrames.length === 0) return;

      const result = await db
        .select({
          ...getTableColumns(Budgets),
          totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
          periodId: Budgets.periodId,
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(
          and(
            eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress),
            inArray(Budgets.periodId, selectedTimeFrames)
          )
        )
        .groupBy(Budgets.id)
        .orderBy(desc(Budgets.id));

      setBudgetList(result);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupBudgetsByPeriod = () => {
    return selectedTimeFrames.map((periodId) => ({
      periodId,
      periodName: periodNames[periodId] || `Period ${periodId}`,
      budgets: budgetList.filter((budget) => budget.periodId === periodId),
    }));
  };

  return (
    <div className="space-y-8">
      <CreateBudget refreshData={getBudgetList} />

      {selectedTimeFrames.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border/80 space-y-3">
          <WalletCards className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No Timeframe Selected</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Please select at least one active timeframe to view and manage your budget allocations.
          </p>
        </div>
      ) : (
        groupBudgetsByPeriod().map((periodGroup) => (
          <div key={periodGroup.periodId} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-lg font-bold text-foreground">{periodGroup.periodName}</h3>
              <span className="text-xs text-muted-foreground font-medium ml-auto">
                {periodGroup.budgets.length} {periodGroup.budgets.length === 1 ? "category" : "categories"}
              </span>
            </div>

            {periodGroup.budgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {periodGroup.budgets.map((budget, index) => (
                  <BudgetItem budget={budget} key={index} />
                ))}
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((item, index) => (
                  <div
                    key={index}
                    className="w-full bg-muted/60 rounded-2xl h-36 border border-border/40 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-card/50 border border-dashed border-border text-muted-foreground text-xs">
                No budget categories created for this timeframe yet. Use the create button above to start.
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}