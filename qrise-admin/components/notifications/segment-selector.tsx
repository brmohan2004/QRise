'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Users, Loader2 } from 'lucide-react'

interface SegmentSelectorProps {
  onChange: (segment: Record<string, unknown>) => void
}

export function SegmentSelector({ onChange }: SegmentSelectorProps) {
  const [type, setType] = useState('all')
  const [plans, setPlans] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [isEstimating, setIsEstimating] = useState(false)
  const [estimate, setEstimate] = useState<number | null>(null)

  useEffect(() => {
    onChange({ type, plans, countries })
  }, [type, plans, countries, onChange])

  const handlePlanToggle = (plan: string) => {
    setPlans(prev => 
      prev.includes(plan) ? prev.filter(p => p !== plan) : [...prev, plan]
    )
  }

  const estimateAudience = async () => {
    setIsEstimating(true)
    // Simplified estimate: in a real app, this would call a /api/admin/users/count with filters
    setTimeout(() => {
      setEstimate(Math.floor(Math.random() * 1000) + 50)
      setIsEstimating(false)
    }, 800)
  }

  return (
    <div className="p-4 bg-[#0a0a0a] rounded-xl border border-[#1a1a1a] space-y-6">
      <div className="space-y-2">
        <Label className="text-gray-400 text-xs uppercase font-bold tracking-widest">Audience Segment</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="bg-black border-[#222]">
            <SelectValue placeholder="Select target audience" />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a0a] border-[#222] text-white">
            <SelectItem value="all">All Registered Users</SelectItem>
            <SelectItem value="plan">Filter by Plan</SelectItem>
            <SelectItem value="country">Filter by Country</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === 'plan' && (
        <div className="space-y-3 pt-2">
          <Label className="text-xs">Select Plans</Label>
          <div className="grid grid-cols-2 gap-3">
            {['free', 'pro', 'business', 'enterprise'].map(plan => (
              <div key={plan} className="flex items-center space-x-2">
                <Checkbox 
                  id={`plan-${plan}`} 
                  checked={plans.includes(plan)}
                  onCheckedChange={() => handlePlanToggle(plan)}
                  className="border-[#333]"
                />
                <label htmlFor={`plan-${plan}`} className="text-sm capitalize text-gray-300 cursor-pointer">
                  {plan}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {type === 'country' && (
        <div className="space-y-3 pt-2">
          <Label className="text-xs">Country (Comma separated codes)</Label>
          <input 
            type="text" 
            placeholder="US, IN, GB"
            className="w-full bg-black border border-[#222] rounded-md px-3 py-2 text-sm text-white"
            onChange={(e) => setCountries(e.target.value.split(',').map(c => c.trim()))}
          />
        </div>
      )}

      <div className="pt-4 border-t border-[#111] flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={estimateAudience}
          disabled={isEstimating}
          className="text-xs text-gray-400 hover:text-white"
        >
          {isEstimating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Users className="h-3 w-3 mr-2" />}
          Estimate Audience
        </Button>
        {estimate !== null && (
          <span className="text-xs font-bold text-white">~{estimate} recipients</span>
        )}
      </div>
    </div>
  )
}
