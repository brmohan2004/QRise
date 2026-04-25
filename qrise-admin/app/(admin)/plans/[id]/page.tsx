'use client'

import { PlanEditorForm } from '@/components/plans/plan-editor-form'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditPlanPage() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'plans', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/plans/${id}`)
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64 bg-[#111]" />
        <div className="grid grid-cols-3 gap-8">
          <Skeleton className="col-span-2 h-[600px] bg-[#111]" />
          <Skeleton className="h-[400px] bg-[#111]" />
        </div>
      </div>
    )
  }

  return <PlanEditorForm initialData={data} id={id as string} />
}
