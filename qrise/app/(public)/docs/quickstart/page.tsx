import { Breadcrumb } from "@/components/docs/breadcrumb"
import { CodeTabs } from "@/components/docs/code-tabs"
import { CREATE_QR_EXAMPLES, UPDATE_QR_EXAMPLES, ANALYTICS_EXAMPLES } from "@/lib/docs"

export default function QuickstartPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Quickstart" }]} />

      <h1 id="quickstart" className="text-3xl font-bold text-gray-900 mb-4">
        Quickstart Guide
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        Get started with the QRise API in 5 minutes.
      </p>

      <h2 id="step-1" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        1. Get your API key
      </h2>
      <p className="text-gray-600 mb-4">
        Follow the{" "}
        <a href="/docs/authentication" className="text-[#0F6E56] hover:underline">
          authentication guide
        </a>{" "}
        to create an API key in your dashboard.
      </p>

      <h2 id="step-2" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        2. Create your first QR code
      </h2>
      <CodeTabs examples={CREATE_QR_EXAMPLES} />

      <h2 id="step-3" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        3. Get the scannable URL
      </h2>
      <p className="text-gray-600 mb-4">
        The response includes a <code>redirect_url</code> that you can encode into your QR code
        or share directly. It looks like:{" "}
        <code>https://r.qrise.io/xK9mPqR2</code>
      </p>

      <h2 id="step-4" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        4. Update the target URL (optional)
      </h2>
      <p className="text-gray-600 mb-4">
        Dynamic QRs let you change the destination without reprinting:
      </p>
      <CodeTabs examples={UPDATE_QR_EXAMPLES} />

      <h2 id="step-5" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        5. Check your analytics
      </h2>
      <CodeTabs examples={ANALYTICS_EXAMPLES} />

      <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Next steps
      </h2>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>
          <a href="/docs/smart-routing" className="text-[#0F6E56] hover:underline">
            Set up Smart Routing
          </a>{" "}
          to redirect by device or location
        </li>
        <li>
          <a href="/docs/webhooks" className="text-[#0F6E56] hover:underline">
            Configure webhooks
          </a>{" "}
          for real-time notifications
        </li>
        <li>
          <a href="/docs/bulk" className="text-[#0F6E56] hover:underline">
            Generate QRs in bulk
          </a>{" "}
          from CSV data
        </li>
      </ul>
    </>
  )
}