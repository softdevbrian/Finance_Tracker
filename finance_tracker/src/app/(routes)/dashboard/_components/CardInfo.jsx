"use client";

import React, { useEffect, useState } from "react";
import formatNumber from "../../../../../utils";
import {
  CreditCard,
  ShoppingCart,
  List,
  TrendingDown,
  ArrowDownCircle,
  ShieldCheck,
  PiggyBank,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import financialAdviceData from "@/app/financialAdviceData";

export default function CardInfo({ budgetList = [], incomeList = [], currentUserEmail }) {
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [expectedSavings, setExpectedSavings] = useState(0);
  const [actualSavings, setActualSavings] = useState(0);
  const [financialAdvice, setFinancialAdvice] = useState("");

  useEffect(() => {
    if (incomeList.length && currentUserEmail) {
      const userIncome = incomeList
        .filter((income) => income.createdBy === currentUserEmail)
        .reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
      setTotalIncome(userIncome);
    }
  }, [incomeList, currentUserEmail]);

  const calculateCardInfo = (income) => {
    let totalBudget_ = 0;
    let totalSpend_ = 0;

    budgetList.forEach((element) => {
      totalBudget_ += parseFloat(element.amount || 0);
      totalSpend_ += parseFloat(element.totalSpend || 0);
    });

    const expectedSavings_ = income - totalBudget_;
    const actualSavings_ = income - totalSpend_;

    setTotalBudget(totalBudget_);
    setTotalSpend(totalSpend_);
    setExpectedSavings(expectedSavings_);
    setActualSavings(actualSavings_);
  };

  function determineScenario(tBudget, tSpend, tIncome) {
    if (tIncome > tBudget && tBudget > tSpend) return "scenario1";
    if (tBudget > tIncome && tIncome > tSpend) return "scenario2";
    if (tSpend > tBudget && tSpend < tIncome) return "scenario3";
    if (tSpend > tIncome && tSpend > tBudget) return "scenario4";
    if (tIncome > tSpend && tSpend > tBudget) return "scenario5";
    if (tIncome === tBudget && tSpend < tIncome) return "scenario6";
    if (tIncome === tSpend && tSpend > tBudget) return "scenario7";
    if (tSpend === tBudget && tIncome < tSpend) return "scenario8";
    if (tIncome === tSpend && tSpend === tBudget) return "scenario9";
    if (tSpend > tIncome && tSpend < tBudget) return "scenario10";
    if (tSpend > tIncome && tIncome === tBudget) return "scenario11";
    return "unknownScenario";
  }

  function provideAdvice(tBudget, tSpend, tIncome) {
    const scenario = determineScenario(tBudget, tSpend, tIncome);

    if (!scenario || !financialAdviceData[scenario] || financialAdviceData[scenario].length === 0) {
      setFinancialAdvice("Reviewing your balances... keep tracking your expenses to generate personalized recommendations.");
      return;
    }

    const adviceArray = financialAdviceData[scenario];
    let index = 0;
    setFinancialAdvice(adviceArray[0]);

    const intervalId = setInterval(() => {
      index = (index + 1) % adviceArray.length;
      setFinancialAdvice(adviceArray[index]);
    }, 20000);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 720000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }

  useEffect(() => {
    if (totalIncome > 0 || budgetList.length > 0) {
      calculateCardInfo(totalIncome);
    }
  }, [totalIncome, budgetList]);

  useEffect(() => {
    if (totalBudget > 0 || totalIncome > 0 || totalSpend > 0) {
      provideAdvice(totalBudget, totalSpend, totalIncome);
    }
  }, [totalBudget, totalIncome, totalSpend]);

  const isOverIncome = totalSpend > totalIncome && totalIncome > 0;
  const isOverBudget = totalSpend > totalBudget && totalBudget > 0;

  const cards = [
    {
      label: "Total Budget",
      value: `Ksh.${formatNumber(totalBudget)}`,
      icon: CreditCard,
      badge: "Target",
      iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      accent: "hover:border-blue-500/40",
    },
    {
      label: "Total Spend",
      value: `Ksh.${formatNumber(totalSpend)}`,
      icon: ShoppingCart,
      badge: isOverIncome ? "Over Income" : isOverBudget ? "Over Budget" : "Normal",
      iconBg: isOverIncome
        ? "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"
        : isOverBudget
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      accent: isOverIncome
        ? "border-rose-500/50 bg-rose-500/5"
        : isOverBudget
        ? "border-amber-500/50 bg-amber-500/5"
        : "hover:border-emerald-500/40",
    },
    {
      label: "No. of Budgets",
      value: budgetList?.length || 0,
      icon: List,
      badge: "Categories",
      iconBg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      accent: "hover:border-purple-500/40",
    },
    {
      label: "Total Income",
      value: `Ksh.${formatNumber(totalIncome)}`,
      icon: TrendingDown,
      badge: "Inflow",
      iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      accent: "hover:border-emerald-500/40",
    },
    {
      label: "Expected Savings",
      value: `Ksh.${formatNumber(expectedSavings)}`,
      icon: ArrowDownCircle,
      badge: "Projected",
      iconBg: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      accent: "hover:border-cyan-500/40",
    },
    {
      label: "Actual Savings",
      value: `Ksh.${formatNumber(actualSavings)}`,
      icon: PiggyBank,
      badge: actualSavings >= 0 ? "Surplus" : "Deficit",
      iconBg:
        actualSavings >= 0
          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
          : "bg-rose-500/10 text-rose-500 border-rose-500/20",
      accent:
        actualSavings >= 0
          ? "hover:border-amber-500/40"
          : "border-rose-500/40 bg-rose-500/5",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Financial Health Advisor Banner */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Smart Financial Advisor
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                  <Sparkles className="w-2.5 h-2.5" />
                  Live Heuristics
                </span>
              </div>
              <p className="text-sm md:text-base font-medium text-foreground/90 leading-relaxed max-w-3xl">
                {financialAdvice || "Analyzing income vs. spend patterns to optimize your savings rate..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      {budgetList?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`p-5 rounded-2xl bg-card border border-border/80 shadow-xs transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${card.accent}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    {card.value}
                  </h3>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {card.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((item, index) => (
            <div
              key={index}
              className="h-28 w-full bg-muted/60 animate-pulse rounded-2xl border border-border/40"
            />
          ))}
        </div>
      )}
    </div>
  );
}