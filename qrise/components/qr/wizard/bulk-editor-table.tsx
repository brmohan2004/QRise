"use client";

import { CheckCircle, XCircle, Trash2, Plus, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkRow {
  name: string;
  url: string;
  status: "valid" | "error" | "duplicate";
  error?: string;
}

interface BulkEditorTableProps {
  data: BulkRow[];
  updateRow: (index: number, field: "name" | "url", value: string) => void;
  removeRow: (index: number) => void;
  addRow: () => void;
  validCount: number;
  errorCount: number;
}

export function BulkEditorTable({
  data,
  updateRow,
  removeRow,
  addRow,
  validCount,
  errorCount
}: BulkEditorTableProps) {
  return (
    <>
      {/* Summary */}
      <div className="flex items-center gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
        <span className="flex items-center gap-1.5 font-medium text-gray-700">
          <FileText className="h-4 w-4 text-gray-400" />
          {data.length} Total Rows
        </span>
        <div className="h-4 w-px bg-gray-200 mx-1" />
        <span className="flex items-center gap-1 text-green-600 font-medium">
          <CheckCircle className="h-4 w-4" />
          {validCount} Ready
        </span>
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-red-600 font-medium">
            <XCircle className="h-4 w-4" />
            {errorCount} Issues
          </span>
        )}
      </div>

      {/* Data table */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="max-h-[400px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600 w-12">#</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Destination URL</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 w-24 text-center">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3">
                    <input
                      value={row.name}
                      placeholder="e.g. Website QR"
                      onChange={(e) => updateRow(index, "name", e.target.value)}
                      className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 placeholder:text-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={row.url}
                      placeholder="https://example.com"
                      onChange={(e) => updateRow(index, "url", e.target.value)}
                      className={cn(
                        "w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 placeholder:text-gray-300",
                        row.status === "error" && "text-red-600"
                      )}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.status === "valid" ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <div className="group relative mx-auto inline-block">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-red-600 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                          {row.error || "Invalid URL"}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeRow(index)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={addRow}
          className="w-full py-3 text-sm text-[#0F6E56] font-medium bg-gray-50/50 hover:bg-[#0F6E56]/5 border-t border-gray-100 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Row
        </button>
      </div>
    </>
  );
}
