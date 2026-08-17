"use client";

import React from "react";
import {
  LayoutGrid,
  PieChart,
  Clock,
  ShoppingCart,
  List,
  TrendingDown,
  X,
  Wallet,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const menuList = [
  { id: 1, name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
  { id: 2, name: "Timeframe", icon: Clock, path: "/dashboard/timeframe" },
  { id: 3, name: "Incomes", icon: TrendingDown, path: "/dashboard/incomes" },
  { id: 4, name: "Budgets", icon: List, path: "/dashboard/budgets" },
  { id: 5, name: "Expenses", icon: ShoppingCart, path: "/dashboard/expenses2" },
  { id: 6, name: "Statistics", icon: PieChart, path: "/dashboard/statistics" },
];

export default function Sidebar({ isMobile = false, closeSidebar }) {
  const { user } = useUser();
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobile && closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <aside
      className={`flex flex-col h-full bg-card/95 backdrop-blur-xl border-r border-border/80 text-card-foreground transition-all duration-300 ${
        isMobile ? "w-72 shadow-2xl" : "w-64"
      }`}
    >
      {/* Header / Brand */}
      <div className="p-6 flex items-center justify-between border-b border-border/60">
        <Link href="/dashboard" onClick={handleLinkClick} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/20 shadow-xs">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Finance<span className="text-primary font-extrabold ml-1">Tracker</span>
            </span>
            <p className="text-[11px] text-muted-foreground font-medium">Smart Wealth Manager</p>
          </div>
        </Link>

        {isMobile && (
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Overview & Tools
        </div>
        {menuList.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link key={item.id} href={item.path} onClick={handleLinkClick}>
              <div
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/70 active:scale-[0.98]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                  }`}
                />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground/90 animate-pulse" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile & Theme Toggle */}
      <div className="p-4 border-t border-border/60 bg-muted/20 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground font-medium">Appearance</span>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/60 shadow-xs">
          <UserButton afterSignOutUrl="/" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.fullName || "My Account"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
