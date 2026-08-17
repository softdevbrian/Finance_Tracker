"use client";

import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

export const useChartExport = () => {
  const exportChartToPDF = async (chartRef, chartName = "Chart") => {
    if (!chartRef.current) {
      console.error("Chart reference is not available");
      toast.error("Chart reference unavailable");
      return;
    }

    try {
      const originalOverflow = chartRef.current.style.overflow;
      const originalWidth = chartRef.current.style.width;

      chartRef.current.style.overflow = "visible";
      chartRef.current.style.width = "auto";

      const canvas = await html2canvas(chartRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        allowTaint: true,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      chartRef.current.style.overflow = originalOverflow;
      chartRef.current.style.width = originalWidth;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const widthRatio = pageWidth / canvas.width;
      const heightRatio = pageHeight / canvas.height;
      const scale = Math.min(widthRatio, heightRatio) * 0.9;

      const scaledWidth = canvas.width * scale;
      const scaledHeight = canvas.height * scale;

      const xPadding = (pageWidth - scaledWidth) / 2;
      const yPadding = (pageHeight - scaledHeight) / 2;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        xPadding,
        yPadding,
        scaledWidth,
        scaledHeight
      );

      pdf.save(`${chartName}_Export_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Chart exported to PDF!");
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to export chart PDF");
    }
  };

  return { exportChartToPDF };
};

export const ChartExportButton = ({ chartRef, chartName, className = "" }) => {
  const { exportChartToPDF } = useChartExport();

  return (
    <button
      onClick={() => exportChartToPDF(chartRef, chartName)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-accent text-foreground text-xs font-semibold border border-border/80 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xs ${className}`}
      title="Export chart to PDF"
    >
      <FileDown className="w-3.5 h-3.5 text-primary" />
      <span>Export PDF</span>
    </button>
  );
};

export const ChartWrapper = ({ children, title, exportable = true }) => {
  const chartRef = useRef(null);

  return (
    <div className="relative bg-card text-card-foreground rounded-2xl border border-border/80 shadow-xs overflow-hidden">
      {exportable && (
        <div className="absolute top-3 right-3 z-10">
          <ChartExportButton chartRef={chartRef} chartName={title} />
        </div>
      )}
      <div ref={chartRef} className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};