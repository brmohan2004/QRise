import { Breadcrumb } from "@/components/docs/breadcrumb"
import { CodeBlock } from "@/components/docs/code-block"
import { Callout } from "@/components/docs/callout"
import authData from "@/data/before-auth/api-doc/authentication.json"

export default function AuthenticationPage() {
  return (
    <>
      <Breadcrumb items={authData.breadcrumb as any} />

      <h1 id="authentication" className="text-3xl font-bold text-gray-900 mb-4">
        {authData.title}
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        {authData.description}
      </p>

      {authData.sections.map((section) => (
        <div key={section.id} className="mt-8">
          {section.title && (
            <h2 id={section.id} className="text-xl font-semibold text-gray-900 mb-4">
              {section.title}
            </h2>
          )}
          
          {section.content && (
            <p className="text-gray-600 mb-4">
              {section.content}
            </p>
          )}

          {section.items && (
            <ol className={`list-${section.listType || 'disc'} pl-6 text-gray-600 space-y-3 mb-4`}>
              {section.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          )}

          {section.table && (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {section.table.headers.map(h => (
                      <th key={h} className="text-left py-2 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {section.table.rows.map((row, ridx) => (
                    <tr key={ridx} className="border-b border-gray-100">
                      {row.map((cell, cidx) => (
                        <td key={cidx} className={`py-2 ${cidx === 0 ? 'font-mono' : ''}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section.codeBlock && (
            <div className="mb-4">
              <CodeBlock
                code={section.codeBlock.code}
                language={section.codeBlock.language as any}
              />
            </div>
          )}

          {section.type && (
            <Callout type={section.type as any} title={section.title || ''}>
              {section.content}
            </Callout>
          )}
        </div>
      ))}
    </>
  )
}