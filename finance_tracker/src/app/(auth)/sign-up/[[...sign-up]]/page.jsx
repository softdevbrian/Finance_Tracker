"use client";

import { SignUp } from "@clerk/nextjs";
import React from "react";
import ImageCarousel from "../../sign-in/[[...sign-in]]/ImageCarousel";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Wallet } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <section className="min-h-screen bg-background text-foreground flex flex-col justify-center">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <ImageCarousel />

        <main className="relative flex items-center justify-center p-6 sm:p-12 lg:col-span-7 xl:col-span-6">
          {/* Top Right Theme Toggle */}
          <div className="absolute top-6 right-6 z-20">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-md space-y-6">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl text-foreground">
                  Finance<span className="text-primary font-extrabold ml-1">Tracker</span>
                </span>
              </Link>
            </div>

            <div className="text-left space-y-1 mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Get started today
              </h1>
              <p className="text-sm text-muted-foreground">
                Create a free account and start tracking budgets with ease.
              </p>
            </div>

            <div className="flex justify-center">
              <SignUp />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}