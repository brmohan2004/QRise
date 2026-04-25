import { Breadcrumb } from "@/components/docs/breadcrumb"
import { CodeTabs } from "@/components/docs/code-tabs"
import { WEBHOOK_VERIFICATION_EXAMPLES } from "@/lib/docs"

const SCAN_RECEIVED_PAYLOAD = {
  event: 'scan.received',
  qr_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  qr_name: 'Summer sale campaign',
  scanned_at: '2025-06-01T14:30:00Z',
  redirect_url: 'https://r.qrise.io/xK9mPqR2',
  device: 'mobile',
  os: 'iOS',
  browser: 'Safari',
  country: 'US',
  city: 'San Francisco',
}

const QR_CREATED_PAYLOAD = {
  event: 'qr.created',
  qr_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  qr_name: 'Summer sale campaign',
  type: 'url',
  redirect_url: 'https://r.qrise.io/xK9mPqR2',
  created_at: '2025-06-01T10:30:00Z',
}

const QR_UPDATED_PAYLOAD = {
  event: 'qr.updated',
  qr_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  qr_name: 'Summer sale campaign',
  changes: {
    target_url: { old: 'https://yourstore.com/summer-sale', new: 'https://yourstore.com/autumn-sale' },
  },
  updated_at: '2025-09-01T08:00:00Z',
}

const QR_DELETED_PAYLOAD = {
  event: 'qr.deleted',
  qr_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  qr_name: 'Summer sale campaign',
  deleted_at: '2025-09-15T10:00:00Z',
}

const FORM_SUBMITTED_PAYLOAD = {
  event: 'form.submitted',
  qr_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  form_id: 'f1a2b3c4-d5e6-7890-abcd-ef1234567890',
  form_name: 'Customer feedback',
  submission_id: 's1a2b3c4-d5e6-7890-abcd-ef1234567890',
  submitted_at: '2025-06-01T14:30:00Z',
  fields: {
    full_name: 'John Doe',
    email: 'john@example.com',
    feedback: 'Great product!',
  },
}

export default function WebhooksEventsPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Webhooks", href: "/docs/webhooks" }, { label: "Event reference" }]} />

      <h1 id="events" className="text-3xl font-bold text-gray-900 mb-4">
        Event Reference
      </h1>

      <p className="text-lg text-gray-600 mb-8">
        Webhook payloads contain event details as JSON. All payloads include the event type, QR ID, and timestamp.
      </p>

      <h2 id="scan-received" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        scan.received
      </h2>
      <p className="text-gray-600 mb-4">
        Sent when a QR code is scanned. Includes device, OS, browser, and location data.
      </p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{JSON.stringify(SCAN_RECEIVED_PAYLOAD, null, 2)}
      </pre>

      <h2 id="qr-created" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        qr.created
      </h2>
      <p className="text-gray-600 mb-4">
        Sent when a new QR code is created in your account.
      </p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{JSON.stringify(QR_CREATED_PAYLOAD, null, 2)}
      </pre>

      <h2 id="qr-updated" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        qr.updated
      </h2>
      <p className="text-gray-600 mb-4">
        Sent when a QR code is updated. The changes object shows what was modified.
      </p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{JSON.stringify(QR_UPDATED_PAYLOAD, null, 2)}
      </pre>

      <h2 id="qr-deleted" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        qr.deleted
      </h2>
      <p className="text-gray-600 mb-4">
        Sent when a QR code is deleted.
      </p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{JSON.stringify(QR_DELETED_PAYLOAD, null, 2)}
      </pre>

      <h2 id="form-submitted" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        form.submitted
      </h2>
      <p className="text-gray-600 mb-4">
        Sent when a form is submitted. The fields object contains the form data.
      </p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{JSON.stringify(FORM_SUBMITTED_PAYLOAD, null, 2)}
      </pre>

      <h2 id="verification" className="text-xl font-semibold text-gray-900 mt-8 mb-4">
        Verifying signatures
      </h2>
      <p className="text-gray-600 mb-4">
        Verify the X-QRise-Signature header to confirm webhook authenticity:
      </p>
      <CodeTabs examples={WEBHOOK_VERIFICATION_EXAMPLES} />
    </>
  )
}