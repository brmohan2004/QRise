"use client"

import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import type { ResponseField } from "@/lib/docs/types"

interface ResponseSchemaProps {
  fields?: ResponseField[]
}

const typeColors: Record<string, string> = {
  string: "bg-gray-100 text-gray-700",
  number: "bg-blue-100 text-blue-700",
  boolean: "bg-purple-100 text-purple-700",
  array: "bg-amber-100 text-amber-700",
  object: "bg-pink-100 text-pink-700",
  uuid: "bg-cyan-100 text-cyan-700",
}

export function ResponseSchema({ fields }: ResponseSchemaProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpand = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const renderField = (field: ResponseField, indent: number = 0) => {
    const hasChildren = field.children && field.children.length > 0
    const isExpanded = expanded[field.name]

    return (
      <div key={field.name} className="border-b border-gray-100">
        <div className={`flex items-start py-3 px-4 gap-4`} style={{ paddingLeft: `${indent * 24 + 16}px` }}>
          {hasChildren && (
            <button onClick={() => toggleExpand(field.name)} className="mt-1">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <code className="text-gray-900 font-medium">{field.name}</code>
              <span className={`px-2 py-0.5 rounded text-xs ${typeColors[field.type] || "bg-gray-100 text-gray-700"}`}>
                {field.type}
              </span>
              {field.nullable && (
                <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
                  nullable
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1">{field.description}</p>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-4">
            {field.children!.map((child) => renderField(child, indent + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Response schema</h3>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-500">
          Fields
        </div>
        <div>
          {fields?.map((field) => renderField(field))}
        </div>
      </div>
    </div>
  )
}