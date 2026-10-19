"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Barcode, 
  QrCode, 
  Plus, 
  Printer, 
  Search,
  ExternalLink,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LabelItem {
  id: string;
  projectId: string;
  projectName: string;
  trackingCode: string;
  type: string;
  symbology: string;
  createdAt: string;
  status: "Active" | "Draft";
}

const ALL_LABELS: LabelItem[] = [
  {
    id: "lbl-1",
    projectId: "courier-tracking",
    projectName: "Courier Tracking",
    trackingCode: "CR-10025",
    type: "Shipping Barcode Label",
    symbology: "Code 128 + QR",
    createdAt: "Created 2 mins ago",
    status: "Active",
  },
  {
    id: "lbl-2",
    projectId: "courier-tracking",
    projectName: "Courier Tracking",
    trackingCode: "CR-10024",
    type: "Express Parcel Slip",
    symbology: "Code 128 + QR",
    createdAt: "Created 1 hour ago",
    status: "Active",
  },
  {
    id: "lbl-3",
    projectId: "product-inventory",
    projectName: "Product Inventory",
    trackingCode: "SKU-99410",
    type: "Product Shelf Label",
    symbology: "EAN-13 + QR",
    createdAt: "Created 3 hours ago",
    status: "Active",
  },
  {
    id: "lbl-4",
    projectId: "warehouse-logistics",
    projectName: "Warehouse Logistics",
    trackingCode: "PAL-88120",
    type: "Pallet Freight Tag",
    symbology: "GS1-128",
    createdAt: "Created 1 day ago",
    status: "Active",
  },
];

export default function MyLabelsPage() {
  const [search, setSearch] = useState("");

  const filteredLabels = ALL_LABELS.filter(
    (l) =>
      l.trackingCode.toLowerCase().includes(search.toLowerCase()) ||
      l.projectName.toLowerCase().includes(search.toLowerCase()) ||
      l.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Labels
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View and manage all custom barcodes and thermal printable stickers
          </p>
        </div>

        <Link href="/qrise-matrix/projects/courier-tracking/create-label">
          <Button className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Label</span>
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search labels by ID, project or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium shadow-xs"
        />
      </div>

      {/* Labels Grid / List */}
      <div className="space-y-3">
        {filteredLabels.map((lbl) => (
          <div
            key={lbl.id}
            className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Visual Printable Sticker Thumbnail */}
              <div className="w-24 sm:w-28 h-15 sm:h-16 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-1.5 flex flex-col justify-between shrink-0 select-none shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-0.5">
                  <span className="text-[7px] font-black text-slate-700 dark:text-slate-300 tracking-tight truncate">
                    {lbl.projectName}
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
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                    {lbl.trackingCode}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {lbl.projectName}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {lbl.type} <span className="mx-1">·</span> {lbl.symbology}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {lbl.createdAt}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/qrise-matrix/projects/${lbl.projectId}/create-label`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Open Studio</span>
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
