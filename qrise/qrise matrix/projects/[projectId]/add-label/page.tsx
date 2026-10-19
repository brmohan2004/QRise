"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  Upload, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Layers, 
  FileText, 
  Printer, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  Edit3,
  Barcode,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { cn } from "@/lib/utils";

interface AddLabelPageProps {
  params: Promise<{ projectId: string }>;
}

export interface LabelTemplateOption {
  id: string;
  name: string;
  type: "default" | "saved";
  dimensions: string;
  badge: string;
  description: string;
  defaultTitle: string;
  defaultSubTitle: string;
  barcodeSymbology: string;
  width: number;
  height: number;
}

const TEMPLATES: LabelTemplateOption[] = [
  {
    id: "tpl-shipping-4x6",
    name: "4 × 6\" Standard Shipping Slip",
    type: "default",
    dimensions: "4.0\" × 6.0\" (390×580px)",
    badge: "Most Popular",
    description: "Standard logistics waybill with tracking QR, barcode & customer address",
    defaultTitle: "ABC LOGISTICS",
    defaultSubTitle: "Fast · Secure · Worldwide Priority",
    barcodeSymbology: "Code 128",
    width: 390,
    height: 580,
  },
  {
    id: "tpl-pos-receipt-80mm",
    name: "80mm POS Thermal Receipt",
    type: "default",
    dimensions: "3.15\" × 5.0\" (340×480px)",
    badge: "Retail Standard",
    description: "Itemized customer receipt with invoice total and verification QR",
    defaultTitle: "RETAIL STORE CHECKOUT",
    defaultSubTitle: "Tax Invoice / Cash Memo",
    barcodeSymbology: "EAN-13",
    width: 340,
    height: 480,
  },
  {
    id: "tpl-shelf-price-3x2",
    name: "3 × 2\" Price & Barcode Tag",
    type: "default",
    dimensions: "3.0\" × 2.0\" (360×240px)",
    badge: "Inventory & Shelf",
    description: "Supermarket shelf edge tag with item code, MRP and batch tracking",
    defaultTitle: "PREMIUM PRODUCTS",
    defaultSubTitle: "Batch Stock #A-9912",
    barcodeSymbology: "UPC-A",
    width: 360,
    height: 240,
  },
  {
    id: "tpl-saved-warehouse-dispatch",
    name: "Saved: Express Dispatch Tag",
    type: "saved",
    dimensions: "4.0\" × 4.0\" (390×390px)",
    badge: "Saved Template",
    description: "Custom saved template for Chennai warehouse air freight delivery",
    defaultTitle: "CHENNAI AIR HUB",
    defaultSubTitle: "Zone 1 · Express Courier",
    barcodeSymbology: "Code 128",
    width: 390,
    height: 390,
  },
  {
    id: "tpl-saved-asset-mini",
    name: "Saved: 2 × 1\" Asset Serial Barcode",
    type: "saved",
    dimensions: "2.0\" × 1.0\" (340×170px)",
    badge: "Saved Template",
    description: "High-density micro barcode for electronics hardware asset tracking",
    defaultTitle: "ASSET MANAGEMENT",
    defaultSubTitle: "Internal Serial Tag",
    barcodeSymbology: "Code 128",
    width: 340,
    height: 170,
  },
];

export interface BulkItemRow {
  id: string;
  mobileNo: string;
  name: string;
  address: string;
  pincode: string;
  extraField: string;
}

