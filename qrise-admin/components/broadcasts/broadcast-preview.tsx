'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Eye, Monitor, Smartphone } from 'lucide-react'
import { useState } from 'react'

interface BroadcastPreviewProps {
  subject: string
  body: string
}

export function BroadcastPreview({ subject, body }: BroadcastPreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  return (
    <Card className="bg-[#0a0a0a] border-[#1a1a1a] text-white h-full">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#1a1a1a] py-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-500" />
          Live Preview
        </CardTitle>
        <div className="flex bg-black rounded-lg p-1 border border-[#222]">
          <button 
            onClick={() => setDevice('desktop')}
            className={`p-1 rounded ${device === 'desktop' ? 'bg-[#222] text-white' : 'text-gray-500'}`}
          >
            <Monitor className="h-3 w-3" />
          </button>
          <button 
            onClick={() => setDevice('mobile')}
            className={`p-1 rounded ${device === 'mobile' ? 'bg-[#222] text-white' : 'text-gray-500'}`}
          >
            <Smartphone className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[500px]">
        <div className="p-4 border-b border-[#111] bg-black">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Subject</p>
          <p className="text-sm font-medium text-white">{subject || '(No subject)'}</p>
        </div>
        <div className="flex-1 bg-white overflow-auto">
          <div className={`mx-auto transition-all duration-300 ${device === 'mobile' ? 'max-w-[320px]' : 'max-w-full'} p-8 text-black`}>
            {body ? (
              <div dangerouslySetInnerHTML={{ __html: body }} className="prose prose-sm max-w-none" />
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-300 italic text-sm">
                Write your message to see a preview...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
