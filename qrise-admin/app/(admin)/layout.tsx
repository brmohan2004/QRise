import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { QueryProvider } from '@/components/providers/query-provider'
import { createClient } from '@/lib/supabase/server'
import { AlertTriangle } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check for impersonation (via user metadata or a specific cookie)
  const isImpersonating = user?.user_metadata?.impersonating === true

  return (
    <QueryProvider>
      <div className="flex h-screen bg-black overflow-hidden dark">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {isImpersonating && (
            <div className="bg-red-600 text-white px-4 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              VIEWING AS: {user?.email} — <button className="underline hover:no-underline">Exit Impersonation</button>
            </div>
          )}
          
          <main className="flex-1 overflow-y-auto no-scrollbar">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </QueryProvider>
  )
}
