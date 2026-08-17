"use client";

import React, { useEffect, useContext } from "react";
import Sidebar from "./_components/Sidebar";
import DashboardHeader from "./_components/DashboardHeader";
import { db } from "../../../../utils/dbConfig";
import { Budgets, Incomes, Expenses, PeriodSelected } from "../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, and, inArray } from "drizzle-orm";
import { useRouter } from "next/navigation";
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";

export default function DashboardLayout({ children }) {
  const { selectedTimeFrames } = useContext(TimeFrameContext);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      checkUserBudgets();
    }
  }, [user]);

  const checkUserBudgets = async () => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      // Fetch the selected period for the user
      const selectedPeriods = await db
        .select()
        .from(PeriodSelected)
        .where(eq(PeriodSelected.createdBy, user?.primaryEmailAddress?.emailAddress));

      if (!selectedPeriods || selectedPeriods.length === 0) {
        router.replace("/dashboard/timeframe");
        return;
      }

      // Fetch incomes for the current user
      const incomes = await db
        .select()
        .from(Incomes)
        .where(eq(Incomes.createdBy, user?.primaryEmailAddress?.emailAddress));

      if (incomes.length === 0) {
        router.replace("/dashboard/incomes");
        return;
      }

      // Fetch budgets for the current user
      const budgets = await db
        .select()
        .from(Budgets)
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));

      if (budgets.length === 0) {
        router.replace("/dashboard/budgets");
        return;
      }
    } catch (error) {
      console.error("Error checking user setup:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 hidden md:block w-64 z-40">
        <Sidebar isMobile={false} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-8 bg-background/50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
