"use client";

import React, { useContext, useState, useEffect } from "react";
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
import { TimeFrameContext } from "@/components/ui/TimeFrameProvider";
import { CheckSquare, Square } from "lucide-react";

export default function SelectAllButton({ periods = [] }) {
  const { selectedTimeFrames, setSelectedTimeFrames } = useContext(TimeFrameContext);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(true);

  useEffect(() => {
    setIsSelectAll(selectedTimeFrames.length === 0);
  }, [selectedTimeFrames]);

  const handleConfirm = async () => {
    try {
      if (isSelectAll) {
        for (const period of periods) {
          if (!selectedTimeFrames.includes(period.id)) {
            await setSelectedTimeFrames(period.id);
          }
        }
      } else {
        for (const period of periods) {
          if (selectedTimeFrames.includes(period.id)) {
            await setSelectedTimeFrames(period.id);
          }
        }
      }
    } catch (error) {
      console.error("Error updating selections:", error);
    }
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowConfirmDialog(true)}
        className="rounded-xl border-border bg-card hover:bg-accent text-foreground text-xs font-semibold gap-2 shadow-xs"
      >
        {isSelectAll ? (
          <>
            <CheckSquare className="w-4 h-4 text-primary" />
            <span>Select All Timeframes</span>
          </>
        ) : (
          <>
            <Square className="w-4 h-4 text-rose-500" />
            <span>Clear Timeframe Selection</span>
          </>
        )}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-card border-border sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              {isSelectAll ? "Select all timeframes?" : "Clear active timeframe selection?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-xs">
              {isSelectAll
                ? "This will combine budgets and transactions across all recorded periods into the dashboard."
                : "This will deselect all timeframes. You will need to select at least one timeframe to view records."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}