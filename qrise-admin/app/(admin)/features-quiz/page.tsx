'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QuizTable } from '@/components/quiz/quiz-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, HelpCircle, RefreshCcw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { QuizFormModal } from '@/components/quiz/quiz-form-modal'

export default function FeaturesQuizPage() {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)

  const { data: quizEntries, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'features_quiz'],
    queryFn: async () => {
      const res = await fetch('/api/admin/features-quiz')
      return res.json()
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Features Quiz</h1>
          <p className="text-gray-400">Manage interactive &quot;Guess the feature&quot; challenges to engage your users.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-transparent border-[#222] hover:bg-[#111]"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin', 'features_quiz'] })}
            disabled={isFetching}
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-white text-black hover:bg-gray-200 font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Quiz Feature
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-3xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
               <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
               <h3 className="text-white font-bold">Boost Engagement</h3>
               <p className="text-gray-500 text-xs mt-1">Gamify your product roadmap. Let users guess features before they launch.</p>
            </div>
         </div>
         <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-3xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-600/10 flex items-center justify-center">
               <Sparkles className="h-6 w-6 text-amber-600" />
            </div>
            <div>
               <h3 className="text-white font-bold">Reward Guesses</h3>
               <p className="text-gray-500 text-xs mt-1">Attach gift codes to correct guesses to drive upgrades and loyalty.</p>
            </div>
         </div>
         <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-3xl space-y-4 text-center flex flex-col items-center justify-center border-dashed border-blue-500/20">
            <p className="text-[10px] uppercase font-black text-blue-500 tracking-widest">Active Challenges</p>
            <span className="text-4xl font-black text-white mt-1">
               {quizEntries?.filter((q: { is_revealed: boolean }) => !q.is_revealed).length || 0}
            </span>
         </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
           <Skeleton className="h-10 w-full bg-[#111] rounded-xl" />
           <Skeleton className="h-96 w-full bg-[#111] rounded-3xl" />
        </div>
      ) : (
        <QuizTable 
          data={quizEntries || []} 
          onUpdate={() => queryClient.invalidateQueries({ queryKey: ['admin', 'features_quiz'] })} 
        />
      )}

      <QuizFormModal 
        isOpen={isAdding} 
        onClose={() => setIsAdding(false)} 
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin', 'features_quiz'] })}
      />
    </div>
  )
}
