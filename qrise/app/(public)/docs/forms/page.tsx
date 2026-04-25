import { Breadcrumb } from "@/components/docs/breadcrumb"
import Link from "next/link"

export default function FormsOverviewPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Forms" }]} />

      <h1 id="forms" className="text-3xl font-bold text-gray-900 mb-4">
        Forms
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        Capture user data with customizable forms. Embed forms in your QR codes or use them standalone with webhooks for submission notifications.
      </p>

      <h2 id="overview" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Features
      </h2>
      <ul className="list-disc list-inside space-y-2 text-gray-600 mb-8">
        <li>Customizable form fields (text, email, phone, dropdown, checkbox, etc.)</li>
        <li>Optional required fields and validation</li>
        <li>Webhook notifications on form submission</li>
        <li>Export submissions to CSV</li>
        <li>Embed forms directly in QR codes via redirect</li>
      </ul>

      <h2 id="endpoints" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Endpoints
      </h2>
      <ul className="space-y-2">
        <li>
          <Link href="/docs/forms/create" className="text-[#0F6E56] hover:underline">
            POST /forms — Create a form
          </Link>
        </li>
        <li>
          <Link href="/docs/forms/manage" className="text-[#0F6E56] hover:underline">
            GET /forms — List forms
          </Link>
        </li>
        <li>
          <Link href="/docs/forms/manage" className="text-[#0F6E56] hover:underline">
            GET /forms/:id — Get a form
          </Link>
        </li>
        <li>
          <Link href="/docs/forms/manage" className="text-[#0F6E56] hover:underline">
            PUT /forms/:id — Update a form
          </Link>
        </li>
        <li>
          <Link href="/docs/forms/manage" className="text-[#0F6E56] hover:underline">
            DELETE /forms/:id — Delete a form
          </Link>
        </li>
        <li>
          <Link href="/docs/forms/manage" className="text-[#0F6E56] hover:underline">
            GET /forms/:id/submissions — Get form submissions
          </Link>
        </li>
      </ul>
    </>
  )
}