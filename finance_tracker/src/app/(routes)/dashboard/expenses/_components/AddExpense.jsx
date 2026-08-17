"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "../../../../../../utils/dbConfig";
import { Budgets, Expenses, Periods } from "../../../../../../utils/schema";
import { Loader2, PlusCircle, CalendarCheck, AlertCircle } from "lucide-react";
import moment from "moment";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { eq } from "drizzle-orm";

export default function AddExpense({ budgetId, refreshData }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [periodDates, setPeriodDates] = useState(null);
  const [validationInfo, setValidationInfo] = useState(null);

  useEffect(() => {
    const fetchPeriodDates = async () => {
      try {
        const budget = await db
          .select({ periodId: Budgets.periodId })
          .from(Budgets)
          .where(eq(Budgets.id, budgetId))
          .limit(1);

        if (budget && budget[0]) {
          const period = await db
            .select({
              startDate: Periods.startDate,
              endDate: Periods.endDate,
            })
            .from(Periods)
            .where(eq(Periods.id, budget[0].periodId))
            .limit(1);

          if (period && period[0]) {
            setPeriodDates(period[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching period dates:", error);
      }
    };

    fetchPeriodDates();
  }, [budgetId]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  useEffect(() => {
    if (!date || !periodDates) return;

    try {
      const expenseDate = moment(date);
      const startDate = moment(periodDates.startDate, "YYYY-MM-DD");
      const endDate = moment(periodDates.endDate, "YYYY-MM-DD");
      const isValid = expenseDate.isBetween(startDate, endDate, "day", "[]");

      setValidationInfo({
        isValid,
        message: isValid
          ? "Date is within active period"
          : `Date must be between ${periodDates.startDate} and ${periodDates.endDate}`,
      });
    } catch (error) {
      setValidationInfo({ isValid: false, message: "Invalid date format" });
    }
  }, [date, periodDates]);

  const addNewExpense = async () => {
    if (!validationInfo?.isValid) {
      toast.error(
        `Expense date must fall within ${periodDates.startDate} to ${periodDates.endDate}`
      );
      return;
    }

    setLoading(true);
    try {
      const formattedDate = moment(date).format("DD/MM/YYYY");

      const result = await db
        .insert(Expenses)
        .values({
          name: name,
          amount: amount,
          budgetId: budgetId,
          createdAt: formattedDate,
        })
        .returning({ insertedId: Expenses.id });

      if (result) {
        if (refreshData) await refreshData();
        toast.success("Expense logged successfully!");
        setAmount("");
        setName("");
        setDate(new Date().toISOString().split("T")[0]);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to record expense");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = Boolean(name && amount && date && validationInfo?.isValid && !loading);

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <PlusCircle className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold text-foreground">Log New Expense</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
            Expense Name
          </label>
          <Input
            placeholder="e.g. Weekly Groceries"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background border-border text-foreground rounded-xl"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
            Amount (Ksh)
          </label>
          <Input
            type="number"
            placeholder="e.g. 2500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background border-border text-foreground rounded-xl"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
            Transaction Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-background border-border text-foreground rounded-xl"
          />

          {validationInfo && (
            <div className={`mt-2 flex items-center gap-1.5 text-xs ${
              validationInfo.isValid ? "text-primary" : "text-amber-500"
            }`}>
              {validationInfo.isValid ? (
                <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{validationInfo.message}</span>
            </div>
          )}
        </div>

        <Button
          disabled={!isFormValid}
          onClick={addNewExpense}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-xs transition-all duration-200"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log Expense Entry"}
        </Button>
      </div>
    </div>
  );
}