import { NotificationComposer } from '@/components/notifications/notification-composer'

export default function NewNotificationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Send Notification</h1>
        <p className="text-gray-400">Target specific users or segments with email or push alerts.</p>
      </div>

      <NotificationComposer />
    </div>
  )
}
