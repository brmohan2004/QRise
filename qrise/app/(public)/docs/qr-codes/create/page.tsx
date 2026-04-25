import { Breadcrumb } from "@/components/docs/breadcrumb"
import { EndpointHeader } from "@/components/docs/endpoint-header"
import { AuthBadge } from "@/components/docs/auth-badge"
import { Callout } from "@/components/docs/callout"
import { ParamTable } from "@/components/docs/param-table"
import { ResponseSchema } from "@/components/docs/response-schema"
import { ExampleResponse } from "@/components/docs/example-response"
import { CodeTabs } from "@/components/docs/code-tabs"
import { TryItConsole } from "@/components/docs/try-it-console"
import { CREATE_QR, CREATE_QR_EXAMPLES } from "@/lib/docs"

export default function CreateQRPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "QR codes" }, { label: "Create QR", href: "/docs/qr-codes/create" }]} />

      <EndpointHeader
        method={CREATE_QR.method}
        path={CREATE_QR.path}
        title={CREATE_QR.title}
        description={CREATE_QR.description}
        requiredScope={CREATE_QR.requiredScope}
      />

      <AuthBadge scope={CREATE_QR.requiredScope!} />

      {CREATE_QR.notes && CREATE_QR.notes.map((note, idx) => (
        <Callout key={idx} type="info">
          {note}
        </Callout>
      ))}

      <h2 id="request" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Request
      </h2>

      <ParamTable title="Body parameters" params={CREATE_QR.bodyParams} />

      <CodeTabs examples={CREATE_QR_EXAMPLES} />

      <h2 id="response" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Response
      </h2>

      <ResponseSchema fields={CREATE_QR.responseSchema} />
      <ExampleResponse data={CREATE_QR.exampleResponse} />

      <h2 id="errors" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error codes
      </h2>
      <p className="text-gray-600 mb-4">
        {CREATE_QR.errorCodes.join(", ")}
      </p>

      <TryItConsole endpoint={CREATE_QR} />
    </>
  )
}