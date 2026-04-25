import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ExampleRequest } from "@/components/docs/example-request"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { SMART_ROUTING_UPDATE, SMART_ROUTING_UPDATE_EXAMPLES } from "@/lib/docs"

export default function SmartRoutingUpdateRulesPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Smart routing", href: "/docs/smart-routing" }, { label: "Update rules" }]} />

      <EndpointHeader
        method={SMART_ROUTING_UPDATE.method}
        path={SMART_ROUTING_UPDATE.path}
        title={SMART_ROUTING_UPDATE.title}
        description={SMART_ROUTING_UPDATE.description}
        requiredScope={SMART_ROUTING_UPDATE.requiredScope}
      />

      <AuthBadge scope={SMART_ROUTING_UPDATE.requiredScope!} />

      <Callout type="warning">
        This endpoint replaces ALL existing routing rules. Include the complete desired rule set — any existing rules not in the request will be deleted.
      </Callout>

      {SMART_ROUTING_UPDATE.notes && SMART_ROUTING_UPDATE.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Path parameters" params={SMART_ROUTING_UPDATE.pathParams!} />
      <ParamTable title="Body parameters" params={SMART_ROUTING_UPDATE.bodyParams!} />

      <CodeTabs examples={SMART_ROUTING_UPDATE_EXAMPLES} />

      <ExampleRequest data={SMART_ROUTING_UPDATE.exampleRequest} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ExampleResponse data={SMART_ROUTING_UPDATE.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {SMART_ROUTING_UPDATE.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={SMART_ROUTING_UPDATE} />
    </>
  )
}