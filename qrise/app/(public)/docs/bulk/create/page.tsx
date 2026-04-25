import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ExampleRequest } from "@/components/docs/example-request"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { BULK_CREATE, BULK_CREATE_EXAMPLES } from "@/lib/docs"

export default function BulkCreatePage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Bulk", href: "/docs/bulk" }, { label: "Create job" }]} />

      <EndpointHeader
        method={BULK_CREATE.method}
        path={BULK_CREATE.path}
        title={BULK_CREATE.title}
        description={BULK_CREATE.description}
        requiredScope={BULK_CREATE.requiredScope}
      />

      <AuthBadge scope={BULK_CREATE.requiredScope!} />

      {BULK_CREATE.notes && BULK_CREATE.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Body parameters" params={BULK_CREATE.bodyParams} />

      <CodeTabs examples={BULK_CREATE_EXAMPLES} />

      <ExampleRequest data={BULK_CREATE.exampleRequest} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ExampleResponse data={BULK_CREATE.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {BULK_CREATE.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={BULK_CREATE} />
    </>
  )
}