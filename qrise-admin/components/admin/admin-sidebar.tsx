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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Zap,
  Server,
  Activity,
  Monitor,
  Boxes,
  Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
      { name: 'Rate Limits', href: '/rate-limits', icon: Zap },
      { name: 'API Monitor', href: '/api-monitor', icon: Monitor },
      { name: 'Custom Types', href: '/custom-types', icon: Boxes },
      { name: 'Subscription Plans', href: '/plans', icon: Settings },
      { name: 'Webhooks', href: '/webhooks', icon: Globe },
    ]
  },
  {
    title: 'Communication',
    items: [
      { name: 'Notifications', href: '/notifications', icon: Bell },
    ]
  },
  {
    title: 'Commerce',
    items: [
      { name: 'Revenue', href: '/revenue', icon: DollarSign },
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
      { name: 'Infra Ops', href: '/infra', icon: Server },
      { name: 'System Health', href: '/system', icon: Activity },
    ]
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [hasRecentRateLimitChanges, setHasRecentRateLimitChanges] = useState(false)
  const [moduleStatus, setModuleStatus] = useState<any>(null)
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved === 'true') {
      setIsCollapsed(true)
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
    }
    
    const fetchConfig = async () => {
      try {
        const [rateLimitRes, moduleRes] = await Promise.all([
          fetch('/api/admin/rate-limits/status'),
          fetch('/api/admin/config/modules')
        ])
        
        const rateLimitData = await rateLimitRes.json()
        setHasRecentRateLimitChanges(rateLimitData.changedRecently)
        
        const moduleData = await moduleRes.json()
        setModuleStatus(moduleData)
      } catch (e) {
        console.error('Failed to fetch config', e)
      }
    }

    const handleConfigUpdate = () => fetchConfig()
    window.addEventListener('admin:config-updated', handleConfigUpdate)

    getUser()
    fetchConfig()

    return () => {
      window.removeEventListener('admin:config-updated', handleConfigUpdate)
    }
  }, [supabase.auth, pathname])

  const filteredNavigation = navigation.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (!moduleStatus) return true
      
      const mapping: Record<string, string> = {
        'Dashboard': 'dashboard',
        'Users': 'users',
        'Abuse Reports': 'reports',
        'QR Codes': 'qr_codes',
        'Bulk Jobs': 'bulk_jobs',
        'Analytics': 'analytics',
        'Feature Flags': 'feature_flags',
        'Features Quiz': 'features_quiz',
        'Rate Limits': 'rate_limits',
        'API Monitor': 'api_monitor',
        'Custom Types': 'custom_types',
        'Subscription Plans': 'plans',
        'Webhooks': 'webhooks',
        'Notifications': 'notifications',
        'Revenue': 'revenue',
        'Coupons': 'coupons',
        'Competitions': 'competitions',
        'Infra Ops': 'infra',
        'System Health': 'system_health',
        'Audit Logs': 'audit_logs'
      }

      const configId = mapping[item.name]
      if (configId && moduleStatus[configId] === false) return false
      
      return true
    })
  })).filter(section => section.items.length > 0)

  const toggleSidebar = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    localStorage.setItem('admin-sidebar-collapsed', String(nextState))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-[#1a1a1a] w-[260px] text-gray-400" />
    )
  }

  return (
    <TooltipProvider delay={0}>
      <div className={cn(
        "flex flex-col h-full bg-[#0a0a0a] border-r border-[#1a1a1a] text-gray-400 transition-all duration-300 relative",
        isCollapsed ? "w-[80px]" : "w-[260px]"
      )}>
        {/* Collapse Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-12 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#0a0a0a] text-white hover:bg-[#111] transition-all duration-200 shadow-md group cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5 group-hover:scale-110" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5 group-hover:scale-110" />
          )}
        </button>

        <div className={cn(
          "p-6 flex items-center transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "gap-3"
        )}>
          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-xl">Q</span>
          </div>
          {!isCollapsed && (
            <span className="text-white font-bold text-xl tracking-tight animate-in fade-in slide-in-from-left-2 duration-500">
              QRise Admin
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 no-scrollbar">
          {filteredNavigation.map((section) => (
            <div key={section.title} className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-2 text-[10px] font-bold text-gray-600 uppercase tracking-[0.1em] animate-in fade-in slide-in-from-left-1 duration-300">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  
                  const linkContent = (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-[#111] text-white" 
                          : "hover:bg-[#0f0f0f] hover:text-gray-200",
                        isCollapsed && "justify-center px-0"
                      )}
                    >
                      <item.icon className={cn(
                        "h-4 w-4 transition-colors flex-shrink-0", 
                        isActive ? "text-white" : "text-gray-500"
                      )} />
                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate animate-in fade-in slide-in-from-left-1 duration-300">
                            {item.name}
                          </span>
                          {(item.name === 'Rate Limits' && hasRecentRateLimitChanges) && (
                            <Badge className="ml-2 bg-amber-500 hover:bg-amber-600 text-[10px] h-4 px-1 py-0 animate-pulse border-none">
                              UPDATED
                            </Badge>
                          )}
                        </div>
                      )}
                    </Link>
                  )

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.name}>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#111] border-[#1a1a1a] text-white">
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return linkContent
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={cn(
          "p-4 border-t border-[#1a1a1a] space-y-4 transition-all duration-300",
          isCollapsed && "px-2"
        )}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  href={process.env.NEXT_PUBLIC_MAIN_APP_URL || '#'} 
                  className="flex items-center justify-center p-2 text-sm hover:text-white transition-colors rounded-md hover:bg-[#0f0f0f]"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#111] border-[#1a1a1a] text-white">
                Back to app
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link 
              href={process.env.NEXT_PUBLIC_MAIN_APP_URL || '#'} 
              className="flex items-center justify-between px-3 py-2 text-sm hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Back to app
              </span>
            </Link>
          )}

          <div className={cn(
            "bg-[#111] rounded-lg transition-all duration-300",
            isCollapsed ? "p-2" : "px-3 py-3 space-y-3"
          )}>
            {!isCollapsed && (
              <div className="flex flex-col gap-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-gray-500 truncate">{userEmail}</span>
                  <Badge variant="outline" className="text-[9px] h-3.5 border-gray-800 text-gray-500 px-1 font-bold">ADMIN</Badge>
                </div>
              </div>
            )}
            
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/settings/page-config" className="w-full flex justify-center p-0 h-8 text-gray-400 hover:text-white hover:bg-transparent">
                    <Settings className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#111] border-[#1a1a1a] text-white">
                  Page Configuration
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link 
                href="/settings/page-config"
                className="w-full flex justify-start gap-2 h-8 px-0 text-gray-400 hover:text-white hover:bg-transparent items-center text-sm"
              >
                <Settings className="h-4 w-4" />
                Page Config
              </Link>
            )}
            
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-center p-0 h-8 text-gray-400 hover:text-white hover:bg-transparent"
                    onClick={() => setIsSignOutDialogOpen(true)}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#111] border-[#1a1a1a] text-white">
                  Sign out ({userEmail})
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start gap-2 h-8 px-0 text-gray-400 hover:text-white hover:bg-transparent"
                onClick={() => setIsSignOutDialogOpen(true)}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={isSignOutDialogOpen} onOpenChange={setIsSignOutDialogOpen}>
        <AlertDialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Sign Out</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to sign out? You will need to log in again to access the admin dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-transparent border-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#111] hover:border-gray-700 transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white border-none transition-all"
            >
              Confirm Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
