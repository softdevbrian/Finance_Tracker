"use client";

import React from "react";
import {
  LayoutGrid,
  Receipt,
  WalletCards,
  TrendingDown,
  Clock,
  BarChart3,
  LogOut,
  X,
  Wallet,
  Sparkles,
} from "lucide-react";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ThemeCustomizer from "@/components/theme-customizer";

const menuList = [
  { id: 1, name: "Overview", icon: LayoutGrid, path: "/dashboard" },
  { id: 2, name: "Transactions", icon: Receipt, path: "/dashboard/expenses2" },
  { id: 3, name: "Budgets", icon: WalletCards, path: "/dashboard/budgets" },
  { id: 4, name: "Incomes", icon: TrendingDown, path: "/dashboard/incomes" },
  { id: 5, name: "Timeframe", icon: Clock, path: "/dashboard/timeframe" },
  { id: 6, name: "Statistics", icon: BarChart3, path: "/dashboard/statistics" },
];

export default function Sidebar({ isMobile = false, closeSidebar }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobile && closeSidebar) {
      closeSidebar();
    }
  };

  const userName = user?.fullName || "User Account";

  return (
    <aside
      className={`flex flex-col h-full bg-card/95 backdrop-blur-xl border-r border-border/80 text-card-foreground transition-all duration-300 ${
        isMobile ? "w-72 shadow-2xl" : "w-60 xl:w-64"
      }`}
    >
      {/* Top Header / Brand Logo */}
      <div className="p-5 flex items-center justify-between border-b border-border/60">
        <Link href="/dashboard" onClick={handleLinkClick} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(16,185,129,0.25)] group-hover:scale-105 transition-all">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-foreground">
              Finance<span className="text-primary font-black ml-1">Tracker</span>
            </span>
          </div>
        </Link>

        {isMobile && (
          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User Profile Card */}
      <div className="p-3 mx-3 mt-3 rounded-2xl bg-background/60 border border-border/70 flex items-center gap-3 shadow-xs">
        <div className="relative">
          <UserButton afterSignOutUrl="/" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{userName}</p>
          <div className="flex items-center gap-1 text-[10px] text-primary font-semibold">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Active Account</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuList.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link key={item.id} href={item.path} onClick={handleLinkClick}>
              <div
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-border/60 bg-muted/20 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground font-medium">Theme Palette</span>
          <ThemeCustomizer />
        </div>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
