'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileCode, 
  Upload, 
  History, 
  CheckCircle, 
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FileVersion {
  id: string
  created_at: string
  content: string
}

interface CompetitionFileUploaderProps {
  id: string
  fileType: 'page' | 'components' | 'form'
  label: string
  description: string
  history?: FileVersion[]
  onSuccess: () => void
}

export function CompetitionFileUploader({ id, fileType, label, description, history = [], onSuccess }: CompetitionFileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (content: string) => {
    setIsUploading(true)
    try {
      const res = await fetch(`/api/admin/competitions/${id}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType, content }),
      })

      if (!res.ok) throw new Error('Upload failed')

      toast.success(`${label} uploaded successfully`)
      onSuccess()
    } catch {
      toast.error(`Error uploading ${label}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.name.endsWith('.tsx') && !file.name.endsWith('.json')) {
      toast.error('Only .tsx or .json files are allowed')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      handleFileUpload(content)
    }
    reader.readAsText(file)
  }

  return (
    <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-bold flex items-center gap-2">
              <FileCode className="h-4 w-4 text-blue-500" />
              {label}
            </h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          {history.length > 0 && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px]">
              <CheckCircle className="h-2 w-2 mr-1" />
              UPLOADED
            </Badge>
          )}
        </div>

        <div 
          className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 ${
            dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-[#222] hover:border-[#333]'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); /* handle drop */ }}
        >
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={handleFileChange}
            accept=".tsx,.json"
          />
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          ) : (
            <div className="w-10 h-10 bg-[#111] rounded-full flex items-center justify-center">
              <Upload className="h-5 w-5 text-gray-500" />
            </div>
          )}
          <div className="text-center">
            <p className="text-xs font-bold">{isUploading ? 'Uploading...' : 'Click or drag file to upload'}</p>
            <p className="text-[10px] text-gray-600 mt-1">.tsx files only, max 200KB</p>
          </div>
        </div>

        {history.length > 0 && (
          <Accordion type="single" collapsible>
            <AccordionItem value="history" className="border-none">
              <AccordionTrigger className="text-[10px] uppercase font-bold text-gray-500 hover:no-underline py-2">
                <History className="h-3 w-3 mr-2" />
                Version History ({history.length})
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-2">
                {history.map((version, i) => (
                  <div key={version.id} className="flex items-center justify-between p-2 bg-black rounded-lg border border-[#111]">
                    <div className="text-[9px] text-gray-400">
                      {new Date(version.created_at).toLocaleString()}
                      {i === 0 && <span className="ml-2 text-blue-500 font-black">CURRENT</span>}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[9px] hover:bg-[#111]"
                      onClick={() => handleFileUpload(version.content)}
                    >
                      Restore
                    </Button>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
