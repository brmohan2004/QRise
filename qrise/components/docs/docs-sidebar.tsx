"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Lock } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NAV_SECTIONS, type NavItem } from "@/lib/docs"
import type { HTTPMethod } from "@/lib/docs/types"

const methodColors: Record<HTTPMethod, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  PATCH: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
}

interface DocsSidebarProps {
  onSearchClick?: () => void
}

export function DocsSidebar({ onSearchClick }: DocsSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-gray-50/50 h-[calc(100vh-4rem)] sticky top-16">
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-500 hover:text-gray-900 h-10"
            onClick={onSearchClick}
          >
            <Search className="mr-2 h-4 w-4" />
            Search docs...
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-500">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-[#0F6E56]/10 text-[#0F6E56] font-medium border-l-2 border-[#0F6E56]"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.method && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${methodColors[item.method]}`}
                          >
                            {item.method}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <Link
            href="/dashboard"
            className="flex items-center text-sm text-gray-600 hover:text-[#0F6E56]"
          >
            ← Back to dashboard
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar would be handled by Sheet in the layout */}
    </>
  )
}

export function MobileSidebarContent({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const pathname = usePathname()

  return (
    <SheetContent side="left" className="w-80 p-0 border-r border-gray-100/50">
      {/* Decorative background element */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-gray-50/50 -z-10" />
      <div className="absolute top-0 right-0 -z-10 h-64 w-64 bg-[#0F6E56]/5 blur-[80px] rounded-full" />
      
      <div className="flex flex-col h-full px-6">
        {/* Header with Logo */}
        <div className="flex items-center h-16 border-b border-gray-100/50">
          <Link 
            href="/" 
            className="flex items-center gap-2.5" 
            onClick={() => onOpenChange(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F6E56] shadow-lg shadow-[#0F6E56]/20">
              <span className="text-white font-bold">Q</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              QRise
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-8">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-8">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 px-2">
                {section.title}
              </h3>
               <ul className="space-y-1.5">
                 {section.items.map((item) => {
                   const isActive = pathname === item.href
                   return (
                     <li key={item.href}>
                       <Link
                         href={item.href}
                         className={cn(
                           "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 min-h-11",
                           isActive
                             ? "bg-[#0F6E56]/5 text-[#0F6E56] shadow-sm ring-1 ring-[#0F6E56]/10 font-semibold"
                             : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                         )}
                       >
                        <span className="truncate">{item.label}</span>
                        {item.method && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                              methodColors[item.method]
                            )}
                          >
                            {item.method}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="py-8 border-t border-gray-100/50">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0F6E56] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to dashboard
          </Link>
        </div>
      </div>
    </SheetContent>
  )
}
