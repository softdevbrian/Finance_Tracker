"use client";

import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "../../../../../../utils/dbConfig";
import { Periods } from "../../../../../../utils/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { PenBox, Sparkles } from "lucide-react";

export default function EditTimeFrame({ periodInfo, refreshData }) {
  const [name, setName] = useState(periodInfo?.name || "");
  const [type, setType] = useState(periodInfo?.type || "");
  const [startDate, setStartDate] = useState(periodInfo?.startDate || "");
  const [endDate, setEndDate] = useState(periodInfo?.endDate || "");

  const { user } = useUser();

  useEffect(() => {
    if (periodInfo) {
      setName(periodInfo.name);
      setType(periodInfo.type);
      setStartDate(periodInfo.startDate);
      setEndDate(periodInfo.endDate);
    }
  }, [periodInfo]);

  const calculateEndDate = (start, periodType) => {
    if (!start || !periodType) return "";
    const m = moment(start);
    switch (periodType) {
      case "weekly":
        return m.add(1, "weeks").format("YYYY-MM-DD");
      case "bi-weekly":
        return m.add(2, "weeks").format("YYYY-MM-DD");
      case "tri-weekly":
        return m.add(3, "weeks").format("YYYY-MM-DD");
      case "monthly":
        return m.add(1, "months").format("YYYY-MM-DD");
      case "2-months":
        return m.add(2, "months").format("YYYY-MM-DD");
      case "3-months":
        return m.add(3, "months").format("YYYY-MM-DD");
      case "4-months":
        return m.add(4, "months").format("YYYY-MM-DD");
      case "5-months":
        return m.add(5, "months").format("YYYY-MM-DD");
      case "6-months":
        return m.add(6, "months").format("YYYY-MM-DD");
      case "yearly":
        return m.add(1, "years").format("YYYY-MM-DD");
      default:
        return "";
    }
  };

  const handleTypeChange = (value) => {
    setType(value);
    if (startDate) {
      setEndDate(calculateEndDate(startDate, value));
    }
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    if (type) {
      setEndDate(calculateEndDate(value, type));
    }
  };

  const onUpdateTimeframe = async () => {
    try {
      const result = await db
        .update(Periods)
        .set({
          name: name,
          type: type,
          startDate: startDate,
          endDate: endDate,
        })
        .where(eq(Periods.id, periodInfo.id))
        .returning();

      if (result) {
        if (refreshData) await refreshData();
        toast.success("Timeframe updated successfully!");
      }
    } catch (error) {
      console.error("Error updating timeframe:", error);
      toast.error("Failed to update timeframe");
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl border-border bg-card text-foreground hover:bg-accent text-xs font-semibold shadow-xs"
          >
            <PenBox className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <DialogTitle className="text-foreground">Edit Timeframe Window</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-xs">
              Modify the timeframe name, duration cadence, or start date.
            </DialogDescription>
          </DialogHeader>

          {/* Form Body outside of DialogHeader/DialogDescription to prevent HTML5 p-nesting errors */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Period Name
              </label>
              <Input
                placeholder="e.g. Q1 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background border-border text-foreground rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Period Type
              </label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="bg-background border-border text-foreground rounded-xl">
                  <SelectValue placeholder="Select period type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="weekly">Weekly (1 Week)</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly (2 Weeks)</SelectItem>
                  <SelectItem value="tri-weekly">Tri-Weekly (3 Weeks)</SelectItem>
                  <SelectItem value="monthly">Monthly (1 Month)</SelectItem>
                  <SelectItem value="2-months">2 Months</SelectItem>
                  <SelectItem value="3-months">Quarterly (3 Months)</SelectItem>
                  <SelectItem value="6-months">Semi-Annual (6 Months)</SelectItem>
                  <SelectItem value="yearly">Annual (1 Year)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="bg-background border-border text-foreground rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                  Calculated End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  readOnly
                  className="bg-muted border-border text-muted-foreground rounded-xl cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <DialogClose asChild>
              <Button
                disabled={!(name && type && startDate && endDate)}
                onClick={onUpdateTimeframe}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-xs"
              >
                Save Changes
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}