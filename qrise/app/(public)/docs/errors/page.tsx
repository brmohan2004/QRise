import { Breadcrumb } from "@/components/docs/breadcrumb"
import { CodeBlock } from "@/components/docs/code-block"

export default function ErrorsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Errors" }]} />

      <h1 id="errors" className="text-3xl font-bold text-gray-900 mb-4">
        Error Codes
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        All errors return JSON with an error message and code.
      </p>

      <h2 id="error-codes" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Error code table
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium">Status</th>
              <th className="text-left py-2 font-medium">Code</th>
              <th className="text-left py-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            <tr className="border-b border-gray-100">
              <td className="py-2">400</td>
              <td className="py-2 font-mono">BAD_REQUEST</td>
              <td className="py-2">Malformed JSON body</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">401</td>
              <td className="py-2 font-mono">UNAUTHORIZED</td>
              <td className="py-2">Missing or invalid API key</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">403</td>
              <td className="py-2 font-mono">FORBIDDEN</td>
              <td className="py-2">Valid key but insufficient scope</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">404</td>
              <td className="py-2 font-mono">NOT_FOUND</td>
              <td className="py-2">Resource doesn't exist</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">422</td>
              <td className="py-2 font-mono">VALIDATION_ERROR</td>
              <td className="py-2">Request body fails validation</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">429</td>
              <td className="py-2 font-mono">RATE_LIMITED</td>
              <td className="py-2">Too many requests</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">500</td>
              <td className="py-2 font-mono">INTERNAL_ERROR</td>
              <td className="py-2">QRise server error</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="example-error" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Example error response
      </h2>
      <CodeBlock
        code={`{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "target_url": "Must begin with http:// or https://",
    "name": "Required field"
  }
}`}
        language="json"
      />

      <h2 id="retrying" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        When to retry
      </h2>
      <p className="text-gray-600 mb-4">
        Safe to retry: 409 (conflict), 429, 500, 503
      </p>
      <p className="text-gray-600">
        Don't retry: 400, 401, 403, 404, 422 — fix the request first
      </p>
    </>
  )
}
