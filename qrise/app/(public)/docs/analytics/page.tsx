import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ResponseSchema } from "@/components/docs/response-schema"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { ANALYTICS, ANALYTICS_EXAMPLES } from "@/lib/docs"

export default function AnalyticsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Analytics" }]} />

      <EndpointHeader
        method={ANALYTICS.method}
        path={ANALYTICS.path}
        title={ANALYTICS.title}
        description={ANALYTICS.description}
        requiredScope={ANALYTICS.requiredScope}
      />

      <AuthBadge scope={ANALYTICS.requiredScope!} />

      {ANALYTICS.notes && ANALYTICS.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="path-params" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Path parameters
      </h2>

      <ParamTable title="Path parameters" params={ANALYTICS.pathParams} />

      <h2 id="query-params" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Query parameters
      </h2>

      <ParamTable title="Query parameters" params={ANALYTICS.queryParams} />

      <CodeTabs examples={ANALYTICS_EXAMPLES} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ResponseSchema fields={ANALYTICS.responseSchema} />
      <ExampleResponse data={ANALYTICS.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {ANALYTICS.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={ANALYTICS} />
    </>
  )
}