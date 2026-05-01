"use client"

import { useState, useEffect, Suspense } from "react"
import { usePathname } from "next/navigation"
import { Menu, Search } from "lucide-react"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { DocsSidebar, MobileSidebarContent } from "@/components/docs/docs-sidebar"
import { SearchModal } from "@/components/docs/search-modal"
import { OnThisPage } from "@/components/docs/on-this-page"
import { DocsPageSkeleton } from "@/components/docs/docs-page-skeleton"
import { NAV_SECTIONS } from "@/lib/docs"
import "./docs-modern.css"


export default function DocsLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)


  // Listen for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="h-[calc(100vh-4rem)] bg-white flex flex-col overflow-hidden relative">
      {/* Mobile sub-header (optional, for docs specific actions) */}
      <header className="lg:hidden shrink-0 bg-white border-b border-gray-100 h-12 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <MobileSidebarContent onOpenChange={setSidebarOpen} />
          </Sheet>
          <span className="text-sm font-semibold">API Documentation</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchOpen(true)}>
          <Search className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 border-r border-gray-100 bg-gray-50/30 overflow-y-auto shrink-0 scrollbar-hide">
          <DocsSidebar onSearchClick={() => setSearchOpen(true)} />
        </aside>
        
        {/* Main content area that scrolls independently */}
        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          <main className="max-w-4xl mx-auto px-12 py-16 modern-docs">
            <Suspense fallback={<DocsPageSkeleton />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>

      {/* Search modal */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
