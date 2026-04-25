import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ExampleRequest } from "@/components/docs/example-request"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { WEBHOOK_CREATE, WEBHOOK_CREATE_EXAMPLES } from "@/lib/docs"

export default function WebhooksCreatePage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Webhooks", href: "/docs/webhooks" }, { label: "Create webhook" }]} />

      <EndpointHeader
        method={WEBHOOK_CREATE.method}
        path={WEBHOOK_CREATE.path}
        title={WEBHOOK_CREATE.title}
        description={WEBHOOK_CREATE.description}
        requiredScope={WEBHOOK_CREATE.requiredScope}
      />

      <AuthBadge scope={WEBHOOK_CREATE.requiredScope!} />

      {WEBHOOK_CREATE.notes && WEBHOOK_CREATE.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Body parameters" params={WEBHOOK_CREATE.bodyParams} />

      <CodeTabs examples={WEBHOOK_CREATE_EXAMPLES} />

      <ExampleRequest data={WEBHOOK_CREATE.exampleRequest} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ExampleResponse data={WEBHOOK_CREATE.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {WEBHOOK_CREATE.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={WEBHOOK_CREATE} />
    </>
  )
}