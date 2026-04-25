import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ResponseSchema } from "@/components/docs/response-schema"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { DELETE_QR, DELETE_QR_EXAMPLES } from "@/lib/docs"

export default function DeleteQRPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "QR codes" }, { label: "Delete QR", href: "/docs/qr-codes/delete" }]} />

      <EndpointHeader
        method={DELETE_QR.method}
        path={DELETE_QR.path}
        title={DELETE_QR.title}
        description={DELETE_QR.description}
        requiredScope={DELETE_QR.requiredScope}
      />

      <AuthBadge scope={DELETE_QR.requiredScope!} />

      {DELETE_QR.notes && DELETE_QR.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Path parameters" params={DELETE_QR.pathParams!} />

      <CodeTabs examples={DELETE_QR_EXAMPLES} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ResponseSchema fields={DELETE_QR.responseSchema} />
      <ExampleResponse data={DELETE_QR.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {DELETE_QR.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={DELETE_QR} />
    </>
  )
}