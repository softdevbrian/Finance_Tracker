"use client";

import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FileDown, Printer } from "lucide-react";
import { toast } from "sonner";
import formatNumber from "../../../../../utils";

export const THEME_PDF_PALETTES = {
  emerald: {
    primary: [16, 185, 129], // #10B981
    darkHeader: [6, 95, 70], // #065F46
    lightBg: [236, 253, 245],
    name: "Emerald Fintech",
  },
  violet: {
    primary: [139, 92, 246], // #8B5CF6
    darkHeader: [91, 33, 182], // #5B21B6
    lightBg: [245, 243, 255],
    name: "Cyber Violet",
  },
  cyan: {
    primary: [6, 182, 212], // #06B6D4
    darkHeader: [21, 94, 117], // #155E75
    lightBg: [236, 254, 255],
    name: "Oceanic Cyan",
  },
  amber: {
    primary: [245, 158, 11], // #F59E0B
    darkHeader: [146, 64, 14], // #92400E
    lightBg: [254, 243, 199],
    name: "Sunset Amber",
  },
  rose: {
    primary: [244, 63, 94], // #F43F5E
    darkHeader: [159, 18, 57], // #9F1239
    lightBg: [255, 241, 242],
    name: "Rose Velvet",
  },
};

export const generateThemedExecutivePDF = async ({
  budgetList = [],
  totalIncome = 0,
  totalBudget = 0,
  totalSpend = 0,
  actualSavings = 0,
  periodName = "Active Window",
  userEmail = "User Account",
  chartRef = null,
}) => {
  try {
    const activeThemeKey = (typeof window !== "undefined" && localStorage.getItem("ft_user_theme")) || "emerald";
    const palette = THEME_PDF_PALETTES[activeThemeKey] || THEME_PDF_PALETTES.emerald;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const savingsRate = totalIncome > 0 ? ((actualSavings / totalIncome) * 100).toFixed(1) : "0.0";
    const budgetUtilization = totalBudget > 0 ? ((totalSpend / totalBudget) * 100).toFixed(1) : "0.0";

    // 1. Top Decorative Themed Banner
    doc.setFillColor(...palette.primary);
    doc.rect(0, 0, pageWidth, 18, "F");

    doc.setFillColor(...palette.darkHeader);
    doc.rect(0, 18, pageWidth, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("FINANCE TRACKER", 14, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("EXECUTIVE FINANCIAL ANALYTICS REPORT", pageWidth - 14, 12, { align: "right" });

    // 2. Report Metadata
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Financial Performance Summary", 14, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Active Period: ${periodName}`, 14, 36);
    doc.text(`Account: ${userEmail}`, 14, 41);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 14, 36, { align: "right" });
    doc.text(`Theme Palette: ${palette.name}`, pageWidth - 14, 41, { align: "right" });

    // 3. Executive KPI Table
    doc.autoTable({
      startY: 46,
      head: [["Total Income Inflow", "Target Budget Limit", "Total Expenditures", "Net Retained Savings"]],
      body: [
        [
          `KSh ${formatNumber(totalIncome)}`,
          `KSh ${formatNumber(totalBudget)}`,
          `KSh ${formatNumber(totalSpend)}`,
          `KSh ${formatNumber(actualSavings)} (${savingsRate}%)`,
        ],
      ],
      theme: "plain",
      headStyles: {
        fillColor: palette.lightBg,
        textColor: palette.darkHeader,
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fillColor: [250, 250, 250],
        textColor: [20, 20, 20],
        fontStyle: "bold",
        fontSize: 11,
        halign: "center",
      },
      styles: {
        cellPadding: 4,
        lineColor: [220, 220, 220],
        lineWidth: 0.2,
      },
    });

    // 4. Financial Health Diagnostic Box
    const kpiFinalY = doc.previousAutoTable.finalY + 6;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, kpiFinalY, pageWidth - 28, 14, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text("Financial Diagnostic Status:", 18, kpiFinalY + 9);

    const isHealthy = actualSavings >= 0 && Number(budgetUtilization) <= 100;
    doc.setTextColor(isHealthy ? 16 : 225, isHealthy ? 185 : 29, isHealthy ? 129 : 72);
    doc.text(
      isHealthy
        ? `OPTIMAL - Retaining ${savingsRate}% of income with ${budgetUtilization}% budget utilization.`
        : `ATTENTION - Spending reached ${budgetUtilization}% of budget allocation.`,
      68,
      kpiFinalY + 9
    );

    // 5. Optional Embedded Chart Canvas
    let chartEndY = kpiFinalY + 18;
    if (chartRef && chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const chartWidth = pageWidth - 28;
        const chartHeight = (canvas.height * chartWidth) / canvas.width;

        if (chartHeight > 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(30, 41, 59);
          doc.text("Visual Analytics Overview", 14, chartEndY);

          doc.addImage(imgData, "PNG", 14, chartEndY + 3, chartWidth, Math.min(chartHeight, 75));
          chartEndY += Math.min(chartHeight, 75) + 10;
        }
      } catch (err) {
        console.warn("Could not capture chart screenshot for PDF:", err);
      }
    }

    // 6. Category Breakdown Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("Budget Category Breakdown", 14, chartEndY + 2);

    const tableRows = budgetList.map((b) => {
      const budget = Number(b.amount || 0);
      const spent = Number(b.totalSpend || 0);
      const remaining = budget - spent;
      const usage = budget > 0 ? ((spent / budget) * 100).toFixed(1) : "0.0";
      const status = spent > budget ? "Over Budget" : spent / budget >= 0.8 ? "Caution" : "On Track";

      return [
        b.name,
        `KSh ${formatNumber(budget)}`,
        `KSh ${formatNumber(spent)}`,
        `KSh ${formatNumber(remaining)}`,
        `${usage}%`,
        status,
      ];
    });

    doc.autoTable({
      startY: chartEndY + 6,
      head: [["Category", "Budget Target", "Actual Spent", "Remaining", "Usage %", "Health Status"]],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: palette.darkHeader,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3.5,
      },
      columnStyles: {
        0: { fontStyle: "bold" },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "center" },
        5: { halign: "center", fontStyle: "bold" },
      },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 5) {
          if (data.cell.raw === "Over Budget") {
            data.cell.styles.textColor = [225, 29, 72];
          } else if (data.cell.raw === "Caution") {
            data.cell.styles.textColor = [217, 119, 6];
          } else {
            data.cell.styles.textColor = [16, 185, 129];
          }
        }
      },
    });

    // 7. PDF Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(
        `Finance Tracker Executive Report  •  Confidential  •  Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    doc.save(`FinanceTracker_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Executive PDF Report generated!");
  } catch (error) {
    console.error("PDF generation failed:", error);
    toast.error("Failed to generate PDF Report");
  }
};

export const ChartWrapper = ({ children, title, exportable = true }) => {
  const chartRef = useRef(null);

  return (
    <div className="relative bg-card text-card-foreground rounded-2xl border border-border/80 shadow-xs overflow-hidden">
      <div ref={chartRef} className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};