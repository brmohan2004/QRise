"use client";

import { CheckCircle, XCircle, Trash2, Plus, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkRow {
  name: string;
  url?: string;
  type?: string;
  label?: string;
  value?: string;
  actions?: { type: string; label: string; value: string }[];
  password?: string;
  routingField?: string;
  routingOp?: string;
  routingValue?: string;
  routingTargetUrl?: string;
  isDynamic?: boolean;
  status: "valid" | "error" | "duplicate";
  error?: string;
}

interface BulkEditorTableProps {
  data: BulkRow[];
  updateRow: (index: number, field: "name" | "url" | "password" | "isDynamic" | "type" | "label" | "value" | "routingField" | "routingOp" | "routingValue" | "routingTargetUrl", value: any) => void;
  removeRow: (index: number) => void;
  addRow: () => void;
  validCount: number;
  errorCount: number;
  bulkType?: "url" | "multi_action" | "password" | "smart_routing";
}


export function BulkEditorTable({
  data,
  updateRow,
  removeRow,
  addRow,
  validCount,
  errorCount,
  bulkType = "url"
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
                {bulkType === "multi_action" && (
                  <>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Label</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Value</th>
                  </>
                )}
                {bulkType === "smart_routing" && (
                  <>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Default URL</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Field</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Operator</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Value</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Target URL</th>
                  </>
                )}
                {(bulkType === "url" || bulkType === "password") && (
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    {bulkType === "password" ? "Protected URL" : "Destination URL"}
                  </th>
                )}
                {bulkType === "password" && (
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Password</th>
                )}
                <th className="px-4 py-3 text-left font-medium text-gray-600 text-center w-24">QR Type</th>
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
                    {bulkType === "multi_action" ? (
                      <select
                        value={row.type || "url"}
                        onChange={(e) => updateRow(index, "type" as any, e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 cursor-pointer"
                      >
                        <option value="url">URL</option>
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="map">Map</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="download">Download</option>
                      </select>
                    ) : bulkType === "smart_routing" ? (
                      <input
                        value={row.url || ""}
                        placeholder="https://default.com"
                        onChange={(e) => updateRow(index, "url", e.target.value)}
                        className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 placeholder:text-gray-300"
                      />
                    ) : (
                      <input
                        value={row.url || ""}
                        placeholder="https://example.com"
                        onChange={(e) => updateRow(index, "url", e.target.value)}
                        className={cn(
                          "w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 placeholder:text-gray-300",
                          row.status === "error" && (!row.url || !row.url.startsWith('http')) && "text-red-600"
                        )}
                      />
                    )}
                  </td>
                  {bulkType === "smart_routing" && (
                    <>
                      <td className="px-4 py-3">
                        <select
                          value={row.routingField || "device"}
                          onChange={(e) => updateRow(index, "routingField", e.target.value)}
                          className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 cursor-pointer"
                        >
                          <option value="device">Device</option>
                          <option value="os">OS</option>
                          <option value="country">Country</option>
                          <option value="language">Language</option>
                          <option value="time_range">Time Range</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.routingOp || "eq"}
                          onChange={(e) => updateRow(index, "routingOp", e.target.value)}
                          className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 cursor-pointer"
                        >
                          <option value="eq">Equals</option>
                          <option value="in">In List</option>
                          <option value="between">Between</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={row.routingValue || ""}
                          placeholder="e.g. iPhone"
                          onChange={(e) => updateRow(index, "routingValue", e.target.value)}
                          className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 placeholder:text-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={row.routingTargetUrl || ""}
                          placeholder="https://target.com"
                          onChange={(e) => updateRow(index, "routingTargetUrl", e.target.value)}
                          className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 placeholder:text-gray-300"
                        />
                      </td>
                    </>
                  )}
                  {bulkType === "multi_action" && (
                    <>
                      <td className="px-4 py-3">
                        <input
                          value={row.label || ""}
                          placeholder="Action Label"
                          onChange={(e) => updateRow(index, "label" as any, e.target.value)}
                          className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 placeholder:text-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={row.value || ""}
                          placeholder="Action Value"
                          onChange={(e) => updateRow(index, "value" as any, e.target.value)}
                          className="w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 placeholder:text-gray-300"
                        />
                      </td>
                    </>
                  )}
                  {bulkType === "password" && (
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.password || ""}
                        placeholder="Password"
                        onChange={(e) => updateRow(index, "password", e.target.value)}
                        className={cn(
                          "w-full border-none bg-transparent focus:ring-0 p-0 text-gray-900 placeholder:text-gray-300",
                          row.status === "error" && (!row.password) && "text-red-600"
                        )}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-center">
                    <select
                      value={row.isDynamic !== false ? "dynamic" : "static"}
                      onChange={(e) => updateRow(index, "isDynamic", e.target.value === "dynamic")}
                      className="border-none bg-transparent focus:ring-0 p-0 text-gray-600 text-sm w-full text-center cursor-pointer"
                    >
                      <option value="dynamic">Dynamic</option>
                      <option value="static">Static</option>
                    </select>
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
