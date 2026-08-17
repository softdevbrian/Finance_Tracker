"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../../../../utils/dbConfig";
import { desc, eq, getTableColumns } from "drizzle-orm";
import { Periods } from "../../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import CreateTimeFrame from "./_components/CreateTimeFrame";
import { toast } from "sonner";
import TimeFramesCreated from "./_components/TimeFrameCreated";
import SelectAllButton from "./_components/SelectAllButton";

export default function TimeFramePage() {
  const [periodList, setPeriodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const getPeriodList = async () => {
    try {
      setLoading(true);
      const result = await db
        .select({
          ...getTableColumns(Periods),
        })
        .from(Periods)
        .where(eq(Periods.createdBy, user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(Periods.createdAt));

      const sortedPeriods = result.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });

      setPeriodList(sortedPeriods);
    } catch (error) {
      console.error("Error fetching periods:", error);
      toast.error("Failed to load timeframes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      getPeriodList();
    }
  }, [user?.primaryEmailAddress?.emailAddress]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Timeframe Windows
          </h2>
          <p className="text-sm text-muted-foreground">
            Select an active accounting period or create custom duration windows
          </p>
        </div>

        {periodList.length > 0 && <SelectAllButton periods={periodList} />}
      </div>

      {/* Create New Timeframe Window */}
      <CreateTimeFrame refreshData={getPeriodList} />

      {/* Timeframes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Recorded Periods</h3>
          <span className="text-xs text-muted-foreground font-medium">
            {periodList.length} total
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((item, index) => (
              <div
                key={index}
                className="w-full bg-muted/60 rounded-2xl h-44 border border-border/40 animate-pulse"
              />
            ))}
          </div>
        ) : periodList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TimeFramesCreated periods={periodList} refreshData={getPeriodList} />
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-card border border-dashed border-border text-muted-foreground text-xs">
            No timeframe windows found. Create your first period above to start allocating budgets.
          </div>
        )}
      </div>
    </div>
  );
}
