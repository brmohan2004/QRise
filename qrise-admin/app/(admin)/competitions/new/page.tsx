import { CompetitionForm } from '@/components/competitions/competition-form'

export default function NewCompetitionPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Create Competition</h1>
        <p className="text-gray-400">Launch a new hackathon, design challenge, or community event.</p>
      </div>

      <CompetitionForm />
    </div>
  )
}
