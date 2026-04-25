import { Breadcrumb } from "@/components/docs/breadcrumb"
import Link from "next/link"

export default function WebhooksOverviewPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Webhooks" }]} />

      <h1 id="webhooks" className="text-3xl font-bold text-gray-900 mb-4">
        Webhooks
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        Receive real-time notifications when events occur in your QR codes. Webhooks send HTTP POST requests to your endpoint with signed payloads.
      </p>

      <h2 id="overview" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        How webhooks work
      </h2>
      <ul className="list-disc list-inside space-y-2 text-gray-600 mb-8">
        <li>Subscribe to events when creating a webhook</li>
        <li>QRise sends a POST request with JSON payload when events occur</li>
        <li>Each request includes an HMAC-SHA256 signature in X-QRise-Signature header</li>
        <li>Verify the signature to ensure authenticity</li>
        <li>Failed deliveries are retried with exponential backoff</li>
      </ul>

      <h2 id="retry-schedule" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Retry schedule
      </h2>
      <p className="text-gray-600 mb-4">
        When your endpoint returns a non-2xx status code or times out, QRise retries the delivery with exponential backoff:
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium">Attempt</th>
              <th className="text-left py-2 font-medium">Delay</th>
              <th className="text-left py-2 font-medium">Cumulative</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            <tr className="border-b border-gray-100">
              <td className="py-2">1</td>
              <td className="py-2">Immediate</td>
              <td className="py-2">0</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">2</td>
              <td className="py-2">1 minute</td>
              <td className="py-2">1m</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">3</td>
              <td className="py-2">5 minutes</td>
              <td className="py-2">6m</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">4</td>
              <td className="py-2">30 minutes</td>
              <td className="py-2">36m</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">5</td>
              <td className="py-2">2 hours</td>
              <td className="py-2">2h 36m</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2">6 (final)</td>
              <td className="py-2">12 hours</td>
              <td className="py-2">14h 36m</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="signature" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Signature verification
      </h2>
      <p className="text-gray-600 mb-4">
        Each webhook request includes an <code>X-QRise-Signature</code> header with an HMAC-SHA256 signature. Verify it using your webhook secret:
      </p>
      <ul className="list-disc pl-6 text-gray-600 space-y-1">
        <li>The signature starts with <code>sha256=</code></li>
        <li>Compute HMAC-SHA256 of the raw request body using your secret</li>
        <li>Use constant-time comparison to prevent timing attacks</li>
      </ul>
      <p className="text-gray-600 mt-4">
        See the <Link href="/docs/webhooks/events" className="text-[#0F6E56] hover:underline">Event reference</Link> for payload examples and verification code.
      </p>

      <h2 id="endpoints" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Endpoints
      </h2>
      <ul className="space-y-2">
        <li>
          <Link href="/docs/webhooks/create" className="text-[#0F6E56] hover:underline">
            POST /webhooks — Create a webhook
          </Link>
        </li>
        <li>
          <Link href="/docs/webhooks/events" className="text-[#0F6E56] hover:underline">
            Event reference — Payload schemas
          </Link>
        </li>
      </ul>
    </>
  )
}