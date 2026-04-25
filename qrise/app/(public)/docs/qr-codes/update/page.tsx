import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ResponseSchema } from "@/components/docs/response-schema"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { UPDATE_QR, UPDATE_QR_EXAMPLES } from "@/lib/docs"

export default function UpdateQRPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "QR codes" }, { label: "Update QR", href: "/docs/qr-codes/update" }]} />

      <EndpointHeader
        method={UPDATE_QR.method}
        path={UPDATE_QR.path}
        title={UPDATE_QR.title}
        description={UPDATE_QR.description}
        requiredScope={UPDATE_QR.requiredScope}
      />

      <AuthBadge scope={UPDATE_QR.requiredScope!} />

      {UPDATE_QR.notes && UPDATE_QR.notes.map((note, idx) => (
        <Callout key={idx} type="warning">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Path parameters" params={UPDATE_QR.pathParams!} />
      <ParamTable title="Body parameters" params={UPDATE_QR.bodyParams!} />

      <CodeTabs examples={UPDATE_QR_EXAMPLES} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ResponseSchema fields={UPDATE_QR.responseSchema} />
      <ExampleResponse data={UPDATE_QR.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {UPDATE_QR.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={UPDATE_QR} />
    </>
  )
}