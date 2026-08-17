"use client";

import React, { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import ThemeCustomizer from "@/components/theme-customizer";
import TimeframeDropdown from "./TimeframeDropdown";

export default function DashboardHeader() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { user } = useUser();
  const pathname = usePathname();

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "User";

  // Dynamic header titles and subtitles based on the active route
  const getRouteMeta = () => {
    if (pathname === "/dashboard") {
      return {
        title: "Dashboard",
        subtitle: `Welcome back, ${firstName}! 👋`,
      };
    }
    if (pathname.startsWith("/dashboard/budgets")) {
      return {
        title: "Budgets",
        subtitle: "Manage category limits and spending thresholds",
      };
    }
    if (pathname.startsWith("/dashboard/incomes")) {
      return {
        title: "Income Streams",
        subtitle: "Track revenue inflows, salaries, and cash sources",
      };
    }
    if (pathname.startsWith("/dashboard/expenses")) {
      return {
        title: "Transactions",
        subtitle: "Review, filter, and log expenditure records",
      };
    }
    if (pathname.startsWith("/dashboard/timeframe")) {
      return {
        title: "Timeframe Windows",
        subtitle: "Configure and switch active accounting periods",
      };
    }
    if (pathname.startsWith("/dashboard/statistics")) {
      return {
        title: "Reports & Analytics",
        subtitle: "Deep-dive visual charts and financial diagnostics",
      };
    }
    return {
      title: "Finance Tracker",
      subtitle: `Welcome back, ${firstName}! 👋`,
    };
  };

  const { title, subtitle } = getRouteMeta();

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-card/85 backdrop-blur-xl border-b border-border/80 px-4 md:px-6 py-3 transition-colors">
        <div className="max-w-[1550px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Mobile trigger & Dynamic Route Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-border bg-card text-foreground"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground transition-all">
                {title}
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Right: Multi-select Checkbox Timeframe Dropdown + Theme + User */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Interactive Multi-Select Timeframe Dropdown */}
            <TimeframeDropdown />

            {/* Theme Personalizer */}
            <ThemeCustomizer />

            {/* User Profile */}
            <div className="pl-1 border-l border-border/60">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
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
