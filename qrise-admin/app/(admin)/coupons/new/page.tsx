import { CouponForm } from '@/components/coupons/coupon-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewCouponPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" asChild className="w-fit gap-2 text-gray-400 hover:text-white -ml-2">
          <Link href="/coupons">
            <ArrowLeft className="h-4 w-4" />
            Back to Coupons
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create Coupon</h1>
          <p className="text-gray-400">Launch a new discount campaign for your users.</p>
        </div>
      </div>

      <CouponForm />
    </div>
  )
}
