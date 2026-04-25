'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  QrCode, 
  Database, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Send, 
  Bell, 
  Ticket, 
  Trophy, 
  ShieldCheck, 
  ExternalLink,
  LogOut,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const navigation = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Users',
    items: [
      { name: 'Users', href: '/users', icon: Users },
      { name: 'Abuse Reports', href: '/reports', icon: AlertTriangle },
    ]
  },
  {
    title: 'Content',
    items: [
      { name: 'QR Codes', href: '/qr-codes', icon: QrCode },
      { name: 'Bulk Jobs', href: '/bulk-jobs', icon: Database },
    ]
  },
  {
    title: 'Platform',
    items: [
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Feature Flags', href: '/feature-flags', icon: Flag },
      { name: 'Features Quiz', href: '/features-quiz', icon: HelpCircle },
    ]
  },
  {
    title: 'Communication',
    items: [
      { name: 'Broadcasts', href: '/broadcasts', icon: Send },
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ]
  },
  {
    title: 'Commerce',
    items: [
      { name: 'Coupons', href: '/coupons', icon: Ticket },
    ]
  },
  {
    title: 'Events',
    items: [
      { name: 'Competitions', href: '/competitions', icon: Trophy },
    ]
  },
  {
    title: 'Config',
    items: [
      { name: 'Plans', href: '/plans', icon: Settings },
      { name: 'System Health', href: '/system', icon: ShieldCheck },
    ]
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
    }
    getUser()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-[#1a1a1a] w-[260px] text-gray-400">
      <div className="p-6 flex items-center gap-2">
        <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-black font-bold text-xl">Q</span>
        </div>
        <span className="text-white font-bold text-xl tracking-tight">QRise Admin</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-[#222]">
        {navigation.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-[#111] text-white" 
                        : "hover:bg-[#0f0f0f] hover:text-gray-200"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-gray-500")} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#1a1a1a] space-y-4">
        <Link 
          href={process.env.NEXT_PUBLIC_MAIN_APP_URL || '#'} 
          className="flex items-center justify-between px-3 py-2 text-sm hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Back to app
          </span>
        </Link>

        <div className="px-3 py-3 bg-[#111] rounded-lg space-y-3">
          <div className="flex flex-col gap-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 truncate">{userEmail}</span>
              <Badge variant="outline" className="text-[10px] h-4 border-gray-700 text-gray-400">ADMIN</Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start gap-2 h-8 px-0 text-gray-400 hover:text-white hover:bg-transparent"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
