"use client"

import { useState, useEffect, Suspense } from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { DocsSidebar, MobileSidebarContent } from "@/components/docs/docs-sidebar"
import { SearchModal } from "@/components/docs/search-modal"
import { OnThisPage } from "@/components/docs/on-this-page"
import { DocsPageSkeleton } from "@/components/docs/docs-page-skeleton"

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

export default function DocsLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [headings, setHeadings] = useState<Heading[]>([])

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
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-14 px-4">
        <div className="flex items-center justify-between h-full">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden h-10 w-10"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <MobileSidebarContent onOpenChange={setSidebarOpen} />
          </Sheet>
          <span className="font-bold font-semibold">API Docs</span>
          <Button
            variant="ghost"
            size="default"
            className="h-10 px-4"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <DocsSidebar onSearchClick={() => setSearchOpen(true)} />
        </div>

        {/* Main content */}
        <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full overflow-x-hidden">
          <Suspense fallback={<DocsPageSkeleton />}>
            {children}
          </Suspense>
        </main>

        {/* On this page - XL screens only */}
        <div className="hidden xl:block w-48 py-12 pr-4">
          {headings.length > 0 && (
            <div className="sticky top-16">
              <OnThisPage headings={headings} />
            </div>
          )}
        </div>
      </div>

      {/* Search modal */}
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
