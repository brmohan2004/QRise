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
  url?: string;
  type?: string;
  label?: string;
  value?: string;
  routingField?: string;
  routingOp?: string;
  routingValue?: string;
  routingTargetUrl?: string;
  actions?: { type: string; label: string; value: string }[];
  password?: string;
  isDynamic?: boolean;
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
  const [bulkType, setBulkType] = useState<"url" | "multi_action" | "password" | "smart_routing">((config as any).bulkType || "url");

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

        const stringData = jsonData.map(row => row.map(cell => String(cell || "")));
        parseDataRows(stringData);
      } catch (error) {
        console.error("Excel parse error:", error);
        toast.error("Failed to parse Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processFile = (file: File) => {
    setFile(file);
    Papa.parse(file, {
      header: false,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const rawData = results.data as string[][];
        if (rawData.length === 0) {
          toast.error("The CSV file is empty.");
          return;
        }
        parseDataRows(rawData);
      },
      error: () => toast.error("Failed to parse CSV file.")
    });
  };

  const parseDataRows = (rawData: string[][]) => {
    const firstRowStr = rawData[0].join(' ').toLowerCase();
    const isHeader = firstRowStr.includes('name') || firstRowStr.includes('#');
    const startIdx = isHeader ? 1 : 0;
    const dataRows = rawData.slice(startIdx).filter(r => r.length > 1 && r.some(c => c.trim()));

    if (dataRows.length > 400) {
      toast.error(`Maximum 400 rows allowed per file. Found ${dataRows.length} rows.`);
      return;
    }

    if (dataRows.length === 0) {
      toast.error("No valid data rows found in the file.");
      return;
    }

    const parseDynamic = (val: string) => {
      if (!val) return true;
      return val.toLowerCase().includes('dynamic') || val.toLowerCase().trim() === 'true';
    };

    if (bulkType === "multi_action") {
      const rows: BulkRow[] = dataRows.map((row, index) => {
        const name = row[1]?.trim() || `QR ${index + 1}`;
        const type = row[2]?.trim() || "url";
        const label = row[3]?.trim() || "Link";
        const value = row[4]?.trim() || "";
        const dynamicStr = row[5]?.trim() || "dynamic";
        
        return {
          name,
          type,
          label,
          value,
          isDynamic: parseDynamic(dynamicStr),
          status: value ? "valid" : "error",
          error: value ? undefined : "Missing action value"
        };
      });
      
      setData(rows);
      setIsManualEntry(true);
      toast.success(`Successfully extracted ${rows.length} action rows.`);
      
    } else if (bulkType === "smart_routing") {
      // #, name, Default URL, Condition Field, Condition Operator, Condition Value, Target URL, dynamic or static
      const rows: BulkRow[] = dataRows.map((row, index) => {
        const name = row[1]?.trim() || `QR ${index + 1}`;
        let url = row[2]?.trim() || "";
        if (url && !url.startsWith('http') && url.includes('.')) url = 'https://' + url;
        const field = row[3]?.trim() || "device";
        const op = row[4]?.trim() || "eq";
        const value = row[5]?.trim() || "";
        let targetUrl = row[6]?.trim() || "";
        if (targetUrl && !targetUrl.startsWith('http') && targetUrl.includes('.')) targetUrl = 'https://' + targetUrl;
        const dynamicStr = row[7]?.trim() || "dynamic";
        
        const isValid = url.startsWith('http') && targetUrl.startsWith('http');
        return { 
          name, 
          url, 
          routingField: field,
          routingOp: op,
          routingValue: value,
          routingTargetUrl: targetUrl,
          isDynamic: parseDynamic(dynamicStr),
          status: isValid ? "valid" : "error", 
          error: isValid ? undefined : "Invalid URLs (Default or Target)" 
        };
      });
      
      setData(rows);
      setIsManualEntry(true);
      toast.success(`Successfully extracted ${rows.length} smart routing rules.`);
      
    } else if (bulkType === "password") {
      // #, name, Protected URL, password, Confirm Password, dynamic or static
      const rows: BulkRow[] = dataRows.map((row, index) => {
        const name = row[1]?.trim() || `QR ${index + 1}`;
        let url = row[2]?.trim() || "";
        if (url && !url.startsWith('http') && url.includes('.')) url = 'https://' + url;
        const password = row[3]?.trim() || "";
        const confirmPassword = row[4]?.trim() || "";
        const dynamicStr = row[5]?.trim() || "dynamic";
        
        const isValidUrl = url.startsWith('http');
        const isPasswordValid = password && password === confirmPassword;
        
        let status: "valid" | "error" = "valid";
        let error: string | undefined;
        if (!isValidUrl) { status = "error"; error = "Invalid URL"; }
        else if (!isPasswordValid) { status = "error"; error = "Passwords do not match or empty"; }
        
        return {
          name,
          url,
          password,
          isDynamic: parseDynamic(dynamicStr),
          status,
          error
        };
      });
      
      setData(rows);
      setIsManualEntry(true);
      toast.success(`Successfully extracted ${rows.length} password QRs.`);
      
    } else {
      // url: #, name, URL, dynamic or static
      const rows: BulkRow[] = dataRows.map((row, index) => {
        const name = row[1]?.trim() || `QR ${index + 1}`;
        let url = row[2]?.trim() || "";
        if (url && !url.startsWith('http') && url.includes('.')) url = 'https://' + url;
        const dynamicStr = row[3]?.trim() || "dynamic";
        
        const isValid = url.startsWith('http');
        return { 
          name, 
          url, 
          isDynamic: parseDynamic(dynamicStr),
          status: isValid ? "valid" : "error", 
          error: isValid ? undefined : "Invalid URL" 
        };
      });
      
      setData(rows);
      setIsManualEntry(true);
      toast.success(`Successfully extracted ${rows.length} URL QRs.`);
    }
  };

  const updateRow = (index: number, field: "name" | "url" | "password" | "isDynamic" | "type" | "label" | "value" | "routingField" | "routingOp" | "routingValue" | "routingTargetUrl", value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    
    // Re-validate row
    const row = newData[index];
    if (bulkType === "url") {
      if (!row.url || (!row.url.startsWith("http://") && !row.url.startsWith("https://"))) {
        row.status = "error";
        row.error = "Invalid URL";
      } else {
        row.status = "valid";
        row.error = undefined;
      }
    } else if (bulkType === "smart_routing") {
      if (!row.url?.startsWith("http") || !row.routingTargetUrl?.startsWith("http")) {
        row.status = "error";
        row.error = "Invalid URLs (Default or Target)";
      } else {
        row.status = "valid";
        row.error = undefined;
      }
    } else if (bulkType === "password") {
      if (!row.url || (!row.url.startsWith("http://") && !row.url.startsWith("https://"))) {
        row.status = "error";
        row.error = "Invalid URL";
      } else if (!row.password) {
        row.status = "error";
        row.error = "Password is required";
      } else {
        row.status = "valid";
        row.error = undefined;
      }
    } else if (bulkType === "multi_action") {
      if (!row.value) {
        row.status = "error";
        row.error = "Missing action value";
      } else {
        row.status = "valid";
        row.error = undefined;
      }
    }
    
    setData(newData);
  };

  const addRow = () => {
    const status = (bulkType === "url" || bulkType === "password" || bulkType === "smart_routing") ? "error" : "valid";
    setData([...data, { 
      name: "", 
      url: "", 
      password: "", 
      type: "url", 
      label: "Link", 
      value: "", 
      routingField: "device",
      routingOp: "eq",
      routingValue: "",
      routingTargetUrl: "",
      isDynamic: true, 
      status 
    }]);
    setIsManualEntry(true);
  };

  const removeRow = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const startManualEntry = () => {
    setIsManualEntry(true);
    if (data.length === 0) {
      const status = (bulkType === "url" || bulkType === "password" || bulkType === "smart_routing") ? "error" : "valid";
      setData([{ 
        name: "", 
        url: "", 
        password: "", 
        type: "url", 
        label: "Link", 
        value: "", 
        routingField: "device",
        routingOp: "eq",
        routingValue: "",
        routingTargetUrl: "",
        isDynamic: true, 
        status 
      }]);
    }
  };

  const downloadSampleCSV = () => {
    let content = "";
    let filename = "";

    switch (bulkType) {
      case "url":
        content = "#,name,URL,dynamic or static\n1,Example QR,https://example.com,dynamic";
        filename = "sample_url_bulk.csv";
        break;
      case "password":
        content = "#,name,Protected URL,password,Confirm Password,dynamic or static\n1,Private QR,https://private.com,1234,1234,dynamic";
        filename = "sample_password_bulk.csv";
        break;
      case "multi_action":
        content = "#,name,type,Label,Value,dynamic or static\n1,Store Link,url,Website,https://store.com,dynamic\n2,Store Link,phone,Call Us,123456789,dynamic";
        filename = "sample_multi_action_bulk.csv";
        break;
      case "smart_routing":
        content = "#,name,Default URL,Condition Field,Condition Operator,Condition Value,Target URL,dynamic or static\n1,Global Hub,https://default.com,country,eq,US,https://us.site.com,dynamic";
        filename = "sample_smart_routing_bulk.csv";
        break;
    }

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulation of storage save or bulk prep
    try {
      let finalRows = data.filter((r) => r.status === "valid");
      
      // Group rows for multi_action
      if (bulkType === "multi_action") {
        const grouped = new Map<string, any>();
        finalRows.forEach(row => {
          if (!grouped.has(row.name)) {
            grouped.set(row.name, {
              name: row.name,
              isDynamic: row.isDynamic,
              actions: []
            });
          }
          grouped.get(row.name).actions.push({
            type: row.type || "url",
            label: row.label || "Link",
            value: row.value || ""
          });
        });
        finalRows = Array.from(grouped.values());
      }
      
      // Group rows for smart_routing
      if (bulkType === "smart_routing") {
        const grouped = new Map<string, any>();
        finalRows.forEach(row => {
          if (!grouped.has(row.name)) {
            grouped.set(row.name, {
              name: row.name,
              defaultUrl: row.url,
              isDynamic: row.isDynamic,
              rules: []
            });
          }
          grouped.get(row.name).rules.push({
            conditions: [{
              field: row.routingField || "device",
              op: row.routingOp || "eq",
              value: row.routingValue || ""
            }],
            targetUrl: row.routingTargetUrl || ""
          });
        });
        finalRows = Array.from(grouped.values());
      }

      setConfig({
        type: "bulk",
        bulkType,
        totalRows: finalRows.length,
        rows: finalRows,
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
        <div className="flex items-center gap-4">
          <select 
            value={bulkType} 
            onChange={(e) => { setBulkType(e.target.value as any); setData([]); setIsManualEntry(false); }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="url">URL Type</option>
            <option value="multi_action">Multi-Action Type</option>
            <option value="password">Password Protected</option>
            <option value="smart_routing">Smart Routing</option>
          </select>
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
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={downloadSampleCSV}
          className="text-xs text-[#0F6E56] hover:underline flex items-center gap-1 font-medium"
        >
          <FileText className="h-3 w-3" />
          Download Sample CSV for {bulkType.replace('_', ' ')}
        </button>
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
            bulkType={bulkType}
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