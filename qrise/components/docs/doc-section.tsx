"use client"

import { Breadcrumb } from "./breadcrumb"
import { CodeTabs } from "./code-tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DocSectionProps {
  data: any;
  endpoint?: any;
  examples?: any;
  id: string;
}

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  PATCH: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
}

export function DocSection({ data, endpoint, examples, id }: DocSectionProps) {
  if (!data && !endpoint) return null;

  const title = data?.title || endpoint?.title;
  const description = data?.description || endpoint?.description;

  const renderSection = (section: any) => (
    <div key={section.id} className="mt-10 first:mt-0">
      {section.title && (
        <h3 id={section.id} className={cn(
          "font-semibold text-gray-900 mb-4 scroll-mt-24",
          section.level === 3 ? "text-lg" : "text-xl"
        )}>
          {section.title}
        </h3>
      )}
      
      {section.content && (
        <p className="text-gray-600 mb-4 whitespace-pre-wrap leading-relaxed">
          {section.content}
        </p>
      )}

      {section.type === 'warning' && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700 font-medium">{section.title}</p>
              <div className="text-sm text-amber-600 mt-1">{section.content}</div>
            </div>
          </div>
        </div>
      )}

      {section.code && (
        <div className="relative group mb-6">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm border border-gray-800 shadow-sm">
            <code>{section.code}</code>
          </pre>
        </div>
      )}

      {section.codeBlock && (
        <div className="relative group mb-6">
          <div className="bg-gray-800 text-gray-400 text-xs px-4 py-1.5 rounded-t-lg border-b border-gray-700 font-mono">
            {section.codeBlock.language || 'code'}
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm border-x border-b border-gray-800 shadow-sm">
            <code>{section.codeBlock.code}</code>
          </pre>
        </div>
      )}

      {section.items && (
        <ul className={cn(
          "pl-6 text-gray-600 space-y-2 mb-6",
          section.listType === 'decimal' ? "list-decimal" : "list-disc"
        )}>
          {section.items.map((item: string, idx: number) => (
            <li key={idx} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      )}

      {section.table && (
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                {section.table.headers?.map((h: string) => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {section.table.rows?.map((row: any[], i: number) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-gray-600 whitespace-pre-wrap">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.link && (
        <a
          href={section.link.href}
          className="inline-flex items-center text-[#0F6E56] font-medium hover:underline mb-4 group"
        >
          {section.link.text}
          <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      )}

      {section.sections?.map(renderSection)}
    </div>
  )

  return (
    <section id={id} className="py-16 first:pt-8 last:border-0 scroll-mt-24 border-b border-gray-100">
      {data?.breadcrumb && <Breadcrumb items={data.breadcrumb} />}
      
      <div className="flex items-baseline gap-3 mb-4 mt-2">
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        {endpoint?.method && (
          <Badge className={cn("text-xs font-bold px-2 py-0.5 rounded-md uppercase", methodColors[endpoint.method])}>
            {endpoint.method}
          </Badge>
        )}
      </div>

      {description && (
        <p className="text-xl text-gray-500 mb-10 leading-relaxed font-light">
          {description}
        </p>
      )}

      {/* API Endpoint Details */}
      {endpoint && (
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 mb-10 font-mono text-sm border border-gray-200 text-gray-700 shadow-inner">
          <span className="text-[#0F6E56] font-bold opacity-70 uppercase tracking-tighter mr-2">{endpoint.method}</span>
          <span className="font-semibold select-all">{endpoint.path}</span>
        </div>
      )}

      {/* Main Sections */}
      <div className="space-y-2">
        {data?.sections?.map(renderSection)}
      </div>

      {/* Code Examples (Curl/TS/Py) */}
      {(examples || endpoint?.exampleRequest || endpoint?.useQuickstartExamples) && (
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F6E56]"></span>
              Example Request
            </h4>
          </div>
          <div className="p-0">
            <CodeTabs examples={examples || endpoint?.exampleRequest || []} />
          </div>
        </div>
      )}

      {/* Response Schema */}
      {endpoint?.responseSchema && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <h4 className="text-lg font-bold text-gray-900">Response Schema</h4>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-tight text-[10px]">
                 <tr>
                   <th className="px-6 py-4">Property</th>
                   <th className="px-6 py-4 text-center">Type</th>
                   <th className="px-6 py-4">Description</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {endpoint.responseSchema.map((field: any) => (
                   <tr key={field.name} className="hover:bg-gray-50/50 transition-colors">
                     <td className="px-6 py-4 font-mono text-[#0F6E56] font-semibold">{field.name}</td>
                     <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded font-mono text-[10px] uppercase">
                          {field.type}{field.nullable ? '?' : ''}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-gray-600 leading-relaxed">{field.description || '-'}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      )}
    </section>
  )
}

