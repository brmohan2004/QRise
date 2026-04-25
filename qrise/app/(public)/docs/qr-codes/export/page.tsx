import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ResponseSchema } from "@/components/docs/response-schema"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { EXPORT_QR, EXPORT_QR_EXAMPLES } from "@/lib/docs"

export default function ExportQRPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "QR codes" }, { label: "Export QR", href: "/docs/qr-codes/export" }]} />

      <EndpointHeader
        method={EXPORT_QR.method}
        path={EXPORT_QR.path}
        title={EXPORT_QR.title}
        description={EXPORT_QR.description}
        requiredScope={EXPORT_QR.requiredScope}
      />

      <AuthBadge scope={EXPORT_QR.requiredScope!} />

      {EXPORT_QR.notes && EXPORT_QR.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Path parameters" params={EXPORT_QR.pathParams!} />
      <ParamTable title="Query parameters" params={EXPORT_QR.queryParams!} />

      <CodeTabs examples={EXPORT_QR_EXAMPLES} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ResponseSchema fields={EXPORT_QR.responseSchema} />
      <ExampleResponse data={EXPORT_QR.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {EXPORT_QR.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={EXPORT_QR} />
    </>
  )
}