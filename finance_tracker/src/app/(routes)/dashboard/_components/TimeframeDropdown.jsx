"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { Calendar, ChevronDown, Check, CheckSquare, Square, Clock } from "lucide-react";
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";
import { db } from "../../../../../utils/dbConfig";
import { Periods } from "../../../../../utils/schema";
import { eq, desc } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import Link from "next/link";

export default function TimeframeDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [periodList, setPeriodList] = useState([]);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);
  const { selectedTimeFrames = [], setSelectedTimeFrames } = useContext(TimeFrameContext);
  const { user } = useUser();
  const dropdownRef = useRef(null);

  // Fetch all user timeframes from database
  const fetchPeriods = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    try {
      setIsLoadingPeriods(true);
      const res = await db
        .select()
        .from(Periods)
        .where(eq(Periods.createdBy, user.primaryEmailAddress.emailAddress))
        .orderBy(desc(Periods.id));
      setPeriodList(res || []);
    } catch (e) {
      console.error("Error fetching periods:", e);
    } finally {
      setIsLoadingPeriods(false);
    }
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchPeriods();
    }
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTogglePeriod = async (periodId) => {
    try {
      await setSelectedTimeFrames(periodId);
    } catch (error) {
      console.error("Error toggling timeframe:", error);
      toast.error("Failed to update timeframe selection");
    }
  };

  const isAllSelected =
    periodList.length > 0 &&
    periodList.every((p) => selectedTimeFrames.includes(p.id));

  const handleSelectAllToggle = async () => {
    try {
      if (isAllSelected) {
        // Deselect all
        for (const p of periodList) {
          if (selectedTimeFrames.includes(p.id)) {
            await setSelectedTimeFrames(p.id);
          }
        }
        toast.info("Cleared all timeframe selections");
      } else {
        // Select all
        for (const p of periodList) {
          if (!selectedTimeFrames.includes(p.id)) {
            await setSelectedTimeFrames(p.id);
          }
        }
        toast.success("Selected all timeframes");
      }
    } catch (error) {
      console.error("Error toggling all timeframes:", error);
    }
  };

  const selectedCount = selectedTimeFrames.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Button: Always "Timeframe" with active badge and arrow */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchPeriods();
        }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 shadow-xs ${
          isOpen || selectedCount > 0
            ? "bg-card border-primary/60 text-foreground ring-2 ring-primary/20"
            : "bg-background border-border/80 text-foreground hover:bg-accent/60"
        }`}
        title="Select Timeframe Windows"
      >
        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>Timeframe</span>

        {selectedCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-md bg-primary/15 text-primary text-[10px] font-bold">
            {selectedCount}
          </span>
        )}

        <ChevronDown
          className={`w-3 h-3 text-muted-foreground transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-card border border-border shadow-2xl z-50 p-3 space-y-3 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Top Bar: Title & Select All Action */}
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <div>
              <h4 className="text-xs font-bold text-foreground">Timeframe Windows</h4>
              <p className="text-[10px] text-muted-foreground">
                {selectedCount} of {periodList.length} active
              </p>
            </div>

            {periodList.length > 0 && (
              <button
                onClick={handleSelectAllToggle}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                {isAllSelected ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>

          {/* Scrollable List of Timeframes with Checkboxes */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {isLoadingPeriods && periodList.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Loading timeframes...
              </div>
            ) : periodList.length > 0 ? (
              periodList.map((period) => {
                const isSelected = selectedTimeFrames.includes(period.id);
                return (
                  <div
                    key={period.id}
                    onClick={() => handleTogglePeriod(period.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none group ${
                      isSelected
                        ? "bg-primary/10 border-primary/40 text-foreground"
                        : "bg-background/60 border-border/60 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    }`}
                  >
                    {/* Checkbox on the Left */}
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/40 bg-card group-hover:border-primary/60"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {/* Period Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold truncate ${
                            isSelected ? "text-foreground" : "text-foreground/80"
                          }`}
                        >
                          {period.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground capitalize font-semibold shrink-0">
                          {period.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {period.startDate} to {period.endDate}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground space-y-2">
                <p>No timeframe windows created yet.</p>
                <Link
                  href="/dashboard/timeframe"
                  onClick={() => setIsOpen(false)}
                  className="inline-block px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                >
                  Create Timeframe
                </Link>
              </div>
            )}
          </div>

          {/* Footer Link to Full Timeframe Page */}
          <div className="pt-1 border-t border-border/60">
            <Link
              href="/dashboard/timeframe"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-muted/50 hover:bg-accent text-foreground text-xs font-semibold border border-border/60 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Manage Timeframe Windows</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
