"use client";

import React, { useState, useContext } from "react";
import { format } from "date-fns";
import { Calendar, CheckCircle2, Clock, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DeleteTimeFrame from "./DeleteTimeFrame";
import EditTimeFrame from "./EditTimeFrame";
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";

export default function TimeFramesCreated({ periods = [], refreshData }) {
  const { selectedTimeFrames = [], setSelectedTimeFrames: updateSelectedTimeFrames } =
    useContext(TimeFrameContext);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDateWithDay = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEE, MMM d, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId);

  const handleDialogOpen = (periodId) => {
    setSelectedPeriodId(periodId);
  };

  const handleDialogClose = () => {
    setSelectedPeriodId(null);
    setShowAlert(false);
  };

  const handleChoose = () => {
    setShowAlert(true);
  };

  const handleConfirmChoice = async () => {
    setIsUpdating(true);
    try {
      await updateSelectedTimeFrames(selectedPeriodId);
      handleDialogClose();
    } catch (error) {
      console.error("Error updating timeframe selection:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {periods.map((period) => {
        const isSelected = (selectedTimeFrames || []).includes(period.id);

        return (
          <Card
            key={period.id}
            className={`w-full rounded-2xl transition-all duration-300 bg-card border ${
              isSelected
                ? "border-primary shadow-md bg-primary/5"
                : "border-border/80 hover:border-border hover:shadow-md"
            }`}
          >
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              {/* Header with name and badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground truncate">
                      {period.name}
                    </h3>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground capitalize mt-0.5">
                    <Layers className="w-3 h-3" />
                    {period.type} Window
                  </span>
                </div>

                <div className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center text-muted-foreground shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
              </div>

              {/* Dates section */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold text-foreground">Active Range</span>
                </div>
                <div className="text-muted-foreground font-medium pl-5">
                  {formatDateWithDay(period.startDate)} — {formatDateWithDay(period.endDate)}
                </div>
              </div>

              {/* Action Button & Modal */}
              <div className="pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleDialogOpen(period.id)}
                      variant={isSelected ? "default" : "outline"}
                      className={`w-full rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 ${
                        isSelected
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "border-border hover:bg-accent text-foreground"
                      }`}
                    >
                      {isSelected ? "Manage Selected Window" : "View & Select Window"}
                    </Button>
                  </DialogTrigger>

                  {selectedPeriod && (
                    <DialogContent className="bg-card border-border sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-foreground flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          <span>{selectedPeriod.name}</span>
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-3 py-2 text-sm">
                        <div className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-1">
                          <p className="text-xs text-muted-foreground">Date Range:</p>
                          <p className="font-semibold text-foreground">
                            {formatDateWithDay(selectedPeriod.startDate)} to {formatDateWithDay(selectedPeriod.endDate)}
                          </p>
                        </div>
                      </div>

                      <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                        <Button
                          onClick={handleChoose}
                          variant={isSelected ? "destructive" : "default"}
                          className="w-full sm:w-auto rounded-xl text-xs font-semibold"
                        >
                          {isSelected ? "Deselect Window" : "Set As Active Window"}
                        </Button>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <EditTimeFrame periodInfo={period} refreshData={refreshData} />
                          <DeleteTimeFrame periodId={selectedPeriodId} refreshData={refreshData} />
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  )}
                </Dialog>
              </div>

              {/* Alert Dialog */}
              <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                      {isSelected ? "Deselect Timeframe?" : "Activate Timeframe?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground text-xs">
                      {isSelected
                        ? "Removing this timeframe will hide its budgets and incomes from the active dashboard view."
                        : "Activating this timeframe will focus the dashboard analytics and transactions on this period."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => setShowAlert(false)}
                      className="rounded-xl border-border"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleConfirmChoice}
                      disabled={isUpdating}
                      className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                      {isUpdating ? "Updating..." : "Confirm"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}