"use client"

import { Copy, Check, Lock } from "lucide-react"
import { useState } from "react"
import type { HTTPMethod } from "@/lib/docs/types"

const methodColors: Record<HTTPMethod, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  PATCH: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
}

interface EndpointHeaderProps {
  method: HTTPMethod
  path: string
  title: string
  description: string
  requiredScope?: string | null
}

export function EndpointHeader({ method, path, title, description, requiredScope }: EndpointHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(path)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-3 py-1 rounded-md font-mono text-sm font-medium ${methodColors[method]}`}>
          {method}
        </span>
        <code className="flex items-center gap-2 bg-zinc-900 text-zinc-100 px-4 py-2 rounded-md font-mono text-sm">
          {path}
          <button
            onClick={handleCopy}
            className="ml-2 text-zinc-400 hover:text-zinc-100"
            title="Copy path"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </code>
      </div>

      <p className="text-gray-600">{description}</p>

      {requiredScope && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <Lock className="h-4 w-4" />
          <span>Requires authentication</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">
            {requiredScope}
          </span>
        </div>
      )}
    </div>
  )
}
