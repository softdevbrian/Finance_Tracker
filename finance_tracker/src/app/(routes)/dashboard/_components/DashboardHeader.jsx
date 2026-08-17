"use client";

import React, { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Menu, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const routeTitles = {
  "/dashboard": "Financial Dashboard",
  "/dashboard/timeframe": "Timeframe Management",
  "/dashboard/incomes": "Income Tracker",
  "/dashboard/budgets": "Budget Allocation",
  "/dashboard/expenses": "Expense Management",
  "/dashboard/expenses2": "Expense Management",
  "/dashboard/statistics": "Analytics & Statistics",
};

export default function DashboardHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user } = useUser();
  const pathname = usePathname();

  const currentTitle = routeTitles[pathname] || "Dashboard";

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-border/80 px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors">
        {/* Left Side: Mobile Menu Button & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="md:hidden p-2 rounded-xl border border-border/80 bg-card hover:bg-accent text-foreground transition-all duration-200 active:scale-95 shadow-xs"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Workspace
              </span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs text-muted-foreground font-medium">{currentTitle}</span>
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
              {currentTitle}
            </h1>
          </div>
        </div>

        {/* Right Side: Quick Theme Toggle & User Info */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-border/80">
            <UserButton afterSignOutUrl="/" />
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {user?.firstName || user?.fullName || "User"}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Active</span>
              </div>
            </div>
          </div>

          <div className="sm:hidden">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-300">
            <Sidebar isMobile={true} closeSidebar={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
