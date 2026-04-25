"use client"

import { CodeBlock } from "./code-block"

interface ExampleRequestProps {
  data?: Record<string, unknown>
  title?: string
}

export function ExampleRequest({ data, title = "Request" }: ExampleRequestProps) {
  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <CodeBlock
        code={JSON.stringify(data ?? {}, null, 2)}
        language="json"
      />
    </div>
  )
}