"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ChevronRight, 
  QrCode, 
  Barcode, 
  Printer, 
  Plus, 
  Layers, 
  X, 
  Eye, 
  FileSpreadsheet,
  CheckCircle2,
  Phone,
  MapPin
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LabelCardItem {
  id: string;
  trackingCode: string;
  title: string;
  subTitle: string;
  type: string;
  symbology: string;
  createdAt: string;
  status: "Active" | "Draft" | "Archived";
  totalCount: number;
  items: Array<{
    id: string;
    code: string;
    name: string;
    mobile: string;
    address: string;
    pincode: string;
    extra: string;
  }>;
}

const DEFAULT_CARDS: LabelCardItem[] = [
  {
    id: "batch-shipping-standard",
    trackingCode: "CR-10025",
    title: "ABC LOGISTICS",
    subTitle: "Fast · Secure · Worldwide Priority",
    type: "4 × 6\" Standard Shipping Slip",
    symbology: "Code 128 + QR",
    createdAt: "Created 2 mins ago",
    status: "Active",
    totalCount: 3,
    items: [
      {
        id: "item-1",
        code: "CR-10025",
        name: "John Doe",
        mobile: "+91 98765 43210",
        address: "456, MG Road, Indiranagar, Bengaluru",
        pincode: "560038",
        extra: "Weight: 2.5 KG",
      },
      {
        id: "item-2",
        code: "CR-10026",
        name: "Sarah Smith",
        mobile: "+91 91234 56789",
        address: "12, Anna Salai, Guindy, Chennai",
        pincode: "600032",
        extra: "Weight: 1.2 KG",
      },
      {
        id: "item-3",
        code: "CR-10027",
        name: "Rajesh Kumar",
        mobile: "+91 99887 76655",
        address: "78, Ring Road, Sector 4, New Delhi",
        pincode: "110001",
        extra: "Weight: 4.0 KG",
      },
    ],
  },
  {
    id: "batch-pos-receipts",
    trackingCode: "INV-99042",
    title: "RETAIL STORE CHECKOUT",
    subTitle: "Tax Invoice / Cash Memo",
    type: "80mm POS Thermal Receipt",
    symbology: "EAN-13 + QR",
    createdAt: "Created 1 hour ago",
    status: "Active",
    totalCount: 2,
    items: [
      {
        id: "item-pos-1",
        code: "INV-99042",
        name: "Counter 1 Customer",
        mobile: "+91 94444 11223",
        address: "Walk-in Store Purchase",
        pincode: "600001",
        extra: "Total: ₹2,450",
      },
      {
        id: "item-pos-2",
        code: "INV-99043",
        name: "Online Pickup Order",
        mobile: "+91 98888 22334",
        address: "Store Pickup Bay 3",
        pincode: "600001",
        extra: "Total: ₹1,120",
      },
    ],
  },
];

interface WorkspaceLabelsListProps {
  projectId?: string;
}

