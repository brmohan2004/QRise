import { Breadcrumb } from "@/components/docs/breadcrumb"
import Link from "next/link"

export default function SmartRoutingOverviewPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Smart routing" }]} />

      <h1 id="smart-routing" className="text-3xl font-bold text-gray-900 mb-4">
        Smart Routing
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        Route scans to different destinations based on device attributes, location, language, and time.
      </p>

      <h2 id="how-it-works" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        How it works
      </h2>
      <ul className="list-disc list-inside space-y-2 text-gray-600 mb-8">
        <li>Smart Routing QR codes are always dynamic</li>
        <li>Rules are evaluated in priority order (lowest number first)</li>
        <li>All conditions in a rule must match for it to trigger</li>
        <li>If no rule matches, the default URL is used</li>
        <li>Maximum 10 rules per QR code</li>
      </ul>

      <h2 id="conditions" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Condition reference
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium">Field</th>
              <th className="text-left py-2 font-medium">Operators</th>
              <th className="text-left py-2 font-medium">Values</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            <tr className="border-b border-gray-100">
              <td className="py-2 font-mono text-gray-900">device</td>
              <td className="py-2">eq, in</td>
              <td className="py-2">mobile, desktop, tablet</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 font-mono text-gray-900">os</td>
              <td className="py-2">eq, in</td>
              <td className="py-2">iOS, Android, Windows, macOS, Linux</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 font-mono text-gray-900">country</td>
              <td className="py-2">eq, in</td>
              <td className="py-2">US, GB, DE, FR, etc. (ISO 3166-1 alpha-2)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 font-mono text-gray-900">language</td>
              <td className="py-2">eq, in</td>
              <td className="py-2">en, en-US, de, fr, es, etc. (BCP 47)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 font-mono text-gray-900">time_range</td>
              <td className="py-2">between</td>
              <td className="py-2">[0-23, 0-23] — hour range in local time</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="endpoints" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Endpoints
      </h2>
      <ul className="space-y-2">
        <li>
          <Link href="/docs/smart-routing/get-rules" className="text-[#0F6E56] hover:underline">
            GET /qr/:id/routing-rules — Get routing rules
          </Link>
        </li>
        <li>
          <Link href="/docs/smart-routing/update-rules" className="text-[#0F6E56] hover:underline">
            PUT /qr/:id/routing-rules — Replace routing rules
          </Link>
        </li>
      </ul>
    </>
  )
}