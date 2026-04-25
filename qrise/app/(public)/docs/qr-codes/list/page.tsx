import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ResponseSchema } from "@/components/docs/response-schema"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { LIST_QR, LIST_QR_EXAMPLES } from "@/lib/docs"

export default function ListQRPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "QR codes" }, { label: "List QR", href: "/docs/qr-codes/list" }]} />

      <EndpointHeader
        method={LIST_QR.method}
        path={LIST_QR.path}
        title={LIST_QR.title}
        description={LIST_QR.description}
        requiredScope={LIST_QR.requiredScope}
      />

      <AuthBadge scope={LIST_QR.requiredScope!} />

      {LIST_QR.notes && LIST_QR.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Query parameters" params={LIST_QR.queryParams!} />

      <CodeTabs examples={LIST_QR_EXAMPLES} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ResponseSchema fields={LIST_QR.responseSchema} />
      <ExampleResponse data={LIST_QR.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {LIST_QR.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={LIST_QR} />
    </>
  )
}