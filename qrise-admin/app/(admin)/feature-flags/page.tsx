'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FlagToggleRow } from '@/components/feature-flags/flag-toggle-row'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  is_enabled: boolean
  enabled_for_plans: string[] | null
}

export default function FeatureFlagsPage() {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [newFlag, setNewFlag] = useState({ key: '', name: '', description: '' })

  const { data: flags, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'feature_flags'],
    queryFn: async () => {
      const res = await fetch('/api/admin/feature-flags')
      return res.json()
    }
  })

  const handleAddFlag = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newFlag, is_enabled: true }),
      })

      if (!res.ok) throw new Error('Failed to create flag')

      toast.success('Feature flag created')
      setIsAdding(false)
      setNewFlag({ key: '', name: '', description: '' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature_flags'] })
    } catch {
      toast.error('Error creating flag')
    }
  }

  const handleUpdate = (updatedFlag: FeatureFlag) => {
    queryClient.setQueryData(['admin', 'feature_flags'], (old: FeatureFlag[]) => 
      old.map(f => f.id === updatedFlag.id ? updatedFlag : f)
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Feature Flags</h1>
          <p className="text-gray-400">Individually toggle platform features on or off for all users.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-transparent border-[#222] hover:bg-[#111]"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'feature_flags'] })}
            disabled={isFetching}
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-gray-200 font-bold">
                <Plus className="h-4 w-4 mr-2" />
                Add Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0a] border border-[#222] text-white">
              <DialogHeader>
                <DialogTitle>Create New Feature Flag</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddFlag} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Flag Key (snake_case)</Label>
                  <Input 
                    id="key" 
                    placeholder="e.g. beta_feature_v2" 
                    className="bg-black border-[#222]" 
                    value={newFlag.key}
                    onChange={e => setNewFlag({...newFlag, key: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Beta Feature" 
                    className="bg-black border-[#222]" 
                    value={newFlag.name}
                    onChange={e => setNewFlag({...newFlag, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Briefly describe what this flag controls." 
                    className="bg-black border-[#222]" 
                    value={newFlag.description}
                    onChange={e => setNewFlag({...newFlag, description: e.target.value})}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                  <Button type="submit" className="bg-white text-black hover:bg-gray-200 font-bold">Create Flag</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-[#111] rounded-xl" />
          ))
        ) : flags?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#222] rounded-2xl">
            <p className="text-gray-500">No feature flags found. Create one to get started.</p>
          </div>
        ) : (
          flags?.map((flag: FeatureFlag) => (
            <FlagToggleRow 
              key={flag.id} 
              flag={flag} 
              onUpdate={handleUpdate} 
            />
          ))
        )}
      </div>
    </div>
  )
}
