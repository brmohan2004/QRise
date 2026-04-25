import { CouponForm } from '@/components/coupons/coupon-form'

export default function NewCouponPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Create Coupon</h1>
        <p className="text-gray-400">Launch a new discount campaign for your users.</p>
      </div>

      <CouponForm />
    </div>
  )
}
