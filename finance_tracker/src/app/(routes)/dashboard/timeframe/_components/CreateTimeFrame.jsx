"use client";

import React, { useState } from "react";
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
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { PlusCircle, Sparkles } from "lucide-react";

export default function CreateTimeFrame({ refreshData }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { user } = useUser();

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

  const onCreateTimeframe = async () => {
    try {
      const result = await db
        .insert(Periods)
        .values({
          name: name,
          type: type,
          startDate: startDate,
          endDate: endDate,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format("YYYY-MM-DDTHH:mm:ss"),
        })
        .returning({ insertedId: Periods.id });

      if (result) {
        if (refreshData) await refreshData();
        toast.success("New timeframe created!");
        setName("");
        setType("");
        setStartDate("");
        setEndDate("");
      }
    } catch (error) {
      console.error("Error creating timeframe:", error);
      toast.error("Failed to create timeframe");
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <div className="p-6 rounded-2xl bg-card border-2 border-dashed border-border/80 hover:border-primary/60 hover:bg-accent/30 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm md:text-base text-foreground group-hover:text-primary transition-colors">
              Create New Timeframe Window
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set monthly, quarterly, or custom duration windows
            </p>
          </div>
        </DialogTrigger>

        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <DialogTitle className="text-foreground">New Timeframe Window</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-xs">
              Establish a period window to anchor budgets and income records.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Timeframe Name
              </label>
              <Input
                placeholder="e.g. October 2024, Q4 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background border-border text-foreground rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Window Cadence
              </label>
              <Select onValueChange={handleTypeChange} value={type}>
                <SelectTrigger className="bg-background border-border text-foreground rounded-xl">
                  <SelectValue placeholder="Choose frequency" />
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
                  Calculated End
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

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button
                disabled={!(name && type && startDate && endDate)}
                onClick={onCreateTimeframe}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-xs"
              >
                Create Timeframe
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}