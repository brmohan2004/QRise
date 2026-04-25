import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { SMART_ROUTING_GET, SMART_ROUTING_GET_EXAMPLES } from "@/lib/docs"

export default function SmartRoutingGetRulesPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Smart routing", href: "/docs/smart-routing" }, { label: "Get rules" }]} />

      <EndpointHeader
        method={SMART_ROUTING_GET.method}
        path={SMART_ROUTING_GET.path}
        title={SMART_ROUTING_GET.title}
        description={SMART_ROUTING_GET.description}
        requiredScope={SMART_ROUTING_GET.requiredScope}
      />

      <AuthBadge scope={SMART_ROUTING_GET.requiredScope!} />

      {SMART_ROUTING_GET.notes && SMART_ROUTING_GET.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Path parameters" params={SMART_ROUTING_GET.pathParams!} />

      <CodeTabs examples={SMART_ROUTING_GET_EXAMPLES} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ExampleResponse data={SMART_ROUTING_GET.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {SMART_ROUTING_GET.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={SMART_ROUTING_GET} />
    </>
  )
}