"use client";

import React, { useState, use } from "react";
import { toast } from "sonner";
import { CreateLabelHeader } from "./components/create-label-header";
import { LabelCanvas } from "./components/label-canvas";
import { AddElementSheet, ElementType } from "./components/add-element-sheet";
import { ElementPropertiesSheet, CanvasElement } from "./components/element-properties-sheet";

interface CreateLabelPageProps {
  params: Promise<{ projectId: string }>;
}

const INITIAL_ELEMENTS: CanvasElement[] = [
  {
    id: "elem-header",
    type: "text",
    title: "Header Title",
    content: "ABC LOGISTICS",
    subContent: "Fast · Secure · Worldwide",
  },
  {
    id: "elem-id",
    type: "text",
    title: "Shipment ID",
    content: "CR-10025",
  },
  {
    id: "elem-from",
    type: "text",
    title: "Sender Address",
    content: "Chennai Warehouse\n123 Industrial Area\nChennai, Tamil Nadu\n600001",
  },
  {
    id: "elem-to",
    type: "text",
    title: "Recipient Address",
    content: "John Doe\n456, MG Road\nBengaluru, Karnataka\n560001",
  },
  {
    id: "elem-barcode",
    type: "barcode",
    title: "Shipping Barcode",
    content: "CR-10025",
    barcodeType: "Code 128",
  },
  {
    id: "elem-qr",
    type: "qr",
    title: "Tracking QR Code",
    content: "https://qrise.app/s/CR-10025",
  },
];

export default function CreateLabelPage({ params }: CreateLabelPageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId || "courier-tracking";
  const projectName = projectId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const [labelName, setLabelName] = useState("Shipping Barcode Label");
  const [labelDescription, setLabelDescription] = useState("Standard 4x6 thermal shipping label template");
  const [elements, setElements] = useState<CanvasElement[]>(INITIAL_ELEMENTS);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle element selection on canvas -> opens properties sheet
  const handleSelectElement = (element: CanvasElement) => {
    setSelectedElement(element);
    setIsPropertiesOpen(true);
  };

  // Handle adding an element from the Add Element sheet
  const handleAddElement = (type: ElementType) => {
    const newId = `elem-${Date.now()}`;
    let newElement: CanvasElement;

    switch (type) {
      case "text":
        newElement = { id: newId, type: "text", title: "Custom Text", content: "New Text Field" };
        break;
      case "barcode":
        newElement = { id: newId, type: "barcode", title: "Barcode", content: "CR-99001", barcodeType: "Code 128" };
        break;
      case "qr":
        newElement = { id: newId, type: "qr", title: "QR Code", content: "https://qrise.app" };
        break;
      case "dynamic":
        newElement = { id: newId, type: "dynamic", title: "Dynamic Variable", content: "{{tracking_code}}" };
        break;
      case "date":
        newElement = { id: newId, type: "date", title: "Print Date", content: new Date().toLocaleDateString() };
        break;
      case "table":
        newElement = { id: newId, type: "table", title: "Item Grid", content: "Items: 1 x Parcel (2.5kg)" };
        break;
      default:
        newElement = { id: newId, type: type, title: type.toUpperCase(), content: `Custom ${type}` };
        break;
    }

    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement);
    setIsPropertiesOpen(true);
    toast.success(`Added ${newElement.title} to canvas`);
  };

  // Update element properties
  const handleUpdateElement = (updated: CanvasElement) => {
    setElements((prev) => prev.map((el) => (el.id === updated.id ? updated : el)));
    setSelectedElement(updated);
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setIsPropertiesOpen(false);
    setSelectedElement(null);
    toast.info("Element removed from canvas");
  };

  // Save template
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Label template saved successfully!");
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Header Bar with Editable Label Details */}
      <CreateLabelHeader
        labelName={labelName}
        onLabelNameChange={setLabelName}
        labelDescription={labelDescription}
        onLabelDescriptionChange={setLabelDescription}
        projectName={projectName}
        projectId={projectId}
        onSave={handleSave}
        onPreview={() => toast.info("Opening high-res thermal print preview...")}
        onShare={() => toast.success("Template link copied to clipboard!")}
        isSaving={isSaving}
      />

      {/* 2. Interactive Printable Canvas */}
      <LabelCanvas
        elements={elements}
        selectedElementId={selectedElement?.id || null}
        onSelectElement={handleSelectElement}
        onOpenAddSheet={() => setIsAddSheetOpen(true)}
      />

      {/* 3. Add Element Bottom Sheet (10 Elements Grid) */}
      <AddElementSheet
        open={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        onAddElement={handleAddElement}
      />

      {/* 4. Element Properties Sheet (Opens when clicking an element) */}
      <ElementPropertiesSheet
        element={selectedElement}
        open={isPropertiesOpen}
        onClose={() => setIsPropertiesOpen(false)}
        onUpdate={handleUpdateElement}
        onDelete={handleDeleteElement}
      />
    </div>
  );
}
