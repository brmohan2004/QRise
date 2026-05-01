import { PlanEditorForm } from '@/components/plans/plan-editor-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewPlanPage() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="gap-2 text-gray-400 hover:text-white -ml-2">
        <Link href="/plans">
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </Link>
      </Button>
      <PlanEditorForm />
    </div>
  )
}
