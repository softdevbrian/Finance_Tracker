"use client";

import React from "react";
import { CreditCard, TrendingDown, ShoppingCart, PiggyBank, Target } from "lucide-react";
import formatNumber from "../../../../../../utils";

export default function MetricCardsRow({ totalBudget = 0, totalIncome = 0, totalSpend = 0 }) {
  const actualSavings = totalIncome - totalSpend;
  const isOverSpend = totalSpend > totalIncome && totalIncome > 0;
  const isOverBudget = totalSpend > totalBudget && totalBudget > 0;

  const cards = [
    {
      title: "Total Budget",
      amount: totalBudget,
      icon: Target,
      iconStyle: "bg-blue-500/10 text-blue-400 border border-blue-500/25",
      badge: "Target Limit",
      badgeStyle: "text-muted-foreground bg-muted",
    },
    {
      title: "Total Income",
      amount: totalIncome,
      icon: TrendingDown,
      iconStyle: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
      badge: "Inflow",
      badgeStyle: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Total Expenses",
      amount: totalSpend,
      icon: ShoppingCart,
      iconStyle: isOverSpend
        ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
        : "bg-amber-500/10 text-amber-400 border border-amber-500/25",
      badge: isOverSpend ? "Over Income" : isOverBudget ? "Over Budget" : "Spend Outflow",
      badgeStyle: isOverSpend || isOverBudget ? "text-rose-500 bg-rose-500/10 font-bold" : "text-muted-foreground bg-muted",
    },
    {
      title: "Net Savings",
      amount: actualSavings,
      icon: PiggyBank,
      iconStyle:
        actualSavings >= 0
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
          : "bg-rose-500/10 text-rose-400 border border-rose-500/25",
      badge: actualSavings >= 0 ? "Surplus" : "Deficit",
      badgeStyle:
        actualSavings >= 0
          ? "text-emerald-500 bg-emerald-500/10 font-bold"
          : "text-rose-500 bg-rose-500/10 font-bold",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="p-5 rounded-2xl bg-card/95 border border-border/80 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            {/* Top row: Title and Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconStyle}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Main Value */}
            <div className="mt-2">
              <h3 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground">
                KSh {formatNumber(card.amount)}
              </h3>
            </div>

            {/* Status Footer */}
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${card.badgeStyle}`}>
                {card.badge}
              </span>
              <span className="text-[11px] text-muted-foreground">Active Period</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
