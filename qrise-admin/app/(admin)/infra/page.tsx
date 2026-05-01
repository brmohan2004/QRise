'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformConfigTable } from '@/components/infra/platform-config-table';
import { MaintenanceWindowForm } from '@/components/infra/maintenance-window-form';
import { AnnouncementComposer } from '@/components/infra/announcement-composer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Zap, Clock, Megaphone, Trash2, Play, Circle, Database, HardDrive, Calendar, AlertCircle, History, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AuditLogTable } from '@/components/infra/audit-log-table';

export default function InfraPage() {
  const [activeTab, setActiveTab] = useState('config');
  const [refreshingCache, setRefreshingCache] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [maintenanceData, setMaintenanceData] = useState<{ windows: any[], activeWindow: any }>({ windows: [], activeWindow: null });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [cronJobs, setCronJobs] = useState<any[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    maintenance: true,
    announcements: true,
    cron: true,
    cache: true
  });
  const [triggeringCron, setTriggeringCron] = useState<string | null>(null);

  const fetchMaintenance = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, maintenance: true }));
    try {
      const res = await fetch('/api/admin/infra/maintenance');
      const data = await res.json();
      setMaintenanceData(data);
    } catch (error) {
      toast.error('Failed to load maintenance windows');
    } finally {
      setLoadingStates(prev => ({ ...prev, maintenance: false }));
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, announcements: true }));
    try {
      const res = await fetch('/api/admin/infra/announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoadingStates(prev => ({ ...prev, announcements: false }));
    }
  }, []);

  const fetchCronJobs = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, cron: true }));
    try {
      const res = await fetch('/api/admin/infra/cron');
      const data = await res.json();
      setCronJobs(data);
    } catch (error) {
      toast.error('Failed to load cron jobs');
    } finally {
      setLoadingStates(prev => ({ ...prev, cron: false }));
    }
  }, []);

  const getCacheStats = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, cache: true }));
    try {
      const res = await fetch('/api/admin/infra/cache');
      const data = await res.json();
      setCacheStats(data);
    } catch (error) {
      toast.error('Failed to load cache stats');
    } finally {
      setLoadingStates(prev => ({ ...prev, cache: false }));
    }
  }, []);

  useEffect(() => {
    getCacheStats();
    fetchMaintenance();
    fetchAnnouncements();
    fetchCronJobs();
  }, [getCacheStats, fetchMaintenance, fetchAnnouncements, fetchCronJobs]);

  async function flushCache(target: string) {
    if (!confirm(`Are you sure you want to flush ${target} cache? This may cause temporary performance degradation.`)) return;
    
    setRefreshingCache(true);
    try {
      const res = await fetch('/api/admin/infra/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      if (!res.ok) throw new Error('Flush failed');
      toast.success('Cache flushed successfully');
      getCacheStats();
    } catch (error) {
      toast.error('Failed to flush cache');
    } finally {
      setRefreshingCache(false);
    }
  }

  async function runCron(jobName: string) {
    setTriggeringCron(jobName);
    try {
      const res = await fetch('/api/admin/infra/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobName }),
      });
      if (!res.ok) throw new Error('Cron trigger failed');
      toast.success(`${jobName} triggered successfully`);
    } catch (error) {
      toast.error(`Failed to trigger ${jobName}`);
    } finally {
      setTriggeringCron(null);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Infra Ops</h1>
          <p className="text-white/40 text-sm font-medium tracking-wide">GLOBAL PLATFORM CONTROLS & INFRASTRUCTURE MANAGEMENT</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">Vercel: Healthy</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-tighter">Supabase: Healthy</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="config" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start gap-1 bg-transparent p-0 h-auto border-b border-white/5 rounded-none mb-8">
          {[
            { id: 'config', label: 'Config', icon: Zap },
            { id: 'maintenance', label: 'Maintenance', icon: Clock },
            { id: 'announcements', label: 'Announcements', icon: Megaphone },
            { id: 'cache', label: 'Cache', icon: RefreshCw },
            { id: 'cron', label: 'Cron Jobs', icon: Database },
            { id: 'logs', label: 'Audit Logs', icon: History }
          ].map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id} 
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-white/30 data-[state=active]:text-white data-[state=active]:bg-white/[0.03] rounded-t-xl rounded-b-none border-b-2 border-transparent data-[state=active]:border-white transition-all"
            >
              <tab.icon className="h-3.5 w-3.5 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="config" className="mt-0 outline-none">
          <PlatformConfigTable />
        </TabsContent>

        <TabsContent value="maintenance" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MaintenanceWindowForm onCreated={fetchMaintenance} />
            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white/90">Timeline</CardTitle>
                <CardDescription className="text-white/40">Upcoming and past maintenance windows</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {loadingStates.maintenance ? (
                  <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-white/20" /></div>
                ) : maintenanceData.windows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 border border-white/5 border-dashed rounded-2xl bg-white/[0.01]">
                    <Clock className="h-10 w-10 text-white/10 mb-4" />
                    <p className="text-sm text-white/30 font-medium">No scheduled windows</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {maintenanceData.windows.map((window) => (
                      <div key={window.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors relative group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-bold text-white/90">{window.title}</h4>
                          <Badge variant={window.is_active ? "default" : "secondary"} className={cn("text-[10px] uppercase", window.is_active ? "bg-amber-500/20 text-amber-500 border-amber-500/20" : "bg-white/5 text-white/40 border-white/5")}>
                            {window.is_active ? 'Active' : 'Archived'}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/50 mb-3 line-clamp-2 italic">"{window.message}"</p>
                        <div className="flex items-center gap-4 text-[10px] font-mono text-white/30">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(window.starts_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(window.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnnouncementComposer onCreated={fetchAnnouncements} />
            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white/90">Live Feed</CardTitle>
                <CardDescription className="text-white/40">Active broadcast history</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {loadingStates.announcements ? (
                  <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-white/20" /></div>
                ) : announcements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 border border-white/5 border-dashed rounded-2xl bg-white/[0.01]">
                    <Megaphone className="h-10 w-10 text-white/10 mb-4" />
                    <p className="text-sm text-white/30 font-medium">No active broadcasts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors relative group">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2 w-2 rounded-full", 
                              item.type === 'error' ? 'bg-red-500' : 
                              item.type === 'warning' ? 'bg-amber-500' : 
                              item.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                            )} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.type}</span>
                          </div>
                          <span className="text-[10px] font-mono text-white/20">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-white/80 line-clamp-2">{item.message}</p>
                        {item.link_text && (
                          <p className="text-[10px] font-bold text-white/30 mt-2 hover:text-white transition-colors cursor-pointer">
                            LINK: {item.link_text} →
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="mt-0 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="col-span-1 border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white/90">Purge Engine</CardTitle>
                <CardDescription className="text-white/40">Instant cache invalidation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="destructive" 
                  className="w-full justify-between h-12 font-bold uppercase tracking-tighter text-xs" 
                  onClick={() => flushCache('all')}
                  disabled={refreshingCache}
                >
                  Global Flush <RefreshCw className={cn("h-4 w-4", refreshingCache && "animate-spin")} />
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-between h-12 font-bold uppercase tracking-tighter text-xs bg-white/5 hover:bg-white/10 text-white border-white/5"
                  onClick={() => flushCache('qr')}
                  disabled={refreshingCache}
                >
                  Purge QR Keys <HardDrive className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-between h-12 font-bold uppercase tracking-tighter text-xs bg-white/5 hover:bg-white/10 text-white border-white/5"
                  onClick={() => flushCache('user')}
                  disabled={refreshingCache}
                >
                  Purge User Keys <Database className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="col-span-2 border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6">
                <Button variant="ghost" size="icon" onClick={getCacheStats} className="text-white/20 hover:text-white hover:bg-white/5" disabled={loadingStates.cache}>
                  <RefreshCw className={cn("h-4 w-4", loadingStates.cache && "animate-spin")} />
                </Button>
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white/90">Performance metrics</CardTitle>
                <CardDescription className="text-white/40">Real-time cache utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Redis Keys</span>
                    <span className="text-3xl font-black text-white">{cacheStats?.redis?.total_keys ?? '---'}</span>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">KV Storage</span>
                    <span className="text-3xl font-black text-white">{cacheStats?.kv?.size ?? '---'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cron" className="mt-0 outline-none">
          <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-white/90">Cron Engine</CardTitle>
                <CardDescription className="text-white/40">Manually trigger backend background tasks</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchCronJobs} className="text-white/30" disabled={loadingStates.cron}>
                <RefreshCw className={cn("h-3.5 w-3.5 mr-2", loadingStates.cron && "animate-spin")} /> Refresh List
              </Button>
            </CardHeader>
            <CardContent>
              {loadingStates.cron ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-white/20" /></div>
              ) : cronJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-white/5 border-dashed rounded-2xl bg-white/[0.01]">
                  <AlertCircle className="h-10 w-10 text-white/10 mb-4" />
                  <p className="text-sm text-white/30 font-medium">No cron jobs registered</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cronJobs.map(job => (
                    <div key={job.name} className="flex items-center justify-between p-5 border border-white/5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black font-mono text-sm text-white/80 group-hover:text-white transition-colors">{job.name}</p>
                          <Badge variant="outline" className="text-[9px] py-0 h-4 border-white/10 text-white/30">TRIGGERABLE</Badge>
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed max-w-[200px]">{job.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/5 hover:bg-white/10 text-white border-white/10 h-10 px-4 font-bold text-[10px] uppercase tracking-widest"
                        onClick={() => runCron(job.name)}
                        disabled={triggeringCron === job.name}
                      >
                        {triggeringCron === job.name ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                        ) : (
                          <Play className="h-3 w-3 mr-2" />
                        )}
                        Execute
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="logs" className="mt-0 outline-none">
          <AuditLogTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