export default function AddLabelPage({ params }: AddLabelPageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId || "courier-tracking";
  const router = useRouter();

  // Wizard Steps: 1 = Choose Template, 2 = Edit Label Details, 3 = Generation (Custom Data & Bulk)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplateOption>(TEMPLATES[0]);
  const [templateFilter, setTemplateFilter] = useState<"all" | "default" | "saved">("all");

  // Step 2: Edit Label Details
  const [labelTitle, setLabelTitle] = useState(TEMPLATES[0].defaultTitle);
  const [labelSubTitle, setLabelSubTitle] = useState(TEMPLATES[0].defaultSubTitle);
  const [labelPrefix, setLabelPrefix] = useState("CR-");
  const [barcodeSymbology, setBarcodeSymbology] = useState(TEMPLATES[0].barcodeSymbology);
  const [noteOrInstructions, setNoteOrInstructions] = useState(
    "Scan QR code for real-time tracking or visit qrise.app/tracking"
  );

  // Step 3: Generation Data (Bulk Rows / Excel Upload)
  const [bulkMode, setBulkMode] = useState<"manual" | "excel">("manual");
  const [bulkRows, setBulkRows] = useState<BulkItemRow[]>([
    {
      id: "row-1",
      name: "John Doe",
      mobileNo: "+91 98765 43210",
      address: "456, MG Road, Indiranagar",
      pincode: "560038",
      extraField: "Weight: 2.5 KG",
    },
    {
      id: "row-2",
      name: "Sarah Smith",
      mobileNo: "+91 91234 56789",
      address: "12, Anna Salai, Guindy",
      pincode: "600032",
      extraField: "Weight: 1.2 KG",
    },
    {
      id: "row-3",
      name: "Rajesh Kumar",
      mobileNo: "+91 99887 76655",
      address: "78, Ring Road, Sector 4",
      pincode: "110001",
      extraField: "Weight: 4.0 KG",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update defaults when template changes in Step 1
  const handleSelectTemplate = (tpl: LabelTemplateOption) => {
    setSelectedTemplate(tpl);
    setLabelTitle(tpl.defaultTitle);
    setLabelSubTitle(tpl.defaultSubTitle);
    setBarcodeSymbology(tpl.barcodeSymbology);
  };

  // Excel / CSV File parser (QRise Studio Style)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: "greedy",
        complete: (results: any) => {
          processRawData(results.data);
        },
      });
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result;
          const workbook = XLSX.read(buffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          processRawData(jsonData);
        } catch {
          toast.error("Failed to parse Excel file. Please check format.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error("Please upload a .csv or .xlsx file");
    }
  };

  const processRawData = (rows: any[]) => {
    if (!rows || rows.length === 0) {
      toast.error("The uploaded file contains no rows");
      return;
    }

    const parsed: BulkItemRow[] = rows.map((r, idx) => ({
      id: `row-upload-${idx + 1}`,
      name: String(r.name || r.Name || r.customer || r.recipient || `Recipient ${idx + 1}`),
      mobileNo: String(r.mobile || r.Mobile || r.phone || r.Phone || r.contact || ""),
      address: String(r.address || r.Address || r.city || r.destination || "Standard Delivery"),
      pincode: String(r.pincode || r.Pincode || r.zip || r.postal || ""),
      extraField: String(r.extra || r.weight || r.notes || "Standard Parcel"),
    }));

    setBulkRows(parsed);
    toast.success(`Imported ${parsed.length} rows successfully from file!`);
  };

  // Add a new row manually
  const handleAddRow = () => {
    const newRow: BulkItemRow = {
      id: `row-${Date.now()}`,
      name: `Recipient ${bulkRows.length + 1}`,
      mobileNo: "",
      address: "",
      pincode: "",
      extraField: "Weight: 1.0 KG",
    };
    setBulkRows([...bulkRows, newRow]);
  };

  const handleUpdateRow = (id: string, field: keyof BulkItemRow, val: string) => {
    setBulkRows(bulkRows.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const handleDeleteRow = (id: string) => {
    if (bulkRows.length <= 1) {
      toast.error("At least one label row is required");
      return;
    }
    setBulkRows(bulkRows.filter((r) => r.id !== id));
  };

  // Final Action: Create All Labels
  const handleGenerateAll = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      // Store generated batch in sessionStorage so the project page can display it
      const batchResult = {
        id: `batch-${Date.now()}`,
        templateName: selectedTemplate.name,
        labelTitle,
        labelSubTitle,
        barcodeSymbology,
        noteOrInstructions,
        prefix: labelPrefix,
        rows: bulkRows,
        totalCreated: bulkRows.length,
        createdAt: "Just now",
      };

      try {
        const key = `qrise_project_labels_${projectId}`;
        const existing = JSON.parse(sessionStorage.getItem(key) || "[]");
        sessionStorage.setItem(key, JSON.stringify([batchResult, ...existing]));
      } catch {
        // Ignore storage errors
      }

      toast.success(`Successfully created ${bulkRows.length} labels!`);
      setIsSubmitting(false);
      router.push(`/qrise-matrix/projects/${projectId}?tab=labels`);
    }, 600);
  };

  const filteredTemplates = TEMPLATES.filter((t) => {
    if (templateFilter === "all") return true;
    return t.type === templateFilter;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Header with Back button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href={`/qrise-matrix/projects/${projectId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0"
              aria-label="Back to project"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Add Label
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Step {currentStep} of 3:{" "}
              {currentStep === 1
                ? "Choose Label Template"
                : currentStep === 2
                ? "Edit Label Details"
                : "Label Generation (Custom Data & Bulk)"}
            </p>
          </div>
        </div>

        {/* Step indicator pills */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                currentStep === step
                  ? "bg-emerald-600 text-white shadow-xs"
                  : currentStep > step
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}
            >
              {currentStep > step ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: CHOOSE LABEL TEMPLATE (Default & Saved Labels) */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Step 1: Choose Label Template
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick from standard default shapes or your saved custom templates
              </p>
            </div>

            {/* Filter Toggle: All / Default / Saved */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTemplateFilter("all")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  templateFilter === "all"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTemplateFilter("default")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  templateFilter === "default"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => setTemplateFilter("saved")}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-all",
                  templateFilter === "saved"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Saved
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTemplates.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group active:scale-[0.99]",
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border",
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                          )}
                        >
                          <Tag className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {tpl.name}
                          </h3>
                          <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {tpl.dimensions}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider">{tpl.badge}</span>
                    <span className="font-mono">{tpl.barcodeSymbology}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue button */}
          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => setCurrentStep(2)}
              className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <span>Next: Edit Label Details</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: EDIT LABEL DETAILS */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Step 2: Edit Label Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize title, secondary branding, tracking prefix, and barcode symbology
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Header Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Header Title / Company Name
                </label>
                <Input
                  value={labelTitle}
                  onChange={(e) => setLabelTitle(e.target.value)}
                  className="rounded-xl h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold"
                />
              </div>

              {/* Secondary Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Secondary Subtitle / Dispatch Line
                </label>
                <Input
                  value={labelSubTitle}
                  onChange={(e) => setLabelSubTitle(e.target.value)}
                  className="rounded-xl h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Prefix */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tracking Code Prefix
                </label>
                <Input
                  value={labelPrefix}
                  onChange={(e) => setLabelPrefix(e.target.value)}
                  placeholder="e.g. CR-, EXP-, INV-"
                  className="rounded-xl h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono font-bold"
                />
              </div>

              {/* Barcode Symbology */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Barcode Symbology
                </label>
                <select
                  value={barcodeSymbology}
                  onChange={(e) => setBarcodeSymbology(e.target.value)}
                  className="w-full h-10 rounded-xl px-3 text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
                >
                  <option value="Code 128">Code 128 (Standard Logistics)</option>
                  <option value="EAN-13">EAN-13 (Retail & Supermarkets)</option>
                  <option value="UPC-A">UPC-A (Point of Sale)</option>
                  <option value="GS1-128">GS1-128 (Supply Chain Freight)</option>
                </select>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Footer Instructions & Scan Notice
              </label>
              <Input
                value={noteOrInstructions}
                onChange={(e) => setNoteOrInstructions(e.target.value)}
                className="rounded-xl h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800"
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
            >
              <span>Next: Label Generation & Bulk Data</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: LABEL GENERATION (CUSTOM DATA: MOBILE, ADDRESS, PINCODE + EXCEL UPLOAD) */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Step 3: Label Generation & Custom Data
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter customer details directly (Mobile No, Address, Pincode) or upload an Excel sheet to create all labels in bulk
            </p>
          </div>

          {/* Mode Switcher: In-App Table Entry vs Excel Sheet Upload */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setBulkMode("manual")}
              className={cn(
                "flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2",
                bulkMode === "manual"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>In-App Table Entry ({bulkRows.length} rows)</span>
            </button>
            <button
              type="button"
              onClick={() => setBulkMode("excel")}
              className={cn(
                "flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2",
                bulkMode === "excel"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Upload Excel / CSV Sheet</span>
            </button>
          </div>

          {/* Excel Upload Box */}
          {bulkMode === "excel" && (
            <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <Upload className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Upload Excel or CSV Sheet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Columns supported: <code>name</code>, <code>mobile</code>, <code>address</code>, <code>pincode</code>, <code>weight/extra</code>
                </p>
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 cursor-pointer transition-all active:scale-95">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose .XLSX / .CSV File</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* In-App Table Entries */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Recipient & Delivery Details ({bulkRows.length} labels to generate)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="h-8 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add Row</span>
              </Button>
            </div>

            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {bulkRows.map((row, idx) => (
                <div
                  key={row.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-mono">
                      <span>Label #{idx + 1}</span>
                      <span className="text-slate-400 text-[10px]">
                        ({labelPrefix}100{idx + 1})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      title="Remove Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Recipient Name */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">Recipient Name</span>
                      <Input
                        value={row.name}
                        onChange={(e) => handleUpdateRow(row.id, "name", e.target.value)}
                        placeholder="Customer name"
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>

                    {/* Mobile No */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">Mobile No</span>
                      <Input
                        value={row.mobileNo}
                        onChange={(e) => handleUpdateRow(row.id, "mobileNo", e.target.value)}
                        placeholder="+91 98765 43210"
                        className="h-8 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Address */}
                    <div className="sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-400">Delivery Address</span>
                      <Input
                        value={row.address}
                        onChange={(e) => handleUpdateRow(row.id, "address", e.target.value)}
                        placeholder="Street, Area, City"
                        className="h-8 rounded-lg text-xs"
                      />
                    </div>

                    {/* Pincode */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">Pincode</span>
                      <Input
                        value={row.pincode}
                        onChange={(e) => handleUpdateRow(row.id, "pincode", e.target.value)}
                        placeholder="600001"
                        className="h-8 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation & Create Button */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800"
            >
              Back
            </Button>

            {/* Create Button (Creates all labels in bulk) */}
            <Button
              onClick={handleGenerateAll}
              disabled={isSubmitting || bulkRows.length === 0}
              className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4 stroke-[2.2]" />
              <span>
                {isSubmitting ? "Generating..." : `Create All (${bulkRows.length}) Labels`}
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
