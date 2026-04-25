"use client"

import { useState } from "react"
import { Send, Loader2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CodeBlock } from "./code-block"
import type { EndpointSpec } from "@/lib/docs/types"

interface TryItConsoleProps {
  endpoint?: EndpointSpec
}

export function TryItConsole({ endpoint }: TryItConsoleProps) {
  const ep = endpoint ?? {
    path: "",
    method: "GET" as const,
    pathParams: [],
    queryParams: [],
    exampleRequest: undefined,
    errorCodes: [],
  }
  const [apiKey, setApiKey] = useState("")
  const [pathParamValues, setPathParamValues] = useState<Record<string, string>>({})
  const [queryParamValues, setQueryParamValues] = useState<Record<string, string>>({})
  const [bodyValue, setBodyValue] = useState(
    ep.exampleRequest ? JSON.stringify(ep.exampleRequest, null, 2) : ""
  )
  const [response, setResponse] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<number | null>(null)
  const [durationMs, setDurationMs] = useState<number | null>(null)
  const [responseCopied, setResponseCopied] = useState(false)

  const useDemoKey = () => {
    setApiKey(process.env.NEXT_PUBLIC_DOCS_DEMO_KEY || "")
  }

  const handleSend = async () => {
    setIsLoading(true)
    setResponse(null)
    setStatus(null)

    try {
      // Build path with params
      let path = ep.path
      ep.pathParams?.forEach((param) => {
        const value = pathParamValues[param.name] || param.example || ""
        path = path.replace(`{${param.name}}`, value)
      })

      // Build query string
      const queryParams = new URLSearchParams()
      ep.queryParams?.forEach((param) => {
        const value = queryParamValues[param.name] || param.defaultValue || ""
        if (value) queryParams.append(param.name, value)
      })
      const queryString = queryParams.toString()

      const res = await fetch("/api/docs/try-it", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: ep.method,
          path: queryString ? `${path}?${queryString}` : path,
          headers: {},
          body: ["POST", "PUT", "PATCH"].includes(ep.method) ? JSON.parse(bodyValue) : null,
          apiKey,
        }),
      })

      const data = await res.json()
      setResponse(data.body || data)
      setStatus(data.status)
      setDurationMs(data.duration_ms)
    } catch (error) {
      setResponse({ error: "Network error" })
      setStatus(0)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyResponse = async () => {
    if (response) {
      await navigator.clipboard.writeText(JSON.stringify(response, null, 2))
      setResponseCopied(true)
      setTimeout(() => setResponseCopied(false), 2000)
    }
  }

  const getStatusColor = () => {
    if (!status) return "text-gray-500"
    if (status >= 200 && status < 300) return "text-green-600"
    return "text-red-600"
  }

  return (
    <div className="my-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Try it</h3>

      {/* API Key */}
      <div className="mb-4">
        <Label htmlFor="apiKey" className="text-sm font-medium text-gray-700">
          API Key
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={useDemoKey}>
            Use demo key
          </Button>
        </div>
      </div>

      {/* Path params */}
      {ep.pathParams && ep.pathParams.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Path parameters</h4>
          {ep.pathParams.map((param) => (
            <div key={param.name} className="mb-2">
              <Label className="text-sm text-gray-500">{param.name} ({param.type})</Label>
              <Input
                value={pathParamValues[param.name] || ""}
                onChange={(e) => setPathParamValues({ ...pathParamValues, [param.name]: e.target.value })}
                placeholder={param.example || param.description}
              />
            </div>
          ))}
        </div>
      )}

      {/* Query params */}
      {ep.queryParams && ep.queryParams.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Query parameters</h4>
          {ep.queryParams.map((param) => (
            <div key={param.name} className="mb-2">
              <Label className="text-sm text-gray-500">{param.name} ({param.type})</Label>
              <Input
                value={queryParamValues[param.name] || ""}
                onChange={(e) => setQueryParamValues({ ...queryParamValues, [param.name]: e.target.value })}
                placeholder={param.defaultValue || param.description}
              />
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      {["POST", "PUT", "PATCH"].includes(ep.method) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Body</h4>
          <Textarea
            value={bodyValue}
            onChange={(e) => setBodyValue(e.target.value)}
            placeholder='{"key": "value"}'
            className="font-mono text-sm min-h-[120px] max-h-[300px] overflow-y-auto"
          />
        </div>
      )}

      {/* Send button */}
      <Button
        onClick={handleSend}
        disabled={isLoading || !apiKey}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send request
          </>
        )}
      </Button>

      {/* Response */}
      {response && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Response</span>
              {status && (
                <span className={`text-sm font-bold ${getStatusColor()}`}>
                  {status}
                </span>
              )}
              {durationMs && (
                <span className="text-sm text-gray-500">({durationMs}ms)</span>
              )}
            </div>
            <button onClick={handleCopyResponse} className="text-gray-500 hover:text-gray-700">
              {responseCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <CodeBlock code={JSON.stringify(response, null, 2)} language="json" />
        </div>
      )}
    </div>
  )
}
