"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Sparkles } from "lucide-react";
import financialAdviceData from "@/app/financialAdviceData";

export default function AdvisorBanner({ totalBudget = 0, totalSpend = 0, totalIncome = 0 }) {
  const [adviceMessage, setAdviceMessage] = useState("");

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

  useEffect(() => {
    const scenario = determineScenario(totalBudget, totalSpend, totalIncome);
    const adviceList = financialAdviceData[scenario];

    if (!adviceList || adviceList.length === 0) {
      setAdviceMessage("Analyzing your income vs. budget allocation to provide tailored financial optimization tips...");
      return;
    }

    let index = 0;
    setAdviceMessage(adviceList[0]);

    const intervalId = setInterval(() => {
      index = (index + 1) % adviceList.length;
      setAdviceMessage(adviceList[index]);
    }, 20000);

    return () => clearInterval(intervalId);
  }, [totalBudget, totalSpend, totalIncome]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card/95 border border-border/80 shadow-xs relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-0 pointer-events-none" />

      <div className="relative z-10 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs group-hover:scale-105 transition-transform">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Finance Tracker Advisor
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              Live Insights
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-foreground/90 leading-relaxed transition-all duration-300">
            {adviceMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
