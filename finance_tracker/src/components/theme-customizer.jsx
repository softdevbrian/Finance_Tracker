"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Palette, Check, Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const themes = [
  {
    id: "emerald",
    name: "Emerald Fintech",
    primary: "#10B981",
    accent: "#3B82F6",
    class: "",
    description: "Classic executive dark slate with emerald cash-flow accents",
  },
  {
    id: "violet",
    name: "Cyber Violet",
    primary: "#8B5CF6",
    accent: "#EC4899",
    class: "theme-violet",
    description: "Neon purple & pink futuristic dashboard aesthetic",
  },
  {
    id: "cyan",
    name: "Oceanic Cyan",
    primary: "#06B6D4",
    accent: "#3B82F6",
    class: "theme-cyan",
    description: "Deep marine teal with electric cyan highlights",
  },
  {
    id: "amber",
    name: "Sunset Amber",
    primary: "#F59E0B",
    accent: "#EF4444",
    class: "theme-amber",
    description: "Warm gold & crimson luxury investment theme",
  },
  {
    id: "rose",
    name: "Rose Velvet",
    primary: "#F43F5E",
    accent: "#A855F7",
    class: "theme-rose",
    description: "High-contrast ruby & violet modern interface",
  },
];

export default function ThemeCustomizer({ triggerClassName = "" }) {
  const [activeTheme, setActiveTheme] = useState("emerald");
  const { theme: mode, setTheme: setMode, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ft_user_theme") || "emerald";
    setActiveTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (themeId) => {
    const root = document.documentElement;
    themes.forEach((t) => {
      if (t.class) root.classList.remove(t.class);
    });

    const target = themes.find((t) => t.id === themeId);
    if (target && target.class) {
      root.classList.add(target.class);
    }
    localStorage.setItem("ft_user_theme", themeId);
    setActiveTheme(themeId);
  };

  if (!mounted) {
    return (
      <button className={`p-2 rounded-xl border border-border bg-card text-foreground ${triggerClassName}`}>
        <Palette className="w-4 h-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark" || mode === "dark";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={`p-2 rounded-xl border border-border/80 bg-card hover:bg-accent text-foreground transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs flex items-center gap-1.5 ${triggerClassName}`}
          title="Customize Theme & Color Palette"
        >
          <Palette className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold hidden md:inline">Theme</span>
        </button>
      </DialogTrigger>

      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <DialogTitle className="text-foreground">Personalize Workspace</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Light/Dark Mode Switcher */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Appearance Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("dark")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  isDark
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-xs">Dark Mode</span>
              </button>
              <button
                onClick={() => setMode("light")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  !isDark
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-xs">Light Mode</span>
              </button>
            </div>
          </div>

          {/* Color Themes List */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Color Palette Accent
            </label>
            <div className="space-y-2.5">
              {themes.map((t) => {
                const isCurrent = activeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => applyTheme(t.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${
                      isCurrent
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border/70 bg-background hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-1.5">
                        <span
                          className="w-5 h-5 rounded-full border-2 border-card shadow-xs"
                          style={{ backgroundColor: t.primary }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border-2 border-card shadow-xs"
                          style={{ backgroundColor: t.accent }}
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {t.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">{t.description}</p>
                      </div>
                    </div>

                    {isCurrent && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
