"use client"

import { useEffect, useState } from "react"

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

interface OnThisPageProps {
  headings: Heading[]
}

export function OnThisPage({ headings }: OnThisPageProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-80px 0px -80px 0px" }
    )

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  return (
    <div className="sticky top-16">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        On this page
      </h4>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`block text-sm ${
              heading.level === 3 ? "pl-3" : ""
            } ${
              activeId === heading.id
                ? "text-[#0F6E56] font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  )
}