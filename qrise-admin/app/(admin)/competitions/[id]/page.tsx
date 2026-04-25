'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CompetitionForm } from '@/components/competitions/competition-form'
import { CompetitionFileUploader } from '@/components/competitions/competition-file-uploader'
import { CompetitionPreview } from '@/components/competitions/competition-preview'
import { RegistrationList } from '@/components/competitions/registration-list'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Settings, 
  Users, 
  FileCode, 
  Eye, 
  ChevronLeft,
  Trophy
} from 'lucide-react'
import Link from 'next/link'

export default function CompetitionDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const { data: comp, isLoading } = useQuery({
    queryKey: ['admin', 'competitions', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/competitions/${id}`)
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-64 bg-[#111]" />
        <Skeleton className="h-96 w-full bg-[#111]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/competitions" className="p-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-gray-500 hover:text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
               <Trophy className="h-4 w-4 text-amber-500" />
               <h1 className="text-2xl font-bold text-white">{comp.title}</h1>
            </div>
            <p className="text-gray-500 text-sm">Managing competition: /{comp.slug}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="bg-[#0a0a0a] border border-[#1a1a1a] p-1 h-12 rounded-2xl">
          <TabsTrigger value="details" className="rounded-xl px-6 data-[state=active]:bg-[#111] data-[state=active]:text-white">
            <Settings className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="registrations" className="rounded-xl px-6 data-[state=active]:bg-[#111] data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Registrations
          </TabsTrigger>
          <TabsTrigger value="files" className="rounded-xl px-6 data-[state=active]:bg-[#111] data-[state=active]:text-white">
            <FileCode className="h-4 w-4 mr-2" />
            Page Files
          </TabsTrigger>
          <TabsTrigger value="preview" className="rounded-xl px-6 data-[state=active]:bg-[#111] data-[state=active]:text-white">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-0">
          <CompetitionForm initialData={comp} id={id as string} />
        </TabsContent>

        <TabsContent value="registrations" className="mt-0">
          <RegistrationList registrations={comp.registrations || []} />
        </TabsContent>

        <TabsContent value="files" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CompetitionFileUploader 
              id={id as string} 
              fileType="page" 
              label="hackathon-page.tsx" 
              description="Main layout and rendering logic for the competition."
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin', 'competitions', id] })}
            />
            <CompetitionFileUploader 
              id={id as string} 
              fileType="components" 
              label="hackathon-components.tsx" 
              description="Custom UI components used within the page."
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin', 'competitions', id] })}
            />
            <CompetitionFileUploader 
              id={id as string} 
              fileType="form" 
              label="registration-form.tsx" 
              description="Definition of registration fields and validation."
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin', 'competitions', id] })}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <CompetitionPreview slug={comp.slug} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
