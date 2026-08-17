"use client";

import React, { useEffect, useState, useContext } from "react";
import CreateIncomes from "./CreateIncomes";
import { db } from "../../../../../../utils/dbConfig";
import { desc, eq, getTableColumns, sql, and, inArray } from "drizzle-orm";
import { Incomes, Expenses, Periods } from "../../../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import IncomeItem from "./IncomeItem";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";
import { Calendar, WalletCards } from "lucide-react";

export default function IncomeList() {
  const [incomelist, setIncomelist] = useState([]);
  const [periodNames, setPeriodNames] = useState({});
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
      getIncomelist();
    } else if (user && (!selectedTimeFrames || selectedTimeFrames.length === 0)) {
      router.replace("/dashboard/timeframe");
      toast("Choose A TimeFrame First", { duration: 6000 });
    }
  }, [user, selectedTimeFrames]);

  const getIncomelist = async () => {
    try {
      setIsLoading(true);
      if (!selectedTimeFrames || selectedTimeFrames.length === 0) return;

      const result = await db
        .select({
          ...getTableColumns(Incomes),
          totalSpend: sql`COALESCE(sum(${Expenses.amount}), 0)`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
          periodId: Incomes.periodId,
        })
        .from(Incomes)
        .leftJoin(Expenses, eq(Incomes.id, Expenses.budgetId))
        .where(
          and(
            eq(Incomes.createdBy, user?.primaryEmailAddress?.emailAddress),
            inArray(Incomes.periodId, selectedTimeFrames)
          )
        )
        .groupBy(Incomes.id)
        .orderBy(desc(Incomes.id));

      setIncomelist(result);
    } catch (error) {
      console.error("Error fetching incomes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupIncomesByPeriod = () => {
    return selectedTimeFrames.map((periodId) => ({
      periodId,
      periodName: periodNames[periodId] || `Period ${periodId}`,
      incomes: incomelist.filter((income) => income.periodId === periodId),
    }));
  };

  return (
    <div className="space-y-8">
      <CreateIncomes refreshData={getIncomelist} />

      {selectedTimeFrames.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border/80 space-y-3">
          <WalletCards className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No Timeframe Selected</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Please select at least one active timeframe to view and track your income streams.
          </p>
        </div>
      ) : (
        groupIncomesByPeriod().map((periodGroup) => (
          <div key={periodGroup.periodId} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <h3 className="text-lg font-bold text-foreground">{periodGroup.periodName}</h3>
              <span className="text-xs text-muted-foreground font-medium ml-auto">
                {periodGroup.incomes.length} {periodGroup.incomes.length === 1 ? "stream" : "streams"}
              </span>
            </div>

            {periodGroup.incomes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {periodGroup.incomes.map((budget, index) => (
                  <IncomeItem
                    incomeId={budget.id}
                    budget={budget}
                    key={index}
                    refreshData={getIncomelist}
                  />
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
                No income sources created for this timeframe yet. Use the create button above to start.
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}