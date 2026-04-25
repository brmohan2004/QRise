import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UserPlanBadgeProps {
  plan: string
}

export function UserPlanBadge({ plan }: UserPlanBadgeProps) {
  const planColors: Record<string, string> = {
    free: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    pro: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    business: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    enterprise: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("capitalize px-2 py-0 text-[10px] font-bold tracking-wider", planColors[plan.toLowerCase()] || planColors.free)}
    >
      {plan}
    </Badge>
  )
}
