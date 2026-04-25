'use client'

import { useState } from 'react'

import { Monitor, Smartphone, Tablet, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CompetitionPreviewProps {
  slug: string
}

export function CompetitionPreview({ slug }: CompetitionPreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile' | 'tablet'>('desktop')
  const [key, setKey] = useState(0)

  const url = `https://qrise.io/competitions/${slug}?preview=true`

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex bg-[#0a0a0a] rounded-xl p-1 border border-[#1a1a1a]">
          <button 
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded-lg transition-all ${device === 'desktop' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setDevice('tablet')}
            className={`p-2 rounded-lg transition-all ${device === 'tablet' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setDevice('mobile')}
            className={`p-2 rounded-lg transition-all ${device === 'mobile' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-transparent border-[#1a1a1a] text-gray-400"
            onClick={() => setKey(k => k + 1)}
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Reload
          </Button>
          <Button asChild variant="outline" size="sm" className="bg-transparent border-[#1a1a1a] text-gray-400">
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-2" />
              Open Live
            </a>
          </Button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-3xl border border-[#1a1a1a] overflow-hidden p-4 flex justify-center h-[700px]">
        <div 
          className="bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-500"
          style={{ width: deviceWidths[device] }}
        >
          <iframe 
            key={key}
            src={url} 
            className="w-full h-full border-none"
            title="Competition Preview"
          />
        </div>
      </div>
    </div>
  )
}
