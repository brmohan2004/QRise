import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ResponseSchema } from "@/components/docs/response-schema"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { GET_QR, GET_QR_EXAMPLES } from "@/lib/docs"

export default function GetQRPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "QR codes" }, { label: "Get QR", href: "/docs/qr-codes/get" }]} />

      <EndpointHeader
        method={GET_QR.method}
        path={GET_QR.path}
        title={GET_QR.title}
        description={GET_QR.description}
        requiredScope={GET_QR.requiredScope}
      />

      <AuthBadge scope={GET_QR.requiredScope!} />

      {GET_QR.notes && GET_QR.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Path parameters" params={GET_QR.pathParams!} />

      <CodeTabs examples={GET_QR_EXAMPLES} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ResponseSchema fields={GET_QR.responseSchema} />
      <ExampleResponse data={GET_QR.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {GET_QR.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={GET_QR} />
    </>
  )
}