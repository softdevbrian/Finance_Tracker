"use client";

import { Button } from "@/components/ui/button";
import { PenBox, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
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
import EmojiPicker from "emoji-picker-react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { db } from "../../../../../../utils/dbConfig";
import { Budgets } from "../../../../../../utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";

export default function EditBudget({ budgetInfo, refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState(budgetInfo?.icon || "🏷️");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState(budgetInfo?.name || "");
  const [amount, setAmount] = useState(budgetInfo?.amount || "");

  const { user } = useUser();

  useEffect(() => {
    if (budgetInfo) {
      setEmojiIcon(budgetInfo?.icon || "🏷️");
      setAmount(budgetInfo.amount);
      setName(budgetInfo.name);
    }
  }, [budgetInfo]);

  const onUpdateBudget = async () => {
    try {
      const result = await db
        .update(Budgets)
        .set({
          name: name,
          amount: amount,
          icon: emojiIcon,
        })
        .where(eq(Budgets.id, budgetInfo.id))
        .returning();

      if (result) {
        if (refreshData) await refreshData();
        toast.success("Budget category updated!");
      }
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Failed to update budget");
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
            <span>Edit Category</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <DialogTitle className="text-foreground">Update Budget</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-xs">
              Modify category target limit, label, or assigned emoji icon.
            </DialogDescription>
          </DialogHeader>

          {/* Form Body outside of DialogHeader/DialogDescription to prevent HTML5 p-nesting errors */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Category Icon
              </label>
              <div className="relative inline-block">
                <Button
                  variant="outline"
                  type="button"
                  className="text-2xl h-14 w-14 rounded-2xl border-border bg-background hover:bg-accent"
                  onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
                >
                  {emojiIcon}
                </Button>
                {openEmojiPicker && (
                  <div className="absolute z-50 mt-2">
                    <EmojiPicker
                      onEmojiClick={(e) => {
                        setEmojiIcon(e.emoji);
                        setOpenEmojiPicker(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Category Name
              </label>
              <Input
                placeholder="e.g. Home Decor, Groceries"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background border-border text-foreground rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Target Budget Limit (KSh)
              </label>
              <Input
                type="number"
                value={amount}
                placeholder="e.g. 5000"
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background border-border text-foreground rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <DialogClose asChild>
              <Button
                disabled={!(name && amount)}
                onClick={onUpdateBudget}
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
