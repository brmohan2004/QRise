import { Breadcrumb } from "@/components/docs/breadcrumb"

export default function ChangelogPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Changelog" }]} />

      <h1 id="changelog" className="text-3xl font-bold text-gray-900 mb-4">
        Changelog
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        A complete history of QRise API updates and changes.
      </p>

      <h2 id="v1-0" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        v1.0 — Initial Release
      </h2>
      <p className="text-gray-600 mb-2">2025-06-01</p>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>Launched QR code creation API with URL, Smart Routing, Password, and Multi Action types</li>
        <li>Dynamic QR codes with live redirect updates</li>
        <li>Scan analytics with device, OS, country, and time breakdowns</li>
        <li>Smart Routing for device-based redirects</li>
        <li>Bulk QR code generation</li>
        <li>Forms API for capturing user data</li>
        <li>Webhook notifications for events</li>
        <li>PNG, SVG, and PDF export formats</li>
      </ul>

      <h2 id="upcoming" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Upcoming Features
      </h2>
      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>QR code design templates</li>
        <li>Batch QR code analytics</li>
        <li>A/B testing for QR code targets</li>
        <li>Scheduled QR code activation</li>
        <li>Team collaboration and workspaces</li>
      </ul>
    </>
  )
}