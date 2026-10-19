import React from "react";
import { QrCode, Barcode, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateSelectStepProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  selectedIndustry?: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  thumbnailType: "shipping" | "retail" | "medical";
}

export const TEMPLATES: ProjectTemplate[] = [
  {
    id: "courier-tracking",
    name: "Courier Tracking",
    description: "Track shipments, deliveries and parcel movements with reusable shipping labels.",
    tags: ["Code 128", "QR Code", "Tracking"],
    thumbnailType: "shipping",
  },
  {
    id: "product-inventory",
    name: "Product Inventory",
    description: "Manage product inventory with barcode labels.",
    tags: ["EAN-13", "Code 128", "QR Code"],
    thumbnailType: "retail",
  },
];

export function TemplateSelectStep({
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectStepProps) {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          3. Choose a Project Template
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select a template to get started quickly
        </p>
      </div>

      <div className="space-y-3">
        {TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.id;

          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl.id)}
              className={cn(
                "w-full group relative rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 active:scale-[0.99]",
                isSelected
                  ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-1 ring-emerald-500/30 shadow-sm"
                  : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Visual Label Sticker Thumbnail */}
                <div className="w-28 sm:w-32 h-18 sm:h-20 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-2 flex flex-col justify-between shrink-0 shadow-xs select-none">
                  {tmpl.thumbnailType === "shipping" ? (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                        <span className="text-[8px] font-black tracking-tight text-slate-800 dark:text-slate-200">
                          ABC LOGISTICS
                        </span>
                        <QrCode className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="text-[7px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        ID: CR-10025
                      </div>
                      <div className="flex items-center justify-between text-[6px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-0.5">
                        <span>FROM: Hub-A</span>
                        <span>TO: Hub-B</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                        <span className="text-[8px] font-bold text-slate-800 dark:text-slate-200">
                          Product Name
                        </span>
                        <QrCode className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="text-[7px] text-slate-500 dark:text-slate-400 font-mono">
                        SKU: PRD-001
                      </div>
                      <div className="flex items-center gap-1 border-t border-slate-100 dark:border-slate-800 pt-0.5">
                        <Barcode className="w-12 h-3.5 text-slate-700 dark:text-slate-300" />
                      </div>
                    </>
                  )}
                </div>

                {/* Template Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {tmpl.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className="hidden sm:flex items-center justify-center shrink-0 pr-1">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                    isSelected
                      ? "border-emerald-600 bg-emerald-600"
                      : "border-slate-300 dark:border-slate-700 bg-transparent"
                  )}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
