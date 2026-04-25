"use client"

import { useState } from "react"
import { CodeBlock } from "./code-block"

interface ExampleResponseProps {
  data?: Record<string, unknown>
  title?: string
}

export function ExampleResponse({ data, title = "Response" }: ExampleResponseProps) {
  const [responseType, setResponseType] = useState<"success" | "error">("success")

  const exampleError = {
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    details: {
      target_url: "Must begin with http:// or https://",
      name: "Required field",
    },
  }

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => setResponseType("success")}
            className={`px-3 py-1 text-sm ${
              responseType === "success"
                ? "bg-green-100 text-green-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            200 OK
          </button>
          <button
            onClick={() => setResponseType("error")}
            className={`px-3 py-1 text-sm ${
              responseType === "error"
                ? "bg-red-100 text-red-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            4xx Error
          </button>
        </div>
      </div>
      <CodeBlock
        code={JSON.stringify(responseType === "success" ? data : exampleError, null, 2)}
        language="json"
      />
    </div>
  )
}
