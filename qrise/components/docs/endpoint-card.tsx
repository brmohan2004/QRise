"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface EndpointCardProps {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: object;
  responseExample?: object;
}

const methodColors = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
  PATCH: "bg-purple-100 text-purple-700",
};

export function EndpointCard({
  method,
  path,
  description,
  params,
  requestBody,
  responseExample,
}: EndpointCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span
          className={cn(
            "px-2 py-1 text-xs font-bold rounded",
            methodColors[method]
          )}
        >
          {method}
        </span>
        <code className="flex-1 text-left text-sm font-mono text-gray-700">
          {path}
        </code>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Description */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Parameters */}
          {params && params.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Parameters
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Type
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {params.map((param) => (
                      <tr key={param.name}>
                        <td className="px-3 py-2 text-sm">
                          <code className="text-gray-900">{param.name}</code>
                          {param.required && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {param.type}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {param.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request body */}
          {requestBody && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Request Body
              </h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(requestBody, null, 2)}
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(requestBody, null, 2), "body")
                  }
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
                >
                  {copied === "body" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Response example */}
          {responseExample && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Response Example
              </h4>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(responseExample, null, 2)}
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify(responseExample, null, 2),
                      "response"
                    )
                  }
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
                >
                  {copied === "response" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}