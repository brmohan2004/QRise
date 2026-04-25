"use client"

import { useState, useEffect } from "react"
import { CodeBlock } from "./code-block"

interface CodeTabsProps {
  examples: {
    js?: string
    python?: string
    curl?: string
  }
}

type Tab = "javascript" | "python" | "bash"

const tabs: { id: Tab; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "bash", label: "cURL" },
]

export function CodeTabs({ examples }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("javascript")

  const availableTabs = tabs.filter((tab) => {
    if (tab.id === "javascript") return !!examples.js
    if (tab.id === "python") return examples.python
    if (tab.id === "bash") return examples.curl
    return false
  })

  useEffect(() => {
    const saved = localStorage.getItem("docs-code-tab") as Tab
    if (saved && availableTabs.some((t) => t.id === saved)) {
      setActiveTab(saved)
    }
  }, [])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    localStorage.setItem("docs-code-tab", tab)
  }

  if (availableTabs.length === 0) {
    return null
  }

  const getCode = () => {
    if (activeTab === "javascript" && examples.js) return examples.js
    if (activeTab === "python" && examples.python) return examples.python
    if (activeTab === "bash" && examples.curl) return examples.curl
    return ""
  }

  return (
    <div className="my-6">
      <div className="flex border-b border-gray-200">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-[#0F6E56] text-[#0F6E56]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <CodeBlock code={getCode()} language={activeTab} />
      </div>
    </div>
  )
}