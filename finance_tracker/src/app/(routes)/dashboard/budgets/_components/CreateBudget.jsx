"use client";

import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "../../../../../../utils/dbConfig";
import { eq, count } from "drizzle-orm";
import { Budgets, PeriodSelected } from "../../../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PlusCircle, Sparkles } from "lucide-react";

export default function CreateBudget({ refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState("🏷️");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const { user } = useUser();
  const router = useRouter();

  const onCreateBudget = async () => {
    try {
      const periodCount = await db
        .select({ count: count() })
        .from(PeriodSelected)
        .where(eq(PeriodSelected.createdBy, user?.primaryEmailAddress?.emailAddress))
        .then((result) => result[0]?.count || 0);

      if (periodCount > 1) {
        toast("Please select only one active time frame to create a budget category");
        router.replace("/dashboard/timeframe");
        return;
      }

      const selectedPeriod = await db
        .select()
        .from(PeriodSelected)
        .where(eq(PeriodSelected.createdBy, user?.primaryEmailAddress?.emailAddress))
        .then((rows) => rows[0] || {});

      if (!selectedPeriod.periodId || selectedPeriod.periodId === 0) {
        toast("Choose a TimeFrame first");
        router.replace("/dashboard/timeframe");
        return;
      }

      const result = await db
        .insert(Budgets)
        .values({
          name: name,
          amount: amount,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          periodId: selectedPeriod.periodId,
          icon: emojiIcon,
        })
        .returning({ insertedId: Budgets.id });

      if (result) {
        refreshData();
        toast.success("New budget category created!");
        setName("");
        setAmount("");
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      toast.error("Failed to create budget");
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
              Create New Budget Category
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set spending limits and track expenses
            </p>
          </div>
        </DialogTrigger>

        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <DialogTitle className="text-foreground">Create Budget</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-xs">
              Define a budget category and its allocated target amount.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">
                Icon Emoji
              </label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-16 h-14 text-2xl border-border bg-background hover:bg-accent rounded-xl"
                  onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
                >
                  {emojiIcon}
                </Button>
                {openEmojiPicker && (
                  <div className="absolute z-50 top-16 left-0 shadow-2xl">
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
                placeholder="e.g. Groceries, Rent, Utilities"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background border-border text-foreground rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
                Budget Limit Amount (Ksh)
              </label>
              <Input
                type="number"
                placeholder="e.g. 25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background border-border text-foreground rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button
                disabled={!(name && amount)}
                onClick={onCreateBudget}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-xs"
              >
                Create Budget Category
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}