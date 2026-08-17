"use client";

import React, { useEffect, useState } from "react";
import { Wallet, ShieldCheck, BarChart3, Sparkles } from "lucide-react";

const images = [
  "https://media.istockphoto.com/id/1257717196/photo/kenyan-coins-on-the-background-of-money.jpg?s=2048x2048&w=is&k=20&c=hOcyTvMGzdBFUEHsvE2n_LPTzXsho9OpZafxmlqNOu0=",
  "https://media.istockphoto.com/id/1158052678/photo/five-hundred-kenyan-shilling-on-a-pile-of-various-kenyan-shilling-notes-top-view.jpg?s=2048x2048&w=is&k=20&c=4cC6BrfeRzqI4clQRgx6zzJyOyH1HK39Ucpq_NSHuaY=",
  "https://media.istockphoto.com/id/1161898919/photo/kenyan-shilling-a-background.jpg?s=2048x2048&w=is&k=20&c=j0xODJFgDvkqCip_gM97QaKhO8X_jaZqj6-1VUT23NA=",
  "https://media.istockphoto.com/id/1152454581/photo/business-object.jpg?s=2048x2048&w=is&k=20&c=o-xRY_50vzWlH6JWZ93DOAnKyxus9l4vyGTEB46fZtE=",
];

export default function ImageCarousel() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="relative hidden lg:flex h-full min-h-screen flex-col justify-between p-12 bg-neutral-950 lg:col-span-5 xl:col-span-6 overflow-hidden">
      {/* Background Image with Fade Transition */}
      <img
        alt="Finance background"
        src={images[currentImage]}
        className="absolute inset-0 h-full w-full object-cover opacity-25 scale-105 transition-all duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

      {/* Top Brand Info */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary backdrop-blur-md">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <span className="font-bold text-xl text-white tracking-tight">
          Finance<span className="text-primary font-extrabold ml-1">Tracker</span>
        </span>
      </div>

      {/* Bottom Feature Highlights */}
      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Wealth Management Platform</span>
        </div>

        <h2 className="text-3xl font-extrabold text-white leading-tight">
          Master your money across every timeframe and budget goal.
        </h2>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <BarChart3 className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-semibold text-white">Visual Analytics</h3>
            <p className="text-xs text-neutral-300">Live breakdown of income, expenses, and savings targets.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-semibold text-white">Advisor Insights</h3>
            <p className="text-xs text-neutral-300">Rule-based financial health diagnostics in real time.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