export function WorkspaceLabelsList({ projectId = "courier-tracking" }: WorkspaceLabelsListProps) {
  const [cards, setCards] = useState<LabelCardItem[]>(DEFAULT_CARDS);
  const [selectedCard, setSelectedCard] = useState<LabelCardItem | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isGenerateNewOpen, setIsGenerateNewOpen] = useState(false);

  // New item form state for "Generate New With Same Label"
  const [newName, setNewName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [newExtra, setNewExtra] = useState("Weight: 1.5 KG");

  // Load dynamically created batches from sessionStorage if available
  useEffect(() => {
    try {
      const key = `qrise_project_labels_${projectId}`;
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted: LabelCardItem[] = parsed.map((p: any) => ({
            id: p.id,
            trackingCode: `${p.prefix || "CR-"}10001`,
            title: p.labelTitle || "ABC LOGISTICS",
            subTitle: p.labelSubTitle || "Standard Priority Delivery",
            type: p.templateName || "4 × 6\" Shipping Slip",
            symbology: p.barcodeSymbology || "Code 128",
            createdAt: p.createdAt || "Just now",
            status: "Active",
            totalCount: p.rows?.length || 1,
            items: (p.rows || []).map((r: any, idx: number) => ({
              id: r.id || `item-${idx + 1}`,
              code: `${p.prefix || "CR-"}100${idx + 1}`,
              name: r.name || `Customer ${idx + 1}`,
              mobile: r.mobileNo || "",
              address: r.address || "",
              pincode: r.pincode || "",
              extra: r.extraField || "",
            })),
          }));

          setCards([...formatted, ...DEFAULT_CARDS]);
        }
      }
    } catch {
      // Ignore errors
    }
  }, [projectId]);

  const handleOpenCard = (card: LabelCardItem) => {
    setSelectedCard(card);
    setIsDetailSheetOpen(true);
  };

  const handleOpenGenerateNew = () => {
    setNewName("");
    setNewMobile("");
    setNewAddress("");
    setNewPincode("");
    setNewExtra("Weight: 1.5 KG");
    setIsGenerateNewOpen(true);
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    if (!newName.trim()) {
      toast.error("Please enter a recipient name");
      return;
    }

    const newItem = {
      id: `item-${Date.now()}`,
      code: `${selectedCard.trackingCode.split("-")[0] || "CR"}-${10000 + selectedCard.items.length + 1}`,
      name: newName.trim(),
      mobile: newMobile.trim(),
      address: newAddress.trim() || "Local Express Hub",
      pincode: newPincode.trim() || "600001",
      extra: newExtra.trim(),
    };

    const updatedCard: LabelCardItem = {
      ...selectedCard,
      totalCount: selectedCard.totalCount + 1,
      items: [newItem, ...selectedCard.items],
    };

    setCards(cards.map((c) => (c.id === selectedCard.id ? updatedCard : c)));
    setSelectedCard(updatedCard);
    setIsGenerateNewOpen(false);
    toast.success(`Generated new label (${newItem.code}) with ${selectedCard.title}!`);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Labels
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Click any label card to view all generated labels or add new with same design
          </p>
        </div>

        <Link
          href={`/qrise-matrix/projects/${projectId}/add-label`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Label</span>
        </Link>
      </div>

      {/* Label Cards List */}
      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleOpenCard(card)}
            className="group rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {/* Visual Single Printable Sticker Thumbnail Preview */}
              <div className="w-24 sm:w-28 h-16 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-1.5 flex flex-col justify-between shrink-0 select-none shadow-xs group-hover:scale-102 transition-transform">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-0.5">
                  <span className="text-[7px] font-black text-slate-800 dark:text-slate-200 tracking-tight truncate">
                    {card.title}
                  </span>
                  <QrCode className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200 shrink-0" />
                </div>
                <div className="text-[6px] font-mono font-bold text-slate-500">
                  {card.trackingCode}
                </div>
                <div className="pt-0.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <Barcode className="w-10 h-2.5 text-slate-800 dark:text-slate-200" />
                  <span className="text-[5px] font-mono text-emerald-600 font-bold">
                    #{card.totalCount}
                  </span>
                </div>
              </div>

              {/* Label Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {card.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                    {card.totalCount} {card.totalCount === 1 ? "Label" : "Labels"}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {card.type} <span className="mx-1">·</span> {card.symbology}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {card.createdAt}
                </p>
              </div>
            </div>

            {/* Chevron */}
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {/* SHEET 1: SHOW ALL LABELS IN CARD + ADD NEW BUTTON */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent 
          side="bottom" 
          className="rounded-t-[32px] p-5 pb-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto max-w-2xl mx-auto"
        >
          {selectedCard && (
            <div className="space-y-4">
              <SheetHeader className="text-left px-0 pt-0 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <SheetTitle className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                        {selectedCard.title}
                      </SheetTitle>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                        {selectedCard.items.length} Labels
                      </span>
                    </div>
                    <SheetDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedCard.type} ({selectedCard.symbology})
                    </SheetDescription>
                  </div>

                  {/* Add New with Same Label Trigger Button */}
                  <Button
                    onClick={handleOpenGenerateNew}
                    size="sm"
                    className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add New</span>
                  </Button>
                </div>
              </SheetHeader>

              {/* All Labels List under this Card */}
              <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {selectedCard.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          {item.code}
                        </span>
                        <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                          {item.name}
                        </span>
                        {item.mobile && (
                          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {item.mobile}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.address} {item.pincode && `· PIN: ${item.pincode}`}</span>
                      </p>

                      {item.extra && (
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          {item.extra}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toast.success(`Printing label ${item.code}`)}
                        className="h-8 w-8 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600"
                        title="Print this label"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* SHEET 2: GENERATE NEW WITH SAME LABEL */}
      <Sheet open={isGenerateNewOpen} onOpenChange={setIsGenerateNewOpen}>
        <SheetContent 
          side="bottom" 
          className="rounded-t-[32px] p-5 pb-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto max-w-lg mx-auto"
        >
          {selectedCard && (
            <form onSubmit={handleSaveNewItem} className="space-y-4">
              <SheetHeader className="text-left px-0 pt-0 pb-1">
                <SheetTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                  Generate New with Same Label
                </SheetTitle>
                <SheetDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Creating another item using <strong>{selectedCard.title}</strong> template
                </SheetDescription>
              </SheetHeader>

              {/* Recipient Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Recipient Name <span className="text-emerald-500">*</span>
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="rounded-xl h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 font-semibold"
                  required
                />
              </div>

              {/* Mobile No */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mobile Number
                </label>
                <Input
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="rounded-xl h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Delivery Address
                </label>
                <Input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Street, Building, Area"
                  className="rounded-xl h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950"
                />
              </div>

              {/* Pincode & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Pincode
                  </label>
                  <Input
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    placeholder="560038"
                    className="rounded-xl h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Weight / Extra Notes
                  </label>
                  <Input
                    value={newExtra}
                    onChange={(e) => setNewExtra(e.target.value)}
                    placeholder="Weight: 2.0 KG"
                    className="rounded-xl h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGenerateNewOpen(false)}
                  className="rounded-xl h-10 text-xs font-bold border-slate-200 dark:border-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Generate Label</span>
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
