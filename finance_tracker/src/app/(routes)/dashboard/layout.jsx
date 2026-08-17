"use client";
import React, { useEffect, useContext } from "react";
import SideNav from "./_components/SideNav";
import DashboardHeader from "./_components/DashboardHeader";
import { db } from "../../../../utils/dbConfig";
import { Budgets, Periods, Incomes, Expenses, PeriodSelected } from "../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq, and, inArray } from "drizzle-orm";
import { useRouter } from "next/navigation";
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";

function DashboardLayout({ children }) {
  const { selectedTimeFrame, setSelectedTimeFrame } = useContext(TimeFrameContext);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      checkUserBudgets();
    }
  }, [user]);

  const checkUserBudgets = async () => {
    try {
      // Fetch the selected period for the user
      const selectedPeriod = await db
        .select()
        .from(PeriodSelected)
        .where(eq(PeriodSelected.createdBy, user?.primaryEmailAddress?.emailAddress))
        .then(rows => rows[0] || {});

      if (!selectedPeriod.periodId || selectedPeriod == 0) {
        // Route to timeframe setup if no period is selected
        router.replace("/dashboard/timeframe");
        return;
      }

      // Fetch incomes for the current user and selected period
      const incomes = await db
      .select()
      .from(Incomes)
      .where(
        and(
          eq(Incomes.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
      );

    if (incomes.length === 0) {
      // Route to incomes setup if incomes are empty
      router.replace("/dashboard/incomes");
      return;
    }

    // Fetch budgets for the current user and selected period
    const budgets = await db
      .select()
      .from(Budgets)
      .where(
        and(
          eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
      );


    if (budgets.length === 0) {
      // Route to budgets setup if budgets are empty
      router.replace("/dashboard/budgets");
      return;
    }

    // Fetch expenses for the current user and their budgets
    const expenses = await db
      .select()
      .from(Expenses)
      .where(
        inArray(Expenses.budgetId, budgets.map(b => b.id))
      );

    if (expenses.length === 0) {
      // Route to budgets page if expenses are empty
      router.replace("/dashboard/budgets");
      return;
    }

      // If all checks pass, allow the user to proceed
      //console.log("All checks passed.");
      router.replace("/dashboard");
    } catch (error) {
      console.error("Error checking user budgets:", error);
    }
  };

  return (
    <div>
      <div className="fixed md:w-64 hidden md:block">
        <SideNav />
      </div>
      <div className="md:ml-64">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
