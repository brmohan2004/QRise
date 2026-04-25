import { Breadcrumb } from "@/components/docs/breadcrumb"
import { CodeTabs } from "@/components/docs/code-tabs"
import { QUICKSTART_EXAMPLES } from "@/lib/docs"
import introData from "@/data/before-auth/api-doc/introduction.json"

export default function IntroductionPage() {
  return (
    <>
      <Breadcrumb items={introData.breadcrumb as any} />

      <h1 id="introduction" className="text-3xl font-bold text-gray-900 mb-4">
        {introData.title}
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        {introData.description}
      </p>

      {introData.sections.map((section) => (
        <div key={section.id} className="mt-8">
          <h2 id={section.id} className="text-xl font-semibold text-gray-900 mb-4">
            {section.title}
          </h2>
          
          {section.content && (
            <p className="text-gray-600 mb-4">
              {section.content}
            </p>
          )}

          {section.code && (
            <code className="block bg-gray-100 px-4 py-3 rounded-lg font-mono text-sm mb-4">
              {section.code}
            </code>
          )}

          {section.items && (
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              {section.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          )}

          {section.useQuickstartExamples && (
            <CodeTabs examples={QUICKSTART_EXAMPLES} />
          )}

          {section.link && (
            <a
              href={section.link.href}
              className="inline-flex items-center text-[#0F6E56] hover:underline"
            >
              {section.link.text}
            </a>
          )}
        </div>
      ))}
    </>
  )
}
