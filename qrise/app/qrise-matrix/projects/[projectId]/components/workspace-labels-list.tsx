import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, QrCode, Barcode } from "lucide-react";

interface LabelItem {
  id: string;
  trackingCode: string;
  type: string;
  symbology: string;
  createdAt: string;
  status: "Active" | "Draft" | "Archived";
}

const LABELS: LabelItem[] = [
  {
    id: "lbl-1",
    trackingCode: "CR-10025",
    type: "Shipment Label",
    symbology: "Code 128 + QR",
    createdAt: "Created 2 mins ago",
    status: "Active",
  },
  {
    id: "lbl-2",
    trackingCode: "CR-10024",
    type: "Shipment Label",
    symbology: "Code 128 + QR",
    createdAt: "Created 1 hour ago",
    status: "Active",
  },
];

export function WorkspaceLabelsList() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          My Labels
        </h2>
        <Link
          href="#all-labels"
          className="text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Labels List */}
      <div className="space-y-2.5">
        {LABELS.map((lbl) => (
          <div
            key={lbl.id}
            className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 sm:p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Visual Printable Sticker Thumbnail */}
              <div className="w-24 sm:w-28 h-15 sm:h-16 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-1.5 flex flex-col justify-between shrink-0 select-none shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-0.5">
                  <span className="text-[7px] font-black text-slate-700 dark:text-slate-300 tracking-tight truncate">
                    ABC LOGISTICS
                  </span>
                  <QrCode className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200 shrink-0" />
                </div>
                <div className="text-[6px] font-mono text-slate-400">
                  {lbl.trackingCode}
                </div>
                <div className="pt-0.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center">
                  <Barcode className="w-10 h-2.5 text-slate-700 dark:text-slate-300" />
                </div>
              </div>

              {/* Label Info */}
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                  {lbl.trackingCode}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {lbl.type} <span className="mx-1">·</span> {lbl.symbology}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {lbl.createdAt}
                </p>
              </div>
            </div>

            {/* Status Badge & Chevron */}
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                {lbl.status}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
