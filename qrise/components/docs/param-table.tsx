"use client"

import { useState } from "react"
import type { ParamSchema } from "@/lib/docs/types"

interface ParamTableProps {
  title: string
  params: ParamSchema[] | undefined
}

const typeColors: Record<string, string> = {
  string: "bg-gray-100 text-gray-700",
  number: "bg-blue-100 text-blue-700",
  boolean: "bg-purple-100 text-purple-700",
  array: "bg-amber-100 text-amber-700",
  object: "bg-pink-100 text-pink-700",
  uuid: "bg-cyan-100 text-cyan-700",
  enum: "bg-green-100 text-green-700",
}

export function ParamTable({ title, params }: ParamTableProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  if (!params || params.length === 0) {
    return null
  }

  const toggleExpand = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Required</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Default</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
            </tr>
          </thead>
          <tbody>
            {params.map((param, idx) => {
              const isExpanded = expanded[param.name]
              return (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <code className={param.required ? "text-green-600 font-medium" : "text-gray-600"}>
                      {param.name}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${typeColors[param.type] || "bg-gray-100 text-gray-700"}`}>
                      {param.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {param.required ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {param.defaultValue || "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600">{param.description}</span>
                    {param.enumValues && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {param.enumValues.map((v) => (
                          <span key={v} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}