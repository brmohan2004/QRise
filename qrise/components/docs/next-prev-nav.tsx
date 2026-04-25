"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { NAV_SECTIONS } from "@/lib/docs/nav-structure"

interface NextPrevNavProps {
  currentHref: string
}

export function NextPrevNav({ currentHref }: NextPrevNavProps) {
  const allItems = NAV_SECTIONS.flatMap((s) => s.items)
  const currentIdx = allItems.findIndex((i) => i.href === currentHref)

  const prev = currentIdx > 0 ? allItems[currentIdx - 1] : null
  const next = currentIdx < allItems.length - 1 ? allItems[currentIdx + 1] : null

  return (
    <div className="flex justify-between mt-12 pt-6 border-t border-gray-200">
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0F6E56]"
        >
          <ChevronLeft className="h-4 w-4" />
          <div>
            <span className="block text-xs text-gray-500">Previous</span>
            <span className="font-medium">{prev.label}</span>
          </div>
        </Link>
      ) : <div />}
      {next ? (
        <Link
          href={next.href}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0F6E56] text-right"
        >
          <div>
            <span className="block text-xs text-gray-500">Next</span>
            <span className="font-medium">{next.label}</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : <div />}
    </div>
  )
}