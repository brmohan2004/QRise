import { CompetitionForm } from '@/components/competitions/competition-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCompetitionPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" asChild className="w-fit gap-2 text-gray-400 hover:text-white -ml-2">
          <Link href="/competitions">
            <ArrowLeft className="h-4 w-4" />
            Back to Competitions
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create Competition</h1>
          <p className="text-gray-400">Launch a new hackathon, design challenge, or community event.</p>
        </div>
      </div>

      <CompetitionForm />
    </div>
  )
}
