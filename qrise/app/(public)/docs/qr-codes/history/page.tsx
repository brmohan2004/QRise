import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ResponseSchema } from "@/components/docs/response-schema"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { QR_HISTORY, QR_HISTORY_EXAMPLES } from "@/lib/docs"

export default function QRHistoryPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "QR codes" }, { label: "History", href: "/docs/qr-codes/history" }]} />

      <EndpointHeader
        method={QR_HISTORY.method}
        path={QR_HISTORY.path}
        title={QR_HISTORY.title}
        description={QR_HISTORY.description}
        requiredScope={QR_HISTORY.requiredScope}
      />

      <AuthBadge scope={QR_HISTORY.requiredScope!} />

      {QR_HISTORY.notes && QR_HISTORY.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Path parameters" params={QR_HISTORY.pathParams!} />

      <CodeTabs examples={QR_HISTORY_EXAMPLES} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ResponseSchema fields={QR_HISTORY.responseSchema} />
      <ExampleResponse data={QR_HISTORY.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {QR_HISTORY.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={QR_HISTORY} />
    </>
  )
}