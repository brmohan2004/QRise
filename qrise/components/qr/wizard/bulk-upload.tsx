"use client";

import { useState, useCallback, useEffect } from "react";
import { useWizardStore } from "@/stores/qr-wizard.store";
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, Loader2, Plus, Trash2, LayoutGrid } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { BulkEditorTable } from "./bulk-editor-table";

interface BulkRow {
  name: string;
  url: string;
  status: "valid" | "error" | "duplicate";
  error?: string;
}

export function BulkUpload() {
  const { config, setConfig } = useWizardStore();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<BulkRow[]>(config.rows || []);
  const [isManualEntry, setIsManualEntry] = useState(!!config.rows?.length);
  const [isFetchingBatch, setIsFetchingBatch] = useState(false);

  useEffect(() => {
    // If we have a bulkJobId but no rows in config, fetch the batch items
    if (config.bulkJobId && (!config.rows || config.rows.length === 0)) {
      setIsFetchingBatch(true);
      fetch(`/api/qr?bulkJobId=${config.bulkJobId}&limit=100`)
        .then(res => res.json())
        .then(json => {
          const items = (json.items || []).map((item: any) => ({
            name: item.name,
            url: item.targetUrl,
            status: "valid" as const
          }));
          setData(items);
          setIsManualEntry(true);
          // Sync back to store so it's preserved
          setConfig({ rows: items });
        })
        .catch(err => {
          console.error("Failed to fetch batch items:", err);
          toast.error("Failed to load batch details");
        })
        .finally(() => setIsFetchingBatch(false));
    }
  }, [config.bulkJobId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const name = selectedFile.name.toLowerCase();
      if (name.endsWith('.csv')) {
        processFile(selectedFile);
      } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        processExcel(selectedFile);
      } else {
        toast.error("Please upload a .csv or .xlsx file.");
      }
    }
  };

  const processExcel = (file: File) => {
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
          toast.error("The Excel file is empty.");
          return;
        }

        // Try to find Name and URL columns
        const headers = jsonData[0].map(h => String(h || "").trim().toLowerCase());
        let nameIdx = headers.findIndex(h => h === "name" || h.includes("name") || h === "title");
        let urlIdx = headers.findIndex(h => h === "url" || h.includes("url") || h.includes("link") || h.includes("destination"));

        // Fallback
        if (nameIdx === -1) nameIdx = 0;
        if (urlIdx === -1) urlIdx = 1;

        const rows: BulkRow[] = jsonData.slice(1)
          .filter(row => row.length > 0 && row.some(cell => cell))
          .map((row, index) => {
            const name = String(row[nameIdx] || "").trim() || `QR ${index + 1}`;
            let url = String(row[urlIdx] || "").trim();
            if (url && !url.startsWith("http") && url.includes(".")) url = "https://" + url;
            const isValid = url.startsWith("http");
            return { 
              name, 
              url, 
              status: isValid ? "valid" : "error", 
              error: isValid ? undefined : "Invalid URL" 
            };
          });

        if (rows.length > 0) {
          setData(rows);
          setIsManualEntry(true);
          toast.success(`Successfully extracted ${rows.length} rows from Excel.`);
        } else {
          toast.error("No valid data found in the Excel file.");
        }
      } catch (error) {
        console.error("Excel parse error:", error);
        toast.error("Failed to parse Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processFile = (file: File) => {
    setFile(file);
    
    // First attempt: with headers
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const headers = results.meta.fields || [];
        const cleanHeader = (h: string) => h?.trim().replace(/^\ufeff/, "").toLowerCase() || "";
        
        const nameKey = headers.find(h => cleanHeader(h) === 'name' || cleanHeader(h).includes('name'));
        const urlKey = headers.find(h => cleanHeader(h) === 'url' || cleanHeader(h).includes('url') || cleanHeader(h).includes('link'));

        // If we found headers, process normally
        if (nameKey && urlKey) {
          const rows: BulkRow[] = results.data
            .filter((row: any) => Object.values(row).some(v => v))
            .map((row: any, index: number) => {
              const name = String(row[nameKey!] || "").trim() || `QR ${index + 1}`;
              let url = String(row[urlKey!] || "").trim();
              if (url && !url.startsWith('http') && url.includes('.')) url = 'https://' + url;
              const isValid = url.startsWith('http');
              return { name, url, status: isValid ? "valid" : "error", error: isValid ? undefined : "Invalid URL" };
            });
          
          if (rows.length > 0) {
            setData(rows);
            setIsManualEntry(true);
            toast.success(`Successfully extracted ${rows.length} rows.`);
            return;
          }
        }

        // Second attempt: without headers (use first/second columns)
        Papa.parse(file, {
          header: false,
          skipEmptyLines: 'greedy',
          complete: (rawResults) => {
            const rawData = rawResults.data as string[][];
            if (rawData.length === 0) {
              toast.error("The CSV file is empty.");
              return;
            }

            // Skip first row if it looks like headers
            const startIdx = (rawData[0][0]?.toLowerCase().includes('name') || rawData[0][1]?.toLowerCase().includes('url')) ? 1 : 0;
            
            const rows: BulkRow[] = rawData.slice(startIdx)
              .filter(row => row.length >= 1 && row.some(cell => cell.trim()))
              .map((row, index) => {
                const name = row[0]?.trim() || `QR ${index + 1}`;
                let url = row[1]?.trim() || "";
                if (url && !url.startsWith('http') && url.includes('.')) url = 'https://' + url;
                const isValid = url.startsWith('http');
                return { name, url, status: isValid ? "valid" : "error", error: isValid ? undefined : "Invalid URL" };
              });

            if (rows.length > 0) {
              setData(rows);
              setIsManualEntry(true);
              toast.success(`Successfully extracted ${rows.length} rows.`);
            } else {
              toast.error("No valid data rows found in the CSV.");
            }
          }
        });
      },
      error: () => toast.error("Failed to parse CSV file.")
    });
  };

  const updateRow = (index: number, field: "name" | "url", value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    
    // Validate
    if (field === "url") {
      if (value && !value.startsWith("http://") && !value.startsWith("https://")) {
        newData[index].status = "error";
        newData[index].error = "Invalid URL";
      } else {
        newData[index].status = "valid";
        newData[index].error = undefined;
      }
    }
    
    setData(newData);
  };

  const addRow = () => {
    setData([...data, { name: "", url: "", status: "valid" }]);
    setIsManualEntry(true);
  };

  const removeRow = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const startManualEntry = () => {
    setIsManualEntry(true);
    if (data.length === 0) {
      setData([{ name: "", url: "", status: "valid" }]);
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulation of storage save or bulk prep
    try {
      setConfig({
        type: "bulk",
        totalRows: validCount,
        rows: data.filter((r) => r.status === "valid"),
      });
      // In a real bulk scenario, we might call /api/qr/bulk here
      await new Promise(resolve => setTimeout(resolve, 800)); 
      toast.success("Bulk configuration saved to storage");
    } finally {
      setLoading(false);
    }
  };

  const validCount = data.filter((r) => r.status === "valid").length;
  const errorCount = data.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bulk Generator</h2>
          <p className="text-sm text-gray-500 mt-1">
            Generate hundreds of QR codes at once
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.length > 0 && (
            <button
              onClick={() => { setFile(null); setData([]); setIsManualEntry(false); }}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          )}
          <label className="inline-block">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="px-4 py-1.5 bg-[#0F6E56]/10 text-[#0F6E56] hover:bg-[#0F6E56]/20 rounded-lg cursor-pointer text-sm font-medium flex items-center gap-2 transition-colors border border-[#0F6E56]/20">
              <Upload className="h-4 w-4" />
              Upload CSV
            </span>
          </label>
        </div>
      </div>

      {isFetchingBatch ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-gray-100 rounded-3xl">
          <Loader2 className="w-12 h-12 text-[#0F6E56] animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading batch details...</p>
        </div>
      ) : !isManualEntry && data.length === 0 ? (
        <div
          onClick={startManualEntry}
          className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-[#0F6E56] hover:bg-[#0F6E56]/5 transition-all cursor-pointer group"
        >
          <div className="h-16 w-16 bg-[#0F6E56]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <LayoutGrid className="h-8 w-8 text-[#0F6E56]" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Prepare the Bulk QR</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Manually enter Name and URL details or upload a CSV to get started.
          </p>
        </div>
      ) : (
        <>
          <BulkEditorTable 
            data={data}
            updateRow={updateRow}
            removeRow={removeRow}
            addRow={addRow}
            validCount={validCount}
            errorCount={errorCount}
          />

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={validCount === 0 || loading}
              className="w-full px-4 py-3 bg-[#0F6E56] text-white rounded-xl font-semibold hover:bg-[#0d5c48] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#0F6E56]/20 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Generate {validCount} QR Codes
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}