import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { ParamTable } from "@/components/docs/param-table"
import { ResponseSchema } from "@/components/docs/response-schema"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { BULK_STATUS, BULK_STATUS_EXAMPLES } from "@/lib/docs"

export default function BulkStatusPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Bulk", href: "/docs/bulk" }, { label: "Job status" }]} />

      <EndpointHeader
        method={BULK_STATUS.method}
        path={BULK_STATUS.path}
        title={BULK_STATUS.title}
        description={BULK_STATUS.description}
        requiredScope={BULK_STATUS.requiredScope}
      />

      <AuthBadge scope={BULK_STATUS.requiredScope!} />

      <h2 id="path-params" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Path parameters
      </h2>

      <ParamTable title="Path parameters" params={BULK_STATUS.pathParams} />

      <CodeTabs examples={BULK_STATUS_EXAMPLES} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ResponseSchema fields={BULK_STATUS.responseSchema} />
      <ExampleResponse data={BULK_STATUS.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {BULK_STATUS.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={BULK_STATUS} />
    </>
  )
}