import { Breadcrumb } from "@/components/docs/breadcrumb"
import Link from "next/link"

export default function QRCodesOverviewPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "QR codes" }]} />

      <h1 id="qr-codes" className="text-3xl font-bold text-gray-900 mb-4">
        QR Codes
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        Create and manage QR codes with different types and capabilities.
      </p>

      <h2 id="types" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        QR code types
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium">Type</th>
              <th className="text-left py-2 font-medium">Dynamic</th>
              <th className="text-left py-2 font-medium">Analytics</th>
              <th className="text-left py-2 font-medium">Routing</th>
              <th className="text-left py-2 font-medium">Password</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            <tr className="border-b border-gray-100">
              <td className="py-2">URL</td>
              <td className="py-2">Optional</td>
              <td className="py-2">Optional</td>
              <td className="py-2">—</td>
              <td className="py-2">—</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">Smart Routing</td>
              <td className="py-2">Always</td>
              <td className="py-2">✓</td>
              <td className="py-2">✓</td>
              <td className="py-2">—</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">Password</td>
              <td className="py-2">Always</td>
              <td className="py-2">✓</td>
              <td className="py-2">—</td>
              <td className="py-2">✓</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">Multi Action</td>
              <td className="py-2">Optional</td>
              <td className="py-2">✓</td>
              <td className="py-2">—</td>
              <td className="py-2">—</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">Bulk</td>
              <td className="py-2">Optional</td>
              <td className="py-2">Optional</td>
              <td className="py-2">—</td>
              <td className="py-2">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="endpoints" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Endpoints
      </h2>
      <ul className="space-y-2">
        <li>
          <Link href="/docs/qr-codes/create" className="text-[#0F6E56] hover:underline">
            POST /qr — Create a QR code
          </Link>
        </li>
        <li>
          <Link href="/docs/qr-codes/list" className="text-[#0F6E56] hover:underline">
            GET /qr — List QR codes
          </Link>
        </li>
        <li>
          <Link href="/docs/qr-codes/get" className="text-[#0F6E56] hover:underline">
            GET /qr/:id — Get a QR code
          </Link>
        </li>
        <li>
          <Link href="/docs/qr-codes/update" className="text-[#0F6E56] hover:underline">
            PUT /qr/:id — Update a QR code
          </Link>
        </li>
        <li>
          <Link href="/docs/qr-codes/delete" className="text-[#0F6E56] hover:underline">
            DELETE /qr/:id — Delete a QR code
          </Link>
        </li>
        <li>
          <Link href="/docs/qr-codes/export" className="text-[#0F6E56] hover:underline">
            GET /qr/:id/export — Export QR image
          </Link>
        </li>
        <li>
          <Link href="/docs/qr-codes/history" className="text-[#0F6E56] hover:underline">
            GET /qr/:id/history — Redirect history
          </Link>
        </li>
      </ul>
    </>
  )
}