import { NotificationComposer } from '@/components/notifications/notification-composer'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewNotificationPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" asChild className="w-fit gap-2 text-gray-400 hover:text-white -ml-2">
          <Link href="/notifications">
            <ArrowLeft className="h-4 w-4" />
            Back to Notifications
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Send Notification</h1>
          <p className="text-gray-400">Target specific users or segments with email or push alerts.</p>
        </div>
      </div>

      <NotificationComposer />
    </div>
  )
}
