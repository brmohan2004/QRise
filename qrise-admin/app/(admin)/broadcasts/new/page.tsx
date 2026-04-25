import { BroadcastComposer } from '@/components/broadcasts/broadcast-composer'

export default function NewBroadcastPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">New Email Broadcast</h1>
        <p className="text-gray-400">Compose and send a platform-wide email to your users.</p>
      </div>

      <BroadcastComposer />
    </div>
  )
}
