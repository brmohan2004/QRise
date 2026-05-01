'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface ConfigItem {
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

export function PlatformConfigTable() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/admin/infra/config');
      const data = await res.json();
      setConfigs(data);
    } catch (error) {
      console.error('Failed to load platform config:', error);
      toast.error('Failed to load platform config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function updateConfig(key: string, value: string | boolean, reason: string = 'Manual update') {
    setSaving(key);
    try {
      const res = await fetch('/api/admin/infra/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: String(value), reason }),
      });

      if (!res.ok) throw new Error('Update failed');
      
      toast.success(`${key} updated successfully`);
      fetchConfigs();
    } catch (error) {
      console.error(`Failed to update ${key}:`, error);
      toast.error(`Failed to update ${key}`);
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight text-white/90">System Configuration</CardTitle>
        <p className="text-xs text-white/40">Manage global platform behaviors and thresholds.</p>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/[0.01]">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Key</TableHead>
                <TableHead className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Value</TableHead>
                <TableHead className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Description</TableHead>
                <TableHead className="text-white/50 font-bold uppercase tracking-wider text-[10px]">Last Updated</TableHead>
                <TableHead className="text-right text-white/50 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => {
                const isBoolean = config.value === 'true' || config.value === 'false';
                const isMaintenance = config.key === 'maintenance_mode';
                const isReadOnly = config.key === 'read_only_mode';

                return (
                  <TableRow key={config.key} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="font-mono font-bold text-xs text-white/70">
                      <span className="px-2 py-1 rounded bg-white/[0.05] border border-white/10">{config.key}</span>
                    </TableCell>
                    <TableCell>
                      {isBoolean ? (
                        <div className="flex items-center gap-3">
                          {isMaintenance ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Switch 
                                  checked={config.value === 'true'} 
                                  className={config.value === 'true' ? 'data-[state=checked]:bg-red-500' : 'bg-white/10'}
                                />
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-[#0f0f0f] border-white/10 text-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-bold">
                                    {config.value === 'true' ? 'Disable Maintenance Mode?' : 'Enable Maintenance Mode?'}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-white/60">
                                    {config.value === 'true' 
                                      ? 'The platform will be accessible to all users again.' 
                                      : 'This will block all non-admin users from accessing the platform. Use for critical updates only.'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => updateConfig(config.key, config.value === 'true' ? 'false' : 'true')}
                                    className={config.value !== 'true' ? 'bg-red-600 hover:bg-red-700' : 'bg-white text-black hover:bg-white/90'}
                                  >
                                    Confirm Change
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Switch 
                              checked={config.value === 'true'} 
                              onCheckedChange={(val) => updateConfig(config.key, val ? 'true' : 'false')}
                              disabled={saving === config.key}
                              className="data-[state=checked]:bg-white/20"
                            />
                          )}
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            config.value === 'true' 
                              ? (isMaintenance || isReadOnly ? 'text-red-400' : 'text-emerald-400') 
                              : 'text-white/20'
                          )}>
                            {config.value === 'true' ? (isMaintenance ? 'Maintenance Active' : 'Enabled') : 'Disabled'}
                          </span>
                        </div>
                      ) : (
                        <Input 
                          defaultValue={config.value} 
                          onBlur={(e) => {
                            if (e.target.value !== config.value) {
                              updateConfig(config.key, e.target.value);
                            }
                          }}
                          className="max-w-[120px] h-8 text-xs bg-white/[0.03] border-white/10 text-white/80 focus:ring-1 focus:ring-white/20 transition-all"
                          disabled={saving === config.key}
                        />
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-white/40 leading-relaxed max-w-[300px]">{config.description}</TableCell>
                    <TableCell className="text-[10px] text-white/30 font-mono">
                      {new Date(config.updated_at).toLocaleDateString()}
                      <span className="block opacity-50">{new Date(config.updated_at).toLocaleTimeString()}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {saving === config.key ? (
                        <Loader2 className="h-4 w-4 animate-spin inline text-white/20" />
                      ) : (
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <Save className="h-3 w-3 text-white/40" />
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
