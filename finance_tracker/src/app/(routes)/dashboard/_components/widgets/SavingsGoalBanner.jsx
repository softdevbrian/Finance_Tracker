"use client";

import React from "react";
import Link from "next/link";
import { Trophy, ChevronRight, Sparkles } from "lucide-react";
import formatNumber from "../../../../../../utils";

export default function SavingsGoalBanner({ totalIncome = 0, totalSpend = 0, targetGoal = 200000 }) {
  const actualSavings = totalIncome - totalSpend;
  const savingsRate = totalIncome > 0 ? Math.round((actualSavings / totalIncome) * 100) : 18;
  const goalPerc = targetGoal > 0 ? Math.min(100, Math.max(0, Math.round((Math.max(0, actualSavings) / targetGoal) * 100))) : 70;

  return (
    <Link href="/dashboard/statistics">
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-card via-card to-primary/10 border border-primary/30 shadow-sm hover:border-primary/60 transition-all duration-300 group cursor-pointer">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Trophy & Headline */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">
                  Great Job! 🎉
                </h4>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                  <Sparkles className="w-2.5 h-2.5" />
                  Optimal Flow
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                You've saved <span className="font-bold text-emerald-400">+{Math.max(0, savingsRate)}%</span> more this period compared to your baseline.
              </p>
            </div>
          </div>

          {/* Center: Motivational text */}
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-foreground">Keep it up!</p>
            <p className="text-xs text-muted-foreground">You're on track to reach your annual savings milestone.</p>
          </div>

          {/* Right: Progress Bar & Goal Status */}
          <div className="flex items-center gap-4">
            <div className="w-full sm:w-60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">{goalPerc || 70}%</span>
                <span className="text-muted-foreground text-[11px]">
                  KSh {formatNumber(targetGoal)} Goal
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  style={{ width: `${goalPerc || 70}%` }}
                />
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
