"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoutingRule, RoutingCondition } from "@/types/qr.types";
import { useToast } from "@/hooks/use-toast";
import { useUsageStats } from "@/lib/hooks/use-usage-stats";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const conditionFields = [
  { value: "device", label: "Device Type" },
  { value: "os", label: "Operating System" },
  { value: "country", label: "Country" },
  { value: "language", label: "Language" },
  { value: "time_range", label: "Time of Day" },
];

const operators = [
  { value: "eq", label: "equals" },
  { value: "in", label: "is one of" },
  { value: "between", label: "is between" },
];

const deviceOptions = ["mobile", "tablet", "desktop"];
const osOptions = ["iOS", "Android", "Windows", "Mac", "Linux"];
const countryOptions = ["US", "GB", "DE", "FR", "CA", "AU", "JP"];


export function SmartRoutingConfig() {
  const { config, name: wizardName, setName: setWizardName, setConfig, editingQrId, setEditingQrId } = useWizardStore();
  const toast = useToast();
  const existingConfig = (config as any);
  
  const [rules, setRules] = useState<RoutingRule[]>(existingConfig?.rules || []);
  const [defaultUrl, setDefaultUrl] = useState(existingConfig?.defaultUrl || "");
  const [localName, setLocalName] = useState(wizardName || "");
  const [loading, setLoading] = useState(false);
  const { data: usage } = useUsageStats();
  const isLimitReached = !!usage && usage.metrics.dynamicQrs.limit !== -1 && usage.metrics.dynamicQrs.current >= usage.metrics.dynamicQrs.limit && !editingQrId;

  // Sync store to state (for editing)
  useEffect(() => {
    if (editingQrId) {
      setRules(existingConfig?.rules || []);
      setDefaultUrl(existingConfig?.defaultUrl || "");
      setLocalName(wizardName || "");
    }
  }, [editingQrId, wizardName, existingConfig]);

  // Filter rules with valid ids for dnd-kit
  const validRules = rules.filter((r): r is RoutingRule & { id: string } => typeof r.id === "string");

  // @dnd-kit sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setRules((items) => {
        const oldIndex = items.findIndex((r) => r.id === active.id);
        const newIndex = items.findIndex((r) => r.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addRule = () => {
    if (rules.length >= 10) return;
    const newRule: RoutingRule & { id: string } = {
      id: `rule-${Date.now()}`,
      priority: rules.length,
      conditions: [{ field: "device", op: "eq", value: "mobile" }],
      targetUrl: "",
      label: `Rule ${rules.length + 1}`,
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (id: string, updates: Partial<RoutingRule>) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRule = (id: string | undefined) => {
    if (!id) return;
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    setWizardName(localName);
    const newConfig = {
      type: "smart_routing" as const,
      defaultUrl,
      rules,
    };
    setConfig(newConfig);

    try {
      const isEditing = !!editingQrId;
      const url = isEditing ? `/api/qr/${editingQrId}` : "/api/qr";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: localName,
          type: "smart_routing",
          config: newConfig,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save to storage");
      }

      const data = await response.json();
      if (!isEditing && data.data?.id) {
        setEditingQrId(data.data.id);
        // Sync the full saved QR back to the store (includes shortCode)
        setConfig(data.data);
      }
      
      toast.success("Configuration saved to storage");
    } catch (e: any) {
      toast.error(e.message || "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Smart Routing QR</h2>
        <p className="text-sm text-gray-500 mt-1">
          Route scans based on device, location, or time
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">QR Name</label>
        <input
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="My Smart QR"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Default URL (fallback)</label>
        <input
          type="url"
          value={defaultUrl}
          onChange={(e) => setDefaultUrl(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="https://default.com"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Routing Rules</label>
          <button
            type="button"
            onClick={addRule}
            disabled={rules.length >= 10}
            className="flex items-center gap-1 text-sm text-[#0F6E56] hover:underline disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Rule
          </button>
        </div>

        {rules.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No rules added. Scans will go to the default URL.
          </p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={validRules} strategy={verticalListSortingStrategy}>
            {validRules.map((rule, index) => (
              <SortableRule
                key={rule.id}
                rule={rule}
                index={index}
                onUpdate={updateRule}
                onDelete={deleteRule}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading || isLimitReached}
        className="w-full px-4 py-2 bg-[#0F6E56] text-white rounded-lg font-medium hover:bg-[#0d5c48] disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Configuration"}
      </button>
    </div>
  );
}

interface SortableRuleProps {
  rule: RoutingRule & { id: string };
  index: number;
  onUpdate: (id: string, updates: Partial<RoutingRule>) => void;
  onDelete: (id: string | undefined) => void;
}

function SortableRule({ rule, index, onUpdate, onDelete }: SortableRuleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-move touch-none"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </button>
        <span className="text-sm font-medium">Rule {index + 1}</span>
        <button
          type="button"
          onClick={() => onDelete(rule.id)}
          className="ml-auto text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <select
          value={rule.conditions[0]?.field || "device"}
          onChange={(e) => {
            onUpdate(rule.id, {
              conditions: [{ ...rule.conditions[0], field: e.target.value as any }],
            });
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {conditionFields.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          value={rule.conditions[0]?.op || "eq"}
          onChange={(e) => {
            onUpdate(rule.id, {
              conditions: [{ ...rule.conditions[0], op: e.target.value as any }],
            });
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {operators.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={rule.conditions[0]?.value as string || ""}
          onChange={(e) => {
            onUpdate(rule.id, {
              conditions: [{ ...rule.conditions[0], value: e.target.value }],
            });
          }}
          placeholder="mobile"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div>
        <input
          type="url"
          value={rule.targetUrl}
          onChange={(e) => {
            onUpdate(rule.id, { targetUrl: e.target.value });
          }}
          placeholder="Target URL for this rule"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </div>
  );
}
