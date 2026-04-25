"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BulkRow {
  name: string;
  url: string;
  status: "valid" | "error" | "duplicate";
  error?: string;
}

interface BulkDataTableProps {
  data: BulkRow[];
  onUpdateRow: (index: number, field: "name" | "url", value: string) => void;
}

export function BulkDataTable({ data, onUpdateRow }: BulkDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const currentRows = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left font-medium w-12">#</th>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Destination URL</th>
                <th className="px-4 py-2 text-left font-medium w-16 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentRows.map((row, index) => {
                const globalIndex = (currentPage - 1) * rowsPerPage + index;
                const urlError = row.url && !isValidUrl(row.url);
                
                return (
                  <tr key={globalIndex} className="hover:bg-muted/30">
                    <td className="px-4 py-2 text-muted-foreground">{globalIndex + 1}</td>
                    <td className="px-4 py-2">
                      <Input
                        value={row.name}
                        onChange={(e) => onUpdateRow(globalIndex, "name", e.target.value)}
                        className="h-8 border-none focus-visible:ring-1 bg-transparent"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={row.url}
                        onChange={(e) => onUpdateRow(globalIndex, "url", e.target.value)}
                        className={cn(
                          "h-8 border-none focus-visible:ring-1 bg-transparent",
                          urlError ? "text-destructive" : ""
                        )}
                        placeholder="https://..."
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      {row.status === "valid" ? (
                        <CheckCircle className="h-4 w-4 text-primary mx-auto" />
                      ) : (
                        <div className="group relative mx-auto inline-block">
                          <XCircle className="h-4 w-4 text-destructive" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-destructive text-destructive-foreground text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {row.error || "Invalid data"}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {Math.min(data.length, (currentPage - 1) * rowsPerPage + 1)}-{Math.min(data.length, currentPage * rowsPerPage)} of {data.length} rows
        </p>
        
        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <div className="text-xs flex items-center px-2">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
