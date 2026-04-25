"use client"

import { useEffect, useRef, useState } from "react"
import { Copy, Check } from "lucide-react"
import hljs from "highlight.js/lib/core"
import javascript from "highlight.js/lib/languages/javascript"
import python from "highlight.js/lib/languages/python"
import bash from "highlight.js/lib/languages/bash"
import json from "highlight.js/lib/languages/json"

hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("python", python)
hljs.registerLanguage("bash", bash)
hljs.registerLanguage("json", json)

interface CodeBlockProps {
  code: string
  language: "javascript" | "python" | "bash" | "json"
  filename?: string
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current)
    }
  }, [code, language])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const languageLabels = {
    javascript: "JavaScript",
    python: "Python",
    bash: "cURL",
    json: "JSON",
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-zinc-400 text-sm font-mono">{filename}</span>
          )}
          <span className="text-zinc-400 text-sm">{languageLabels[language]}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  )
}