import { Metadata } from 'next'
import { WebhookList } from '@/components/webhooks/webhook-list'
import { DeliveryLogTable } from '@/components/webhooks/delivery-log-table'

export const metadata: Metadata = {
  title: 'Webhook Management | QRise Admin',
  description: 'Monitor and manage global webhook subscriptions and delivery logs.',
}

export default function WebhooksPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter text-white">Webhook Infrastructure</h1>
        <p className="text-gray-500 text-sm font-medium">Global oversight of event delivery and endpoint health.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <WebhookList />
        <DeliveryLogTable />
      </div>
    </div>
  )
}
