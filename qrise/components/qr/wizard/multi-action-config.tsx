"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Plus, Trash2, GripVertical, Globe, Phone, Mail, MapPin, Download, MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QRAction } from "@/types/qr.types";
import { useToast } from "@/hooks/use-toast";

const actionTypes = [
  { value: "url", label: "URL", icon: Globe },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "map", label: "Map", icon: MapPin },
  { value: "download", label: "Download", icon: Download },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export function MultiActionConfig() {
  const { config, name: wizardName, setName: setWizardName, setConfig, editingQrId, setEditingQrId } = useWizardStore();
  const toast = useToast();
  const existingConfig = (config as any);
  
  const [actions, setActions] = useState<QRAction[]>(existingConfig?.actions || []);
  const [localName, setLocalName] = useState(wizardName || "");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync store to state (for editing)
  useEffect(() => {
    if (editingQrId) {
      setActions(existingConfig?.actions || []);
      setLocalName(wizardName || "");
    }
  }, [editingQrId, wizardName, existingConfig]);

  const addAction = (action: QRAction) => {
    if (actions.length >= 8) return;
    setActions([...actions, { ...action, id: `action-${Date.now()}`, displayOrder: actions.length }]);
    setShowModal(false);
  };

  const deleteAction = (id: string | undefined) => {
    if (!id) return;
    setActions(actions.filter((a) => a.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    setWizardName(localName);
    const newConfig = {
      type: "multi_action" as const,
      actions,
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
          type: "multi_action",
          config: newConfig,
        }),
      });

      if (!response.ok) throw new Error("Failed to save to storage");

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
        <h2 className="text-xl font-semibold text-gray-900">Multiple Action QR</h2>
        <p className="text-sm text-gray-500 mt-1">
          Let users pick from multiple destinations
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">QR Name</label>
        <input
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="My Multi-Action QR"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Actions</label>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={actions.length >= 8}
            className="flex items-center gap-1 text-sm text-[#0F6E56] hover:underline disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Action
          </button>
        </div>

        {actions.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No actions added. Add at least one action.
          </p>
        )}

        {actions.map((action) => {
          const ActionIcon = actionTypes.find((t) => t.value === action.actionType)?.icon || Globe;
          return (
            <div key={action.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
              <ActionIcon className="h-5 w-5 text-gray-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs text-gray-500 truncate">{action.actionValue}</p>
              </div>
              <button
                type="button"
                onClick={() => deleteAction(action.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <ActionModal
          onClose={() => setShowModal(false)}
          onSave={addAction}
        />
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={actions.length === 0 || loading}
        className="w-full px-4 py-2 bg-[#0F6E56] text-white rounded-lg font-medium hover:bg-[#0d5c48] disabled:opacity-50 flex items-center justify-center"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Configuration"}
      </button>
    </div>
  );
}

function ActionModal({ onClose, onSave }: { onClose: () => void; onSave: (action: QRAction) => void }) {
  const [type, setType] = useState("url");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      label,
      actionType: type as any,
      actionValue: value,
      displayOrder: 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add Action</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {actionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Visit Website"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Value</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={type === "url" ? "https://example.com" : type === "phone" ? "+1234567890" : "email@example.com"}
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[#0F6E56] text-white rounded-lg">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
