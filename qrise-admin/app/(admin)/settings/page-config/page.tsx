'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { 
  Loader2, Monitor, Activity, BarChart3, DollarSign, Globe, History, Save, ShieldAlert,
  Users, AlertTriangle, QrCode, Database, Flag, HelpCircle, Zap, Boxes, Settings,
  Bell, Ticket, Trophy, Server, LayoutDashboard
} from 'lucide-react'
import { toast } from 'sonner'

export default function PageConfigPage() {
  const [status, setStatus] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/config/modules')
      const data = await res.json()
      setStatus(data)
    } catch (error) {
      toast.error('Failed to load module configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        toast.success('Configuration saved. Changes applied globally.')
        // Dispatch custom event for instant sidebar update
        window.dispatchEvent(new CustomEvent('admin:config-updated'))
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const toggleModule = (id: string) => {
    setStatus(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
      </div>
    )
  }

  const sections = [
    {
      title: 'Overview',
      modules: [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Users & Content',
      modules: [
        { id: 'users', name: 'Users Management', icon: Users },
        { id: 'reports', name: 'Abuse Reports', icon: AlertTriangle },
        { id: 'qr_codes', name: 'QR Codes', icon: QrCode },
        { id: 'bulk_jobs', name: 'Bulk Jobs', icon: Database },
      ]
    },
    {
      title: 'Platform Features',
      modules: [
        { id: 'analytics', name: 'Analytics', icon: BarChart3 },
        { id: 'feature_flags', name: 'Feature Flags', icon: Flag },
        { id: 'features_quiz', name: 'Features Quiz', icon: HelpCircle },
        { id: 'rate_limits', name: 'Rate Limits', icon: Zap },
        { id: 'api_monitor', name: 'API Monitor', icon: Monitor },
        { id: 'custom_types', name: 'Custom Types', icon: Boxes },
      ]
    },
    {
      title: 'Commerce & Communication',
      modules: [
        { id: 'revenue', name: 'Revenue', icon: DollarSign },
        { id: 'coupons', name: 'Coupons', icon: Ticket },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'competitions', name: 'Competitions', icon: Trophy },
      ]
    },
    {
      title: 'System & Infra',
      modules: [
        { id: 'plans', name: 'Subscription Plans', icon: Settings },
        { id: 'webhooks', name: 'Webhooks', icon: Globe },
        { id: 'infra', name: 'Infra Ops', icon: Server },
        { id: 'system_health', name: 'System Health', icon: Activity },
        { id: 'audit_logs', name: 'Audit Logs', icon: History },
      ]
    }
  ]

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-white">Full Platform Control</h1>
          <p className="text-gray-500 text-sm font-medium">Enable or disable any of the 20+ administrative modules to optimize performance.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-white text-black hover:bg-white/90 rounded-2xl px-8 font-bold h-12 gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Apply Changes
        </Button>
      </div>

      <div className="space-y-12">
        {sections.map((section) => (
          <div key={section.title} className="space-y-6">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-[0.2em] px-2">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.modules.map((mod) => (
                <Card key={mod.id} className="bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#222] transition-all overflow-hidden group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.05] transition-colors">
                          <mod.icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                        </div>
                        <span className="font-bold text-white text-sm">{mod.name}</span>
                      </div>
                      <Switch 
                        checked={status[mod.id] !== false} // Default to true if not present
                        onCheckedChange={() => toggleModule(mod.id)}
                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-[#222]"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card className="bg-amber-500/5 border-amber-500/10 rounded-3xl p-6">
        <div className="flex gap-4">
          <ShieldAlert className="h-6 w-6 text-amber-500 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Administrative Advisory</h4>
            <p className="text-xs text-amber-500/60 leading-relaxed">
              Toggling these modules will affect all administrative users. Disabling core modules like "Users Management" or "QR Codes" may limit your ability to manage the platform effectively. Use these controls primarily to reduce load from real-time monitoring tools.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
