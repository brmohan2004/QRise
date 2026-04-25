"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { NAV_SECTIONS, ALL_ENDPOINTS } from "@/lib/docs"

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchResult {
  label: string
  href: string
  section: string
  description?: string
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const q = query.toLowerCase()
    const newResults: SearchResult[] = []

    // Search nav items
    NAV_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        if (item.label.toLowerCase().includes(q)) {
          newResults.push({
            label: item.label,
            href: item.href,
            section: section.title,
          })
        }
      })
    })

    // Search endpoint titles/descriptions
    ALL_ENDPOINTS.forEach((ep) => {
      if (ep.title.toLowerCase().includes(q) || ep.description.toLowerCase().includes(q)) {
        newResults.push({
          label: ep.title,
          href: `/docs${ep.path.replace("/qr", "/qr-codes").replace("/bulk", "/bulk").replace("/webhooks", "/webhooks")}`,
          section: "Endpoints",
          description: ep.description,
        })
      }
    })

    setResults(newResults.slice(0, 10))
    setSelectedIdx(0)
  }, [query])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search docs..."
            className="border-0 focus-visible:ring-0"
          />
          <kbd className="text-xs text-gray-400">ESC</kbd>
        </div>

        {results.length > 0 ? (
          <div className="max-h-96 overflow-y-auto py-2">
            {results.map((result, idx) => (
              <a
                key={idx}
                href={result.href}
                onClick={() => onOpenChange(false)}
                className={`block px-3 py-2 rounded-md ${
                  idx === selectedIdx ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{result.section}</span>
                </div>
                <p className="font-medium text-gray-900">{result.label}</p>
                {result.description && (
                  <p className="text-sm text-gray-500 truncate">{result.description}</p>
                )}
              </a>
            ))}
          </div>
        ) : query ? (
          <div className="py-8 text-center text-gray-500">
            <p>No results found for "{query}"</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}