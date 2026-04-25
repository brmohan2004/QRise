import { Breadcrumb } from "@/components/docs/breadcrumb"
import Link from "next/link"

export default function BulkOverviewPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Bulk" }]} />

      <h1 id="bulk" className="text-3xl font-bold text-gray-900 mb-4">
        Bulk Generation
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        Generate thousands of QR codes at once with bulk jobs. Submit an array of QR code definitions and receive a job ID to track progress.
      </p>

      <h2 id="overview" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        How it works
      </h2>
      <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-8">
        <li>Submit a bulk job with an array of QR code definitions (up to 1,000 on Pro, 10,000 on Business/Enterprise)</li>
        <li>Receive a job ID immediately</li>
        <li>Poll the job status endpoint until status is <code className="bg-gray-100 px-1 rounded">done</code></li>
        <li>Download a ZIP file containing all QR code images (valid for 24 hours)</li>
      </ol>

      <h2 id="limits" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Limits
      </h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium">Plan</th>
              <th className="text-left py-2 font-medium">Max rows per job</th>
              <th className="text-left py-2 font-medium">Required scope</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            <tr className="border-b border-gray-100">
              <td className="py-2">Free</td>
              <td className="py-2">—</td>
              <td className="py-2">—</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">Pro</td>
              <td className="py-2">1,000</td>
              <td className="py-2">bulk:write</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">Business</td>
              <td className="py-2">10,000</td>
              <td className="py-2">bulk:write</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">Enterprise</td>
              <td className="py-2">10,000</td>
              <td className="py-2">bulk:write</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="endpoints" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Endpoints
      </h2>
      <ul className="space-y-2">
        <li>
          <Link href="/docs/bulk/create" className="text-[#0F6E56] hover:underline">
            POST /bulk — Create bulk job
          </Link>
        </li>
        <li>
          <Link href="/docs/bulk/status" className="text-[#0F6E56] hover:underline">
            GET /bulk/:jobId — Get job status
          </Link>
        </li>
      </ul>
    </>
  )
}